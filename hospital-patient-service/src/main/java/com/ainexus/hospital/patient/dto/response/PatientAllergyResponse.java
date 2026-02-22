package com.ainexus.hospital.patient.dto.response;

import com.ainexus.hospital.patient.model.AllergyType;
import com.ainexus.hospital.patient.model.AllergySeverity;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientAllergyResponse {

    private Long id;
    private String patientId;
    private String allergyName;
    private AllergyType allergyType;
    private AllergySeverity severity;
    private String reaction;
    private String onsetDate;         // YYYY-MM-DD
    private String notes;
    private Boolean isActive;
    private String createdBy;
    private String createdAt;         // ISO 8601 UTC
    private String updatedBy;
    private String updatedAt;         // ISO 8601 UTC
}
