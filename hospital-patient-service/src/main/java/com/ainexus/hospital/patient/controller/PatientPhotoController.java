package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.audit.AuditAction;
import com.ainexus.hospital.patient.audit.AuditWriter;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.AuditLog;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/patients/{patientId}/photo")
@RequiredArgsConstructor
@Tag(name = "Patient Photo", description = "Patient photo upload and retrieval")
public class PatientPhotoController {

    private static final long   MAX_BYTES        = 2L * 1024 * 1024; // 2 MB
    private static final String DEFAULT_CONTENT  = "image/jpeg";

    private final PatientRepository patientRepository;
    private final AuditWriter       auditWriter;

    @Operation(summary = "Upload or replace patient photo (max 2 MB)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @PathVariable String patientId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        if (file.getSize() > MAX_BYTES) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of("error", "File exceeds 2 MB limit"));
        }

        String contentType = file.getContentType() != null ? file.getContentType() : DEFAULT_CONTENT;
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patient.setPhoto(file.getBytes());
        patient.setPhotoContentType(contentType);
        patientRepository.save(patient);

        writeAudit(AuditAction.PHOTO_UPLOAD, patientId, principal);
        log.info("Photo uploaded patientId={}", patientId);

        return ResponseEntity.ok(Map.of("message", "Photo uploaded successfully"));
    }

    @Operation(summary = "Download patient photo")
    @GetMapping
    public ResponseEntity<byte[]> getPhoto(@PathVariable String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        if (patient.getPhoto() == null || patient.getPhoto().length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = patient.getPhotoContentType() != null
                ? patient.getPhotoContentType() : DEFAULT_CONTENT;

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                .body(patient.getPhoto());
    }

    @Operation(summary = "Delete patient photo")
    @DeleteMapping
    public ResponseEntity<Map<String, String>> deletePhoto(
            @PathVariable String patientId,
            @AuthenticationPrincipal UserPrincipal principal) {

        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patient.setPhoto(null);
        patient.setPhotoContentType(null);
        patientRepository.save(patient);

        writeAudit(AuditAction.PHOTO_DELETE, patientId, principal);
        log.info("Photo deleted patientId={}", patientId);

        return ResponseEntity.ok(Map.of("message", "Photo deleted successfully"));
    }

    private void writeAudit(AuditAction action, String patientId, UserPrincipal principal) {
        if (principal == null) return;
        auditWriter.write(AuditLog.builder()
                .userId(principal.getUserId())
                .username(principal.getUsername())
                .userRole(principal.getRole())
                .action(action)
                .patientId(patientId)
                .occurredAt(Instant.now())
                .build());
    }
}
