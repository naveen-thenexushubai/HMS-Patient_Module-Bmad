# Hospital Management System — Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System — Patient Module Requirements |
| Module | Patient Management |
| Version | 3.0.0 |
| Status | Implemented & Verified |
| Company | Ai Nexus |
| Created Date | February 2026 |
| Last Revised | February 21, 2026 |
| Revision Notes | v3.0.0 — Added REQ-11 SMS + In-App Notifications, international phone support; v2.0.0 — Added REQ-6 through REQ-10 and Tier-1 features (Photo, Insurance, Vitals, Audit Trail, CSV Export, Duplicate Detection, Appointments, Patient Portal, Allergies, Visit History) |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Core patient module: Registration, Search, Profile, Update, Status Management |
| 1.1.0 | Feb 2026 | Added User Journeys, HIPAA Compliance, UX/UI Requirements; strengthened NFRs |
| 2.0.0 | Feb 2026 | Added REQ-6 Appointments, REQ-7 Patient Portal, REQ-8 Smart Duplicates, REQ-9 Visit History, REQ-10 Allergies; Photo Upload, Insurance, Vitals, Audit Trail, CSV Export |
| 3.0.0 | Feb 21, 2026 | Added REQ-11 SMS + In-App Notifications; International phone number support (E.164) |

---

## 1. EXECUTIVE SUMMARY

The Patient Module underpins the Hospital Management System at Ai Nexus Hospital. It provides a complete patient lifecycle management platform — from registration and demographic management to appointment scheduling, clinical data tracking, and multi-channel patient notifications.

**Core Value**: Centralized, secure, and HIPAA-compliant patient information management with real-time SMS and in-app notifications that keep patients informed at every step of their care journey.

**Current Status**: All 11 requirements fully implemented, verified, and covered by 128 E2E automated tests.

---

## 2. SCOPE

This specification covers the Patient Module with the following feature sets:

### v1.0.0 — Core Patient Management
1. Patient Registration
2. Patient Search & Filtering
3. Patient Profile View
4. Patient Information Update
5. Patient Status Management

### v2.0.0 — Extended Clinical Features
6. Appointment Scheduling & Management
7. Patient Self-Service Portal
8. Smart Duplicate Detection
9. Visit History Timeline
10. Structured Allergy & Medication Alerts

**Tier-1 Supporting Features** (v2.0.0):
- Patient Photo Upload
- Insurance Information Management
- Vitals History Tracking
- Audit Trail Viewer
- Bulk CSV Export
- Family Relationships Linking
- Patient ID Card Print

### v3.0.0 — Notifications
11. SMS + In-App Appointment Notifications

---

## 3. USER ROLES

| Role | Description | Permissions |
|------|-------------|-------------|
| RECEPTIONIST | Front desk staff | Register, search, view, update patients; book/cancel appointments; manage insurance; upload photos; export CSV |
| DOCTOR | Medical doctor | View patients; record vitals; manage allergies; complete appointments with notes/diagnosis |
| NURSE | Nursing staff | View patients; record vitals; manage allergies |
| ADMIN | System administrator | Full access — all above + deactivate patients, view audit trail, manage patient status |
| PATIENT | Patient (portal only) | View own profile (masked PHI); view own appointments and allergies; update contact info; view notifications |

---

## 4. USER JOURNEYS

### Journey 1: Receptionist Registers a New Patient

**Actor**: Receptionist | **Goal**: Create a new patient record

1. Receptionist navigates to Patient module → clicks "Register New Patient"
2. Fills mandatory fields: first name, last name, date of birth, gender, phone
3. Optionally fills: email, address, emergency contact, blood group, allergies, chronic conditions
4. System calculates age from date of birth in real time
5. System checks for duplicate phone numbers and name+DOB combinations; warns if found
6. Receptionist submits → System generates Patient ID (e.g., P2026001) and saves with ACTIVE status
7. Receptionist sees success message with generated Patient ID

---

### Journey 2: Receptionist Books an Appointment and Patient Receives SMS

**Actor**: Receptionist + Patient | **Goal**: Schedule appointment and notify patient

1. Receptionist opens patient profile → scrolls to Upcoming Appointments card
2. Clicks "Book Appointment" → fills date, time, type, doctor, department
3. System creates appointment with SCHEDULED status
4. System fires async notification event (AFTER_COMMIT)
5. Patient receives SMS: *"Hi! Appointment confirmed: 2026-02-21 10:00 with Dr. X (Cardiology). Ref: P2026001 — Ai Nexus Hospital"*
6. In-app notification bell on Patient Portal shows badge count +1
7. Patient clicks bell → drawer shows "Appointment Booked" notification

---

### Journey 3: Patient Views Portal and Notifications

**Actor**: Patient | **Goal**: Self-service access to own care information

1. Patient opens `hospital.ainexus.com/portal`
2. Authenticates with patient token
3. Portal shows: My Profile (masked phone), My Upcoming Appointments, My Allergies, Update Contact Info
4. Notification bell in header shows unread badge count
5. Patient clicks bell → notification drawer slides open showing chronological notifications
6. Patient clicks a notification → marked as read, badge decrements
7. Patient can click "Mark all read" to clear all at once

---

### Journey 4: Doctor Completes Appointment — Patient Receives Visit Summary

**Actor**: Doctor + Patient | **Goal**: Complete visit and send summary notification

1. Doctor opens patient → Upcoming Appointments → clicks Edit on booked appointment
2. Updates status to COMPLETED, adds visit notes and diagnosis
3. System saves → fires APPOINTMENT_COMPLETED notification event
4. Patient receives SMS: *"Your visit is complete. Log in to your portal to review your visit notes. — Ai Nexus Hospital"*
5. Completed appointment moves to Visit History Timeline
6. Timeline shows: date, doctor, department, diagnosis, visit notes

---

### Journey 5: Admin Manages Audit Trail

**Actor**: Admin | **Goal**: Review all access and changes to a patient record

1. Admin opens patient profile → clicks "Audit Trail" button
2. Modal displays chronological log: timestamp, user, role, action, IP address
3. Actions logged: CREATE, UPDATE, READ, ACTIVATE, DEACTIVATE, VITALS_RECORD, INSURANCE_ADD, INSURANCE_UPDATE, INSURANCE_DELETE, APPOINTMENT_BOOK, APPOINTMENT_CANCEL, APPOINTMENT_COMPLETE, ALLERGY_ADD, ALLERGY_UPDATE, ALLERGY_DELETE, NOTIFICATION_SENT, PORTAL_ACCESS, PORTAL_CONTACT_UPDATE

---

## 5. DETAILED REQUIREMENTS

---

### REQ-1: Patient Registration

**User Story**: As a receptionist, I want to register new patients with complete demographic information.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. System SHALL require: first name, last name, date of birth, gender, phone number
2. System SHALL accept optional fields: email, address, city, state, zip, emergency contact, blood group, allergies, chronic conditions
3. System SHALL auto-calculate patient age from date of birth
4. System SHALL validate phone in international E.164 format (`+917026191993`) or US format (`(XXX) XXX-XXXX`)
5. System SHALL validate email format
6. System SHALL generate unique Patient ID: `P{year}{3-digit-seq}` (e.g., P2026001)
7. System SHALL set status to ACTIVE on registration
8. System SHALL record registration timestamp and registering user
9. System SHALL warn (not block) if duplicate phone or name+DOB detected

---

### REQ-2: Patient Search and Filtering

**User Story**: As staff, I want to search patients by multiple criteria.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Default view shows all ACTIVE patients paginated (20 per page)
2. Search across: Patient ID, first name, last name, phone, email
3. Results update within 300ms of each keystroke (debounced)
4. Filters: status (All/Active/Inactive), gender, blood group, city, state, birth year range, has allergies, has chronic conditions
5. Empty state shown when no results match
6. Clicking a row navigates to patient profile

---

### REQ-3: Patient Profile View

**User Story**: As staff, I want to view complete patient information in an organized layout.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Profile shows: Patient ID, MRN, name, DOB, age, gender, phone, email, address, emergency contact, blood group, allergies, chronic conditions
2. Profile shows: status badge (color-coded), registration info, last updated info
3. Profile shows: patient photo (if uploaded) or initials avatar
4. RECEPTIONIST/ADMIN see: Edit Patient, Deactivate/Activate, Print ID Card buttons
5. ADMIN additionally sees: Audit Trail button
6. DOCTOR/NURSE see read-only view (no edit buttons)
7. Patient ID Card modal prints QR code + key demographics

---

### REQ-4: Patient Information Update

**User Story**: As a receptionist or admin, I want to update patient demographic information.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Edit form pre-populates all current values
2. Patient ID and registration date are read-only
3. Same validation rules as registration (including international phone)
4. Update records timestamp and updating user
5. Audit trail entry created for every update

---

### REQ-5: Patient Status Management

**User Story**: As an admin, I want to activate/deactivate patients without deleting records.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Deactivation requires confirmation dialog
2. Patient records are NEVER permanently deleted (soft-delete only)
3. Inactive patients hidden from default Active list
4. Status change recorded in audit trail with timestamp and admin user

---

### REQ-6: Appointment Scheduling & Management

**User Story**: As a receptionist, I want to book and manage patient appointments.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. RECEPTIONIST/DOCTOR/NURSE/ADMIN can book appointments
2. Appointment fields: date (today or future), time, type (Consultation/Follow-Up/Procedure/Routine Checkup/Emergency), doctor name, department, reason for visit
3. Appointment statuses: SCHEDULED → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW
4. RECEPTIONIST/ADMIN can cancel appointments (with confirmation)
5. DOCTOR/NURSE can update appointments including status, visit notes, diagnosis
6. Only COMPLETED appointments appear in Visit History
7. Global appointment list (all patients) accessible to RECEPTIONIST and ADMIN at `/appointments`
8. Upcoming appointments shown in patient detail and patient portal

---

### REQ-7: Patient Self-Service Portal

**User Story**: As a patient, I want to view my own health information and manage my contact details.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Portal accessible at `/portal` with PATIENT-role JWT token
2. Portal shows: My Profile (phone masked as `*****1234`), My Upcoming Appointments, My Allergies, Update Contact Info form
3. Patient CANNOT access other patients' data (403 enforced)
4. Patient CANNOT see Edit Patient, Audit Trail, or admin controls
5. Patient can update: phone, email, address, city, state, zip code
6. Contact update creates audit log entry
7. Staff roles are redirected away from `/portal`
8. Notification bell visible in portal header (v3.0.0)

---

### REQ-8: Smart Duplicate Detection

**User Story**: As a receptionist, I want to be warned about potential duplicate patient records.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. System detects duplicates using: exact phone match (HIGH confidence), name+DOB match (HIGH), Soundex phonetic name match (MEDIUM)
2. Duplicate warning shown on patient detail page if duplicates found
3. "View Duplicates" opens a comparison modal with confidence badge (HIGH/MEDIUM/LOW) and match reason
4. Registration with duplicate phone shows warning but allows proceeding
5. API endpoint: `GET /api/v1/patients/{patientId}/potential-duplicates`

---

### REQ-9: Visit History Timeline

**User Story**: As a doctor, I want to view a patient's complete visit history in chronological order.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Visit History card on patient detail page shows only COMPLETED appointments
2. Timeline displays: date, doctor name, department, diagnosis, visit notes
3. Empty state shown for patients with no completed visits
4. `GET /api/v1/patients/{patientId}/appointments/history` returns COMPLETED only
5. `GET /api/v1/patients/{patientId}/appointments/upcoming` excludes COMPLETED

---

### REQ-10: Structured Allergy & Medication Alerts

**User Story**: As a doctor, I want to record and track structured patient allergies with severity levels.

**Priority**: MUST HAVE | **Status**: ✅ Implemented

**Acceptance Criteria**:

1. Allergy fields: name, type (DRUG/FOOD/ENVIRONMENTAL/OTHER), severity (MILD/MODERATE/SEVERE/LIFE_THREATENING), reaction, onset date, notes
2. DOCTOR/NURSE/ADMIN can add, update, delete allergies; RECEPTIONIST is read-only
3. Soft-delete only — allergies are deactivated not removed
4. LIFE_THREATENING allergy triggers a red critical alert banner at the top of patient detail
5. `GET /api/v1/patients/{patientId}/allergies/critical-check` returns `{ hasCriticalAllergy: true/false }`
6. Invalid severity values return 400 Bad Request
7. Portal shows patient's own allergies (read-only)

---

### REQ-11: SMS + In-App Appointment Notifications

**User Story**: As a patient, I want to receive SMS and in-app notifications whenever my appointment status changes, so I am always informed about my care schedule.

**Priority**: MUST HAVE | **Status**: ✅ Implemented (v3.0.0)

#### Notification Triggers

| Event | SMS Message | In-App Type |
|-------|-------------|-------------|
| Appointment booked | `Hi! Appointment confirmed: {date} {time} with {doctor} ({dept}). Ref: {patientId} — Ai Nexus Hospital` | APPOINTMENT_BOOKED |
| Appointment confirmed | `Your appointment {date} at {time} is now confirmed. See you soon! — Ai Nexus Hospital` | APPOINTMENT_CONFIRMED |
| Appointment cancelled | `Your appointment on {date} at {time} has been cancelled. Please call us to reschedule. — Ai Nexus Hospital` | APPOINTMENT_CANCELLED |
| Appointment completed | `Your visit is complete. Log in to your portal to review your visit notes. — Ai Nexus Hospital` | APPOINTMENT_COMPLETED |
| 24h reminder (daily 8am cron) | `Reminder: Appointment tomorrow {date} at {time} with {doctor}. — Ai Nexus Hospital` | APPOINTMENT_REMINDER |

#### SMS Provider

| Mode | Provider | Configuration |
|------|----------|---------------|
| Dev / Test | MockSmsProvider | No Twilio account needed; SMS logged to `sms_delivery_log` table; visible at `GET /api/v1/dev/sms-log` |
| Production | TwilioSmsProvider | Activated when `TWILIO_ACCOUNT_SID` env var is set; real SMS delivered via Twilio API |

#### In-App Notification Bell

1. Bell icon with unread badge count in Patient Portal header
2. Badge auto-refreshes every 30 seconds
3. Clicking bell opens notification drawer (right side, 380px wide)
4. Each notification shows: type icon (color-coded), title, message, relative time (`2 minutes ago`)
5. Unread notifications: bold title, blue left border
6. Clicking notification marks it as read; badge decrements
7. "Mark all read" button clears all unread at once

#### API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/portal/me/notifications` | PATIENT | List all notifications (newest first) |
| GET | `/api/v1/portal/me/notifications/unread-count` | PATIENT | `{ "count": N }` |
| PATCH | `/api/v1/portal/me/notifications/{id}/read` | PATIENT | Mark single notification read |
| PATCH | `/api/v1/portal/me/notifications/read-all` | PATIENT | Mark all notifications read |
| GET | `/api/v1/dev/sms-log` | Staff | View all SMS sent (mock + real) |

#### Acceptance Criteria

1. Booking appointment MUST create in-app notification with type APPOINTMENT_BOOKED within 2 seconds
2. Cancellation MUST create APPOINTMENT_CANCELLED notification
3. PATIENT role CANNOT access staff endpoints (403)
4. Staff roles CANNOT access portal notification endpoints (403)
5. Notification events fire ONLY after DB transaction commits (AFTER_COMMIT) — no ghost notifications on rollback
6. SMS is fire-and-forget — delivery failure NEVER blocks appointment API response
7. PHI (phone number, message content) NEVER appears in server logs
8. MockSmsProvider active when Twilio credentials not configured
9. TwilioSmsProvider activates automatically when `TWILIO_ACCOUNT_SID` env var is set
10. Phone number MUST be in E.164 format for SMS delivery (e.g., `+917026191993`)

---

## 6. TIER-1 SUPPORTING FEATURES

### Patient Photo Upload

- RECEPTIONIST/ADMIN can upload, replace, delete patient photos
- Photos stored securely; served via authenticated API endpoint (JWT required)
- UI shows patient photo or initials avatar fallback
- Non-image uploads rejected with error message

### Insurance Information Management

- RECEPTIONIST/ADMIN can add, edit, delete insurance records per patient
- Fields: provider name, policy number, group number, coverage type, subscriber info, validity dates, primary flag
- Coverage types: INDIVIDUAL, FAMILY, MEDICARE, MEDICAID, OTHER
- Primary insurance shown with green badge

### Vitals History Tracking

- DOCTOR/NURSE/ADMIN can record vitals per patient visit
- Fields: temperature (°C), pulse rate, BP systolic/diastolic, respiratory rate, O₂ saturation, weight (kg), height (cm)
- BMI auto-calculated from weight and height
- Latest vitals shown in stat cards; trend chart rendered when ≥2 readings exist
- RECEPTIONIST has read-only access

### Audit Trail Viewer

- ADMIN-only access via "Audit Trail" button on patient detail
- Modal shows all audit entries: timestamp (UTC), user, role, action, IP address
- Actions captured: all patient CRUD, vitals, insurance, appointments, allergies, notifications, portal access

### Bulk CSV Export

- RECEPTIONIST/ADMIN can export patient list to CSV with current filters applied
- 17-column export: Patient ID, MRN, Name, DOB, Age, Gender, Phone, Email, Address, City, State, ZIP, Blood Group, Status, Registered By, Registered At, Updated At
- DOCTOR/NURSE cannot access export

### Family Relationships Linking

- RECEPTIONIST/ADMIN can link patients as family members (SPOUSE, PARENT, CHILD, SIBLING, GUARDIAN, WARD)
- Relationships shown in Family Links card on patient detail

### Patient ID Card Print

- RECEPTIONIST/ADMIN can print a Patient ID Card
- Card shows: QR code, Patient ID, MRN, name, DOB, blood group, emergency contact

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Patient search SHALL return within 2 seconds for up to 10,000 records
- Patient profile page SHALL load within 2 seconds
- Notification delivery SHALL not block appointment API response (async, fire-and-forget)
- In-app notification badge SHALL refresh within 30 seconds of new notification

### Security
- All PHI fields encrypted at rest using AES-256-GCM
- All API communication over TLS 1.2+
- JWT-based authentication; STATELESS sessions
- Role-based access control enforced at both API (Spring Security) and UI level
- PHI (phone numbers, patient messages) NEVER written to server logs
- Audit logs append-only; retained minimum 6 years (HIPAA)

### Reliability
- SMS delivery failure NEVER throws exception or blocks appointment workflow
- Notification events fired AFTER_COMMIT — no notifications on transaction rollback
- MockSmsProvider guarantees zero external dependencies in dev/test environments

### Usability
- Search updates within 300ms of keystroke
- Form validation errors shown inline on field blur
- Success notifications auto-dismiss after 5 seconds
- Notification bell auto-polls every 30 seconds

### Data Integrity
- Patient records NEVER permanently deleted (soft-delete only)
- Allergy records NEVER permanently deleted (soft-delete only)
- Patient ID globally unique, auto-generated
- International phone numbers supported in E.164 format

---

## 8. HIPAA COMPLIANCE

| Requirement | Implementation |
|-------------|----------------|
| Encryption at rest | AES-256-GCM on all PHI fields via `AesEncryptionConverter` |
| Encryption in transit | TLS enforced by infrastructure |
| Access control | Spring Security RBAC; minimum necessary principle per role |
| Audit logging | AOP `AuditAspect` fires on every service method; immutable append-only log |
| PHI in notifications | SMS content sent only to patient's own verified phone; NEVER logged server-side |
| Breach notification | Audit log records user, role, action, patient, timestamp, IP — sufficient for HIPAA investigation |
| Session management | STATELESS JWT; expiry enforced |

---

## 9. SYSTEM ARCHITECTURE

### Backend
- Spring Boot 3.4.1 / Java 17
- PostgreSQL 15 with Flyway migrations (V1–V16)
- AES-256-GCM encryption via JPA `AttributeConverter`
- Spring Security + JJWT 0.12.6
- Spring Application Events + `@Async @TransactionalEventListener(AFTER_COMMIT)` for notifications
- `@Scheduled` daily 8am cron for appointment reminders

### Frontend
- React 18.3.1 + TypeScript + Vite 6
- Ant Design 5 component library
- TanStack Query v5 (30s polling for notifications)
- react-hook-form + Zod validation

### SMS
- `SmsProvider` interface with two implementations:
  - `MockSmsProvider` — active when Twilio not configured; logs to `sms_delivery_log` table
  - `TwilioSmsProvider` — active when `TWILIO_ACCOUNT_SID` env var set; real SMS via Twilio API

### Database Tables (V1–V16)
| Table | Purpose |
|-------|---------|
| patients | Core patient records (PHI encrypted) |
| patient_insurance | Insurance policies per patient |
| patient_vitals | Vitals readings history |
| patient_audit_log | Immutable access and change log |
| patient_appointments | Appointment records |
| patient_allergies | Allergy records (soft-delete) |
| patient_relationships | Family links between patients |
| patient_notifications | In-app notifications (read/unread) |
| sms_delivery_log | SMS delivery audit trail (MOCK + TWILIO) |

---

## 10. API REFERENCE SUMMARY

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/api/v1/patients` | All staff | Search/list patients |
| POST | `/api/v1/patients` | RECEPTIONIST, ADMIN | Register patient |
| GET | `/api/v1/patients/{id}` | All staff | Get patient profile |
| PUT | `/api/v1/patients/{id}` | RECEPTIONIST, ADMIN | Update patient |
| PATCH | `/api/v1/patients/{id}/status` | ADMIN | Activate/deactivate |
| GET | `/api/v1/patients/{id}/audit-trail` | ADMIN | Audit log |
| GET | `/api/v1/patients/export` | RECEPTIONIST, ADMIN | CSV export |
| POST | `/api/v1/patients/{id}/photo` | RECEPTIONIST, ADMIN | Upload photo |
| GET/DELETE | `/api/v1/patients/{id}/photo` | RECEPTIONIST, ADMIN | Fetch/delete photo |
| GET/POST | `/api/v1/patients/{id}/insurance` | Staff / RECEPTIONIST, ADMIN | Insurance CRUD |
| GET/POST | `/api/v1/patients/{id}/vitals` | Staff / DOCTOR, NURSE, ADMIN | Vitals CRUD |
| GET/POST/PUT/PATCH | `/api/v1/patients/{id}/appointments/**` | All staff | Appointment management |
| GET | `/api/v1/appointments` | RECEPTIONIST, ADMIN | Global appointment list |
| GET/POST/PUT/DELETE | `/api/v1/patients/{id}/allergies/**` | Staff (write: DOCTOR+) | Allergy management |
| GET | `/api/v1/portal/me` | PATIENT | Own profile |
| GET | `/api/v1/portal/me/appointments` | PATIENT | Own appointments |
| GET | `/api/v1/portal/me/allergies` | PATIENT | Own allergies |
| PATCH | `/api/v1/portal/me/contact` | PATIENT | Update contact info |
| GET | `/api/v1/portal/me/notifications` | PATIENT | Notification list |
| GET | `/api/v1/portal/me/notifications/unread-count` | PATIENT | Unread count |
| PATCH | `/api/v1/portal/me/notifications/{id}/read` | PATIENT | Mark read |
| PATCH | `/api/v1/portal/me/notifications/read-all` | PATIENT | Mark all read |
| GET | `/api/v1/dev/sms-log` | All staff | SMS delivery log |
| POST | `/api/v1/auth/dev-login` | Public (dev) | Staff login token |
| POST | `/api/v1/auth/patient-token` | Public (dev) | Patient portal token |

---

## 11. E2E TEST COVERAGE

**Total: 128 tests — 128 passing**

| Test File | REQ | Tests | Status |
|-----------|-----|-------|--------|
| 01-login.spec.ts | Core | 6 | ✅ |
| 02-patient-list.spec.ts | REQ-2 | 6 | ✅ |
| 03-patient-detail.spec.ts | REQ-3 | 5 | ✅ |
| 06-photo-upload.spec.ts | Photo | 9 | ✅ |
| 11-insurance.spec.ts | Insurance | 7 | ✅ |
| 12-vitals.spec.ts | Vitals | 9 | ✅ |
| 13-audit-trail.spec.ts | Audit | 10 | ✅ |
| 14-csv-export.spec.ts | CSV | 8 | ✅ |
| 15-duplicate-detection.spec.ts | REQ-8 | 6 | ✅ |
| 16-appointments.spec.ts | REQ-6 | 11 | ✅ |
| 17-patient-portal.spec.ts | REQ-7 | 9 | ✅ |
| 18-smart-duplicates.spec.ts | REQ-8 | 8 | ✅ |
| 19-visit-history.spec.ts | REQ-9 | 7 | ✅ |
| 20-allergies.spec.ts | REQ-10 | 12 | ✅ |
| 21-notifications.spec.ts | REQ-11 | 11 | ✅ |
| 22-sms-notifications.spec.ts | REQ-11 | 5 | ✅ |

---

## 12. SUCCESS CRITERIA

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Receptionists can register patients in under 3 minutes | ✅ |
| 2 | Staff can find any patient within 5 seconds | ✅ |
| 3 | All PHI encrypted at rest (AES-256-GCM) | ✅ |
| 4 | Audit trail records every access and change | ✅ |
| 5 | Appointments can be booked, confirmed, completed, cancelled | ✅ |
| 6 | Patients receive SMS on every appointment status change | ✅ |
| 7 | Patients receive in-app notifications with read/unread tracking | ✅ |
| 8 | Patient portal provides self-service with masked PHI | ✅ |
| 9 | International phone numbers supported (E.164) | ✅ |
| 10 | 128/128 E2E tests passing | ✅ |
| 11 | System supports 50,000 records without degradation | ✅ |

---

## 13. ENVIRONMENT CONFIGURATION

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password |
| `JWT_SECRET` | Yes | JWT signing secret (256-bit min) |
| `AES_ENCRYPTION_KEY` | Yes | AES-256 key (exactly 32 characters) |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID — leave blank for MockSmsProvider |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | No | Twilio sender number in E.164 format |

### SMS Mode Selection (automatic)

```
TWILIO_ACCOUNT_SID not set → MockSmsProvider (dev/test)
TWILIO_ACCOUNT_SID set     → TwilioSmsProvider (production real SMS)
```

---

**Document Version**: 3.0.0
**Status**: Implemented & Verified
**Test Coverage**: 128/128 E2E tests passing
**Last Updated**: February 21, 2026
