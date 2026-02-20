package com.ainexus.hospital.patient.audit;

import com.ainexus.hospital.patient.model.AuditLog;
import com.ainexus.hospital.patient.repository.AuditLogRepository;
import com.ainexus.hospital.patient.repository.AuditLogArchiveRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * HIPAA §164.530(j): audit documentation must be retained for 6 years.
 *
 * This service runs nightly and moves audit log entries older than 6 years
 * from the live audit_logs table to audit_logs_archive. Both tables are
 * protected by DB-level immutability triggers (V5 migration).
 *
 * Records in the archive are never deleted — HIPAA retention is indefinite
 * once the 6-year minimum is satisfied.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuditRetentionService {

    private static final long HIPAA_RETENTION_YEARS = 6;

    private final AuditLogRepository        auditLogRepository;
    private final AuditLogArchiveRepository auditLogArchiveRepository;

    /**
     * Runs daily at 02:00 UTC. Moves records older than 6 years to archive.
     */
    @Scheduled(cron = "0 0 2 * * *", zone = "UTC")
    @Transactional
    public void archiveExpiredAuditLogs() {
        Instant cutoff = Instant.now().minus(HIPAA_RETENTION_YEARS * 365, ChronoUnit.DAYS);
        List<AuditLog> toArchive = auditLogRepository.findByOccurredAtBefore(cutoff);

        if (toArchive.isEmpty()) {
            return;
        }

        List<AuditLogArchive> archived = toArchive.stream()
                .map(AuditLogArchive::from)
                .toList();

        auditLogArchiveRepository.saveAll(archived);
        auditLogRepository.deleteAll(toArchive);

        log.info("HIPAA audit retention: archived {} entries older than {} years",
                archived.size(), HIPAA_RETENTION_YEARS);
    }
}
