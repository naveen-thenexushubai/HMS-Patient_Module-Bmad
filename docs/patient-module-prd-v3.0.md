# Hospital Management System - Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System - Patient Module Requirements |
| Module | Patient Management |
| Version | 3.0.0 |
| Status | Released |
| Company | Ai Nexus |
| Created Date | February 2026 |
| Last Revised | February 2026 |
| Revision Notes | **v3.0 — Clinical Operations Features**: Added Insurance Information, Patient Vitals History with Trend Chart, Audit Trail Viewer, Bulk CSV Export, and Duplicate Detection by Name + Date of Birth |
| Baseline Document | `patient-module-prd-v2.0.md` (v2.0.0) — all v1.1.0 and v2.0.0 requirements remain in force |

---

## Change Summary

This document specifies **five new features** added to the Patient Module in version 3.0.0.
All requirements from v1.1.0 and v2.0.0 continue to apply without modification.

| Feature | Priority | Requirement Section | Roles |
|---------|----------|---------------------|-------|
| Insurance Information | High | REQ-11 | RECEPTIONIST, ADMIN (write); all roles (read) |
| Patient Vitals History | High | REQ-12 | DOCTOR, NURSE, ADMIN (write); all roles (read) |
| Audit Trail Viewer | High | REQ-13 | ADMIN only |
| Bulk CSV Export | High | REQ-14 | RECEPTIONIST, ADMIN |
| Duplicate Detection by Name + DOB | High | REQ-15 | Automatic (system) |

---

## 1. EXECUTIVE SUMMARY (v3.0 Additions)

Version 3.0 extends the Patient Module into a full clinical operations platform. Receptionists can capture and update insurance coverage to support billing workflows. Nurses and doctors can record vital signs per visit with automatic trend visualization. Administrators gain full visibility into who changed what and when through an immutable audit trail. Bulk export supports operational reporting without requiring database access. Duplicate detection is strengthened by adding name + date-of-birth matching alongside existing phone-number detection.

**Core Value Added**: Elevated from a patient identity hub to a clinically operational record — supporting front-desk billing intake, nursing vitals documentation, administrative oversight, and data export for reporting.

---

## 2. v3.0 SCOPE

This specification adds the following features to the existing Patient Module:

1. **Insurance Information** — Store, edit, and remove primary and secondary insurance coverage per patient
2. **Patient Vitals History** — Record and display vital signs per visit with interactive trend chart
3. **Audit Trail Viewer** — ADMIN-only immutable history of all changes to a patient record
4. **Bulk CSV Export** — Download filtered patient list as a CSV file
5. **Duplicate Detection by Name + DOB** — Extend duplicate alerts to match on normalized first+last name and birth year

---

## 3. DETAILED REQUIREMENTS

---

### REQ-11: Insurance Information

#### 3.1.1 Overview
The system shall allow users with appropriate permissions to store, view, update, and remove health insurance records linked to a patient. A patient may have multiple insurance records, at most one of which is designated as the primary plan.

#### 3.1.2 Functional Requirements

| ID | Requirement |
|----|-------------|
| REQ-11.1 | Each insurance record shall capture: provider name (required), policy number, group number, coverage type, subscriber name, subscriber date of birth, valid from date, valid to date, and primary flag. |
| REQ-11.2 | Coverage type shall be one of: INDIVIDUAL, FAMILY, MEDICARE, MEDICAID, OTHER. |
| REQ-11.3 | RECEPTIONIST and ADMIN roles may add, edit, and delete insurance records. |
| REQ-11.4 | DOCTOR, NURSE, RECEPTIONIST, and ADMIN roles may view insurance records. |
| REQ-11.5 | The primary insurance record shall be visually distinguished (green badge) in the insurance table. |
| REQ-11.6 | Deleting an insurance record shall require a confirmation dialog. |
| REQ-11.7 | All insurance add, update, and delete operations shall be recorded in the audit log with actions INSURANCE_ADD, INSURANCE_UPDATE, INSURANCE_REMOVE respectively. |
| REQ-11.8 | Insurance records are stored in the `patient_insurance` table with a foreign key linkage via `patient_id`. |

#### 3.1.3 User Journey — Receptionist Adding Insurance
1. Open patient detail page for P2026001.
2. Scroll to "Insurance" card.
3. Click "Add Insurance".
4. Fill in: Provider Name = "Blue Cross Blue Shield", Coverage Type = "FAMILY", Policy # = "BCB-123456", Valid From = 2025-01-01, Is Primary = ON.
5. Click Save → row appears in table with green "Primary" badge.
6. Audit log records INSURANCE_ADD action.

#### 3.1.4 Acceptance Criteria
- [ ] RECEPTIONIST can add, edit, and delete insurance; DOCTOR cannot see Add/Edit/Delete controls.
- [ ] Primary insurance is displayed with a distinct visual indicator.
- [ ] Deleting without confirmation does nothing; confirming removes the record.
- [ ] Audit log contains an INSURANCE_ADD entry after adding insurance.
- [ ] All insurance fields are persisted correctly and displayed on reload.

---

### REQ-12: Patient Vitals History

#### 3.2.1 Overview
The system shall allow clinical staff (DOCTOR, NURSE, ADMIN) to record vital signs measurements per patient visit and display the full history with a trend chart.

#### 3.2.2 Functional Requirements

| ID | Requirement |
|----|-------------|
| REQ-12.1 | Vital signs recordable per visit: temperature (°C), pulse rate (BPM), blood pressure systolic/diastolic (mmHg), respiratory rate, oxygen saturation (%), weight (kg), height (cm), and free-text notes. |
| REQ-12.2 | All vital sign fields are optional in a single recording. |
| REQ-12.3 | Validation ranges: temperature 30–45 °C; pulse 30–250 BPM; SpO₂ 50–100 %; weight and height must be positive. |
| REQ-12.4 | BMI shall be automatically computed from weight and height when both are provided. |
| REQ-12.5 | DOCTOR, NURSE, and ADMIN roles may record vitals. |
| REQ-12.6 | RECEPTIONIST, DOCTOR, NURSE, and ADMIN roles may view vitals history. |
| REQ-12.7 | The latest readings shall be displayed as prominent Statistic cards at the top of the vitals section. |
| REQ-12.8 | A line chart shall be displayed when two or more readings are available, showing trends for pulse, systolic BP, diastolic BP, and SpO₂. |
| REQ-12.9 | The full vitals history shall be displayed in a sortable table (newest first), showing up to 50 most recent records. |
| REQ-12.10 | "Record Vitals" button is visible only to DOCTOR, NURSE, and ADMIN roles. |
| REQ-12.11 | All vitals recordings shall be recorded in the audit log with action VITALS_RECORD. |
| REQ-12.12 | The Record Vitals modal shall display a live BMI preview as the user enters weight and height. |

#### 3.2.3 User Journey — Nurse Recording Vitals
1. Open patient detail page.
2. Scroll to "Vitals History" card.
3. Click "Record Vitals" (visible because role = NURSE).
4. Enter: BP 120/80, Pulse 72, Temp 37.1, SpO₂ 98%, Weight 70 kg, Height 175 cm.
5. BMI preview shows 22.9.
6. Click Save → row appears at top of history table; Statistic cards update; audit log records VITALS_RECORD.
7. After a second recording, a trend chart appears above the table.

#### 3.2.4 Acceptance Criteria
- [ ] NURSE can see and click "Record Vitals"; RECEPTIONIST cannot.
- [ ] Validation prevents temperature outside 30–45 °C range.
- [ ] BMI is computed and stored when weight and height are both provided.
- [ ] Chart is hidden with only one reading; appears with two or more.
- [ ] Audit log contains a VITALS_RECORD entry after recording.
- [ ] Latest reading is shown in Statistic cards immediately after save.

---

### REQ-13: Audit Trail Viewer

#### 3.3.1 Overview
The system shall provide ADMIN-only access to an immutable, chronologically ordered log of all changes made to a patient record, including who made the change, when, and from what IP address.

#### 3.3.2 Functional Requirements

| ID | Requirement |
|----|-------------|
| REQ-13.1 | The audit trail shall be accessible via an "Audit Trail" button in the patient detail page header. |
| REQ-13.2 | The button and modal are visible only to users with the ADMIN role. |
| REQ-13.3 | The audit trail displays: date/time, user ID, username, role, action, patient ID, and IP address. |
| REQ-13.4 | Entries are displayed newest-first. |
| REQ-13.5 | Action types are visually differentiated by color-coded tags (e.g., CREATE = green, UPDATE = blue, DELETE/REMOVE = red, PHOTO = purple). |
| REQ-13.6 | The audit log is immutable; no UI or API allows deletion of audit entries. |
| REQ-13.7 | Audit log records are fetched only when the modal is opened (lazy loading). |
| REQ-13.8 | Actions tracked include: PATIENT_CREATE, PATIENT_UPDATE, PATIENT_DEACTIVATE, PATIENT_ACTIVATE, PHOTO_UPLOAD, PHOTO_DELETE, RELATIONSHIP_ADD, RELATIONSHIP_REMOVE, INSURANCE_ADD, INSURANCE_UPDATE, INSURANCE_REMOVE, VITALS_RECORD, CSV_EXPORT. |

#### 3.3.3 User Journey — Admin Reviewing Audit Trail
1. Open patient detail page as ADMIN.
2. Click "Audit Trail" in page header.
3. Modal opens showing all changes chronologically.
4. Most recent entry at top; each row shows timestamp, username, role, action tag, and IP.
5. PATIENT_CREATE shown in green, INSURANCE_ADD in blue, VITALS_RECORD in blue.

#### 3.3.4 Acceptance Criteria
- [ ] "Audit Trail" button is visible to ADMIN; not visible to DOCTOR, NURSE, or RECEPTIONIST.
- [ ] Modal displays all audit entries for the patient.
- [ ] Actions are color-coded in tags.
- [ ] Audit entries cannot be deleted through any UI or API endpoint.

---

### REQ-14: Bulk CSV Export

#### 3.4.1 Overview
The system shall allow RECEPTIONIST and ADMIN users to export the current filtered patient list as a downloadable CSV file for reporting and data exchange.

#### 3.4.2 Functional Requirements

| ID | Requirement |
|----|-------------|
| REQ-14.1 | An "Export CSV" button shall appear on the patient list page, visible to RECEPTIONIST and ADMIN roles. |
| REQ-14.2 | The export applies all active filters (search text, status, gender, blood group, city, state, birth year range, allergies flag, chronic conditions flag). |
| REQ-14.3 | The exported file is named `patients_export.csv`. |
| REQ-14.4 | The CSV shall include the following columns: PatientID, MRN, FirstName, LastName, DateOfBirth, Age, Gender, PhoneNumber, Email, City, State, ZipCode, BloodGroup, KnownAllergies, ChronicConditions, Status, RegisteredAt. |
| REQ-14.5 | Fields containing commas, quotes, or newlines shall be properly escaped using RFC 4180 CSV quoting. |
| REQ-14.6 | The export is not paginated — all matching patients are included. |
| REQ-14.7 | DOCTOR and NURSE roles shall not see the Export CSV button. |
| REQ-14.8 | Each CSV export shall be recorded in the audit log with action CSV_EXPORT. |

#### 3.4.3 User Journey — Receptionist Exporting Filtered List
1. Navigate to Patient List page.
2. Filter: City = "Chicago", Status = ACTIVE.
3. Click "Export CSV".
4. Browser downloads `patients_export.csv`.
5. Opening the file shows a header row followed by one row per matching patient.
6. Audit log records CSV_EXPORT action.

#### 3.4.4 Acceptance Criteria
- [ ] CSV download triggers immediately on button click.
- [ ] Only patients matching active filters appear in the export.
- [ ] Header row present with all 17 columns.
- [ ] Fields with commas or quotes are properly quoted.
- [ ] DOCTOR cannot see or trigger the Export CSV button.

---

### REQ-15: Duplicate Detection by Name + Date of Birth

#### 3.5.1 Overview
The system shall extend the existing duplicate patient detection to flag records that share both a normalized name (first + last) and birth year, in addition to existing phone-number-based detection.

#### 3.5.2 Functional Requirements

| ID | Requirement |
|----|-------------|
| REQ-15.1 | During duplicate detection, the system shall query for patients with the same normalized first name, normalized last name, and birth year, excluding the current patient. |
| REQ-15.2 | Results from name+DOB matching shall be merged with results from phone-number matching, with deduplication by patient ID. |
| REQ-15.3 | The duplicate alert card (DuplicatesAlert) on the patient detail page shall display both phone-based and name+DOB-based matches. |
| REQ-15.4 | Name normalization uses the same search index (lowercase, normalized) applied during patient registration and update. |
| REQ-15.5 | Birth year is stored as a plaintext integer derived from date of birth at registration and update time, enabling index-based queries without decryption. |
| REQ-15.6 | Duplicate detection is read-only; no automatic merging is performed. |
| REQ-15.7 | A patient whose phone number is unique but whose name+DOB match another patient will appear in the duplicate alert. |

#### 3.5.3 User Journey — Detecting Name + DOB Duplicate
1. Patient P2026007 is "David Chen", DOB 2001-08-15, phone (206) 555-1001.
2. Register a new patient: "David Chen", DOB 2001-08-15, different phone (206) 555-9999. New patient receives ID P2026011.
3. Open P2026007 detail page.
4. Duplicate alert card displays P2026011 as a potential duplicate (name+DOB match, even though phone numbers differ).

#### 3.5.4 Acceptance Criteria
- [ ] Opening a patient with a name+DOB match shows a duplicate alert.
- [ ] A patient matched only by name+DOB (not phone) still appears in the alert.
- [ ] The same patient is not listed twice if they match on both phone and name+DOB.
- [ ] A patient with a unique name+DOB does not trigger a duplicate alert.

---

## 4. TECHNICAL NOTES

### 4.1 Database Changes
| Migration | Purpose |
|-----------|---------|
| V10__create_patient_insurance_table.sql | `patient_insurance` table with indexes on `patient_id` |
| V11__create_patient_vitals_table.sql | `patient_vitals` table with indexes on `patient_id` and `recorded_at` |

### 4.2 New API Endpoints
| Method | Path | Roles | Feature |
|--------|------|-------|---------|
| GET | `/api/v1/patients/{id}/insurance` | RECEPTIONIST, DOCTOR, NURSE, ADMIN | REQ-11 |
| POST | `/api/v1/patients/{id}/insurance` | RECEPTIONIST, ADMIN | REQ-11 |
| PUT | `/api/v1/patients/{id}/insurance/{insId}` | RECEPTIONIST, ADMIN | REQ-11 |
| DELETE | `/api/v1/patients/{id}/insurance/{insId}` | RECEPTIONIST, ADMIN | REQ-11 |
| GET | `/api/v1/patients/{id}/vitals` | RECEPTIONIST, DOCTOR, NURSE, ADMIN | REQ-12 |
| POST | `/api/v1/patients/{id}/vitals` | DOCTOR, NURSE, ADMIN | REQ-12 |
| GET | `/api/v1/patients/{id}/audit-trail` | ADMIN | REQ-13 |
| GET | `/api/v1/patients/export` | RECEPTIONIST, ADMIN | REQ-14 |

### 4.3 HIPAA Compliance Notes
- The `audit_logs` table is immutable at the database level via a trigger that blocks DELETE and UPDATE operations. This enforces HIPAA audit retention requirements regardless of application-layer controls.
- Patient PII fields (name, phone, email, DOB, address) are AES-256 encrypted at rest. Search indexes (`first_name_search`, `last_name_search`, `phone_number_hash`, `email_hash`, `birth_year`) are stored as plaintext to enable query performance without exposing raw PII.
- Insurance records are stored without encryption in v3.0. If PHI sensitivity of insurance data requires encryption in a future version, AES-256 fields shall follow the existing patient PII pattern.

### 4.4 New Audit Actions
`INSURANCE_ADD`, `INSURANCE_UPDATE`, `INSURANCE_REMOVE`, `VITALS_RECORD`, `CSV_EXPORT`

---

## 5. ROLES AND PERMISSIONS SUMMARY (v3.0 Cumulative)

| Feature | ADMIN | RECEPTIONIST | DOCTOR | NURSE |
|---------|-------|-------------|--------|-------|
| Register patient | ✓ | ✓ | | |
| Edit patient | ✓ | ✓ | | |
| Activate/Deactivate | ✓ | | | |
| View patient | ✓ | ✓ | ✓ | ✓ |
| Upload photo | ✓ | ✓ | | |
| Export CSV | ✓ | ✓ | | |
| Add/Edit/Delete insurance | ✓ | ✓ | | |
| View insurance | ✓ | ✓ | ✓ | ✓ |
| Record vitals | ✓ | | ✓ | ✓ |
| View vitals | ✓ | ✓ | ✓ | ✓ |
| View audit trail | ✓ | | | |

---

## 6. VERIFICATION CHECKLIST

### Feature 11 — Insurance
- [ ] RECEPTIONIST can add Blue Cross insurance for P2026001 (policy B12345) → row appears in table
- [ ] Edit policy number → updated in table
- [ ] Delete → confirmation dialog → removed
- [ ] DOCTOR: insurance visible, no Add/Edit/Delete buttons

### Feature 12 — Vitals
- [ ] NURSE: record vitals (BP 120/80, pulse 72, temp 37.1, SpO₂ 98%) → appears in table + Statistic cards
- [ ] Record 3 more readings → chart appears showing trend lines
- [ ] RECEPTIONIST: sees vitals table/chart, no "Record Vitals" button

### Feature 13 — Audit Trail
- [ ] ADMIN: open P2026001 → "Audit Trail" button visible → modal shows PATIENT_CREATE, INSURANCE_ADD, VITALS_RECORD entries
- [ ] DOCTOR: "Audit Trail" button NOT visible

### Feature 14 — CSV Export
- [ ] Filter City=Chicago → click Export CSV → downloads `patients_export.csv`
- [ ] Open file → header row present, only Chicago patients in rows
- [ ] No filter → all patients exported

### Feature 15 — Name+DOB Duplicate
- [ ] Register "David Chen" DOB 2001-08-15 with new phone → opens existing "David Chen" P2026007 → duplicate alert shows new patient
- [ ] P2026007 shows BOTH phone-match and name+DOB-match duplicates if applicable

### Regression
- [ ] `mvn test` — 40/40 tests pass
- [ ] Existing features (photo, relationships, MRN, advanced search, duplicate by phone) unchanged

---

*All v1.1.0 and v2.0.0 requirements remain in effect. This document records additions only.*
