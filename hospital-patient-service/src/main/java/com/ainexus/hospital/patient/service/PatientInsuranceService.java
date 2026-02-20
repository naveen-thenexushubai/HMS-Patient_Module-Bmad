package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.PatientInsuranceRequest;
import com.ainexus.hospital.patient.dto.response.PatientInsuranceResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.PatientInsurance;
import com.ainexus.hospital.patient.repository.PatientInsuranceRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientInsuranceService {

    private final PatientInsuranceRepository insuranceRepository;
    private final PatientRepository patientRepository;

    @Transactional(readOnly = true)
    public List<PatientInsuranceResponse> getInsurance(String patientId) {
        patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        return insuranceRepository
                .findByPatientIdOrderByIsPrimaryDescCreatedAtDesc(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public PatientInsuranceResponse addInsurance(String patientId, PatientInsuranceRequest req) {
        patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        String currentUser = getCurrentUsername();
        PatientInsurance insurance = PatientInsurance.builder()
                .patientId(patientId)
                .providerName(req.getProviderName())
                .policyNumber(req.getPolicyNumber())
                .groupNumber(req.getGroupNumber())
                .coverageType(req.getCoverageType())
                .subscriberName(req.getSubscriberName())
                .subscriberDob(req.getSubscriberDob())
                .validFrom(parseDate(req.getValidFrom()))
                .validTo(parseDate(req.getValidTo()))
                .isPrimary(req.getIsPrimary() != null ? req.getIsPrimary() : true)
                .createdBy(currentUser)
                .build();

        return toResponse(insuranceRepository.save(insurance));
    }

    @Transactional
    public PatientInsuranceResponse updateInsurance(String patientId, Long id, PatientInsuranceRequest req) {
        PatientInsurance insurance = insuranceRepository.findByIdAndPatientId(id, patientId)
                .orElseThrow(() -> new EntityNotFoundException("Insurance record not found"));

        insurance.setProviderName(req.getProviderName());
        insurance.setPolicyNumber(req.getPolicyNumber());
        insurance.setGroupNumber(req.getGroupNumber());
        insurance.setCoverageType(req.getCoverageType());
        insurance.setSubscriberName(req.getSubscriberName());
        insurance.setSubscriberDob(req.getSubscriberDob());
        insurance.setValidFrom(parseDate(req.getValidFrom()));
        insurance.setValidTo(parseDate(req.getValidTo()));
        if (req.getIsPrimary() != null) insurance.setIsPrimary(req.getIsPrimary());
        insurance.setUpdatedBy(getCurrentUsername());
        insurance.setUpdatedAt(Instant.now());

        return toResponse(insuranceRepository.save(insurance));
    }

    @Transactional
    public void deleteInsurance(String patientId, Long id) {
        PatientInsurance insurance = insuranceRepository.findByIdAndPatientId(id, patientId)
                .orElseThrow(() -> new EntityNotFoundException("Insurance record not found"));
        insuranceRepository.delete(insurance);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private PatientInsuranceResponse toResponse(PatientInsurance ins) {
        return PatientInsuranceResponse.builder()
                .id(ins.getId())
                .patientId(ins.getPatientId())
                .providerName(ins.getProviderName())
                .policyNumber(ins.getPolicyNumber())
                .groupNumber(ins.getGroupNumber())
                .coverageType(ins.getCoverageType())
                .subscriberName(ins.getSubscriberName())
                .subscriberDob(ins.getSubscriberDob())
                .validFrom(ins.getValidFrom() != null ? ins.getValidFrom().toString() : null)
                .validTo(ins.getValidTo() != null ? ins.getValidTo().toString() : null)
                .isPrimary(Boolean.TRUE.equals(ins.getIsPrimary()))
                .createdBy(ins.getCreatedBy())
                .createdAt(ins.getCreatedAt() != null ? ins.getCreatedAt().toString() : null)
                .updatedBy(ins.getUpdatedBy())
                .updatedAt(ins.getUpdatedAt() != null ? ins.getUpdatedAt().toString() : null)
                .build();
    }

    private String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getUsername();
        }
        return "system";
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }
}
