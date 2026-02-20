package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.model.PatientStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository slice test using H2 in-memory database.
 *
 * Flyway is disabled so Hibernate creates the schema from entity annotations.
 * The encryption key is provided as a test property so AesEncryptionConverter
 * can encrypt/decrypt PHI fields; search index columns (firstNameSearch, etc.)
 * are plaintext and are the fields exercised by the JPQL query under test.
 */
@DataJpaTest
@TestPropertySource(properties = {
    "spring.flyway.enabled=false",
    "app.encryption.key=test-encryption-key-for-unit-tests!"  // 40 chars, trimmed to 32 bytes
})
class PatientRepositoryTest {

    @Autowired PatientRepository patientRepository;

    private static final PageRequest PAGE = PageRequest.of(0, 20);

    @BeforeEach
    void seed() {
        patientRepository.deleteAll();
        patientRepository.save(makePatient("P2026001", "john",  "doe",     "hash-555-0001", "hash-john@x.com",  Gender.MALE,   PatientStatus.ACTIVE,   "A+"));
        patientRepository.save(makePatient("P2026002", "jane",  "smith",   "hash-555-0002", "hash-jane@x.com",  Gender.FEMALE, PatientStatus.INACTIVE, "B+"));
        patientRepository.save(makePatient("P2026003", "alice", "johnson", "hash-555-0003", "hash-alice@x.com", Gender.FEMALE, PatientStatus.ACTIVE,   "O+"));
    }

    // ── existsByPhoneNumberHash ────────────────────────────────────────────────

    @Test
    void existsByPhoneNumberHash_returnsTrue_whenHashExists() {
        assertTrue(patientRepository.existsByPhoneNumberHash("hash-555-0001"));
    }

    @Test
    void existsByPhoneNumberHash_returnsFalse_whenHashAbsent() {
        assertFalse(patientRepository.existsByPhoneNumberHash("hash-unknown"));
    }

    // ── searchPatients — no filters ───────────────────────────────────────────

    @Test
    void search_noFilters_returnsAllPatients() {
        Page<Patient> result = search(null, "", "", null, null, null);
        assertEquals(3, result.getTotalElements());
    }

    // ── searchPatients — status filter ────────────────────────────────────────

    @Test
    void search_activeStatus_returnsOnlyActivePatients() {
        Page<Patient> result = search(null, "", "", PatientStatus.ACTIVE, null, null);
        assertEquals(2, result.getTotalElements());
        result.getContent().forEach(p -> assertEquals(PatientStatus.ACTIVE, p.getStatus()));
    }

    @Test
    void search_inactiveStatus_returnsOnlyInactivePatients() {
        Page<Patient> result = search(null, "", "", PatientStatus.INACTIVE, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026002", result.getContent().get(0).getPatientId());
    }

    // ── searchPatients — gender filter ────────────────────────────────────────

    @Test
    void search_femaleGender_returnsOnlyFemalePatients() {
        Page<Patient> result = search(null, "", "", null, Gender.FEMALE, null);
        assertEquals(2, result.getTotalElements());
        result.getContent().forEach(p -> assertEquals(Gender.FEMALE, p.getGender()));
    }

    @Test
    void search_maleGender_returnsOnlyMalePatients() {
        Page<Patient> result = search(null, "", "", null, Gender.MALE, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026001", result.getContent().get(0).getPatientId());
    }

    // ── searchPatients — blood group filter ───────────────────────────────────

    @Test
    void search_bloodGroupFilter_returnsMatchingPatients() {
        Page<Patient> result = search(null, "", "", null, null, "A+");
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026001", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_bloodGroupFilter_noMatch_returnsEmpty() {
        Page<Patient> result = search(null, "", "", null, null, "AB-");
        assertEquals(0, result.getTotalElements());
    }

    // ── searchPatients — text search ──────────────────────────────────────────

    @Test
    void search_byFirstNamePrefix_returnsMatchingPatient() {
        Page<Patient> result = search("ali", "", "", null, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026003", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_byLastName_returnsMatchingPatient() {
        Page<Patient> result = search("smith", "", "", null, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026002", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_byPatientId_returnsExactMatch() {
        Page<Patient> result = search("P2026001", "", "", null, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026001", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_byPhoneHash_returnsExactMatch() {
        // Phone/email search is hash-based exact match; text term can be anything
        Page<Patient> result = search("anything", "hash-555-0002", "", null, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026002", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_byEmailHash_returnsExactMatch() {
        Page<Patient> result = search("anything", "", "hash-alice@x.com", null, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026003", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_noTextMatch_returnsEmpty() {
        Page<Patient> result = search("zzznomatch", "", "", null, null, null);
        assertEquals(0, result.getTotalElements());
    }

    // ── searchPatients — combined filters ─────────────────────────────────────

    @Test
    void search_statusAndGender_combinedFilter() {
        // ACTIVE + FEMALE should return only alice (jane is INACTIVE)
        Page<Patient> result = search(null, "", "", PatientStatus.ACTIVE, Gender.FEMALE, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026003", result.getContent().get(0).getPatientId());
    }

    @Test
    void search_textAndStatus_combinedFilter() {
        // "doe" matches john (ACTIVE) — should return 1
        Page<Patient> result = search("doe", "", "", PatientStatus.ACTIVE, null, null);
        assertEquals(1, result.getTotalElements());
        assertEquals("P2026001", result.getContent().get(0).getPatientId());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Page<Patient> search(String text, String phoneHash, String emailHash,
                                  PatientStatus status, Gender gender, String bloodGroup) {
        return patientRepository.searchPatients(
                text, phoneHash, emailHash, status, gender, bloodGroup,
                null, null, null, null, null, null, PAGE);
    }

    private Patient makePatient(String patientId, String firstSearch, String lastSearch,
                                 String phoneHash, String emailHash,
                                 Gender gender, PatientStatus status, String bloodGroup) {
        return Patient.builder()
                .patientId(patientId)
                // Encrypted PHI — values don't matter for search tests;
                // AesEncryptionConverter will encrypt them transparently.
                .firstName(firstSearch)
                .lastName(lastSearch)
                .dateOfBirth("2000-01-01")
                .gender(gender)
                .phoneNumber("555-000-0001")
                // Plaintext search index columns — these drive the JPQL query
                .firstNameSearch(firstSearch)
                .lastNameSearch(lastSearch)
                .phoneNumberHash(phoneHash)
                .emailHash(emailHash)
                .bloodGroup(bloodGroup)
                .status(status)
                .registeredBy("test-user")
                .registeredAt(Instant.now())
                .build();
    }
}
