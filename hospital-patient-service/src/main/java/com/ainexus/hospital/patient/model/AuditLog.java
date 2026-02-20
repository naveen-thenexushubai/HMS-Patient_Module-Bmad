package com.ainexus.hospital.patient.model;

import com.ainexus.hospital.patient.audit.AuditAction;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "user_role", nullable = false, length = 50)
    private String userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "patient_id", nullable = false, length = 10)
    private String patientId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;
}
