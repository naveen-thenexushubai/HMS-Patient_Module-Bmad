package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.AppointmentRequest;
import com.ainexus.hospital.patient.dto.request.AppointmentUpdateRequest;
import com.ainexus.hospital.patient.dto.response.AppointmentResponse;
import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.service.PatientAppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Patient appointment scheduling endpoints")
public class PatientAppointmentController {

    private final PatientAppointmentService appointmentService;

    @Operation(summary = "Get all appointments for a patient")
    @GetMapping("/api/v1/patients/{patientId}/appointments")
    public ResponseEntity<List<AppointmentResponse>> getAppointments(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getAppointments(patientId));
    }

    @Operation(summary = "Get upcoming appointments for a patient")
    @GetMapping("/api/v1/patients/{patientId}/appointments/upcoming")
    public ResponseEntity<List<AppointmentResponse>> getUpcomingAppointments(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getUpcomingAppointments(patientId));
    }

    @Operation(summary = "Get visit history (completed appointments) for a patient")
    @GetMapping("/api/v1/patients/{patientId}/appointments/history")
    public ResponseEntity<List<AppointmentResponse>> getVisitHistory(@PathVariable String patientId) {
        return ResponseEntity.ok(appointmentService.getVisitHistory(patientId));
    }

    @Operation(summary = "Book a new appointment")
    @PostMapping("/api/v1/patients/{patientId}/appointments")
    public ResponseEntity<AppointmentResponse> bookAppointment(
            @PathVariable String patientId,
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.bookAppointment(patientId, request));
    }

    @Operation(summary = "Update an appointment (details or status)")
    @PutMapping("/api/v1/patients/{patientId}/appointments/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @PathVariable String patientId,
            @PathVariable Long id,
            @Valid @RequestBody AppointmentUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(patientId, id, request));
    }

    @Operation(summary = "Cancel an appointment")
    @PatchMapping("/api/v1/patients/{patientId}/appointments/{id}/cancel")
    public ResponseEntity<AppointmentResponse> cancelAppointment(
            @PathVariable String patientId,
            @PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.cancelAppointment(patientId, id));
    }

    @Operation(summary = "Global appointment list (Admin/Receptionist)")
    @GetMapping("/api/v1/appointments")
    public ResponseEntity<Page<AppointmentResponse>> getAllAppointments(
            @RequestParam(required = false) String patientId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(
                appointmentService.getAllAppointments(patientId, status, fromDate, toDate,
                        PageRequest.of(page, Math.min(size, 100))));
    }
}
