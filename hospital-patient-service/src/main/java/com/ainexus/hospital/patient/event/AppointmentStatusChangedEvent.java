package com.ainexus.hospital.patient.event;

import com.ainexus.hospital.patient.model.AppointmentStatus;

public record AppointmentStatusChangedEvent(
        String           patientId,
        Long             appointmentId,
        AppointmentStatus newStatus,
        String           date,
        String           time,
        String           doctor
) {}
