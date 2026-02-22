-- Patient Appointments
-- Part of Patient Module v2.0.0 — Feature: Appointment Scheduling (REQ-6)

CREATE TABLE patient_appointments (
    id                BIGSERIAL    PRIMARY KEY,
    patient_id        VARCHAR(10)  NOT NULL,
    appointment_date  DATE         NOT NULL,
    appointment_time  TIME         NOT NULL,
    appointment_type  VARCHAR(30)  NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    doctor_name       VARCHAR(200),
    department        VARCHAR(200),
    reason_for_visit  TEXT,
    visit_notes       TEXT,
    diagnosis         TEXT,
    created_by        VARCHAR(100) NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by        VARCHAR(100),
    updated_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_appointments_patient_id ON patient_appointments(patient_id);
CREATE INDEX idx_appointments_date       ON patient_appointments(appointment_date);
CREATE INDEX idx_appointments_status     ON patient_appointments(status);
