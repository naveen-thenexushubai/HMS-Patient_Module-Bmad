package com.ainexus.hospital.patient.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PatientVitalsRequest {

    @DecimalMin(value = "30.0", message = "Temperature must be at least 30.0°C")
    @DecimalMax(value = "45.0", message = "Temperature must be at most 45.0°C")
    private BigDecimal temperatureCelsius;

    @Min(value = 30, message = "Pulse rate must be at least 30 BPM")
    @Max(value = 250, message = "Pulse rate must be at most 250 BPM")
    private Integer pulseRate;

    @Min(value = 50, message = "Systolic BP must be at least 50 mmHg")
    @Max(value = 300, message = "Systolic BP must be at most 300 mmHg")
    private Integer bloodPressureSystolic;

    @Min(value = 30, message = "Diastolic BP must be at least 30 mmHg")
    @Max(value = 200, message = "Diastolic BP must be at most 200 mmHg")
    private Integer bloodPressureDiastolic;

    @Min(value = 4, message = "Respiratory rate must be at least 4")
    @Max(value = 60, message = "Respiratory rate must be at most 60")
    private Integer respiratoryRate;

    @DecimalMin(value = "50.0", message = "O₂ saturation must be at least 50%")
    @DecimalMax(value = "100.0", message = "O₂ saturation must be at most 100%")
    private BigDecimal oxygenSaturation;

    @DecimalMin(value = "1.0", message = "Weight must be at least 1 kg")
    @DecimalMax(value = "500.0", message = "Weight must be at most 500 kg")
    private BigDecimal weightKg;

    @DecimalMin(value = "30.0", message = "Height must be at least 30 cm")
    @DecimalMax(value = "300.0", message = "Height must be at most 300 cm")
    private BigDecimal heightCm;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
