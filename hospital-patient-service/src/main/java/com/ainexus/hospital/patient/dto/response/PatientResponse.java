package com.ainexus.hospital.patient.dto.response;

import com.ainexus.hospital.patient.model.Gender;
import com.ainexus.hospital.patient.model.PatientStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PatientResponse {

    // Identity
    private String patientId;
    private String mrn;
    private boolean hasPhoto;

    // Personal Information
    private String firstName;
    private String lastName;
    private String dateOfBirth;
    private int age;
    private Gender gender;

    // Contact Information
    private String phoneNumber;
    private String email;
    private String address;
    private String city;
    private String state;
    private String zipCode;

    // Emergency Contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    // Medical Information
    private String bloodGroup;
    private String knownAllergies;
    private String chronicConditions;
    private boolean hasAllergies;
    private boolean hasChronicConditions;

    // Duplicate phone warning — true if another patient already has this phone number.
    // Registration proceeds regardless (PRD REQ-1.11).
    private boolean duplicatePhoneWarning;

    // Status & Audit (ISO 8601 UTC)
    private PatientStatus status;
    private String registeredBy;
    private String registeredAt;
    private String updatedBy;
    private String updatedAt;
}
