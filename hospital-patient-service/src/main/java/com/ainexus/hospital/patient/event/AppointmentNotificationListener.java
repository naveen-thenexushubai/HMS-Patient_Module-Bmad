package com.ainexus.hospital.patient.event;

import com.ainexus.hospital.patient.model.AppointmentStatus;
import com.ainexus.hospital.patient.model.NotificationType;
import com.ainexus.hospital.patient.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class AppointmentNotificationListener {

    private final NotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onBooked(AppointmentBookedEvent e) {
        String inApp = String.format("Appointment on %s at %s with %s (%s) has been scheduled.",
                e.date(), e.time(), e.doctor() != null ? e.doctor() : "TBD",
                e.department() != null ? e.department() : "TBD");
        String sms = String.format(
                "Hi! Appointment confirmed: %s at %s with %s (%s). Ref: %s — Ai Nexus Hospital",
                e.date(), e.time(),
                e.doctor() != null ? e.doctor() : "TBD",
                e.department() != null ? e.department() : "TBD",
                e.patientId());
        notificationService.notify(e.patientId(), NotificationType.APPOINTMENT_BOOKED,
                "Appointment Confirmed", inApp, sms, e.appointmentId());
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onStatusChanged(AppointmentStatusChangedEvent e) {
        if (e.newStatus() == AppointmentStatus.CONFIRMED) {
            String inApp = String.format("Your appointment on %s at %s has been confirmed.", e.date(), e.time());
            String sms = String.format(
                    "Your appointment %s at %s is now confirmed. See you soon! — Ai Nexus Hospital",
                    e.date(), e.time());
            notificationService.notify(e.patientId(), NotificationType.APPOINTMENT_CONFIRMED,
                    "Appointment Confirmed", inApp, sms, e.appointmentId());
        } else if (e.newStatus() == AppointmentStatus.COMPLETED) {
            String inApp = "Your visit is complete. Log in to your portal to review your visit notes and diagnosis.";
            String sms = "Your visit is complete. Log in to your portal to review your visit notes. — Ai Nexus Hospital";
            notificationService.notify(e.patientId(), NotificationType.APPOINTMENT_COMPLETED,
                    "Visit Complete", inApp, sms, e.appointmentId());
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onCancelled(AppointmentCancelledEvent e) {
        String inApp = String.format("Your appointment on %s at %s has been cancelled. Please contact us to reschedule.", e.date(), e.time());
        String sms = String.format(
                "Your appointment on %s at %s has been cancelled. Please call us to reschedule. — Ai Nexus Hospital",
                e.date(), e.time());
        notificationService.notify(e.patientId(), NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled", inApp, sms, e.appointmentId());
    }
}
