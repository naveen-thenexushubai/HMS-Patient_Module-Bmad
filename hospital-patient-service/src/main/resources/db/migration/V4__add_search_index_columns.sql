-- Search index columns — stored as plaintext/hash for DB-level querying.
-- Context: PHI fields are AES-256-GCM encrypted with random IVs, making
-- SQL LIKE queries on encrypted values impossible. This migration adds
-- dedicated search columns populated by the application on write.
--
-- Security note: firstNameSearch / lastNameSearch store lowercase-normalized
-- names to support substring search. phoneNumberHash / emailHash store
-- SHA-256 of normalized values for exact-match lookup without storing
-- plaintext phone/email outside the encrypted column.

ALTER TABLE patients
    ADD COLUMN first_name_search  VARCHAR(100),
    ADD COLUMN last_name_search   VARCHAR(100),
    ADD COLUMN phone_number_hash  VARCHAR(64),
    ADD COLUMN email_hash         VARCHAR(64);

CREATE INDEX idx_patients_first_name_search ON patients(first_name_search);
CREATE INDEX idx_patients_last_name_search  ON patients(last_name_search);
CREATE INDEX idx_patients_phone_hash        ON patients(phone_number_hash);
CREATE INDEX idx_patients_email_hash        ON patients(email_hash);
