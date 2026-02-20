CREATE TABLE patients (
    id              BIGSERIAL PRIMARY KEY,
    patient_id      VARCHAR(10)  NOT NULL UNIQUE,

    -- Personal Information (PHI — stored AES-256 encrypted)
    first_name      TEXT         NOT NULL,
    last_name       TEXT         NOT NULL,
    date_of_birth   VARCHAR(255) NOT NULL,  -- encrypted
    gender          VARCHAR(20)  NOT NULL,

    -- Contact Information (PHI — encrypted)
    phone_number    TEXT         NOT NULL,
    email           TEXT,
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    zip_code        VARCHAR(20),

    -- Emergency Contact (PHI — encrypted)
    emergency_contact_name         TEXT,
    emergency_contact_phone        TEXT,
    emergency_contact_relationship VARCHAR(100),

    -- Medical Information (PHI — encrypted)
    blood_group         VARCHAR(10),
    known_allergies     TEXT,
    chronic_conditions  TEXT,

    -- Status & Audit
    status          VARCHAR(10)  NOT NULL DEFAULT 'ACTIVE',
    registered_by   VARCHAR(100) NOT NULL,
    registered_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by      VARCHAR(100),
    updated_at      TIMESTAMP WITH TIME ZONE
);

-- Indexes for search and filtering performance
CREATE UNIQUE INDEX idx_patients_patient_id    ON patients(patient_id);
CREATE        INDEX idx_patients_phone_number  ON patients(phone_number);
CREATE        INDEX idx_patients_status        ON patients(status);
CREATE        INDEX idx_patients_name          ON patients(last_name, first_name);
