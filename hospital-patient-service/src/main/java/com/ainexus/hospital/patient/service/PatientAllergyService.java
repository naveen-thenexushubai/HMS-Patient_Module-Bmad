package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.PatientAllergyRequest;
import com.ainexus.hospital.patient.dto.response.PatientAllergyResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.AllergySeverity;
import com.ainexus.hospital.patient.model.PatientAllergy;
import com.ainexus.hospital.patient.repository.PatientAllergyRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientAllergyService {

    private final PatientAllergyRepository allergyRepository;
    private final PatientRepository patientRepository;

    private static final List<AllergySeverity> CRITICAL_SEVERITIES =
            List.of(AllergySeverity.SEVERE, AllergySeverity.LIFE_THREATENING);

    @Transactional(readOnly = true)
    public List<PatientAllergyResponse> getAllergies(String patientId) {
        validatePatientExists(patientId);
        return allergyRepository
                .findByPatientIdAndIsActiveTrueOrderBySeverityDescCreatedAtDesc(patientId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public boolean hasCriticalAllergy(String patientId) {
        return allergyRepository.existsByPatientIdAndSeverityInAndIsActiveTrue(patientId, CRITICAL_SEVERITIES);
    }

    public PatientAllergyResponse addAllergy(String patientId, PatientAllergyRequest request) {
        validatePatientExists(patientId);

        PatientAllergy allergy = PatientAllergy.builder()
                .patientId(patientId)
                .allergyName(request.getAllergyName())
                .allergyType(request.getAllergyType())
                .severity(request.getSeverity())
                .reaction(request.getReaction())
                .onsetDate(parseDate(request.getOnsetDate()))
                .notes(request.getNotes())
                .isActive(true)
                .createdBy(getCurrentUsername())
                .createdAt(Instant.now())
                .build();

        PatientAllergy saved = allergyRepository.save(allergy);
        log.info("Allergy added patientId={} allergyId={} severity={} userId={}",
                patientId, saved.getId(), saved.getSeverity(), getCurrentUserId());
        return toResponse(saved);
    }

    public PatientAllergyResponse updateAllergy(String patientId, Long allergyId, PatientAllergyRequest request) {
        PatientAllergy allergy = allergyRepository.findByIdAndPatientId(allergyId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Allergy record not found"));

        if (!allergy.getIsActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update an inactive allergy record");
        }

        allergy.setAllergyName(request.getAllergyName());
        allergy.setAllergyType(request.getAllergyType());
        allergy.setSeverity(request.getSeverity());
        allergy.setReaction(request.getReaction());
        allergy.setOnsetDate(parseDate(request.getOnsetDate()));
        allergy.setNotes(request.getNotes());
        allergy.setUpdatedBy(getCurrentUsername());
        allergy.setUpdatedAt(Instant.now());

        PatientAllergy saved = allergyRepository.save(allergy);
        log.info("Allergy updated patientId={} allergyId={} severity={} userId={}",
                patientId, allergyId, saved.getSeverity(), getCurrentUserId());
        return toResponse(saved);
    }

    public void deactivateAllergy(String patientId, Long allergyId) {
        PatientAllergy allergy = allergyRepository.findByIdAndPatientId(allergyId, patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Allergy record not found"));

        allergy.setIsActive(false);
        allergy.setUpdatedBy(getCurrentUsername());
        allergy.setUpdatedAt(Instant.now());
        allergyRepository.save(allergy);
        log.info("Allergy deactivated patientId={} allergyId={} userId={}", patientId, allergyId, getCurrentUserId());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void validatePatientExists(String patientId) {
        if (!patientRepository.findByPatientId(patientId).isPresent()) {
            throw new PatientNotFoundException(patientId);
        }
    }

    private LocalDate parseDate(String date) {
        if (!StringUtils.hasText(date)) return null;
        try { return LocalDate.parse(date); } catch (Exception e) { return null; }
    }

    private PatientAllergyResponse toResponse(PatientAllergy a) {
        return PatientAllergyResponse.builder()
                .id(a.getId())
                .patientId(a.getPatientId())
                .allergyName(a.getAllergyName())
                .allergyType(a.getAllergyType())
                .severity(a.getSeverity())
                .reaction(a.getReaction())
                .onsetDate(a.getOnsetDate() != null ? a.getOnsetDate().toString() : null)
                .notes(a.getNotes())
                .isActive(a.getIsActive())
                .createdBy(a.getCreatedBy())
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .updatedBy(a.getUpdatedBy())
                .updatedAt(a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : null)
                .build();
    }

    private String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUsername();
        return "system";
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) return up.getUserId();
        return "system";
    }
}
