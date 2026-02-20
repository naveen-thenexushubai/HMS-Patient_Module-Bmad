package com.ainexus.hospital.patient.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "patient_vitals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PatientVitals {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", length = 10, nullable = false)
    private String patientId;

    @Column(name = "recorded_at", nullable = false)
    @Builder.Default
    private Instant recordedAt = Instant.now();

    @Column(name = "recorded_by", length = 100, nullable = false)
    private String recordedBy;

    @Column(name = "temperature_celsius", precision = 4, scale = 1)
    private BigDecimal temperatureCelsius;

    @Column(name = "pulse_rate")
    private Integer pulseRate;

    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "oxygen_saturation", precision = 4, scale = 1)
    private BigDecimal oxygenSaturation;

    @Column(name = "weight_kg", precision = 5, scale = 1)
    private BigDecimal weightKg;

    @Column(name = "height_cm", precision = 5, scale = 1)
    private BigDecimal heightCm;

    @Column(name = "notes", length = 500)
    private String notes;
}
