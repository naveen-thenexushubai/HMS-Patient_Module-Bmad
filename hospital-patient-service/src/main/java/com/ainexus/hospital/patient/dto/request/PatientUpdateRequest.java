package com.ainexus.hospital.patient.dto.request;

import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.validation.PastDate;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PatientUpdateRequest {

    // Personal Information — mandatory
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Date of birth is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Date of birth must be in format YYYY-MM-DD")
    @PastDate
    private String dateOfBirth;

    @NotNull(message = "Gender is required")
    private Gender gender;

    // Contact Information — phone mandatory
    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(\\+[1-9]\\d{6,14}|(\\+1-?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4})$",
        message = "Phone: international format +917026191993 or US format (XXX) XXX-XXXX"
    )
    private String phoneNumber;

    @Email(message = "Email must be a valid email address")
    private String email;

    private String address;
    private String city;
    private String state;
    private String zipCode;

    // Emergency Contact
    private String emergencyContactName;

    @Pattern(
        regexp = "^$|(\\+[1-9]\\d{6,14}|(\\+1-?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4})$",
        message = "Emergency contact phone must be a valid phone number"
    )
    private String emergencyContactPhone;

    private String emergencyContactRelationship;

    // Medical Information
    private String bloodGroup;
    private String knownAllergies;
    private String chronicConditions;
}
