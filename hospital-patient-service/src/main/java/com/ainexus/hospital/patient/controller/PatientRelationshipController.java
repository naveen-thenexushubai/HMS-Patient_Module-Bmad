package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.AddRelationshipRequest;
import com.ainexus.hospital.patient.dto.response.PatientRelationshipResponse;
import com.ainexus.hospital.patient.service.PatientRelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/relationships")
@RequiredArgsConstructor
@Tag(name = "Patient Relationships", description = "Family and relationship linking")
public class PatientRelationshipController {

    private final PatientRelationshipService relationshipService;

    @Operation(summary = "List all relationships for a patient")
    @GetMapping
    public ResponseEntity<List<PatientRelationshipResponse>> getRelationships(
            @PathVariable String patientId) {
        return ResponseEntity.ok(relationshipService.getRelationships(patientId));
    }

    @Operation(summary = "Add a family/relationship link")
    @PostMapping
    public ResponseEntity<PatientRelationshipResponse> addRelationship(
            @PathVariable String patientId,
            @Valid @RequestBody AddRelationshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(relationshipService.addRelationship(patientId, request));
    }

    @Operation(summary = "Remove a relationship link")
    @DeleteMapping("/{relatedPatientId}")
    public ResponseEntity<Void> removeRelationship(
            @PathVariable String patientId,
            @PathVariable String relatedPatientId) {
        relationshipService.removeRelationship(patientId, relatedPatientId);
        return ResponseEntity.noContent().build();
    }
}
