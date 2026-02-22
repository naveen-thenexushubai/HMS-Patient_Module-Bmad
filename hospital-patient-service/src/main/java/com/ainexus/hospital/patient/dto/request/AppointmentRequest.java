package com.ainexus.hospital.patient.dto.request;

import com.ainexus.hospital.patient.model.AppointmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppointmentRequest {

    @NotBlank(message = "Appointment date is required")
    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Appointment date must be in format YYYY-MM-DD")
    private String appointmentDate;

    @NotBlank(message = "Appointment time is required")
    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Appointment time must be in format HH:mm")
    private String appointmentTime;

    @NotNull(message = "Appointment type is required")
    private AppointmentType appointmentType;

    @Size(max = 200, message = "Doctor name must not exceed 200 characters")
    private String doctorName;

    @Size(max = 200, message = "Department must not exceed 200 characters")
    private String department;

    @Size(max = 1000, message = "Reason for visit must not exceed 1000 characters")
    private String reasonForVisit;
}
