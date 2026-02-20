package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PatientInsuranceRequest;
import com.ainexus.hospital.patient.dto.response.PatientInsuranceResponse;
import com.ainexus.hospital.patient.service.PatientInsuranceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/insurance")
@RequiredArgsConstructor
public class PatientInsuranceController {

    private final PatientInsuranceService insuranceService;

    @Operation(summary = "Get insurance records for a patient")
    @GetMapping
    public ResponseEntity<List<PatientInsuranceResponse>> getInsurance(
            @PathVariable String patientId) {
        return ResponseEntity.ok(insuranceService.getInsurance(patientId));
    }

    @Operation(summary = "Add insurance record for a patient")
    @PostMapping
    public ResponseEntity<PatientInsuranceResponse> addInsurance(
            @PathVariable String patientId,
            @Valid @RequestBody PatientInsuranceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(insuranceService.addInsurance(patientId, request));
    }

    @Operation(summary = "Update an insurance record")
    @PutMapping("/{id}")
    public ResponseEntity<PatientInsuranceResponse> updateInsurance(
            @PathVariable String patientId,
            @PathVariable Long id,
            @Valid @RequestBody PatientInsuranceRequest request) {
        return ResponseEntity.ok(insuranceService.updateInsurance(patientId, id, request));
    }

    @Operation(summary = "Delete an insurance record")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInsurance(
            @PathVariable String patientId,
            @PathVariable Long id) {
        insuranceService.deleteInsurance(patientId, id);
        return ResponseEntity.noContent().build();
    }
}
