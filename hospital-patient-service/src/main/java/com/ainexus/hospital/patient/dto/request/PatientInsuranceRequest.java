package com.ainexus.hospital.patient.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PatientInsuranceRequest {

    @NotBlank(message = "Provider name is required")
    @Size(max = 200, message = "Provider name must not exceed 200 characters")
    private String providerName;

    @Size(max = 100)
    private String policyNumber;

    @Size(max = 100)
    private String groupNumber;

    private String coverageType; // INDIVIDUAL, FAMILY, MEDICARE, MEDICAID, OTHER

    @Size(max = 200)
    private String subscriberName;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Subscriber DOB must be YYYY-MM-DD")
    private String subscriberDob;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Valid from must be YYYY-MM-DD")
    private String validFrom;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Valid to must be YYYY-MM-DD")
    private String validTo;

    private Boolean isPrimary;
}
