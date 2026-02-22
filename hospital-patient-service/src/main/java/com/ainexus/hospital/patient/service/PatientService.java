package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.dto.request.PatientCreateRequest;
import com.ainexus.hospital.patient.dto.request.PatientStatusRequest;
import com.ainexus.hospital.patient.dto.request.PatientUpdateRequest;
import com.ainexus.hospital.patient.dto.response.PatientResponse;
import com.ainexus.hospital.patient.dto.response.PatientSummaryResponse;
import com.ainexus.hospital.patient.exception.PatientNotFoundException;
import com.ainexus.hospital.patient.mapper.PatientMapper;
import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.model.PatientStatus;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.Instant;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PatientService {

    private final PatientRepository         patientRepository;
    private final PatientIdGeneratorService idGeneratorService;
    private final MrnGeneratorService       mrnGeneratorService;
    private final PatientMapper             patientMapper;
    private final SearchIndexService        searchIndexService;

    public PatientResponse registerPatient(PatientCreateRequest request) {
        // Check for duplicate phone number (PRD REQ-1.11 — warn but allow)
        String phoneHash = searchIndexService.hashPhone(request.getPhoneNumber());
        boolean duplicatePhone = patientRepository.existsByPhoneNumberHash(phoneHash);
        if (duplicatePhone) {
            log.warn("Duplicate phone detected during registration — proceeding per PRD REQ-1.11");
        }

        String patientId   = idGeneratorService.generate();
        String mrn         = mrnGeneratorService.generate();
        String currentUser = getCurrentUsername();

        Patient patient = patientMapper.toEntity(request);
        patient.setPatientId(patientId);
        patient.setMrn(mrn);
        patient.setStatus(PatientStatus.ACTIVE);
        patient.setRegisteredBy(currentUser);
        patient.setRegisteredAt(Instant.now());

        // Populate derived search fields
        populateSearchIndex(patient, request.getFirstName(), request.getLastName(),
                request.getPhoneNumber(), request.getEmail());
        populateDerivedFields(patient, request.getDateOfBirth(),
                request.getKnownAllergies(), request.getChronicConditions());

        Patient saved = patientRepository.save(patient);
        log.info("Patient registered patientId={} mrn={} userId={}", patientId, mrn, getCurrentUserId());

        PatientResponse response = buildResponse(saved);
        response.setDuplicatePhoneWarning(duplicatePhone);
        return response;
    }

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));
        return buildResponse(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientSummaryResponse> searchPatients(String search,
                                                        PatientStatus status,
                                                        String gender,
                                                        String bloodGroup,
                                                        String city,
                                                        String state,
                                                        Integer birthYearFrom,
                                                        Integer birthYearTo,
                                                        Boolean hasAllergies,
                                                        Boolean hasChronicConditions,
                                                        Pageable pageable) {
        // Compute search hashes for exact phone/email lookup
        String phoneHash = (search != null && !search.isBlank())
                ? searchIndexService.hashPhone(search) : "";
        String emailHash = (search != null && !search.isBlank())
                ? searchIndexService.hashEmail(search) : "";

        Gender genderEnum = null;
        if (gender != null && !gender.isBlank()) {
            try { genderEnum = Gender.valueOf(gender.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Page<Patient> page = patientRepository.searchPatients(
                search, phoneHash, emailHash, status, genderEnum, bloodGroup,
                city, state, birthYearFrom, birthYearTo, hasAllergies, hasChronicConditions,
                pageable);

        return page.map(this::buildSummaryResponse);
    }

    @Transactional(readOnly = true)
    public List<PatientSummaryResponse> findPotentialDuplicates(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        // Track each candidate with its confidence level (highest wins on merge)
        Map<String, PatientSummaryResponse> resultMap = new java.util.LinkedHashMap<>();

        // 1. HIGH confidence — phone hash exact match
        if (patient.getPhoneNumberHash() != null && !patient.getPhoneNumberHash().isBlank()) {
            patientRepository.findByPhoneNumberHashAndPatientIdNot(patient.getPhoneNumberHash(), patientId)
                    .forEach(p -> {
                        PatientSummaryResponse r = buildSummaryResponse(p);
                        r.setMatchConfidence("HIGH");
                        r.setMatchReason("Phone number match");
                        resultMap.put(p.getPatientId(), r);
                    });
        }

        // 2. MEDIUM confidence — Soundex phonetic name + same birth year
        if (patient.getFirstNameSoundex() != null && patient.getBirthYear() != null) {
            patientRepository.findByFirstNameSoundexAndLastNameSoundexAndBirthYearAndPatientIdNot(
                            patient.getFirstNameSoundex(), patient.getLastNameSoundex(),
                            patient.getBirthYear(), patientId)
                    .forEach(p -> {
                        if (!resultMap.containsKey(p.getPatientId())) {
                            PatientSummaryResponse r = buildSummaryResponse(p);
                            r.setMatchConfidence("MEDIUM");
                            r.setMatchReason("Name sounds similar + same birth year");
                            resultMap.put(p.getPatientId(), r);
                        }
                    });
        }

        // 3. LOW confidence — exact name token + birth year
        if (patient.getFirstNameSearch() != null && patient.getBirthYear() != null) {
            patientRepository.findByFirstNameSearchAndLastNameSearchAndBirthYearAndPatientIdNot(
                            patient.getFirstNameSearch(), patient.getLastNameSearch(),
                            patient.getBirthYear(), patientId)
                    .forEach(p -> {
                        if (!resultMap.containsKey(p.getPatientId())) {
                            PatientSummaryResponse r = buildSummaryResponse(p);
                            r.setMatchConfidence("LOW");
                            r.setMatchReason("Exact name + birth year match");
                            resultMap.put(p.getPatientId(), r);
                        }
                    });
        }

        return resultMap.values().stream().toList();
    }

    @Transactional(readOnly = true)
    public void streamCsvExport(PrintWriter writer,
                                String search, PatientStatus status, String gender,
                                String bloodGroup, String city, String state,
                                Integer birthYearFrom, Integer birthYearTo,
                                Boolean hasAllergies, Boolean hasChronicConditions) throws IOException {
        String phoneHash = (search != null && !search.isBlank()) ? searchIndexService.hashPhone(search) : "";
        String emailHash = (search != null && !search.isBlank()) ? searchIndexService.hashEmail(search) : "";

        Gender genderEnum = null;
        if (gender != null && !gender.isBlank()) {
            try { genderEnum = Gender.valueOf(gender.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }

        org.springframework.data.domain.Pageable unpaged = org.springframework.data.domain.Pageable.unpaged();
        List<Patient> patients = patientRepository.searchPatients(
                search, phoneHash, emailHash, status, genderEnum, bloodGroup,
                city, state, birthYearFrom, birthYearTo, hasAllergies, hasChronicConditions,
                unpaged).getContent();

        // CSV header
        writer.println("PatientID,MRN,FirstName,LastName,DateOfBirth,Age,Gender,PhoneNumber," +
                "Email,City,State,ZipCode,BloodGroup,KnownAllergies,ChronicConditions,Status,RegisteredAt");

        // CSV rows
        for (Patient p : patients) {
            PatientResponse r = buildResponse(p);
            writer.println(String.join(",",
                    csvField(r.getPatientId()),
                    csvField(r.getMrn()),
                    csvField(r.getFirstName()),
                    csvField(r.getLastName()),
                    csvField(r.getDateOfBirth()),
                    String.valueOf(r.getAge()),
                    csvField(r.getGender() != null ? r.getGender().name() : ""),
                    csvField(r.getPhoneNumber()),
                    csvField(r.getEmail()),
                    csvField(r.getCity()),
                    csvField(r.getState()),
                    csvField(r.getZipCode()),
                    csvField(r.getBloodGroup()),
                    csvField(r.getKnownAllergies()),
                    csvField(r.getChronicConditions()),
                    csvField(r.getStatus() != null ? r.getStatus().name() : ""),
                    csvField(r.getRegisteredAt())
            ));
        }
        writer.flush();
    }

    private static String csvField(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    public PatientResponse updatePatient(String patientId, PatientUpdateRequest request) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patientMapper.updateEntityFromRequest(request, patient);
        patient.setUpdatedBy(getCurrentUsername());
        patient.setUpdatedAt(Instant.now());

        // Refresh search index and derived fields with updated values
        populateSearchIndex(patient, request.getFirstName(), request.getLastName(),
                request.getPhoneNumber(), request.getEmail());
        populateDerivedFields(patient, request.getDateOfBirth(),
                request.getKnownAllergies(), request.getChronicConditions());

        Patient saved = patientRepository.save(patient);
        log.info("Patient updated patientId={} userId={}", patientId, getCurrentUserId());
        return buildResponse(saved);
    }

    public PatientResponse deactivatePatient(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patient.setStatus(PatientStatus.INACTIVE);
        patient.setUpdatedBy(getCurrentUsername());
        patient.setUpdatedAt(Instant.now());

        Patient saved = patientRepository.save(patient);
        log.info("Patient deactivated patientId={} userId={}", patientId, getCurrentUserId());
        return buildResponse(saved);
    }

    public PatientResponse activatePatient(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patient.setStatus(PatientStatus.ACTIVE);
        patient.setUpdatedBy(getCurrentUsername());
        patient.setUpdatedAt(Instant.now());

        Patient saved = patientRepository.save(patient);
        log.info("Patient activated patientId={} userId={}", patientId, getCurrentUserId());
        return buildResponse(saved);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void populateSearchIndex(Patient patient, String firstName, String lastName,
                                     String phone, String email) {
        patient.setFirstNameSearch(searchIndexService.nameSearchToken(firstName));
        patient.setLastNameSearch(searchIndexService.nameSearchToken(lastName));
        patient.setPhoneNumberHash(searchIndexService.hashPhone(phone));
        patient.setEmailHash(searchIndexService.hashEmail(email));
        // Soundex phonetic codes for duplicate detection (v2.0.0 REQ-8)
        patient.setFirstNameSoundex(searchIndexService.soundex(firstName));
        patient.setLastNameSoundex(searchIndexService.soundex(lastName));
    }

    private void populateDerivedFields(Patient patient, String dateOfBirth,
                                       String knownAllergies, String chronicConditions) {
        if (StringUtils.hasText(dateOfBirth)) {
            try {
                patient.setBirthYear(LocalDate.parse(dateOfBirth).getYear());
            } catch (Exception ignored) {}
        }
        patient.setHasAllergies(StringUtils.hasText(knownAllergies));
        patient.setHasChronicConditions(StringUtils.hasText(chronicConditions));
    }

    private PatientResponse buildResponse(Patient patient) {
        PatientResponse response = patientMapper.toResponse(patient);
        response.setAge(calculateAge(patient.getDateOfBirth()));
        return response;
    }

    private PatientSummaryResponse buildSummaryResponse(Patient patient) {
        PatientSummaryResponse summary = patientMapper.toSummaryResponse(patient);
        summary.setAge(calculateAge(patient.getDateOfBirth()));
        return summary;
    }

    private int calculateAge(String dateOfBirth) {
        if (dateOfBirth == null) return 0;
        try {
            return Period.between(LocalDate.parse(dateOfBirth), LocalDate.now()).getYears();
        } catch (Exception e) {
            return 0;
        }
    }

    private String getCurrentUsername() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getUsername();
        }
        return "system";
    }

    private String getCurrentUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal up) {
            return up.getUserId();
        }
        return "system";
    }
}
