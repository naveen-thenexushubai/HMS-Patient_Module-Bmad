# Hospital Management System - Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System - Patient Module Requirements |
| Module | Patient Management |
| Version | 1.1.0 |
| Status | Revised |
| Company | Ai Nexus |
| Created Date | February 2026 |
| Last Revised | February 2026 |
| Revision Notes | Added User Journeys, HIPAA Compliance, UX/UI Requirements; strengthened NFRs with measurement methods |

---

## 1. EXECUTIVE SUMMARY

The Patient Module underpins the Hospital Management System. Receptionists use it to register patients, doctors and nurses use it to access patient demographics, and administrators use it to manage patient records and status.

**Core Value**: Centralized, secure, and HIPAA-compliant patient information management that serves as the data foundation for all downstream hospital modules (appointments, EMR, billing).

---

## 2. MVP SCOPE - PATIENT MODULE

This specification covers ONLY the Patient Module with the following features:

1. **Patient Registration** - Register new patients with complete demographics
2. **Patient Search** - Search and filter patients by multiple criteria
3. **Patient Profile View** - View complete patient information
4. **Patient Update** - Update patient demographic information
5. **Patient Status Management** - Activate/deactivate patient records

**Out of Scope for This Module**:
- Authentication (Auth module)
- Appointments (Appointment module)
- Medical records/EMR (EMR module)
- Billing (Billing module)
- Pharmacy (Pharmacy module)

---

## 3. USER ROLES

| Role | Description | Patient Module Permissions |
|------|-------------|---------------------------|
| RECEPTIONIST | Front desk staff | Register, search, view, update patients |
| DOCTOR | Medical doctor | Search, view patients (read-only demographics) |
| NURSE | Nursing staff | Search, view patients (read-only demographics) |
| ADMIN | System administrator | Full access — register, search, view, update, deactivate |

**Note**: Authentication and role assignment are handled by the Auth module.

---

## 4. USER JOURNEYS

### Journey 1: Receptionist Registers a New Patient

**Actor**: Receptionist | **Goal**: Create a new patient record

1. Receptionist navigates to the Patient module
2. Clicks "Register New Patient"
3. System displays the registration form
4. Receptionist fills mandatory fields: first name, last name, date of birth, gender, phone
5. Receptionist optionally fills: email, address, emergency contact, blood group, allergies, chronic conditions
6. System calculates and displays patient age from date of birth in real time
7. Receptionist submits the form
8. System validates all fields and checks for duplicate phone numbers
9. System generates unique Patient ID (e.g., P2026001) and saves record with ACTIVE status
10. Receptionist sees success confirmation displaying the generated Patient ID

**Exit Conditions**: Patient record created and accessible in patient list

---

### Journey 2: Staff Searches for and Views a Patient

**Actor**: Receptionist, Doctor, or Nurse | **Goal**: Locate a specific patient record

1. Staff navigates to the Patient list (active patients shown by default)
2. Types search term (Patient ID, name, phone, or email) in search box
3. System returns matching results within 300ms of each keystroke
4. Staff optionally applies filters: status, gender, blood group
5. Staff clicks on the target patient row
6. System displays the patient profile with demographics, emergency contact, and medical information
7. Doctor/Nurse sees read-only view (no Edit button); Receptionist/Admin sees Edit button

**Exit Conditions**: Staff has accessed the patient's complete profile

---

### Journey 3: Receptionist or Admin Updates Patient Information

**Actor**: Receptionist or Admin | **Goal**: Correct or update patient demographics

1. Staff locates patient via search (Journey 2)
2. Clicks "Edit Patient" on the profile page
3. System displays pre-populated editable form (Patient ID and registration date are read-only)
4. Staff modifies required fields
5. System applies the same validation rules as registration
6. Staff submits the form
7. System saves changes, records update timestamp and user, and displays success message
8. System returns to the updated patient profile view

**Exit Conditions**: Patient record updated with new information and audit trail recorded

---

### Journey 4: Admin Deactivates a Patient Record

**Actor**: Admin | **Goal**: Mark a patient as inactive without deleting the record

1. Admin locates patient via search (Journey 2)
2. Views patient profile with ACTIVE status
3. Clicks "Deactivate Patient"
4. System displays confirmation dialog: "Are you sure you want to deactivate this patient?"
5. Admin confirms
6. System changes patient status to INACTIVE, records timestamp and admin user
7. System displays success message
8. Patient no longer appears in the default Active patient list

**Exit Conditions**: Patient record marked INACTIVE; historical data preserved; audit entry created

---

## 5. DETAILED REQUIREMENTS

### Requirement 1: Patient Registration

**User Story**: As a receptionist, I want to register new patients with complete demographic information, so that the hospital has accurate patient records for treatment and billing.

**Priority**: MUST HAVE (MVP)
**Estimated Effort**: 2-3 days

**Acceptance Criteria**:

1. WHEN a receptionist clicks "Register New Patient", THE System SHALL display a patient registration form
2. WHEN the form is displayed, THE System SHALL require the following mandatory fields: first name, last name, date of birth, gender, phone number
3. WHEN the form is displayed, THE System SHALL provide optional fields: email, address, city, state, zip code, emergency contact name, emergency contact phone, emergency contact relationship, blood group, known allergies, chronic conditions
4. WHEN a receptionist enters a date of birth, THE System SHALL automatically calculate and display the patient's age
5. WHEN a receptionist enters a phone number, THE System SHALL validate it matches the format: +1-XXX-XXX-XXXX or (XXX) XXX-XXXX or XXX-XXX-XXXX
6. WHEN a receptionist enters an email, THE System SHALL validate it is a valid email format
7. WHEN a receptionist submits the form with valid data, THE System SHALL generate a unique Patient ID in format "P" + year + sequential number (e.g., P2026001)
8. WHEN a patient is successfully registered, THE System SHALL display a success message with the generated Patient ID
9. WHEN a patient is successfully registered, THE System SHALL set the patient status to "ACTIVE" by default
10. WHEN registration fails due to validation errors, THE System SHALL display a specific error message adjacent to each invalid field identifying the field name and required format
11. WHEN a receptionist tries to register a patient with a phone number that already exists, THE System SHALL warn about potential duplicate but allow registration
12. WHEN a patient is registered, THE System SHALL record the registration timestamp and the user who registered the patient

---

### Requirement 2: Patient Search and Filtering

**User Story**: As a hospital staff member, I want to search for patients using multiple criteria, so that I can quickly find the patient I need to work with.

**Priority**: MUST HAVE (MVP)
**Estimated Effort**: 2 days

**Acceptance Criteria**:

1. WHEN a user accesses the patient list page, THE System SHALL display all active patients by default
2. WHEN the patient list is displayed, THE System SHALL show: Patient ID, full name, age, gender, phone number, and status
3. WHEN the patient list has more than 20 records, THE System SHALL provide pagination with 20 patients per page
4. WHEN a user enters text in the search box, THE System SHALL search across: Patient ID, first name, last name, phone number, and email
5. WHEN a user types in the search box, THE System SHALL display matching results within 300ms of each keystroke
6. WHEN a user selects a status filter (All, Active, Inactive), THE System SHALL display only patients with that status
7. WHEN a user selects a gender filter (All, Male, Female, Other), THE System SHALL display only patients with that gender
8. WHEN a user selects a blood group filter, THE System SHALL display only patients with that blood group
9. WHEN no patients match the search criteria, THE System SHALL display "No patients found" message
10. WHEN a user clicks on a patient row, THE System SHALL navigate to the patient profile page

---

### Requirement 3: Patient Profile View

**User Story**: As a hospital staff member, I want to view complete patient information in an organized layout, so that I can quickly understand the patient's demographics and medical background.

**Priority**: MUST HAVE (MVP)
**Estimated Effort**: 2 days

**Acceptance Criteria**:

1. WHEN a user clicks on a patient from the list, THE System SHALL display the patient profile page
2. WHEN the profile page loads, THE System SHALL display patient demographics: Patient ID, full name, date of birth, age, gender, phone, email, address
3. WHEN the profile page loads, THE System SHALL display emergency contact information: name, phone, relationship
4. WHEN the profile page loads, THE System SHALL display medical information: blood group, known allergies, chronic conditions
5. WHEN the profile page loads, THE System SHALL display patient status (Active/Inactive) with color coding (green for active, red for inactive) and a text label
6. WHEN the profile page loads, THE System SHALL display registration date and registered by user
7. WHEN the profile page loads, THE System SHALL display last updated date and updated by user
8. WHEN a user with edit permissions views the profile, THE System SHALL display an "Edit Patient" button
9. WHEN a user without edit permissions views the profile, THE System SHALL NOT display the "Edit Patient" button
10. WHEN a user clicks "Back to List", THE System SHALL return to the patient list page

---

### Requirement 4: Patient Information Update

**User Story**: As a receptionist or admin, I want to update patient demographic information, so that patient records remain accurate and up-to-date.

**Priority**: MUST HAVE (MVP)
**Estimated Effort**: 2 days

**Acceptance Criteria**:

1. WHEN a user with edit permissions clicks "Edit Patient", THE System SHALL display the patient information in an editable form
2. WHEN the edit form is displayed, THE System SHALL pre-populate all fields with current patient data
3. WHEN the edit form is displayed, THE System SHALL NOT allow editing of Patient ID (read-only)
4. WHEN the edit form is displayed, THE System SHALL NOT allow editing of registration date (read-only)
5. WHEN a user modifies any field, THE System SHALL apply the same validation rules as registration
6. WHEN a user submits the updated form with valid data, THE System SHALL save the changes
7. WHEN patient information is successfully updated, THE System SHALL display a success message
8. WHEN patient information is successfully updated, THE System SHALL record the update timestamp and the user who made the update
9. WHEN a user clicks "Cancel", THE System SHALL discard changes and return to the profile view
10. WHEN update fails due to validation errors, THE System SHALL display a specific error message adjacent to each invalid field identifying the field name and required format

---

### Requirement 5: Patient Status Management

**User Story**: As an admin, I want to deactivate patient records instead of deleting them, so that we maintain historical data while marking patients who are no longer active.

**Priority**: MUST HAVE (MVP)
**Estimated Effort**: 1 day

**Acceptance Criteria**:

1. WHEN an admin views an active patient profile, THE System SHALL display a "Deactivate Patient" button
2. WHEN an admin views an inactive patient profile, THE System SHALL display an "Activate Patient" button
3. WHEN an admin clicks "Deactivate Patient", THE System SHALL display a confirmation dialog: "Are you sure you want to deactivate this patient?"
4. WHEN an admin confirms deactivation, THE System SHALL change the patient status to "INACTIVE"
5. WHEN a patient is deactivated, THE System SHALL record the deactivation timestamp and the user who deactivated
6. WHEN a patient is deactivated, THE System SHALL display a success message
7. WHEN an admin clicks "Activate Patient", THE System SHALL change the patient status to "ACTIVE" without confirmation
8. WHEN a patient is activated, THE System SHALL record the activation timestamp and the user who activated
9. WHEN viewing the patient list with "Active" filter, THE System SHALL NOT display inactive patients
10. WHEN viewing the patient list with "All" filter, THE System SHALL display both active and inactive patients with status indicators

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### Performance
- Patient search results SHALL return within 2 seconds for up to 10,000 patient records as measured by API response time monitoring under normal load of 100 concurrent users
- Patient registration SHALL complete within 3 seconds from form submission to success confirmation as measured under normal load
- Patient profile page SHALL load within 2 seconds from navigation to full page render as measured under normal load

### Security
- All PHI fields SHALL be encrypted at rest using AES-256
- All data transmission SHALL use TLS 1.2 or higher
- All access to patient data SHALL be logged with user ID, role, action type, patient ID, timestamp, and IP address
- Audit logs SHALL be retained for a minimum of 6 years per HIPAA requirements
- Audit logs SHALL be immutable (append-only; no modification or deletion permitted)
- Only authenticated users with appropriate roles SHALL access patient data

### Usability
- Patient registration form SHALL be completable in under 3 minutes as measured by task completion time testing with representative users
- Search results SHALL update within 300ms of each keystroke as measured by frontend performance testing
- Each form field SHALL display a specific error message identifying the field name and required format when validation fails
- UI SHALL adapt to viewport sizes from 320px (mobile) to 2560px (desktop) with fully functional layouts at all breakpoints

### Data Integrity
- Patient ID SHALL be unique and auto-generated
- Phone numbers SHALL be validated before storage
- Email addresses SHALL be validated before storage
- Date of birth SHALL not allow future dates
- Age SHALL be calculated automatically from date of birth
- Patient records SHALL never be permanently deleted

### Scalability
- System SHALL support up to 50,000 patient records without performance degradation as validated by load testing
- System SHALL support up to 100 concurrent users accessing patient data simultaneously as measured by load testing

---

## 7. HIPAA COMPLIANCE

This module handles Protected Health Information (PHI) and must comply with the HIPAA Privacy Rule and Security Rule.

### Technical Safeguards

| Requirement | Specification |
|-------------|---------------|
| Encryption at rest | AES-256 for all PHI fields in the database |
| Encryption in transit | TLS 1.2 or higher for all API communications |
| Multi-Factor Authentication | MFA SHALL be enforced for all users accessing PHI — coordinated with Auth Module (hard dependency) |
| Session timeout | Automatic logout after 15 minutes of inactivity — coordinated with Auth Module |
| Access control | Role-based access enforcing minimum necessary principle (see Section 3) |

### Audit Controls

- All read, write, update, and status-change actions on patient records SHALL generate an audit log entry
- Each audit log entry SHALL contain: user ID, user role, action type (READ/CREATE/UPDATE/DEACTIVATE/ACTIVATE), patient ID, timestamp (UTC), IP address
- Audit logs SHALL be retained for a minimum of 6 years
- Audit logs SHALL be immutable — no modification or deletion permitted after creation

### Minimum Necessary Principle

| Role | Data Access |
|------|-------------|
| RECEPTIONIST | Full demographic and contact data; can write |
| DOCTOR | Demographics and medical summary; read-only |
| NURSE | Demographics and medical summary; read-only |
| ADMIN | Full access including status management and audit log review |

### Breach Notification Support

- Audit logs produced by this module SHALL be sufficient to identify: which user accessed which patient record, when, and from which IP address
- These logs support organizational HIPAA breach investigation and notification obligations

### Dependency Risk

> **BLOCKER**: This module's HIPAA compliance (MFA, session timeout, role enforcement) is dependent on the Auth Module. Patient Module MUST NOT be deployed to production without a HIPAA-compliant Auth Module in place.

---

## 8. UX/UI REQUIREMENTS

### Responsive Design

| Breakpoint | Viewport | Layout |
|------------|----------|--------|
| Mobile | 320px – 767px | Single-column; patient list as cards |
| Tablet | 768px – 1279px | Two-column; patient list as compact table |
| Desktop | 1280px and above | Full table layout with sidebar filters |

- All features SHALL be fully functional at every breakpoint
- Touch targets SHALL be a minimum of 44x44px on mobile

### Accessibility

- UI SHALL conform to WCAG 2.1 Level AA
- All form fields SHALL have associated `<label>` elements
- Status indicators (Active/Inactive) SHALL use both color and text label — color alone is insufficient
- All interactive elements SHALL be keyboard navigable with visible focus states
- Error messages SHALL be announced to screen readers via ARIA live regions

### Form Design

- Registration and edit forms SHALL group fields into four logical sections:
  1. Personal Information (name, DOB, gender)
  2. Contact Information (phone, email, address)
  3. Emergency Contact (name, phone, relationship)
  4. Medical Information (blood group, allergies, chronic conditions)
- Required fields SHALL be marked with a visible asterisk (*) and a form-level note: "* Required field"
- Inline validation SHALL display errors adjacent to the relevant field immediately on field blur

### Error and Feedback States

- Successful actions (register, update, activate, deactivate) SHALL display a non-blocking success notification at the top of the page, auto-dismissing after 5 seconds
- System-level errors SHALL display a non-blocking error notification at the top of the page with a specific message
- Destructive actions (deactivate) SHALL require confirmation via modal dialog before executing

---

## 9. OUT OF SCOPE

The following features are NOT part of the Patient Module and will be handled by other modules:

- User authentication and login (Auth Module)
- Appointment scheduling (Appointment Module)
- Medical records and clinical notes (EMR Module)
- Prescriptions and medications (EMR/Pharmacy Module)
- Lab results and imaging (Laboratory/Radiology Module)
- Billing and insurance (Billing Module)
- Patient portal for self-service (Patient Portal Module)
- Document upload and management (Document Module)
- Notifications and reminders (Notification Module)
- Reporting and analytics (Reporting Module)

---

## 10. ASSUMPTIONS AND DEPENDENCIES

### Assumptions
- Users have appropriate roles assigned (RECEPTIONIST, DOCTOR, NURSE, ADMIN)
- PostgreSQL 15 or higher is available

### Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Auth Module | **BLOCKER** | Required for authentication, MFA, session management, and role enforcement. Patient Module cannot be HIPAA-compliant without it. |
| PostgreSQL 15+ | Required | Primary data store |
| Spring Boot 3.2.x / Java 17 | Required | Backend framework |
| React 18.x | Required | Frontend framework |

---

## 11. SUCCESS CRITERIA

The Patient Module will be considered successful when:

1. ✅ Receptionists can register new patients in under 3 minutes as measured by task completion testing
2. ✅ Staff can find any patient within 5 seconds using search
3. ✅ All patient data is accurately stored and retrieved
4. ✅ Patient status can be managed (activate/deactivate) with full audit trail
5. ✅ All HIPAA technical safeguards are implemented: AES-256 at rest, TLS 1.2+, MFA, 6-year audit log retention
6. ✅ System handles 50,000 patient records without performance degradation as validated by load testing
7. ✅ UI is fully functional at mobile (320px), tablet (768px), and desktop (1280px) breakpoints
8. ✅ UI conforms to WCAG 2.1 Level AA
9. ✅ All 5 requirements are fully implemented and tested

---

**Document Version**: 1.1.0
**Status**: Ready for Architecture Phase
**Next Step**: Create architecture.md — run `/bmad-bmm-create-architecture`
