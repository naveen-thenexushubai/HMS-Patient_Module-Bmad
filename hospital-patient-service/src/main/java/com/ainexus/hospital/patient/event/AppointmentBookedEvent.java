package com.ainexus.hospital.patient.event;

public record AppointmentBookedEvent(
        String patientId,
        Long   appointmentId,
        String date,
        String time,
        String doctor,
        String department
) {}
