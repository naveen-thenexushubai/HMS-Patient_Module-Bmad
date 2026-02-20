package com.ainexus.hospital.patient.model;

import java.io.Serializable;
import java.util.Objects;

public class PatientRelationshipId implements Serializable {

    private String patientId;
    private String relatedPatientId;

    public PatientRelationshipId() {}

    public PatientRelationshipId(String patientId, String relatedPatientId) {
        this.patientId        = patientId;
        this.relatedPatientId = relatedPatientId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PatientRelationshipId that)) return false;
        return Objects.equals(patientId, that.patientId) &&
               Objects.equals(relatedPatientId, that.relatedPatientId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(patientId, relatedPatientId);
    }
}
