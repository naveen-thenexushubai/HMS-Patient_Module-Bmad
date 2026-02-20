package com.ainexus.hospital.patient.audit;

public enum AuditAction {
    CREATE,
    READ,
    UPDATE,
    DEACTIVATE,
    ACTIVATE,
    PHOTO_UPLOAD,
    PHOTO_DELETE,
    LINK_FAMILY,
    UNLINK_FAMILY,
    INSURANCE_ADD,
    INSURANCE_UPDATE,
    INSURANCE_REMOVE,
    VITALS_RECORD,
    CSV_EXPORT
}
