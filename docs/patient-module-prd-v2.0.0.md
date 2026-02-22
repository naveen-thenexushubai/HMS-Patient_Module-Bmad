# Hospital Management System - Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System - Patient Module Requirements |
| Module | Patient Management |
| Version | 2.0.0 |
| Status | Active |
| Company | Ai Nexus |
| Created Date | February 2026 |
| Last Revised | February 2026 |
| Revision Notes | Added Tier 1 feature set: Appointment Scheduling, Patient Portal, Enhanced Duplicate Detection, Visit History Timeline, Structured Allergy Alerts |
| Previous Version | 1.1.0 |

---

## 1. EXECUTIVE SUMMARY

The Patient Module underpins the Hospital Management System. Receptionists use it to register patients, doctors and nurses use it to access patient demographics, and administrators use it to manage patient records and status. With v2.0.0, the module expands to include appointment scheduling, a patient-facing self-service portal, intelligent duplicate detection, visit history tracking, and structured allergy management with critical safety alerts.

**Core Value**: Centralized, secure, and HIPAA-compliant patient information management that serves as the data foundation for all downstream hospital modules. v2.0.0 reduces administrative time by 40–60% through self-service features and intelligent automation.

---

## 2. SCOPE

### v1.1.0 Features (Implemented)

1. **Patient Registration** — Register new patients with complete demographics
2. **Patient Search** — Search and filter patients by multiple criteria
3. **Patient Profile View** — View complete patient information
4. **Patient Update** — Update patient demographic information
5. **Patient Status Management** — Activate/deactivate patient records

### v2.0.0 New Tier 1 Features

6. **Appointment Scheduling** — Calendar-based booking with full status lifecycle
7. **Patient Portal / Self-Service** — Patient-facing portal with contact update capability
8. **Enhanced Duplicate Detection** — Soundex phonetic matching with confidence scoring
9. **Visit History Timeline** — Completed visit history with diagnosis and notes
10. **Structured Allergy & Medication Alerts** — Severity-coded allergy records with critical safety banners

### Out of Scope
- Full EMR (Electronic Medical Records)
- Billing and insurance claims processing
- Pharmacy management
- Laboratory information system
- Multi-factor authentication (Auth module responsibility)

---

## 3. USER ROLES

| Role | Description | v2.0.0 Additional Permissions |
|------|-------------|-------------------------------|
| RECEPTIONIST | Front desk staff | Book/cancel appointments, view allergies |
| DOCTOR | Medical doctor | Add/edit/delete allergies, complete visits with notes, book appointments |
| NURSE | Nursing staff | Add/edit/delete allergies, complete visits with notes, book appointments |
| ADMIN | System administrator | All permissions; global appointment list |
| PATIENT | Registered patient | Own portal: view profile, view appointments, view allergies, update contact info |

**Note**: PATIENT role JWT is issued separately from staff JWT. Patients cannot access staff interfaces.

---

## 4. USER JOURNEYS

### Journey 1: Receptionist Books an Appointment

**Actor**: Receptionist
**Goal**: Schedule a patient for an upcoming consultation

1. Receptionist navigates to patient profile
2. Opens "Appointments" card → clicks "Book Appointment"
3. Selects date (future only), time, type (CONSULTATION), doctor name, department, reason
4. Submits — appointment appears with SCHEDULED status
5. System logs APPOINTMENT_SCHEDULE audit action

### Journey 2: Patient Views Own Portal

**Actor**: Patient (P2026001)
**Goal**: Check upcoming appointments and update phone number

1. Patient logs in with PATIENT-role token (issued by hospital) at /login
2. System detects PATIENT role → redirects to /portal
3. Patient sees: own profile (read-only), upcoming appointments, allergy list
4. Patient clicks "Update Contact Info" → changes phone number → submits
5. System logs PORTAL_CONTACT_UPDATE audit action

### Journey 3: Doctor Records Visit Outcome

**Actor**: Doctor
**Goal**: Complete an appointment with diagnosis and notes

1. Doctor opens patient profile → "Appointments" card
2. Finds today's SCHEDULED appointment → clicks "Update"
3. Changes status to COMPLETED, adds diagnosis, adds visit notes
4. Submits — appointment moves to Visit History Timeline
5. System logs APPOINTMENT_UPDATE audit action

### Journey 4: Nurse Adds Critical Allergy

**Actor**: Nurse
**Goal**: Record a life-threatening drug allergy discovered during patient interview

1. Nurse opens patient profile → "Allergies" card → "Add Allergy"
2. Enters: Allergy Name = "Penicillin", Type = DRUG, Severity = LIFE_THREATENING, Reaction = "Anaphylaxis"
3. Submits — allergy saved, audit action ALLERGY_ADD logged
4. Red critical alert banner appears at top of patient profile immediately
5. All staff who open this patient's profile see the CRITICAL ALLERGY banner first

---

## 5. DETAILED REQUIREMENTS

---

### REQ-6: Appointment Scheduling

**Summary**: Staff can book, manage, and track appointments for patients with a full status lifecycle.

#### Acceptance Criteria

| ID | Criteria |
|----|----------|
| 6.1 | WHEN a RECEPTIONIST, DOCTOR, NURSE, or ADMIN submits a valid appointment request, THE System SHALL create an appointment record with status SCHEDULED and log audit action APPOINTMENT_SCHEDULE |
| 6.2 | WHEN booking an appointment, THE System SHALL require: appointment date (future only), appointment time, and appointment type |
| 6.3 | WHEN an appointment is booked, THE System SHALL display it in the patient's Appointments card with: date, time, type badge, doctor name, department, and status badge |
| 6.4 | WHEN a RECEPTIONIST, DOCTOR, NURSE, or ADMIN cancels an appointment, THE System SHALL set status to CANCELLED and log audit action APPOINTMENT_CANCEL |
| 6.5 | WHEN a DOCTOR or NURSE updates an appointment to COMPLETED status, THE System SHALL allow entry of diagnosis and visit notes |
| 6.6 | WHEN retrieving upcoming appointments, THE System SHALL return only SCHEDULED and CONFIRMED appointments with future dates, ordered by date ascending |
| 6.7 | WHEN retrieving visit history, THE System SHALL return only COMPLETED appointments, ordered by date descending |
| 6.8 | WHEN an ADMIN accesses /appointments, THE System SHALL show a paginated global appointment list across all patients with search and filter capabilities |
| 6.9 | WHEN appointment date is today or in the past during booking, THE System SHALL reject the request with a 400 error |
| 6.10 | WHEN appointment status transitions occur, THE System SHALL enforce valid transitions: SCHEDULED → CONFIRMED, COMPLETED, CANCELLED; CONFIRMED → COMPLETED, CANCELLED; COMPLETED and CANCELLED are terminal states |

**Appointment Types**: CONSULTATION, FOLLOW_UP, PROCEDURE, ROUTINE_CHECKUP, EMERGENCY
**Appointment Statuses**: SCHEDULED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

---

### REQ-7: Patient Portal / Self-Service

**Summary**: Patients can log in with a PATIENT-role JWT and view their own record, upcoming appointments, and allergies. They can update their contact information.

#### Acceptance Criteria

| ID | Criteria |
|----|----------|
| 7.1 | WHEN a user logs in with a PATIENT-role JWT, THE System SHALL redirect to /portal instead of /patients |
| 7.2 | WHEN a PATIENT accesses /portal/me, THE System SHALL return only their own patient record (validated against JWT patientId claim) |
| 7.3 | WHEN a PATIENT accesses /portal/me/appointments, THE System SHALL return their upcoming appointments only |
| 7.4 | WHEN a PATIENT accesses /portal/me/allergies, THE System SHALL return their active allergy list |
| 7.5 | WHEN a PATIENT submits a contact update with valid phone, email, or address, THE System SHALL update the record and log audit action PORTAL_CONTACT_UPDATE |
| 7.6 | WHEN a PATIENT attempts to access another patient's data, THE System SHALL reject with HTTP 403 Forbidden |
| 7.7 | WHEN a non-PATIENT role navigates to /portal, THE System SHALL redirect to /patients |
| 7.8 | WHEN the portal page loads, THE System SHALL display: patient name (masked), upcoming appointments (next 3), allergy list with severity badges, and contact update form |

**Portal Contact Fields**: phone number, email address, street address (limited to these 3 fields only)

---

### REQ-8: Enhanced Duplicate Detection

**Summary**: When registering or searching for patients, the system uses Soundex phonetic name matching in addition to exact phone matching to surface potential duplicates with confidence scores.

#### Acceptance Criteria

| ID | Criteria |
|----|----------|
| 8.1 | WHEN a patient's phone number exactly matches another patient's phone (via HMAC hash), THE System SHALL flag as HIGH confidence duplicate |
| 8.2 | WHEN a patient's name Soundex code AND birth year match another patient (but phone differs), THE System SHALL flag as MEDIUM confidence duplicate |
| 8.3 | WHEN a patient's exact name tokens AND birth year match (but Soundex check misses edge cases), THE System SHALL flag as LOW confidence duplicate |
| 8.4 | WHEN duplicates are found, THE System SHALL return a confidence level (HIGH/MEDIUM/LOW) with each potential duplicate |
| 8.5 | WHEN displaying duplicates in the UI, THE System SHALL show confidence badges: HIGH=red, MEDIUM=orange, LOW=yellow with a human-readable reason |
| 8.6 | WHEN a patient record is saved or updated, THE System SHALL compute and store the Soundex codes for first name and last name |

---

### REQ-9: Visit History Timeline

**Summary**: Completed appointments are surfaced as a chronological visit history timeline on the patient's profile, including diagnosis and clinical notes.

#### Acceptance Criteria

| ID | Criteria |
|----|----------|
| 9.1 | WHEN a patient profile is opened, THE System SHALL display a Visit History Timeline section showing all COMPLETED appointments |
| 9.2 | WHEN visit history items are displayed, THE System SHALL show: date, appointment type, doctor name, department, diagnosis (if recorded), and visit notes (if recorded) |
| 9.3 | WHEN visit history is ordered, THE System SHALL display most recent completed visit first (descending by appointment date) |
| 9.4 | WHEN a patient has no completed visits, THE System SHALL display "No visit history recorded" in the timeline section |
| 9.5 | WHEN a DOCTOR or NURSE completes an appointment, THE System SHALL allow recording a free-text diagnosis (max 2000 chars) and visit notes (max 5000 chars) |
| 9.6 | WHEN the timeline has more than 20 items, THE System SHALL display the 20 most recent and provide a "View all" option |

---

### REQ-10: Structured Allergy & Medication Alerts

**Summary**: Allergies are stored as structured records (not free text) with type and severity classification. Critical allergies trigger a prominent safety banner on the patient's profile.

#### Acceptance Criteria

| ID | Criteria |
|----|----------|
| 10.1 | WHEN a DOCTOR or NURSE adds an allergy, THE System SHALL require: allergy name, allergy type (DRUG/FOOD/ENVIRONMENTAL/OTHER), and severity (MILD/MODERATE/SEVERE/LIFE_THREATENING) |
| 10.2 | WHEN an allergy with severity SEVERE or LIFE_THREATENING exists for a patient, THE System SHALL display a red critical alert banner at the TOP of the patient's profile before any other content |
| 10.3 | WHEN the critical alert banner is displayed, THE System SHALL list the names of all critical allergies in the banner message |
| 10.4 | WHEN an allergy is displayed in the allergy card, THE System SHALL color-code the severity badge: MILD=green, MODERATE=orange, SEVERE=red, LIFE_THREATENING=red with warning icon |
| 10.5 | WHEN a DOCTOR or NURSE deletes an allergy, THE System SHALL soft-delete (set isActive=false) and log ALLERGY_REMOVE — the record is retained for audit purposes |
| 10.6 | WHEN an allergy record is saved, THE System SHALL encrypt the allergy name, reaction description, and notes fields using AES-256-GCM |
| 10.7 | WHEN listing allergies for a patient, THE System SHALL return only active allergies (isActive=true), ordered by severity descending (most critical first) |
| 10.8 | WHEN a RECEPTIONIST views a patient profile, THE System SHALL display allergy information (read-only) but NOT show Add/Edit/Delete buttons |

**Allergy Types**: DRUG, FOOD, ENVIRONMENTAL, OTHER
**Severity Levels**: MILD, MODERATE, SEVERE, LIFE_THREATENING

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### Performance
| Metric | Target |
|--------|--------|
| Appointment list load | < 500ms |
| Duplicate detection (including soundex) | < 300ms |
| Portal page load | < 2s |
| Allergy card load | < 300ms |
| Global appointment list load | < 1s |

### Scalability
| Metric | Target |
|--------|--------|
| Patient records | 100,000+ |
| Appointments per patient | Unlimited (indexed) |
| Allergies per patient | Unlimited |
| Concurrent users | 200 |
| Concurrent portal users | 500 |

### Security
- All allergy PHI (name, reaction, notes) encrypted with AES-256-GCM
- PATIENT role JWT scoped to single patientId — cannot access other patients
- Portal contact update rate-limited to prevent abuse
- All portal actions produce HIPAA audit log entries

### HIPAA Compliance
- Allergy records: soft-delete only (retained for 6 years in audit archive)
- Portal access logged (PORTAL_ACCESS audit action)
- Contact updates logged (PORTAL_CONTACT_UPDATE audit action)
- Appointment actions logged (APPOINTMENT_SCHEDULE, UPDATE, CANCEL)

---

## 7. SUCCESS CRITERIA FOR v2.0.0

| Criterion | Measurement |
|-----------|-------------|
| Appointment booking < 2 minutes | User testing with 5 receptionists |
| Portal self-service reduces receptionist calls by 30% | 30-day post-deployment measurement |
| Critical allergy banner visible within 1s of profile load | Automated E2E test |
| Duplicate detection soundex reduces missed duplicates by 50% | Comparison against v1.1.0 duplicate detection |
| All 38 new acceptance criteria pass E2E tests | Playwright test suite execution |
| Zero HIPAA compliance violations | Security audit of audit logs |

---

## 8. AUDIT ACTIONS (v2.0.0 Additions)

| Action | Trigger |
|--------|---------|
| APPOINTMENT_SCHEDULE | Appointment booked by staff |
| APPOINTMENT_UPDATE | Appointment details or status changed |
| APPOINTMENT_CANCEL | Appointment cancelled |
| ALLERGY_ADD | Allergy record created |
| ALLERGY_UPDATE | Allergy record updated |
| ALLERGY_REMOVE | Allergy record soft-deleted |
| PORTAL_ACCESS | Patient accesses own portal |
| PORTAL_CONTACT_UPDATE | Patient updates own contact info |
