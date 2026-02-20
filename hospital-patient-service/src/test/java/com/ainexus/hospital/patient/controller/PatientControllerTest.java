package com.ainexus.hospital.patient.controller;

import com.ainexus.hospital.patient.dto.request.PatientCreateRequest;
import com.ainexus.hospital.patient.dto.request.PatientStatusRequest;
import com.ainexus.hospital.patient.dto.request.PatientUpdateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.dto.response.PatientSummaryResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.PatientStatus;
import com.ainexus.hospital.patient.security.JwtAuthFilter;
import com.ainexus.hospital.patient.security.SecurityConfig;
import com.ainexus.hospital.patient.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web layer slice test for PatientController.
 *
 * Imports SecurityConfig so that CSRF is disabled and role-based access rules
 * are tested. The JwtAuthFilter mock is configured to forward the filter chain
 * (so Spring Security's AuthorizationFilter runs) while @WithMockUser provides
 * the authentication context.
 */
@WebMvcTest(PatientController.class)
@Import(SecurityConfig.class)
class PatientControllerTest {

    @Autowired MockMvc        mockMvc;
    @Autowired ObjectMapper   objectMapper;

    @MockBean PatientService  patientService;
    @MockBean JwtAuthFilter   jwtAuthFilter; // satisfies SecurityConfig constructor injection

    /** Make the JWT filter mock a transparent pass-through so downstream filters run. */
    @BeforeEach
    void configureJwtFilterToForwardChain() throws Exception {
        doAnswer(invocation -> {
            ((FilterChain) invocation.getArgument(2))
                    .doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any(FilterChain.class));
    }

    // ── POST /api/v1/patients ──────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void registerPatient_returns201_withValidRequest() throws Exception {
        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .firstName("John")
                .lastName("Doe")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.registerPatient(any(PatientCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.patientId").value("P2026001"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void registerPatient_returns400_whenMandatoryFieldsMissing() throws Exception {
        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PatientCreateRequest())))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).registerPatient(any());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void registerPatient_returns400_whenPhoneFormatInvalid() throws Exception {
        PatientCreateRequest req = validCreateRequest();
        req.setPhoneNumber("not-a-phone");

        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).registerPatient(any());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void registerPatient_returns403_forDoctorRole() throws Exception {
        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "NURSE")
    void registerPatient_returns403_forNurseRole() throws Exception {
        mockMvc.perform(post("/api/v1/patients")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateRequest())))
                .andExpect(status().isForbidden());
    }

    // ── GET /api/v1/patients ───────────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void searchPatients_returns200_forReceptionistRole() throws Exception {
        when(patientService.searchPatients(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void searchPatients_returns200_withResults_forDoctorRole() throws Exception {
        PatientSummaryResponse summary = PatientSummaryResponse.builder()
                .patientId("P2026001")
                .firstName("John")
                .lastName("Doe")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.searchPatients(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(summary)));

        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].patientId").value("P2026001"));
    }

    @Test
    @WithMockUser(roles = "NURSE")
    void searchPatients_returns200_forNurseRole() throws Exception {
        when(patientService.searchPatients(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/v1/patients"))
                .andExpect(status().isOk());
    }

    // ── GET /api/v1/patients/{id} ──────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getPatient_returns200_whenFound() throws Exception {
        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .firstName("John")
                .lastName("Doe")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.getPatientById("P2026001")).thenReturn(response);

        mockMvc.perform(get("/api/v1/patients/P2026001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.patientId").value("P2026001"));
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void getPatient_returns200_forDoctorRole() throws Exception {
        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.getPatientById("P2026001")).thenReturn(response);

        mockMvc.perform(get("/api/v1/patients/P2026001"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void getPatient_returns404_whenNotFound() throws Exception {
        when(patientService.getPatientById("P9999999"))
                .thenThrow(new PatientNotFoundException("P9999999"));

        mockMvc.perform(get("/api/v1/patients/P9999999"))
                .andExpect(status().isNotFound());
    }

    // ── PUT /api/v1/patients/{id} ──────────────────────────────────────────────

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void updatePatient_returns200_withValidRequest() throws Exception {
        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .firstName("Jane")
                .lastName("Doe")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.updatePatient(eq("P2026001"), any(PatientUpdateRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/patients/P2026001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void updatePatient_returns400_whenMandatoryFieldsMissing() throws Exception {
        mockMvc.perform(put("/api/v1/patients/P2026001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PatientUpdateRequest())))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).updatePatient(any(), any());
    }

    @Test
    @WithMockUser(roles = "NURSE")
    void updatePatient_returns403_forNurseRole() throws Exception {
        mockMvc.perform(put("/api/v1/patients/P2026001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void updatePatient_returns403_forDoctorRole() throws Exception {
        mockMvc.perform(put("/api/v1/patients/P2026001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateRequest())))
                .andExpect(status().isForbidden());
    }

    // ── PATCH /api/v1/patients/{id}/status ────────────────────────────────────

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_deactivate_returns200_forAdminRole() throws Exception {
        PatientStatusRequest req = new PatientStatusRequest();
        req.setStatus(PatientStatus.INACTIVE);

        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .status(PatientStatus.INACTIVE)
                .build();
        when(patientService.deactivatePatient("P2026001")).thenReturn(response);

        mockMvc.perform(patch("/api/v1/patients/P2026001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_activate_returns200_forAdminRole() throws Exception {
        PatientStatusRequest req = new PatientStatusRequest();
        req.setStatus(PatientStatus.ACTIVE);

        PatientResponse response = PatientResponse.builder()
                .patientId("P2026001")
                .status(PatientStatus.ACTIVE)
                .build();
        when(patientService.activatePatient("P2026001")).thenReturn(response);

        mockMvc.perform(patch("/api/v1/patients/P2026001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    @WithMockUser(roles = "RECEPTIONIST")
    void updateStatus_returns403_forReceptionistRole() throws Exception {
        PatientStatusRequest req = new PatientStatusRequest();
        req.setStatus(PatientStatus.INACTIVE);

        mockMvc.perform(patch("/api/v1/patients/P2026001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());

        verify(patientService, never()).deactivatePatient(any());
    }

    @Test
    @WithMockUser(roles = "DOCTOR")
    void updateStatus_returns403_forDoctorRole() throws Exception {
        PatientStatusRequest req = new PatientStatusRequest();
        req.setStatus(PatientStatus.INACTIVE);

        mockMvc.perform(patch("/api/v1/patients/P2026001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private PatientCreateRequest validCreateRequest() {
        PatientCreateRequest r = new PatientCreateRequest();
        r.setFirstName("John");
        r.setLastName("Doe");
        r.setDateOfBirth("1990-01-15");
        r.setGender(Gender.MALE);
        r.setPhoneNumber("555-123-4567");
        return r;
    }

    private PatientUpdateRequest validUpdateRequest() {
        PatientUpdateRequest r = new PatientUpdateRequest();
        r.setFirstName("Jane");
        r.setLastName("Doe");
        r.setDateOfBirth("1990-01-15");
        r.setGender(Gender.FEMALE);
        r.setPhoneNumber("555-123-4567");
        return r;
    }
}
