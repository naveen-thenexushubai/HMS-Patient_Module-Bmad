package com.ainexus.hospital.patient.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddRelationshipRequest {

    @NotBlank(message = "Related patient ID is required")
    private String relatedPatientId;

    @NotBlank(message = "Relationship type is required")
    private String relationshipType; // SPOUSE | PARENT | CHILD | SIBLING | GUARDIAN | WARD | OTHER
}
