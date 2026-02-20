package com.ainexus.hospital.patient.audit;

import com.ainexus.hospital.patient.model.AuditLog;
import com.ainexus.hospital.patient.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Writes audit log entries in a brand-new transaction, independent of whatever
 * transaction (including read-only ones) is active on the calling thread.
 *
 * This is required because AuditAspect fires after read-only service methods
 * (e.g. getPatientById) and a REQUIRES_NEW transaction allows the INSERT to
 * proceed even when the outer transaction is read-only.
 */
@Component
@RequiredArgsConstructor
public class AuditWriter {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void write(AuditLog entry) {
        auditLogRepository.save(entry);
    }
}
