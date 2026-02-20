package com.ainexus.hospital.patient.repository;

import com.ainexus.hospital.patient.audit.AuditLogArchive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogArchiveRepository extends JpaRepository<AuditLogArchive, Long> {
    // Append-only — no delete or update methods exposed
}
