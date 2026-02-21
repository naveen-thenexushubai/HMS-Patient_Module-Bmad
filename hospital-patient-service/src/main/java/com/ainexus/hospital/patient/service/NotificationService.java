package com.ainexus.hospital.patient.service;

import com.ainexus.hospital.patient.model.PatientNotification;
import com.ainexus.hospital.patient.model.NotificationType;
import com.ainexus.hospital.patient.repository.PatientNotificationRepository;
import com.ainexus.hospital.patient.repository.PatientRepository;
import com.ainexus.hospital.patient.sms.SmsProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final PatientNotificationRepository notificationRepository;
    private final PatientRepository patientRepository;
    private final SmsProvider smsProvider;

    /**
     * Create an in-app notification for a patient.
     */
    @Transactional
    public void createInApp(String patientId, NotificationType type,
                            String title, String message, Long appointmentId) {
        PatientNotification notification = PatientNotification.builder()
                .patientId(patientId)
                .type(type)
                .title(title)
                .message(message)
                .appointmentId(appointmentId)
                .createdAt(Instant.now())
                .build();
        notificationRepository.save(notification);
        log.info("In-app notification created patientId={} type={}", patientId, type);
    }

    /**
     * Send an SMS to the patient — decrypts phone from DB at runtime.
     * Fire-and-forget: never throws.
     */
    public void sendSms(String patientId, String messageText) {
        try {
            patientRepository.findByPatientId(patientId).ifPresent(patient -> {
                String phone = patient.getPhoneNumber(); // AES decrypted at runtime
                if (phone != null && !phone.isBlank()) {
                    smsProvider.send(patientId, phone, messageText);
                }
            });
        } catch (Exception ex) {
            log.error("SMS send failed patientId={} error={}", patientId, ex.getMessage());
        }
    }

    /**
     * Convenience method: create in-app notification AND send SMS in one call.
     */
    @Transactional
    public void notify(String patientId, NotificationType type,
                       String title, String inAppMessage,
                       String smsMessage, Long appointmentId) {
        createInApp(patientId, type, title, inAppMessage, appointmentId);
        sendSms(patientId, smsMessage);
    }
}
