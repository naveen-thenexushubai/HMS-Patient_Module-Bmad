package com.ainexus.hospital.patient.event;

public record AppointmentCancelledEvent(
        String patientId,
        Long   appointmentId,
        String date,
        String time
) {}
