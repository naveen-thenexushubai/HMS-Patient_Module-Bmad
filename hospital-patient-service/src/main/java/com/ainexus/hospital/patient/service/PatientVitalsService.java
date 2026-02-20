package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.PatientVitalsRequest;
import com.ainexus.hospital.patient.dto.response.PatientVitalsResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.PatientVitals;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.repository.PatientVitalsRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientVitalsService {

    private final PatientVitalsRepository vitalsRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<PatientVitalsResponse> getVitals(String patientId) {
        patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        return vitalsRepository.findTop50ByPatientIdOrderByRecordedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PatientVitalsResponse recordVitals(String patientId, PatientVitalsRequest req) {
        patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        String currentUser = getCurrentUsername();
        PatientVitals vitals = PatientVitals.builder()
                .patientId(patientId)
                .recordedBy(currentUser)
                .temperatureCelsius(req.getTemperatureCelsius())
                .pulseRate(req.getPulseRate())
                .bloodPressureSystolic(req.getBloodPressureSystolic())
                .bloodPressureDiastolic(req.getBloodPressureDiastolic())
                .respiratoryRate(req.getRespiratoryRate())
                .oxygenSaturation(req.getOxygenSaturation())
                .weightKg(req.getWeightKg())
                .heightCm(req.getHeightCm())
                .notes(req.getNotes())
                .build();

        return toResponse(vitalsRepository.save(vitals));
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private PatientVitalsResponse toResponse(PatientVitals v) {
        BigDecimal bmi = null;
        if (v.getWeightKg() != null && v.getHeightCm() != null
                && v.getHeightCm().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal heightM = v.getHeightCm().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            bmi = v.getWeightKg().divide(heightM.multiply(heightM), 1, RoundingMode.HALF_UP);
        }

        return PatientVitalsResponse.builder()
                .id(v.getId())
                .patientId(v.getPatientId())
                .recordedAt(v.getRecordedAt() != null ? v.getRecordedAt().toString() : null)
                .recordedBy(v.getRecordedBy())
                .temperatureCelsius(v.getTemperatureCelsius())
                .pulseRate(v.getPulseRate())
                .bloodPressureSystolic(v.getBloodPressureSystolic())
                .bloodPressureDiastolic(v.getBloodPressureDiastolic())
                .respiratoryRate(v.getRespiratoryRate())
                .oxygenSaturation(v.getOxygenSaturation())
                .weightKg(v.getWeightKg())
                .heightCm(v.getHeightCm())
                .bmi(bmi)
                .notes(v.getNotes())
                .build();
    }

    private String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getUsername();
        }
        return "system";
    }
}
