package com.ainexus.hospital.patient.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientInsuranceResponse {
    private Long id;
    private String patientId;
    private String providerName;
    private String policyNumber;
    private String groupNumber;
    private String coverageType;
    private String subscriberName;
    private String subscriberDob;
    private String validFrom;
    private String validTo;
    private Boolean isPrimary;
    private String createdBy;
    private String createdAt;
    private String updatedBy;
    private String updatedAt;
}
