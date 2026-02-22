package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.AllergySeverity;
import com.ainexus.hospital.patient.model.PatientAllergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientAllergyRepository extends JpaRepository<PatientAllergy, Long> {

    /** Active allergies ordered by severity desc (LIFE_THREATENING first), then createdAt desc. */
    List<PatientAllergy> findByPatientIdAndIsActiveTrueOrderBySeverityDescCreatedAtDesc(String patientId);

    /** All allergies (including inactive) — for admin audit purposes. */
    List<PatientAllergy> findByPatientIdOrderByCreatedAtDesc(String patientId);

    Optional<PatientAllergy> findByIdAndPatientId(Long id, String patientId);

    /** Check if patient has any critical allergy (SEVERE or LIFE_THREATENING). */
    boolean existsByPatientIdAndSeverityInAndIsActiveTrue(String patientId, List<AllergySeverity> severities);
}
