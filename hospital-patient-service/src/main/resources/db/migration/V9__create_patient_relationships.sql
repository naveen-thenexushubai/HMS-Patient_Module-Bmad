-- Family / Relationship Linking between patients
-- Both directions stored: when A→B (PARENT) is created, B→A (CHILD) is also created
-- Deletion of either direction is handled by PatientRelationshipService

CREATE TABLE patient_relationships (
    patient_id         VARCHAR(10)              NOT NULL,
    related_patient_id VARCHAR(10)              NOT NULL,
    relationship_type  VARCHAR(50)              NOT NULL,
    created_by         VARCHAR(100)             NOT NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (patient_id, related_patient_id)
);

CREATE INDEX idx_rel_patient_id         ON patient_relationships(patient_id);
CREATE INDEX idx_rel_related_patient_id ON patient_relationships(related_patient_id);

COMMENT ON TABLE patient_relationships IS
    'Bidirectional family/relationship links between patients. '
    'Both directions (A→B and B→A) are stored as separate rows.';
