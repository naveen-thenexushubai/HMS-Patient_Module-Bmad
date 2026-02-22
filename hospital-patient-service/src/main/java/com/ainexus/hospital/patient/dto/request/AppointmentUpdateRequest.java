package com.ainexus.hospital.patient.dto.request;

import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.AppointmentType;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AppointmentUpdateRequest {

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Appointment date must be in format YYYY-MM-DD")
    private String appointmentDate;

    @Pattern(regexp = "^([01]\\d|2[0-3]):[0-5]\\d$", message = "Appointment time must be in format HH:mm")
    private String appointmentTime;

    private AppointmentType appointmentType;

    private AppointmentStatus status;

    @Size(max = 200)
    private String doctorName;

    @Size(max = 200)
    private String department;

    @Size(max = 1000)
    private String reasonForVisit;

    @Size(max = 5000, message = "Visit notes must not exceed 5000 characters")
    private String visitNotes;

    @Size(max = 2000, message = "Diagnosis must not exceed 2000 characters")
    private String diagnosis;
}
