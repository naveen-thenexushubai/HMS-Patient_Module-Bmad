package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.PatientCreateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.mapper.PatientMapper;
import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.model.PatientStatus;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock private PatientRepository         patientRepository;
    @Mock private PatientIdGeneratorService idGeneratorService;
    @Mock private MrnGeneratorService       mrnGeneratorService;
    @Mock private PatientMapper             patientMapper;
    @Mock private SearchIndexService        searchIndexService;

    @InjectMocks private PatientService patientService;

    @BeforeEach
    void setUpSecurityContext() {
        UserPrincipal principal = new UserPrincipal("user-1", "receptionist1", "RECEPTIONIST");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void registerPatient_generatesPatientId_andSetsActiveStatus() {
        PatientCreateRequest request = new PatientCreateRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setDateOfBirth("1990-01-15");
        request.setGender(Gender.MALE);
        request.setPhoneNumber("555-123-4567");

        Patient entity = new Patient();
        entity.setDateOfBirth("1990-01-15");

        Patient saved = new Patient();
        saved.setPatientId("P2026001");
        saved.setFirstName("John");
        saved.setLastName("Doe");
        saved.setDateOfBirth("1990-01-15");
        saved.setGender(Gender.MALE);
        saved.setPhoneNumber("555-123-4567");
        saved.setStatus(PatientStatus.ACTIVE);
        saved.setRegisteredAt(Instant.now());
        saved.setRegisteredBy("receptionist1");

        PatientResponse expectedResponse = PatientResponse.builder()
                .patientId("P2026001")
                .firstName("John")
                .lastName("Doe")
                .status(PatientStatus.ACTIVE)
                .build();

        when(searchIndexService.hashPhone(anyString())).thenReturn("abc123hash");
        when(searchIndexService.nameSearchToken(anyString())).thenReturn("john");
        when(patientRepository.existsByPhoneNumberHash("abc123hash")).thenReturn(false);
        when(idGeneratorService.generate()).thenReturn("P2026001");
        when(mrnGeneratorService.generate()).thenReturn("MRN2026001");
        when(patientMapper.toEntity(request)).thenReturn(entity);
        when(patientRepository.save(any(Patient.class))).thenReturn(saved);
        when(patientMapper.toResponse(saved)).thenReturn(expectedResponse);

        PatientResponse result = patientService.registerPatient(request);

        assertEquals("P2026001", result.getPatientId());
        assertEquals(PatientStatus.ACTIVE, result.getStatus());
        assertFalse(result.isDuplicatePhoneWarning());
        verify(patientRepository).save(any(Patient.class));
    }

    @Test
    void registerPatient_setsDuplicatePhoneWarning_whenPhoneAlreadyExists() {
        PatientCreateRequest request = new PatientCreateRequest();
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setDateOfBirth("1985-06-20");
        request.setGender(Gender.FEMALE);
        request.setPhoneNumber("555-123-4567"); // same phone as existing patient

        Patient entity = new Patient();
        entity.setDateOfBirth("1985-06-20");

        Patient saved = new Patient();
        saved.setPatientId("P2026002");
        saved.setDateOfBirth("1985-06-20");
        saved.setStatus(PatientStatus.ACTIVE);
        saved.setRegisteredAt(Instant.now());
        saved.setRegisteredBy("receptionist1");

        PatientResponse expectedResponse = PatientResponse.builder()
                .patientId("P2026002")
                .status(PatientStatus.ACTIVE)
                .build();

        when(searchIndexService.hashPhone(anyString())).thenReturn("abc123hash");
        when(searchIndexService.nameSearchToken(anyString())).thenReturn("jane");
        when(patientRepository.existsByPhoneNumberHash("abc123hash")).thenReturn(true);
        when(idGeneratorService.generate()).thenReturn("P2026002");
        when(mrnGeneratorService.generate()).thenReturn("MRN2026002");
        when(patientMapper.toEntity(request)).thenReturn(entity);
        when(patientRepository.save(any(Patient.class))).thenReturn(saved);
        when(patientMapper.toResponse(saved)).thenReturn(expectedResponse);

        PatientResponse result = patientService.registerPatient(request);

        assertTrue(result.isDuplicatePhoneWarning(), "Should flag duplicate phone warning");
        assertEquals("P2026002", result.getPatientId());
    }

    @Test
    void getPatientById_throwsNotFound_whenPatientDoesNotExist() {
        when(patientRepository.findByPatientId("P9999999")).thenReturn(Optional.empty());
        assertThrows(PatientNotFoundException.class, () -> patientService.getPatientById("P9999999"));
    }

    @Test
    void deactivatePatient_setsStatusToInactive() {
        Patient patient = new Patient();
        patient.setPatientId("P2026001");
        patient.setDateOfBirth("1990-01-15");
        patient.setStatus(PatientStatus.ACTIVE);

        PatientResponse expectedResponse = PatientResponse.builder()
                .patientId("P2026001")
                .status(PatientStatus.INACTIVE)
                .build();

        when(patientRepository.findByPatientId("P2026001")).thenReturn(Optional.of(patient));
        when(patientRepository.save(patient)).thenReturn(patient);
        when(patientMapper.toResponse(patient)).thenReturn(expectedResponse);

        PatientResponse result = patientService.deactivatePatient("P2026001");

        assertEquals(PatientStatus.INACTIVE, result.getStatus());
        assertEquals(PatientStatus.INACTIVE, patient.getStatus());
    }
}
