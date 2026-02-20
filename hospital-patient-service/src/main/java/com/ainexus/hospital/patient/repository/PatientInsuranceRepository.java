package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.PatientInsurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientInsuranceRepository extends JpaRepository<PatientInsurance, Long> {
    List<PatientInsurance> findByPatientIdOrderByIsPrimaryDescCreatedAtDesc(String patientId);
    Optional<PatientInsurance> findByIdAndPatientId(Long id, String patientId);
}
