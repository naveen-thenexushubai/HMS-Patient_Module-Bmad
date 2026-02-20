package com.ainexus.hospital.patient.audit;

import com.ainexus.hospital.patient.model.AuditLog;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "audit_logs_archive")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogArchive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id",    nullable = false, length = 100)
    private String userId;

    @Column(name = "username",   nullable = false, length = 100)
    private String username;

    @Column(name = "user_role",  nullable = false, length = 50)
    private String userRole;

    @Enumerated(EnumType.STRING)
    @Column(name = "action",     nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "patient_id", nullable = false, length = 10)
    private String patientId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "archived_at", nullable = false)
    private Instant archivedAt;

    public static AuditLogArchive from(AuditLog log) {
        return AuditLogArchive.builder()
                .userId(log.getUserId())
                .username(log.getUsername())
                .userRole(log.getUserRole())
                .action(log.getAction())
                .patientId(log.getPatientId())
                .ipAddress(log.getIpAddress())
                .occurredAt(log.getOccurredAt())
                .archivedAt(Instant.now())
                .build();
    }
}
