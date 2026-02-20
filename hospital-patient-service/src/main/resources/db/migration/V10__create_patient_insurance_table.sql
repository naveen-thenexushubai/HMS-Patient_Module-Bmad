-- Patient Insurance Information
-- Part of Patient Module v3.0 — Feature: Insurance Information (REQ-11)

CREATE TABLE patient_insurance (
    id               BIGSERIAL       PRIMARY KEY,
    patient_id       VARCHAR(10)     NOT NULL,
    provider_name    VARCHAR(200)    NOT NULL,
    policy_number    VARCHAR(100),
    group_number     VARCHAR(100),
    coverage_type    VARCHAR(50),  -- INDIVIDUAL, FAMILY, MEDICARE, MEDICAID, OTHER
    subscriber_name  VARCHAR(200),
    subscriber_dob   VARCHAR(10),  -- YYYY-MM-DD plaintext (payer reference, not PHI in this context)
    valid_from       DATE,
    valid_to         DATE,
    is_primary       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_by       VARCHAR(100)    NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by       VARCHAR(100),
    updated_at       TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_insurance_patient_id ON patient_insurance(patient_id);
