CREATE TABLE patient_notifications (
    id              BIGSERIAL    PRIMARY KEY,
    patient_id      VARCHAR(10)  NOT NULL,
    type            VARCHAR(50)  NOT NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT         NOT NULL,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    appointment_id  BIGINT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMP WITH TIME ZONE
);
CREATE INDEX idx_notifications_patient_id ON patient_notifications(patient_id);
CREATE INDEX idx_notifications_unread     ON patient_notifications(patient_id, is_read);
