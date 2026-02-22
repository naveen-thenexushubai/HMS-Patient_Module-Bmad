-- Patient Allergies (Structured)
-- Part of Patient Module v2.0.0 — Feature: Structured Allergy & Medication Alerts (REQ-10)
--
-- PHI fields (allergy_name, reaction, notes) are encrypted by the application
-- using AES-256-GCM before storage. The severity column is plaintext for indexed filtering.

CREATE TABLE patient_allergies (
    id            BIGSERIAL     PRIMARY KEY,
    patient_id    VARCHAR(10)   NOT NULL,
    allergy_name  TEXT          NOT NULL,   -- AES-256-GCM encrypted
    allergy_type  VARCHAR(30)   NOT NULL,   -- DRUG | FOOD | ENVIRONMENTAL | OTHER
    severity      VARCHAR(30)   NOT NULL,   -- MILD | MODERATE | SEVERE | LIFE_THREATENING
    reaction      TEXT,                     -- AES-256-GCM encrypted
    onset_date    DATE,
    notes         TEXT,                     -- AES-256-GCM encrypted
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_by    VARCHAR(100)  NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by    VARCHAR(100),
    updated_at    TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_allergies_patient_id ON patient_allergies(patient_id);
CREATE INDEX idx_allergies_severity   ON patient_allergies(severity);
CREATE INDEX idx_allergies_active     ON patient_allergies(patient_id, is_active);
