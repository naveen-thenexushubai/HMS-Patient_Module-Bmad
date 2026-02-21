package com.ainexus.hospital.patient.sms;

import com.ainexus.hospital.patient.model.SmsDeliveryLog;
import com.ainexus.hospital.patient.model.SmsStatus;
import com.ainexus.hospital.patient.repository.SmsDeliveryLogRepository;
import com.twilio.Twilio;
import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component("twilioSmsProvider")
@ConditionalOnProperty(name = "twilio.account-sid", matchIfMissing = false)
public class TwilioSmsProvider implements SmsProvider {

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-number}")
    private String fromNumber;

    private final SmsDeliveryLogRepository smsLogRepository;

    public TwilioSmsProvider(SmsDeliveryLogRepository smsLogRepository) {
        this.smsLogRepository = smsLogRepository;
    }

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        log.info("TwilioSmsProvider initialised");
    }

    @Override
    public void send(String patientId, String toPhone, String message) {
        SmsDeliveryLog logEntry = SmsDeliveryLog.builder()
                .patientId(patientId)
                .phoneNumber(toPhone)
                .message(message)
                .status(SmsStatus.PENDING)
                .provider("TWILIO")
                .sentAt(Instant.now())
                .build();
        try {
            Message sent = Message.creator(
                    new PhoneNumber(toPhone),
                    new PhoneNumber(fromNumber),
                    message
            ).create();
            logEntry.setStatus(SmsStatus.SENT);
            logEntry.setProviderMessageId(sent.getSid());
            log.info("[SMS-TWILIO] patientId={} status=SENT sid={}", patientId, sent.getSid());
        } catch (ApiException ex) {
            logEntry.setStatus(SmsStatus.FAILED);
            logEntry.setErrorMessage(ex.getMessage());
            log.error("[SMS-TWILIO] patientId={} status=FAILED error={}", patientId, ex.getCode());
            // Never rethrow — SMS is fire-and-forget
        } finally {
            smsLogRepository.save(logEntry);
        }
    }
}
