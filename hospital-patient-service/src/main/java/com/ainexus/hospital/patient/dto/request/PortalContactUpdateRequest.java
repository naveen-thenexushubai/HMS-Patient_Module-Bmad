package com.ainexus.hospital.patient.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Patient portal contact update — limited to phone, email, address only.
 * Principle of least privilege: patients cannot change identity fields (name, DOB, gender).
 */
@Data
public class PortalContactUpdateRequest {

    @Pattern(
        regexp = "^$|(\\+1-?)?\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$",
        message = "Phone number must be in format +1-XXX-XXX-XXXX, (XXX) XXX-XXXX, or XXX-XXX-XXXX"
    )
    private String phoneNumber;

    @Email(message = "Email must be a valid email address")
    private String email;

    private String address;
    private String city;
    private String state;
    private String zipCode;
}
