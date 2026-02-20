package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.Patient;
import com.ainexus.hospital.patient.model.PatientStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientId(String patientId);

    boolean existsByPhoneNumberHash(String phoneNumberHash);

    List<Patient> findByPhoneNumberHashAndPatientIdNot(String phoneNumberHash, String patientId);

    List<Patient> findByFirstNameSearchAndLastNameSearchAndBirthYearAndPatientIdNot(
            String firstNameSearch, String lastNameSearch, Integer birthYear, String patientId);

    /**
     * DB-level search using indexed search columns.
     *
     * Name / ID / MRN search uses LIKE on plaintext columns.
     * Phone/email search uses HMAC hash exact-match.
     * Advanced filters: city, state, birthYear range, hasAllergies, hasChronicConditions.
     *
     * All PHI fields remain encrypted; search columns are the search surface.
     */
    @Query("""
        SELECT p FROM Patient p
        WHERE (:status IS NULL OR p.status = :status)
          AND (:gender IS NULL OR p.gender = :gender)
          AND (:bloodGroup IS NULL OR :bloodGroup = '' OR p.bloodGroup = :bloodGroup)
          AND (:city IS NULL OR :city = '' OR LOWER(p.city) LIKE LOWER(CONCAT('%', :city, '%')))
          AND (:state IS NULL OR :state = '' OR LOWER(p.state) LIKE LOWER(CONCAT('%', :state, '%')))
          AND (:birthYearFrom IS NULL OR p.birthYear >= :birthYearFrom)
          AND (:birthYearTo   IS NULL OR p.birthYear <= :birthYearTo)
          AND (:hasAllergies IS NULL OR p.hasAllergies = :hasAllergies)
          AND (:hasChronicConditions IS NULL OR p.hasChronicConditions = :hasChronicConditions)
          AND (:search IS NULL OR :search = '' OR (
                LOWER(p.patientId) LIKE LOWER(CONCAT('%', :search, '%')) OR
                (p.mrn IS NOT NULL AND LOWER(p.mrn) LIKE LOWER(CONCAT('%', :search, '%'))) OR
                LOWER(p.firstNameSearch) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(p.lastNameSearch)  LIKE LOWER(CONCAT('%', :search, '%')) OR
                (:phoneHash <> '' AND p.phoneNumberHash = :phoneHash) OR
                (:emailHash <> '' AND p.emailHash       = :emailHash)
              ))
        """)
    Page<Patient> searchPatients(
            @Param("search")               String search,
            @Param("phoneHash")            String phoneHash,
            @Param("emailHash")            String emailHash,
            @Param("status")               PatientStatus status,
            @Param("gender")               Gender gender,
            @Param("bloodGroup")           String bloodGroup,
            @Param("city")                 String city,
            @Param("state")                String state,
            @Param("birthYearFrom")        Integer birthYearFrom,
            @Param("birthYearTo")          Integer birthYearTo,
            @Param("hasAllergies")         Boolean hasAllergies,
            @Param("hasChronicConditions") Boolean hasChronicConditions,
            Pageable pageable
    );
}
