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
    CSV_EXPORT,
    // v2.0.0 — Appointment Scheduling (REQ-6)
    APPOINTMENT_SCHEDULE,
    APPOINTMENT_UPDATE,
    APPOINTMENT_CANCEL,
    // v2.0.0 — Structured Allergy Alerts (REQ-10)
    ALLERGY_ADD,
    ALLERGY_UPDATE,
    ALLERGY_REMOVE,
    // v2.0.0 — Patient Portal (REQ-7)
    PORTAL_ACCESS,
    PORTAL_CONTACT_UPDATE,
    // v2.0.0 — Notifications (REQ-8)
    NOTIFICATION_SENT
}
