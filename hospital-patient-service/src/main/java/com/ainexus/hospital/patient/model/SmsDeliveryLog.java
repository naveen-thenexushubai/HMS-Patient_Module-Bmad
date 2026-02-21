package com.ainexus.hospital.patient.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "sms_delivery_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SmsDeliveryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, length = 10)
    private String patientId;

    @Column(name = "phone_number", nullable = false, length = 50)
    private String phoneNumber;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SmsStatus status = SmsStatus.PENDING;

    @Column(name = "provider", nullable = false, length = 20)
    private String provider;

    @Column(name = "provider_message_id", length = 100)
    private String providerMessageId;

    @Column(name = "sent_at", nullable = false)
    @Builder.Default
    private Instant sentAt = Instant.now();

    @Column(name = "error_message", length = 500)
    private String errorMessage;
}
