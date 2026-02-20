package com.ainexus.hospital.patient.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that a YYYY-MM-DD string represents a date that is not in the future.
 * Works alongside @Pattern for format validation — if the format is invalid,
 * this validator passes (letting @Pattern report the format error).
 */
@Documented
@Constraint(validatedBy = PastDateValidator.class)
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
public @interface PastDate {
    String message() default "Date of birth cannot be in the future";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
