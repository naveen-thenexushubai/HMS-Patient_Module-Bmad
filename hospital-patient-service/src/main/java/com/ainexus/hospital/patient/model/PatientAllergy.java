package com.ainexus.hospital.patient.model;

import com.ainexus.hospital.patient.config.AesEncryptionConverter;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "patient_allergies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientAllergy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, length = 10)
    private String patientId;

    // PHI fields — AES-256-GCM encrypted at rest
    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "allergy_name", nullable = false, columnDefinition = "TEXT")
    private String allergyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "allergy_type", nullable = false, length = 30)
    private AllergyType allergyType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 30)
    private AllergySeverity severity;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "reaction", columnDefinition = "TEXT")
    private String reaction;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Convert(converter = AesEncryptionConverter.class)
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by", nullable = false, length = 100)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
