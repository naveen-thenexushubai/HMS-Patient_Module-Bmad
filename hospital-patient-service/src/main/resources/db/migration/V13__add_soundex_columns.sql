-- Soundex phonetic name columns for enhanced duplicate detection
-- Part of Patient Module v2.0.0 — Feature: Enhanced Duplicate Detection (REQ-8)
--
-- firstNameSoundex and lastNameSoundex are computed in Java (SearchIndexService)
-- and stored here for efficient indexed lookups.
-- Existing records will have NULL until next update; new/updated records fill automatically.

ALTER TABLE patients ADD COLUMN first_name_soundex VARCHAR(10);
ALTER TABLE patients ADD COLUMN last_name_soundex  VARCHAR(10);

CREATE INDEX idx_patients_soundex ON patients(first_name_soundex, last_name_soundex);
