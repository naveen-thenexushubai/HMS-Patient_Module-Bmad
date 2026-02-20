-- Clinical Gap Features: photo, MRN, birth_year search index, allergy/condition flags
-- Part of High Priority Core Clinical Gap implementation

ALTER TABLE patients
    ADD COLUMN photo                  BYTEA,
    ADD COLUMN photo_content_type     VARCHAR(50),
    ADD COLUMN mrn                    VARCHAR(15),
    ADD COLUMN birth_year             INTEGER,
    ADD COLUMN has_allergies          BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN has_chronic_conditions BOOLEAN NOT NULL DEFAULT FALSE;

-- MRN must be unique when present (allows NULL for existing records migrated without one)
CREATE UNIQUE INDEX idx_patients_mrn        ON patients(mrn) WHERE mrn IS NOT NULL;
CREATE        INDEX idx_patients_birth_year ON patients(birth_year);
