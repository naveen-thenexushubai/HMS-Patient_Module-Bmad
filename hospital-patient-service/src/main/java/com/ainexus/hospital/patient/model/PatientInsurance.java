package com.ainexus.hospital.patient.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "patient_insurance")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientInsurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", length = 10, nullable = false)
    private String patientId;

    @Column(name = "provider_name", length = 200, nullable = false)
    private String providerName;

    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @Column(name = "group_number", length = 100)
    private String groupNumber;

    @Column(name = "coverage_type", length = 50)
    private String coverageType;

    @Column(name = "subscriber_name", length = 200)
    private String subscriberName;

    @Column(name = "subscriber_dob", length = 10)
    private String subscriberDob;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_to")
    private LocalDate validTo;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = true;

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
