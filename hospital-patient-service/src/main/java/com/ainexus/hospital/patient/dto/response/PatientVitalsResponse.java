package com.ainexus.hospital.patient.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PatientVitalsResponse {
    private Long id;
    private String patientId;
    private String recordedAt;
    private String recordedBy;
    private BigDecimal temperatureCelsius;
    private Integer pulseRate;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer respiratoryRate;
    private BigDecimal oxygenSaturation;
    private BigDecimal weightKg;
    private BigDecimal heightCm;
    private BigDecimal bmi;
    private String notes;
}
