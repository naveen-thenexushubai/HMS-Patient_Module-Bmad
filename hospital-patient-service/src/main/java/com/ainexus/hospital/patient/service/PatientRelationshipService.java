package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.AddRelationshipRequest;
import com.ainexus.hospital.patient.dto.response.PatientRelationshipResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.model.PatientRelationship;
import com.ainexus.hospital.patient.repository.PatientRelationshipRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientRelationshipService {

    private final PatientRelationshipRepository relationshipRepository;
    private final PatientRepository             patientRepository;

    /** Inverse relationship types (A→B implies B→A with the inverse type). */
    private static final Map<String, String> INVERSE = Map.of(
        "PARENT",   "CHILD",
        "CHILD",    "PARENT",
        "GUARDIAN", "WARD",
        "WARD",     "GUARDIAN",
        "SPOUSE",   "SPOUSE",
        "SIBLING",  "SIBLING",
        "OTHER",    "OTHER"
    );

    @Transactional(readOnly = true)
    public List<PatientRelationshipResponse> getRelationships(String patientId) {
        requirePatientExists(patientId);
        return relationshipRepository.findByPatientId(patientId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PatientRelationshipResponse addRelationship(String patientId, AddRelationshipRequest req) {
        Patient patient        = requirePatientExists(patientId);
        Patient relatedPatient = requirePatientExists(req.getRelatedPatientId());

        if (patientId.equals(req.getRelatedPatientId())) {
            throw new IllegalArgumentException("A patient cannot be linked to themselves");
        }

        String relType    = req.getRelationshipType().toUpperCase();
        String inverseType = INVERSE.getOrDefault(relType, "OTHER");
        String currentUser = getCurrentUsername();
        Instant now        = Instant.now();

        // Store both directions so each patient sees their own list
        PatientRelationship forward = PatientRelationship.builder()
                .patientId(patientId)
                .relatedPatientId(req.getRelatedPatientId())
                .relationshipType(relType)
                .createdBy(currentUser)
                .createdAt(now)
                .build();

        PatientRelationship inverse = PatientRelationship.builder()
                .patientId(req.getRelatedPatientId())
                .relatedPatientId(patientId)
                .relationshipType(inverseType)
                .createdBy(currentUser)
                .createdAt(now)
                .build();

        relationshipRepository.save(forward);
        relationshipRepository.save(inverse);

        log.info("Linked patients {}<->{} type={}", patientId, req.getRelatedPatientId(), relType);
        return toResponseWithName(forward, relatedPatient);
    }

    public void removeRelationship(String patientId, String relatedPatientId) {
        requirePatientExists(patientId);
        requirePatientExists(relatedPatientId);

        // Delete both directions
        relationshipRepository.deleteByPatientIdAndRelatedPatientId(patientId, relatedPatientId);
        relationshipRepository.deleteByPatientIdAndRelatedPatientId(relatedPatientId, patientId);

        log.info("Unlinked patients {}<->{}", patientId, relatedPatientId);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private Patient requirePatientExists(String patientId) {
        return patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
    }

    private PatientRelationshipResponse toResponse(PatientRelationship rel) {
        String name = patientRepository.findByPatientId(rel.getRelatedPatientId())
                .map(p -> p.getFirstName() + " " + p.getLastName())
                .orElse(rel.getRelatedPatientId());

        return PatientRelationshipResponse.builder()
                .relatedPatientId(rel.getRelatedPatientId())
                .relatedPatientName(name)
                .relationshipType(rel.getRelationshipType())
                .createdBy(rel.getCreatedBy())
                .createdAt(rel.getCreatedAt().toString())
                .build();
    }

    private PatientRelationshipResponse toResponseWithName(PatientRelationship rel, Patient relatedPatient) {
        return PatientRelationshipResponse.builder()
                .relatedPatientId(rel.getRelatedPatientId())
                .relatedPatientName(relatedPatient.getFirstName() + " " + relatedPatient.getLastName())
                .relationshipType(rel.getRelationshipType())
                .createdBy(rel.getCreatedBy())
                .createdAt(rel.getCreatedAt().toString())
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
