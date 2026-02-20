CREATE TABLE audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     VARCHAR(100) NOT NULL,
    username    VARCHAR(100) NOT NULL,
    user_role   VARCHAR(50)  NOT NULL,
    action      VARCHAR(20)  NOT NULL,  -- CREATE | READ | UPDATE | DEACTIVATE | ACTIVATE
    patient_id  VARCHAR(10)  NOT NULL,  -- business ID e.g. P2026001
    ip_address  VARCHAR(45),            -- supports IPv6
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enforce immutability: no UPDATE or DELETE allowed on audit_logs
-- Application layer must also enforce append-only writes

CREATE INDEX idx_audit_logs_patient_id  ON audit_logs(patient_id);
CREATE INDEX idx_audit_logs_occurred_at ON audit_logs(occurred_at);
CREATE INDEX idx_audit_logs_user_id     ON audit_logs(user_id);
