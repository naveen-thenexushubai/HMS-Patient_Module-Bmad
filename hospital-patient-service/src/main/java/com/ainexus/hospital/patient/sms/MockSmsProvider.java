package com.ainexus.hospital.patient.sms;

import com.ainexus.hospital.patient.model.SmsDeliveryLog;
import com.ainexus.hospital.patient.model.SmsStatus;
import com.ainexus.hospital.patient.repository.SmsDeliveryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@ConditionalOnMissingBean(name = "twilioSmsProvider")
@RequiredArgsConstructor
public class MockSmsProvider implements SmsProvider {

    private final SmsDeliveryLogRepository smsLogRepository;

    @Override
    public void send(String patientId, String toPhone, String message) {
        // Log to DB — phone/message stored for dev visibility only
        smsLogRepository.save(SmsDeliveryLog.builder()
                .patientId(patientId)
                .phoneNumber(toPhone)
                .message(message)
                .status(SmsStatus.SENT)
                .provider("MOCK")
                .sentAt(Instant.now())
                .build());
        // Never log PHI (phone number or message content) in server logs
        log.info("[SMS-MOCK] patientId={} status=SENT provider=MOCK", patientId);
    }
}
