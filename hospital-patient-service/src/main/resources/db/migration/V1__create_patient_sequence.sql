-- Patient sequential number sequence (resets per year via application logic)
CREATE SEQUENCE IF NOT EXISTS patient_seq
    START WITH 1
    INCREMENT BY 1
    NO MAXVALUE
    NO CYCLE;
