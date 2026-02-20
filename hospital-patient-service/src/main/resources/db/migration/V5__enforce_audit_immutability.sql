-- Enforce immutability of audit_logs at the database level.
-- HIPAA requires audit logs to be append-only.
-- This trigger raises an exception on any attempt to UPDATE or DELETE
-- an audit log row, regardless of which DB user attempts it.

CREATE OR REPLACE FUNCTION fn_prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
        'audit_logs are immutable (HIPAA requirement). '
        'Modification and deletion are not permitted. '
        'Operation: %, Table: audit_logs', TG_OP;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_immutable
    BEFORE DELETE OR UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_audit_modification();

COMMENT ON TABLE audit_logs IS
    'Append-only HIPAA audit log. Rows are protected by trg_audit_logs_immutable. '
    'Retention: minimum 6 years per HIPAA §164.530(j).';
