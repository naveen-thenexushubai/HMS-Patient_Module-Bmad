package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.response.AuditLogResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.repository.AuditLogRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/audit-trail")
@RequiredArgsConstructor
public class PatientAuditTrailController {

    private final AuditLogRepository auditLogRepository;
    private final PatientRepository patientRepository;

    @Operation(summary = "Get full audit trail for a patient (ADMIN only)")
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getAuditTrail(
            @PathVariable String patientId) {
        patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        List<AuditLogResponse> trail = auditLogRepository
                .findByPatientIdOrderByOccurredAtDesc(patientId)
                .stream()
                .map(log -> AuditLogResponse.builder()
                        .id(log.getId())
                        .userId(log.getUserId())
                        .username(log.getUsername())
                        .userRole(log.getUserRole())
                        .action(log.getAction().name())
                        .patientId(log.getPatientId())
                        .ipAddress(log.getIpAddress())
                        .occurredAt(log.getOccurredAt() != null ? log.getOccurredAt().toString() : null)
                        .build())
                .toList();

        return ResponseEntity.ok(trail);
    }
}
