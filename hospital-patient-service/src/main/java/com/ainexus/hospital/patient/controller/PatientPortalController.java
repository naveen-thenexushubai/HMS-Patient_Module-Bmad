package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PortalContactUpdateRequest;
import com.ainexus.hospital.patient.dto.response.AppointmentResponse;
import com.ainexus.hospital.patient.dto.response.PatientAllergyResponse;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.service.PatientAllergyService;
import com.ainexus.hospital.patient.service.PatientAppointmentService;
import com.ainexus.hospital.patient.service.PatientPortalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portal")
@RequiredArgsConstructor
@Tag(name = "Patient Portal", description = "Self-service endpoints for authenticated patients")
public class PatientPortalController {

    private final PatientPortalService portalService;
    private final PatientAppointmentService appointmentService;
    private final PatientAllergyService allergyService;

    @Operation(summary = "Get own patient profile")
    @GetMapping("/me")
    public ResponseEntity<PatientResponse> getMyProfile(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        portalService.logPortalAccess(patientId, auth);
        return ResponseEntity.ok(portalService.getOwnProfile(patientId));
    }

    @Operation(summary = "Get own upcoming appointments")
    @GetMapping("/me/appointments")
    public ResponseEntity<List<AppointmentResponse>> getMyAppointments(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        return ResponseEntity.ok(appointmentService.getUpcomingAppointments(patientId));
    }

    @Operation(summary = "Get own allergy list")
    @GetMapping("/me/allergies")
    public ResponseEntity<List<PatientAllergyResponse>> getMyAllergies(Authentication auth) {
        String patientId = portalService.resolvePatientId(auth);
        return ResponseEntity.ok(allergyService.getAllergies(patientId));
    }

    @Operation(summary = "Update own contact information")
    @PatchMapping("/me/contact")
    public ResponseEntity<PatientResponse> updateMyContact(
            Authentication auth,
            @Valid @RequestBody PortalContactUpdateRequest request) {
        String patientId = portalService.resolvePatientId(auth);
        return ResponseEntity.ok(portalService.updateContactInfo(patientId, request, auth));
    }
}
