package com.ainexus.hospital.patient.model;

import com.ainexus.hospital.patient.config.AesEncryptionConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true, length = 10)
    private String patientId;

    // Personal Information — PHI fields encrypted at rest
    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "date_of_birth", nullable = false)
    private String dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false, length = 20)
    private Gender gender;

    // Contact Information — PHI fields encrypted at rest
    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "email")
    private String email;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "address")
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    // Emergency Contact — PHI encrypted at rest
    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relationship", length = 100)
    private String emergencyContactRelationship;

    // Medical Information — PHI encrypted at rest
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "known_allergies")
    private String knownAllergies;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "chronic_conditions")
    private String chronicConditions;

    // Search index columns — populated on write for DB-level querying.
    // PHI is still stored encrypted above; these enable efficient search
    // without loading all records into memory.
    @Column(name = "first_name_search", length = 100)
    private String firstNameSearch;   // lowercase, trimmed — LIKE queries

    @Column(name = "last_name_search", length = 100)
    private String lastNameSearch;    // lowercase, trimmed — LIKE queries

    @Column(name = "phone_number_hash", length = 64)
    private String phoneNumberHash;   // HMAC-SHA256 of digits-only phone

    @Column(name = "email_hash", length = 64)
    private String emailHash;         // HMAC-SHA256 of lowercase email

    // Phonetic search columns — Soundex codes for duplicate detection (v2.0.0 REQ-8)
    @Column(name = "first_name_soundex", length = 10)
    private String firstNameSoundex;  // Soundex code of firstName (e.g. "J500" for "John")

    @Column(name = "last_name_soundex", length = 10)
    private String lastNameSoundex;   // Soundex code of lastName

    // Status & Audit
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    @Builder.Default
    private PatientStatus status = PatientStatus.ACTIVE;

    @Column(name = "registered_by", nullable = false, length = 100)
    private String registeredBy;

    @Column(name = "registered_at", nullable = false)
    private Instant registeredAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Clinical Gap Features
    @Column(name = "mrn", length = 15, unique = true)
    private String mrn;

    @Column(name = "photo")
    private byte[] photo;

    @Column(name = "photo_content_type", length = 50)
    private String photoContentType;

    @Column(name = "birth_year")
    private Integer birthYear;  // plaintext for DOB-range search without decrypting all records

    @Column(name = "has_allergies")
    @Builder.Default
    private Boolean hasAllergies = false;

    @Column(name = "has_chronic_conditions")
    @Builder.Default
    private Boolean hasChronicConditions = false;
}
