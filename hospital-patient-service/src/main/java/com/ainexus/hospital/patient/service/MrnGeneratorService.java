package com.ainexus.hospital.patient.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

/**
 * Generates unique Medical Record Numbers in format MRN{year}{seq} (e.g., MRN2026001).
 * Uses the mrn_seq PostgreSQL sequence. Runs in REQUIRES_NEW to avoid transaction conflicts.
 */
@Service
@RequiredArgsConstructor
public class MrnGeneratorService {

    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generate() {
        Long nextVal = (Long) entityManager
            .createNativeQuery("SELECT nextval('mrn_seq')")
            .getSingleResult();

        int year = Year.now().getValue();
        return String.format("MRN%d%03d", year, nextVal);
    }
}
