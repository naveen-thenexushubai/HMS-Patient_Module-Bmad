package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PatientVitalsRequest;
import com.ainexus.hospital.patient.dto.response.PatientVitalsResponse;
import com.ainexus.hospital.patient.service.PatientVitalsService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/patients/{patientId}/vitals")
@RequiredArgsConstructor
public class PatientVitalsController {

    private final PatientVitalsService vitalsService;

    @Operation(summary = "Get vitals history for a patient")
    @GetMapping
    public ResponseEntity<List<PatientVitalsResponse>> getVitals(
            @PathVariable String patientId) {
        return ResponseEntity.ok(vitalsService.getVitals(patientId));
    }

    @Operation(summary = "Record vitals for a patient")
    @PostMapping
    public ResponseEntity<PatientVitalsResponse> recordVitals(
            @PathVariable String patientId,
            @Valid @RequestBody PatientVitalsRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vitalsService.recordVitals(patientId, request));
    }
}
