-- Separate sequence for Medical Record Numbers (MRN), independent of patient_seq
CREATE SEQUENCE IF NOT EXISTS mrn_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO CYCLE;
