package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PatientCreateRequest;
import com.ainexus.hospital.patient.dto.request.PatientStatusRequest;
import com.ainexus.hospital.patient.dto.request.PatientUpdateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.dto.response.PatientSummaryResponse;
import com.ainexus.hospital.patient.model.PatientStatus;
import com.ainexus.hospital.patient.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
@Tag(name = "Patients", description = "Patient management endpoints")
public class PatientController {

    private final PatientService patientService;

    @Operation(summary = "Register a new patient")
    @PostMapping
    public ResponseEntity<PatientResponse> registerPatient(
            @Valid @RequestBody PatientCreateRequest request) {
        PatientResponse response = patientService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Export patient list as CSV")
    @GetMapping("/export")
    public void exportCsv(
            HttpServletResponse response,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PatientStatus status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Integer birthYearFrom,
            @RequestParam(required = false) Integer birthYearTo,
            @RequestParam(required = false) Boolean hasAllergies,
            @RequestParam(required = false) Boolean hasChronicConditions) throws IOException {
        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=patients_export.csv");
        patientService.streamCsvExport(response.getWriter(), search, status, gender, bloodGroup,
                city, state, birthYearFrom, birthYearTo, hasAllergies, hasChronicConditions);
    }

    @Operation(summary = "Search and list patients")
    @GetMapping
    public ResponseEntity<Page<PatientSummaryResponse>> searchPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PatientStatus status,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Integer birthYearFrom,
            @RequestParam(required = false) Integer birthYearTo,
            @RequestParam(required = false) Boolean hasAllergies,
            @RequestParam(required = false) Boolean hasChronicConditions,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
            Sort.by("lastName", "firstName"));
        Page<PatientSummaryResponse> result =
            patientService.searchPatients(search, status, gender, bloodGroup,
                city, state, birthYearFrom, birthYearTo, hasAllergies, hasChronicConditions,
                pageable);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get potential duplicate patients (same phone number)")
    @GetMapping("/{patientId}/potential-duplicates")
    public ResponseEntity<List<PatientSummaryResponse>> getPotentialDuplicates(
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientService.findPotentialDuplicates(patientId));
    }

    @Operation(summary = "Get patient profile by Patient ID")
    @GetMapping("/{patientId}")
    public ResponseEntity<PatientResponse> getPatient(
            @PathVariable String patientId) {
        return ResponseEntity.ok(patientService.getPatientById(patientId));
    }

    @Operation(summary = "Update patient information")
    @PutMapping("/{patientId}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable String patientId,
            @Valid @RequestBody PatientUpdateRequest request) {
        return ResponseEntity.ok(patientService.updatePatient(patientId, request));
    }

    @Operation(summary = "Update patient status (Admin only)")
    @PatchMapping("/{patientId}/status")
    public ResponseEntity<PatientResponse> updateStatus(
            @PathVariable String patientId,
            @Valid @RequestBody PatientStatusRequest request) {
        PatientResponse response = switch (request.getStatus()) {
            case INACTIVE -> patientService.deactivatePatient(patientId);
            case ACTIVE   -> patientService.activatePatient(patientId);
        };
        return ResponseEntity.ok(response);
    }
}
