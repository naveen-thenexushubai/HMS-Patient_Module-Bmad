package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PatientAllergyRequest;
import com.ainexus.hospital.patient.dto.response.PatientAllergyResponse;
import com.ainexus.hospital.patient.service.PatientAllergyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/allergies")
@RequiredArgsConstructor
@Tag(name = "Allergies", description = "Patient allergy management endpoints")
public class PatientAllergyController {

    private final PatientAllergyService allergyService;

    @Operation(summary = "Get active allergies for a patient")
    @GetMapping
    public ResponseEntity<List<PatientAllergyResponse>> getAllergies(@PathVariable String patientId) {
        return ResponseEntity.ok(allergyService.getAllergies(patientId));
    }

    @Operation(summary = "Check if patient has critical allergy (SEVERE or LIFE_THREATENING)")
    @GetMapping("/critical-check")
    public ResponseEntity<Map<String, Boolean>> hasCriticalAllergy(@PathVariable String patientId) {
        return ResponseEntity.ok(Map.of("hasCriticalAllergy", allergyService.hasCriticalAllergy(patientId)));
    }

    @Operation(summary = "Add an allergy record")
    @PostMapping
    public ResponseEntity<PatientAllergyResponse> addAllergy(
            @PathVariable String patientId,
            @Valid @RequestBody PatientAllergyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(allergyService.addAllergy(patientId, request));
    }

    @Operation(summary = "Update an allergy record")
    @PutMapping("/{id}")
    public ResponseEntity<PatientAllergyResponse> updateAllergy(
            @PathVariable String patientId,
            @PathVariable Long id,
            @Valid @RequestBody PatientAllergyRequest request) {
        return ResponseEntity.ok(allergyService.updateAllergy(patientId, id, request));
    }

    @Operation(summary = "Soft-delete an allergy record (sets isActive=false)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAllergy(
            @PathVariable String patientId,
            @PathVariable Long id) {
        allergyService.deactivateAllergy(patientId, id);
        return ResponseEntity.noContent().build();
    }
}
