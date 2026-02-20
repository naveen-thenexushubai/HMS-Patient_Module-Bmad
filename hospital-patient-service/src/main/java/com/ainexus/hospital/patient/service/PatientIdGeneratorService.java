package com.ainexus.hospital.patient.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;

/**
 * Generates unique Patient IDs in format P{year}{seq} (e.g., P2026001).
 * Uses the patient_seq PostgreSQL sequence. The sequence is shared across years;
 * the year prefix provides human-readable context.
 */
@Service
@RequiredArgsConstructor
public class PatientIdGeneratorService {

    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public String generate() {
        Long nextVal = (Long) entityManager
            .createNativeQuery("SELECT nextval('patient_seq')")
            .getSingleResult();

        int year = Year.now().getValue();
        return String.format("P%d%03d", year, nextVal);
    }
}
