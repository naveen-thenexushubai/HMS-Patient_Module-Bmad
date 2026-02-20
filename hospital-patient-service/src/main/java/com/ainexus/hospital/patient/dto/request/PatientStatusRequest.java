package com.ainexus.hospital.patient.dto.request;

import com.ainexus.hospital.patient.model.PatientStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientStatusRequest {

    @NotNull(message = "Status is required")
    private PatientStatus status;
}
