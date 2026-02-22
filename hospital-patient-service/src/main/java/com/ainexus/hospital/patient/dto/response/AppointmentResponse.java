package com.ainexus.hospital.patient.dto.response;

import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.AppointmentType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppointmentResponse {

    private Long id;
    private String patientId;
    private String appointmentDate;   // YYYY-MM-DD
    private String appointmentTime;   // HH:mm
    private AppointmentType appointmentType;
    private AppointmentStatus status;
    private String doctorName;
    private String department;
    private String reasonForVisit;
    private String visitNotes;
    private String diagnosis;
    private String createdBy;
    private String createdAt;         // ISO 8601 UTC
    private String updatedBy;
    private String updatedAt;         // ISO 8601 UTC
}
