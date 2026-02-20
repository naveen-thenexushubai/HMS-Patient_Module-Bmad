package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByOccurredAtBefore(Instant cutoff);

    List<AuditLog> findByPatientIdOrderByOccurredAtDesc(String patientId);
    // Append-only — no other mutation methods exposed
}
