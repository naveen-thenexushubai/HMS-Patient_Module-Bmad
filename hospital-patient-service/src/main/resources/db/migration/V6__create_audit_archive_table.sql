-- Archive table for audit logs older than 6 years.
-- HIPAA §164.530(j): audit documentation shall be retained for 6 years.
-- The application's AuditRetentionService moves records here after 6 years
-- to keep the live audit_logs table lean while preserving full history.
-- This table is also protected by an immutability trigger.

CREATE TABLE audit_logs_archive (
    id          BIGINT       NOT NULL,
    user_id     VARCHAR(100) NOT NULL,
    username    VARCHAR(100) NOT NULL,
    user_role   VARCHAR(50)  NOT NULL,
    action      VARCHAR(20)  NOT NULL,
    patient_id  VARCHAR(10)  NOT NULL,
    ip_address  VARCHAR(45),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_archive_patient_id  ON audit_logs_archive(patient_id);
CREATE INDEX idx_audit_archive_occurred_at ON audit_logs_archive(occurred_at);
CREATE INDEX idx_audit_archive_archived_at ON audit_logs_archive(archived_at);

-- Immutability trigger for archive table
CREATE TRIGGER trg_audit_logs_archive_immutable
    BEFORE DELETE OR UPDATE ON audit_logs_archive
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_audit_modification();

COMMENT ON TABLE audit_logs_archive IS
    'HIPAA audit log archive. Records moved here from audit_logs after 6 years. '
    'Immutable. Retention: indefinite (minimum 6 years from occurred_at).';
