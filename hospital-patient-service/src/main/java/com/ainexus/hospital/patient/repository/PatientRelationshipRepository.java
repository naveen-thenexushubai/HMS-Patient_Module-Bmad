package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.PatientRelationship;
import com.ainexus.hospital.patient.model.PatientRelationshipId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRelationshipRepository
        extends JpaRepository<PatientRelationship, PatientRelationshipId> {

    List<PatientRelationship> findByPatientId(String patientId);

    void deleteByPatientIdAndRelatedPatientId(String patientId, String relatedPatientId);
}
