package com.ainexus.hospital.patient.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class PastDateValidator implements ConstraintValidator<PastDate, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // @NotBlank handles null/blank
        }
        try {
            LocalDate date = LocalDate.parse(value);
            return !date.isAfter(LocalDate.now());
        } catch (DateTimeParseException e) {
            return true; // @Pattern handles format errors — don't double-report
        }
    }
}
