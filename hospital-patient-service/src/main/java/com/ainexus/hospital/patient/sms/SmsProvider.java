package com.ainexus.hospital.patient.sms;

public interface SmsProvider {
    /**
     * Send an SMS message.
     * @param patientId  for audit/logging only (never log phone/message content)
     * @param toPhone    destination phone number (decrypted at call site)
     * @param message    SMS text content
     */
    void send(String patientId, String toPhone, String message);
}
