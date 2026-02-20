package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.PatientVitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientVitalsRepository extends JpaRepository<PatientVitals, Long> {
    List<PatientVitals> findTop50ByPatientIdOrderByRecordedAtDesc(String patientId);
}
