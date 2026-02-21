package com.ainexus.hospital.patient.scheduler;

import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.NotificationType;
import com.ainexus.hospital.patient.model.PatientAppointment;
import com.ainexus.hospital.patient.repository.PatientAppointmentRepository;
import com.ainexus.hospital.patient.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final PatientAppointmentRepository appointmentRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    /** Runs every day at 08:00 AM */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<PatientAppointment> upcoming = appointmentRepository
                .findByAppointmentDateAndStatusIn(tomorrow,
                        List.of(AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED));
        log.info("Reminder scheduler: {} appointments found for {}", upcoming.size(), tomorrow);
        for (PatientAppointment appt : upcoming) {
            String dateStr = appt.getAppointmentDate().toString();
            String timeStr = appt.getAppointmentTime().format(TIME_FMT);
            String doctor  = appt.getDoctorName() != null ? appt.getDoctorName() : "your doctor";

            String inApp = String.format("Reminder: You have an appointment tomorrow %s at %s with %s.",
                    dateStr, timeStr, doctor);
            String sms = String.format(
                    "Reminder: Appointment tomorrow %s at %s with %s. — Ai Nexus Hospital",
                    dateStr, timeStr, doctor);
            notificationService.notify(appt.getPatientId(), NotificationType.APPOINTMENT_REMINDER,
                    "Appointment Reminder", inApp, sms, appt.getId());
        }
    }
}
