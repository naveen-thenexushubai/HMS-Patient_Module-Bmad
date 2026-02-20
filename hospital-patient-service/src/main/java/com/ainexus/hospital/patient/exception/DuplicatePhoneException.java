package com.ainexus.hospital.patient.exception;

public class DuplicatePhoneException extends RuntimeException {
    public DuplicatePhoneException(String phone) {
        super("A patient with this phone number may already exist");
    }
}
