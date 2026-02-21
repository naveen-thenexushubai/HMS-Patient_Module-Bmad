CREATE TABLE sms_delivery_log (
    id                  BIGSERIAL    PRIMARY KEY,
    patient_id          VARCHAR(10)  NOT NULL,
    phone_number        VARCHAR(50)  NOT NULL,
    message             TEXT         NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    provider            VARCHAR(20)  NOT NULL,
    provider_message_id VARCHAR(100),
    sent_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    error_message       VARCHAR(500)
);
CREATE INDEX idx_sms_log_patient_id ON sms_delivery_log(patient_id);
