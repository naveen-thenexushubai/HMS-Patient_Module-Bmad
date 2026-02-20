# Hospital Management System - Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System - Patient Module Requirements |
| Module | Patient Management |
| Version | 2.0.0 |
| Status | Released |
| Company | Ai Nexus |
| Created Date | February 2026 |
| Last Revised | February 2026 |
| Revision Notes | **v2.0 — Clinical Gap Features**: Added Patient Photo & Printable ID Card, Duplicate Patient Detection, Advanced Patient Search, Medical Record Number (MRN), and Family / Relationship Linking |
| Baseline Document | `patient-module-prd.md` (v1.1.0) — all v1.1.0 requirements remain in force |

---

## Change Summary

This document specifies **five new features** added to the Patient Module in version 2.0.0.
All requirements from v1.1.0 continue to apply without modification.

| Feature | Priority | Requirement Section |
|---------|----------|---------------------|
| Patient Photo + Printable ID Card | High | REQ-6 |
| Duplicate Patient Detection | High | REQ-7 |
| Advanced Patient Search | High | REQ-8 |
| Medical Record Number (MRN) | High | REQ-9 |
| Family / Relationship Linking | High | REQ-10 |

---

## 1. EXECUTIVE SUMMARY (v2.0 Additions)

Version 2.0 closes five critical clinical gaps identified during real-world use of the v1.1.0 Patient Module. Receptionists need to identify patients at a glance (photo + printed ID card), prevent duplicate records (duplicate detection), search by clinical attributes (advanced filters), track patients by their hospital-issued MRN, and capture family relationships for emergency and next-of-kin workflows.

**Core Value Added**: Upgraded from a demographic registry to a clinically-aware patient identity hub that supports bedside identification, family coordination, and duplicate prevention.

---

## 2. v2.0 SCOPE

This specification adds the following features to the existing Patient Module:

1. **Patient Photo** — Upload, display, and remove patient photo (max 2 MB, stored in database)
2. **Printable ID Card** — Generate and print a patient identity card with QR code
3. **Duplicate Detection** — Flag patients sharing the same phone number with side-by-side comparison
4. **Advanced Search Filters** — Filter by city, state, age range, allergies flag, chronic conditions flag
5. **MRN (Medical Record Number)** — Auto-generated hospital-wide unique identifier (e.g., MRN2026001)
6. **Family / Relationship Linking** — Bidirectional links between patient records with relationship types

**Out of Scope for v2.0**:
- Merging/replacing duplicate patient records (flagging only; hard merge is a future feature)
- Document/attachment upload beyond profile photo (Document Module)
- Next-of-kin legal workflows (Legal/EMR Module)

---

## 3. USER ROLES (unchanged from v1.1.0 — permissions extended)

| Role | v2.0 Additional Permissions |
|------|-----------------------------|
| RECEPTIONIST | Upload/remove photo; print ID card; add/remove relationships; view duplicate alerts |
| DOCTOR | View photo; print ID card; view relationships; view duplicate alerts (read-only) |
| NURSE | View photo; print ID card; view relationships; view duplicate alerts (read-only) |
| ADMIN | All RECEPTIONIST permissions + full photo/relationship management |

---

## 4. USER JOURNEYS (v2.0 Additions)

### Journey 5: Receptionist Uploads and Prints Patient ID Card

**Actor**: Receptionist | **Goal**: Attach a patient photo and produce a printed bedside ID card

1. Receptionist opens the patient profile page
2. System displays a patient avatar (photo or initials fallback) in the Personal Information card
3. Receptionist clicks "Upload Photo"
4. System displays a file picker accepting image files only (JPEG, PNG, WebP)
5. Receptionist selects an image file
6. System validates file is an image and is ≤ 2 MB; displays error if either check fails
7. System uploads and stores the photo; avatar on the profile page updates immediately
8. Receptionist clicks "Print ID Card"
9. System opens a print-preview modal showing: hospital name, patient full name, MRN, Patient ID, date of birth, blood group, and a QR code (encodes Patient ID)
10. Receptionist clicks "Print Card"; browser print dialog opens
11. Card is printed without browser chrome (header/footer)

**Exit Conditions**: Patient photo stored; printed card in hand for wristband/folder use

---

### Journey 6: Receptionist Detects and Compares Duplicate Patients

**Actor**: Receptionist | **Goal**: Identify and compare patients with the same phone number to prevent duplicate records

1. Receptionist opens a patient profile
2. System automatically checks for other patients with the same phone number
3. If potential duplicates exist, System displays a yellow warning banner: "N possible duplicate patient(s) detected"
4. Receptionist clicks "View Duplicates"
5. System opens a comparison modal listing all duplicate patients in a table: Patient ID, MRN, name, age, phone, status
6. Each row includes a "View Profile" link
7. Receptionist reviews each duplicate profile to determine if it is a true duplicate or a different person using the same phone
8. Receptionist closes the modal and takes appropriate action (update phone number on one record, or confirm they are different people)

**Exit Conditions**: Receptionist has made an informed decision about potential duplicates; no automatic merging occurs

---

### Journey 7: Staff Uses Advanced Search to Narrow Patient Results

**Actor**: Any staff role | **Goal**: Find patients by clinical or geographic attributes not available in basic search

1. Staff opens the patient list page
2. Staff clicks "Advanced Filters" to expand the filter panel
3. System reveals additional filter controls: City, State, Age From, Age To, Has Allergies toggle, Has Chronic Conditions toggle
4. Staff enters "Chicago" in City and toggles "Has Allergies" on
5. System immediately returns only Chicago patients with known allergies
6. Staff combines with basic search (e.g., gender = Female) for further narrowing
7. Staff clicks a patient row to open their profile

**Exit Conditions**: Staff has found the correct patient using a combination of advanced filters

---

### Journey 8: MRN Is Auto-Assigned and Used for Identification

**Actor**: Receptionist (during registration) | **Goal**: Every patient gets a unique, readable hospital identifier

1. Receptionist registers a new patient (Journey 1 from v1.1.0)
2. System generates and stores a unique MRN in format MRN{year}{seq} (e.g., MRN2026001) at the moment of registration
3. System displays the MRN on the registration success screen alongside the Patient ID
4. MRN appears on the patient profile Personal Information card
5. MRN appears as a column in the patient list table
6. Staff can search for a patient by typing their MRN in the search box
7. MRN is printed on the patient ID card (Journey 5)

**Exit Conditions**: Patient has a permanent, human-readable hospital identifier that never changes

---

### Journey 9: Receptionist Links Family Members

**Actor**: Receptionist | **Goal**: Record that two patients are related so staff can quickly contact family

1. Receptionist opens a patient profile (e.g., a child)
2. Scrolls to the "Family & Relationships" card at the bottom of the profile
3. Clicks "Add Link"
4. System opens a modal with two inputs: Patient ID to link, and Relationship Type dropdown
5. Receptionist enters the Patient ID of the parent and selects "PARENT"
6. System validates both patient IDs exist; displays error if either is not found
7. System saves the link in both directions: child → parent as PARENT, parent → child as CHILD
8. Both patient profiles now show each other in the Family & Relationships card
9. Receptionist can click "View" on any linked patient to open their profile
10. To remove a link, Receptionist clicks "Remove" and confirms

**Exit Conditions**: Both patient profiles reflect the relationship; either side can navigate to the other; removing from one side removes from both

---

## 5. DETAILED REQUIREMENTS (v2.0)

### Requirement 6: Patient Photo

**User Story**: As a receptionist, I want to upload a patient's photo so that clinical staff can visually identify the patient at the bedside.

**Priority**: MUST HAVE (v2.0)
**Estimated Effort**: 2 days

**Acceptance Criteria**:

1. WHEN a receptionist or admin views a patient profile, THE System SHALL display a photo upload area showing either the current photo or an avatar with the patient's initials as fallback
2. WHEN a receptionist or admin clicks "Upload Photo", THE System SHALL open a file picker restricted to image file types (image/*)
3. WHEN a user selects a file larger than 2 MB, THE System SHALL display an error "Photo must be under 2 MB" and reject the file
4. WHEN a user selects a non-image file type, THE System SHALL display an error "Only image files are allowed" and reject the file
5. WHEN a valid photo is uploaded, THE System SHALL store it in the database and display it on the profile page immediately without page reload
6. WHEN a photo exists, THE System SHALL display a "Replace" button to upload a new photo and a delete button to remove the current photo
7. WHEN a receptionist or admin clicks the delete button, THE System SHALL display a confirmation prompt before removing the photo
8. WHEN a photo is removed, THE System SHALL revert the display to the initials avatar
9. WHEN a doctor or nurse views a patient profile with a photo, THE System SHALL display the photo in read-only mode with no upload or remove controls
10. WHEN a photo is uploaded or deleted, THE System SHALL create an audit log entry with action PHOTO_UPLOAD or PHOTO_DELETE
11. WHEN the patient list or profile page requests a photo that does not exist, THE System SHALL return HTTP 404 and the UI SHALL display the initials avatar

---

### Requirement 7: Duplicate Patient Detection

**User Story**: As a receptionist, I want to be alerted when a patient shares a phone number with another patient, so that I can review potential duplicate records before proceeding.

**Priority**: MUST HAVE (v2.0)
**Estimated Effort**: 1 day

**Acceptance Criteria**:

1. WHEN a patient profile page loads, THE System SHALL automatically check for other patient records that share the same phone number
2. WHEN one or more potential duplicates exist, THE System SHALL display a yellow warning banner on the patient profile page with the message "N possible duplicate patient(s) detected"
3. WHEN the duplicate warning banner is displayed, THE System SHALL show a "View Duplicates" button
4. WHEN a user clicks "View Duplicates", THE System SHALL open a comparison modal listing all patients with the same phone number
5. WHEN the comparison modal is open, THE System SHALL display for each duplicate: Patient ID, MRN, full name, age, phone number, status
6. WHEN the comparison modal is open, THE System SHALL mark the currently viewed patient (e.g., "Current" badge)
7. WHEN the comparison modal is open, THE System SHALL provide a "View Profile" link for each listed patient that navigates to that patient's profile
8. WHEN no potential duplicates exist for a patient, THE System SHALL NOT display any warning banner
9. WHEN a potential duplicate is found, THE System SHALL NOT automatically merge or modify any patient records — flagging and investigation only
10. WHEN a user registers a patient with an existing phone number (v1.1.0 REQ-1.11 behavior), THE System SHALL set the duplicatePhoneWarning flag on the registration response

---

### Requirement 8: Advanced Patient Search

**User Story**: As a staff member, I want to filter patients by city, state, age range, allergies status, and chronic conditions status, so that I can quickly find cohorts of patients with specific characteristics.

**Priority**: MUST HAVE (v2.0)
**Estimated Effort**: 1.5 days

**Acceptance Criteria**:

1. WHEN a user is on the patient list page, THE System SHALL provide an "Advanced Filters" collapsible panel below the basic filter row
2. WHEN the advanced filter panel is expanded, THE System SHALL provide the following filter controls: City (text input), State (text input), Age From (numeric input), Age To (numeric input), Has Allergies (toggle), Has Chronic Conditions (toggle)
3. WHEN a user enters a city, THE System SHALL return only patients whose city contains the entered text (case-insensitive partial match)
4. WHEN a user enters a state, THE System SHALL return only patients whose state contains the entered text (case-insensitive partial match)
5. WHEN a user enters Age From and/or Age To, THE System SHALL return only patients whose age falls within the specified range (inclusive)
6. WHEN a user enables the Has Allergies toggle, THE System SHALL return only patients who have a non-empty known allergies field
7. WHEN a user enables the Has Chronic Conditions toggle, THE System SHALL return only patients who have a non-empty chronic conditions field
8. WHEN multiple advanced filters are active simultaneously, THE System SHALL apply all filters as AND conditions
9. WHEN advanced filters are combined with basic filters (status, gender, blood group, search text), THE System SHALL apply all filters together as AND conditions
10. WHEN a user clicks "Clear" in the advanced filter panel, THE System SHALL reset all advanced filters and refresh the patient list
11. WHEN search by MRN text is entered in the basic search box, THE System SHALL match patients whose MRN contains the search text

---

### Requirement 9: Medical Record Number (MRN)

**User Story**: As a receptionist, I want every patient to have a hospital-issued MRN so that clinical staff have a stable, unique, human-readable identifier that differs from the system-generated Patient ID.

**Priority**: MUST HAVE (v2.0)
**Estimated Effort**: 1 day

**Acceptance Criteria**:

1. WHEN a new patient is registered, THE System SHALL automatically generate and assign an MRN using the format: MRN{year}{3-digit-sequence} (e.g., MRN2026001, MRN2026002)
2. WHEN an MRN is generated, THE System SHALL guarantee uniqueness across all patients using a database sequence
3. WHEN a patient is registered successfully, THE System SHALL include the MRN in the registration success response
4. WHEN a patient profile is loaded, THE System SHALL display the MRN in the Personal Information card
5. WHEN the patient list is displayed, THE System SHALL show the MRN as a column in the patient table
6. WHEN a user enters an MRN (or partial MRN) in the search box, THE System SHALL return matching patients
7. WHEN an MRN is assigned, THE System SHALL NOT allow it to be changed or reassigned (MRN is permanent)
8. WHEN the patient ID card is printed (REQ-6), THE System SHALL include the MRN prominently on the card
9. WHEN the MRN sequence reaches 999 for a given year, THE System SHALL continue incrementing (e.g., MRN20261000) — the sequence is not reset per year
10. WHEN a patient record is updated, THE System SHALL NOT modify the MRN field

---

### Requirement 10: Family / Relationship Linking

**User Story**: As a receptionist, I want to link patient records with their family members and specify the relationship type, so that clinical staff can quickly identify and contact a patient's family.

**Priority**: MUST HAVE (v2.0)
**Estimated Effort**: 2 days

**Acceptance Criteria**:

1. WHEN a user views a patient profile, THE System SHALL display a "Family & Relationships" card showing all linked patients
2. WHEN the Family & Relationships card is displayed, THE System SHALL show for each link: linked patient's full name, Patient ID, relationship type badge, and action buttons
3. WHEN a receptionist or admin clicks "Add Link", THE System SHALL open a modal with: Patient ID input and Relationship Type selector
4. WHEN the Relationship Type selector is shown, THE System SHALL offer the following options: SPOUSE, PARENT, CHILD, SIBLING, GUARDIAN, WARD, OTHER
5. WHEN a user submits a new link, THE System SHALL validate that the entered Patient ID exists; display an error if not found
6. WHEN a user submits a new link, THE System SHALL prevent a patient from linking to themselves; display an error if the same Patient ID is entered
7. WHEN a link is created (A → B with type X), THE System SHALL automatically create the inverse link (B → A with the appropriate inverse type):
   - PARENT → inverse is CHILD
   - CHILD → inverse is PARENT
   - GUARDIAN → inverse is WARD
   - WARD → inverse is GUARDIAN
   - SPOUSE → inverse is SPOUSE
   - SIBLING → inverse is SIBLING
   - OTHER → inverse is OTHER
8. WHEN a link is created, THE System SHALL immediately display it on both patient profile pages without page reload
9. WHEN a receptionist or admin clicks "Remove" on a relationship, THE System SHALL display a confirmation prompt
10. WHEN a relationship removal is confirmed, THE System SHALL delete the link from BOTH patient profiles simultaneously
11. WHEN a relationship link is added or removed, THE System SHALL create an audit log entry with action LINK_FAMILY or UNLINK_FAMILY
12. WHEN a doctor or nurse views a patient profile, THE System SHALL display the Family & Relationships card in read-only mode with no Add or Remove controls

---

## 6. NON-FUNCTIONAL REQUIREMENTS (v2.0 Additions)

### Performance
- Photo upload (≤ 2 MB) SHALL complete and update the UI within 5 seconds on a standard hospital network connection
- Duplicate detection check SHALL complete as part of the patient profile load within the existing 2-second budget (no additional round-trip after initial load)
- Advanced search with all filters active SHALL return within 2 seconds for up to 10,000 patient records, consistent with v1.1.0 REQ-2 performance targets

### Security
- Patient photos SHALL be stored in the database (not on the filesystem or public CDN) to prevent unauthorized access bypassing the API
- Photo retrieval SHALL require a valid JWT with an appropriate role — anonymous access to photo URLs is not permitted
- Photo content type SHALL be validated server-side; a file with an image MIME type but non-image binary content SHALL be rejected
- MRN SHALL be generated server-side using a database sequence; client-supplied MRN values SHALL be ignored

### Data Integrity
- MRN SHALL be unique across all patient records; uniqueness is enforced by a database unique constraint
- Relationship links SHALL be stored as two rows (A → B and B → A) so that each patient's relationship list is complete by querying a single patient ID
- Relationship links SHALL be deleted from both directions atomically; partial deletion is not permitted
- Birth year SHALL be derived and stored as a plaintext integer at write time to enable age-range search without decrypting the encrypted date-of-birth field

### Storage
- Patient photo storage limit per record is 2 MB (BYTEA column in PostgreSQL)
- No global cap on total photo storage is imposed in v2.0; capacity planning shall be reviewed at 10,000 records

---

## 7. HIPAA COMPLIANCE (v2.0 Additions)

### New PHI Fields
The following fields added in v2.0 are classified as PHI and subject to all v1.1.0 HIPAA controls:

| Field | Classification | Encryption |
|-------|---------------|------------|
| Patient photo (photo) | PHI (biometric identifier) | Stored in PostgreSQL BYTEA; database-level access control applies |
| MRN | PHI (medical record number) | Stored plaintext (required for search); access controlled by JWT auth |
| Family relationships | PHI (family member association) | Stored plaintext (patient IDs only); access controlled by JWT auth |

### Updated Audit Log Actions
In addition to v1.1.0 audit actions (READ, CREATE, UPDATE, DEACTIVATE, ACTIVATE), v2.0 adds:

| Action | Trigger |
|--------|---------|
| PHOTO_UPLOAD | Patient photo is uploaded or replaced |
| PHOTO_DELETE | Patient photo is deleted |
| LINK_FAMILY | A family relationship link is created |
| UNLINK_FAMILY | A family relationship link is removed |

### Minimum Necessary Principle (v2.0 Updates)

| Role | Photo Access | Relationship Access | Duplicate Alert |
|------|-------------|--------------------|-----------------|
| RECEPTIONIST | View + Upload + Delete | View + Add + Remove | View |
| DOCTOR | View only | View only | View |
| NURSE | View only | View only | View |
| ADMIN | View + Upload + Delete | View + Add + Remove | View |

---

## 8. UX/UI REQUIREMENTS (v2.0 Additions)

### Patient Photo Component
- Photo SHALL display as a circular avatar (96×96px) within the Personal Information card
- When no photo exists, the avatar SHALL show the patient's initials on a blue background
- Upload, Replace, and Remove controls SHALL appear below the avatar — visible only to RECEPTIONIST and ADMIN roles
- A loading spinner SHALL appear while the photo is uploading; the avatar SHALL update on completion

### Printable ID Card
- The ID card SHALL render in a modal with a "Print Card" button
- The card SHALL use CSS `@media print` to hide all page elements except the card content during printing
- The card SHALL display: hospital name, patient full name, MRN, Patient ID, date of birth, blood group, and a QR code that encodes the Patient ID
- The QR code SHALL be scannable by standard hospital barcode scanners

### Duplicate Alert
- The duplicate warning banner SHALL use a yellow/warning color scheme and a warning icon
- The banner SHALL appear at the top of the profile page, above all patient cards
- The banner SHALL NOT block navigation or be a modal — staff can dismiss it by scrolling past

### Advanced Filters Panel
- The advanced filter panel SHALL use a collapsible/accordion component to keep the list page uncluttered by default
- The panel header SHALL display "Advanced Filters" with a filter icon
- A "Clear" button SHALL reset all advanced filters (city, state, age range, toggles) to their unset state
- Age range inputs SHALL accept integers between 0 and 150 only

### Family & Relationships Card
- The card SHALL appear as a full-width card below the Medical Information card on the patient profile page
- Each relationship row SHALL display a color-coded relationship type badge (e.g., red for SPOUSE, blue for PARENT)
- When no relationships exist, the card SHALL display "No relationships linked" using an empty state illustration
- "View" links SHALL open the linked patient profile in the same tab (not a new tab) to maintain navigation history

---

## 9. OUT OF SCOPE (v2.0 Specific)

The following are explicitly excluded from v2.0 and deferred to future versions:

- **Hard patient merge** — Merging duplicate records into one canonical record (flagging only in v2.0)
- **Document upload** — Attaching PDFs, lab reports, or other documents to a patient record
- **Relationship-based billing** — Using family links for insurance or guarantor workflows (Billing Module)
- **Multi-photo support** — Storing more than one photo per patient
- **Photo facial recognition** — Using the stored photo for automated identity matching
- **External QR code scanner integration** — Decoding the ID card QR in the app to navigate to a patient (future feature)
- **Relationship notifications** — Alerting linked family members about appointments or status changes (Notification Module)

---

## 10. ASSUMPTIONS AND DEPENDENCIES (v2.0)

### Assumptions
- Photo storage in PostgreSQL is acceptable at the anticipated patient volume (< 50,000 records × 2 MB = < 100 GB); reviewed at scale
- Relationship linking is administrative only; legal next-of-kin workflows are handled by the EMR Module
- MRN sequence is not reset per year; the sequence is continuous and shared across calendar years

### New Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| PostgreSQL BYTEA | Required | Photo storage column in patients table |
| mrn_seq (PostgreSQL sequence) | Required | Auto-increment MRN counter (V8 migration) |
| patient_relationships table | Required | Bidirectional relationship storage (V9 migration) |
| qrcode.react ^4.2.0 | Required | QR code rendering in the printable ID card |
| Spring multipart config (max-file-size: 2MB) | Required | Limits photo upload size at the API gateway |

---

## 11. SUCCESS CRITERIA (v2.0)

The v2.0 feature set will be considered successful when:

1. ✅ A receptionist can upload a patient photo and it persists across sessions
2. ✅ A DOCTOR or NURSE sees the photo in read-only mode with no upload controls visible
3. ✅ Uploading a file > 2 MB is rejected with a clear error message
4. ✅ The "Print ID Card" modal renders with MRN, Patient ID, and a valid QR code, and prints correctly without browser chrome
5. ✅ When two patients share the same phone number, the duplicate warning banner appears on both profile pages
6. ✅ The "View Duplicates" modal shows both records side-by-side with links to each profile
7. ✅ Searching by MRN (e.g., "MRN2026001") in the search box returns the correct patient
8. ✅ MRN is visible in the patient list table and the patient profile Personal Information card
9. ✅ Filtering by City "Chicago" returns only patients with city = Chicago (case-insensitive partial match)
10. ✅ Filtering by Age From 30, Age To 40 returns only patients born between 1984 and 1996 (relative to current year)
11. ✅ Enabling "Has Allergies" filter returns only patients with a non-empty allergies field
12. ✅ Linking Patient A to Patient B as PARENT automatically creates the inverse CHILD link on Patient B's profile
13. ✅ Removing a relationship from either patient's profile removes it from both profiles
14. ✅ Audit log contains entries for PHOTO_UPLOAD, PHOTO_DELETE, LINK_FAMILY, UNLINK_FAMILY actions
15. ✅ All v1.1.0 success criteria (11 criteria) remain satisfied — no regression

---

## 12. MIGRATION PLAN

v2.0 is backwards-compatible with v1.1.0. The following Flyway migrations are applied automatically on startup:

| Migration | Description | Breaking? |
|-----------|-------------|-----------|
| V7__add_clinical_gap_columns.sql | Adds photo, mrn, birth_year, has_allergies, has_chronic_conditions columns to patients table with null-safe defaults | No |
| V8__add_mrn_sequence.sql | Creates mrn_seq PostgreSQL sequence starting at 1 | No |
| V9__create_patient_relationships.sql | Creates patient_relationships table with bidirectional composite PK | No |

**Existing patient records** after migration will have:
- `mrn = NULL` (existing patients do not receive a backfilled MRN — to be handled as a data migration task if required)
- `photo = NULL` (no photo)
- `has_allergies` / `has_chronic_conditions` = derived at next update from existing `known_allergies` / `chronic_conditions` field values

---

**Document Version**: 2.0.0
**Status**: Released — Implemented February 2026
**Baseline**: `patient-module-prd.md` v1.1.0 remains unchanged and is the authoritative v1 reference
