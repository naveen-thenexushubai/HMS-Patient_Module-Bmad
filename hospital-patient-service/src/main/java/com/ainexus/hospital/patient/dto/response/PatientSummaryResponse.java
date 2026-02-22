package com.ainexus.hospital.patient.dto.response;

import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.PatientStatus;
import lombok.Builder;
import lombok.Data;

/**
 * Lightweight patient summary for list/search results.
 * Only non-PHI or minimally necessary fields.
 */
@Data
@Builder
public class PatientSummaryResponse {

    private String patientId;
    private String mrn;
    private String firstName;
    private String lastName;
    private int age;
    private Gender gender;
    private String phoneNumber;
    private PatientStatus status;

    /**
     * Duplicate detection confidence level — only populated when returned
     * from the findPotentialDuplicates endpoint. Null in all other contexts.
     * Values: HIGH (phone match) | MEDIUM (soundex + birth year) | LOW (exact name + birth year)
     */
    private String matchConfidence;
    private String matchReason;
}
