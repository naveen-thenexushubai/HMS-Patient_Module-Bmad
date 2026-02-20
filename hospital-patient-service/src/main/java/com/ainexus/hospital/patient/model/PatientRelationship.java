package com.ainexus.hospital.patient.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "patient_relationships")
@IdClass(PatientRelationshipId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientRelationship {

    @Id
    @Column(name = "patient_id", length = 10, nullable = false)
    private String patientId;

    @Id
    @Column(name = "related_patient_id", length = 10, nullable = false)
    private String relatedPatientId;

    /** SPOUSE, PARENT, CHILD, SIBLING, GUARDIAN, WARD, OTHER */
    @Column(name = "relationship_type", length = 50, nullable = false)
    private String relationshipType;

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}
