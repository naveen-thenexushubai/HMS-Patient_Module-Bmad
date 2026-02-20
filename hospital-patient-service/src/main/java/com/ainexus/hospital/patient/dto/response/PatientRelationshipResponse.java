package com.ainexus.hospital.patient.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientRelationshipResponse {
    private String relatedPatientId;
    private String relatedPatientName;
    private String relationshipType;
    private String createdBy;
    private String createdAt;
}
