-- Patient Vitals History
-- Part of Patient Module v3.0 — Feature: Patient Vitals History (REQ-12)

CREATE TABLE patient_vitals (
    id                       BIGSERIAL    PRIMARY KEY,
    patient_id               VARCHAR(10)  NOT NULL,
    recorded_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    recorded_by              VARCHAR(100) NOT NULL,
    temperature_celsius      NUMERIC(4,1),
    pulse_rate               INTEGER,
    blood_pressure_systolic  INTEGER,
    blood_pressure_diastolic INTEGER,
    respiratory_rate         INTEGER,
    oxygen_saturation        NUMERIC(4,1),
    weight_kg                NUMERIC(5,1),
    height_cm                NUMERIC(5,1),
    notes                    VARCHAR(500)
);

CREATE INDEX idx_vitals_patient_id  ON patient_vitals(patient_id);
CREATE INDEX idx_vitals_recorded_at ON patient_vitals(recorded_at);
