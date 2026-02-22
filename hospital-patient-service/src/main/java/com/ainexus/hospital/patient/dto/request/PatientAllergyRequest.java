package com.ainexus.hospital.patient.dto.request;

import com.ainexus.hospital.patient.model.AllergyType;
import com.ainexus.hospital.patient.model.AllergySeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PatientAllergyRequest {

    @NotBlank(message = "Allergy name is required")
    @Size(max = 200, message = "Allergy name must not exceed 200 characters")
    private String allergyName;

    @NotNull(message = "Allergy type is required")
    private AllergyType allergyType;

    @NotNull(message = "Severity is required")
    private AllergySeverity severity;

    @Size(max = 500, message = "Reaction description must not exceed 500 characters")
    private String reaction;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "Onset date must be in format YYYY-MM-DD")
    private String onsetDate;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
