package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.PatientNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface PatientNotificationRepository extends JpaRepository<PatientNotification, Long> {

    List<PatientNotification> findByPatientIdOrderByCreatedAtDesc(String patientId);

    long countByPatientIdAndIsReadFalse(String patientId);

    @Modifying
    @Query("UPDATE PatientNotification n SET n.isRead = true, n.readAt = :now WHERE n.patientId = :patientId AND n.isRead = false")
    void markAllReadByPatientId(@Param("patientId") String patientId, @Param("now") Instant now);
}
