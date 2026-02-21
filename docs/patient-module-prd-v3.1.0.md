# Hospital Management System — Patient Module Requirements

## Document Control

| Field | Value |
|-------|-------|
| Document Title | Hospital Management System — Patient Module Requirements |
| Module | Patient Management |
| Version | 3.1.0 |
| Status | Implemented & Verified |
| Company | Ai Nexus |
| Created Date | February 21, 2026 |
| Last Revised | February 21, 2026 |
| Revision Notes | **v3.1.0 — Appointment Notification System**: Added SMS + In-App notifications for all appointment lifecycle events; international phone number support (E.164) |
| Baseline Document | `patient-module-prd-v3.0.md` (v3.0.0) — all previous requirements remain in force |

---

## Change Summary

This document specifies **two enhancements** added to the Patient Module in version 3.1.0.
All requirements from v1.1.0, v2.0.0, and v3.0.0 continue to apply without modification.

| # | Feature | Priority | Requirement | Roles |
|---|---------|----------|-------------|-------|
| 1 | SMS + In-App Appointment Notifications | High | REQ-16 | PATIENT (receive); All staff (trigger) |
| 2 | International Phone Number Support | Medium | REQ-1 enhancement | RECEPTIONIST, ADMIN |

---

## 1. EXECUTIVE SUMMARY

Version 3.1.0 closes the last patient-facing communication gap in the Hospital Management System. Patients previously received zero feedback when appointments were booked, confirmed, cancelled, or upcoming. This release adds a full dual-channel notification system:

- **SMS** via Twilio (production) or MockSmsProvider (dev — zero external dependencies for testing)
- **In-app bell** with notification drawer in the Patient Portal

All five appointment lifecycle events generate notifications automatically, including a daily 8am reminder for the next day's appointments.

Additionally, v3.1.0 removes the US-only phone number restriction — the system now accepts international numbers in E.164 format, enabling SMS delivery to patients in any country.

---

## 2. NEW REQUIREMENTS

---

### REQ-16: SMS + In-App Appointment Notifications

**User Story**: As a patient, I want to receive SMS and in-app notifications whenever my appointment status changes, so I am always informed about my care schedule without having to log in to check.

**Priority**: MUST HAVE
**Status**: ✅ Implemented & Verified
**E2E Tests**: `21-notifications.spec.ts` (11 tests), `22-sms-notifications.spec.ts` (5 tests)

---

#### 16.1 Notification Triggers

| Trigger Event | In-App Type | SMS Message |
|---------------|-------------|-------------|
| Appointment booked | `APPOINTMENT_BOOKED` | `Hi! Appointment confirmed: {date} {time} with {doctor} ({dept}). Ref: {patientId} — Ai Nexus Hospital` |
| Appointment confirmed | `APPOINTMENT_CONFIRMED` | `Your appointment {date} at {time} is now confirmed. See you soon! — Ai Nexus Hospital` |
| Appointment cancelled | `APPOINTMENT_CANCELLED` | `Your appointment on {date} at {time} has been cancelled. Please call us to reschedule. — Ai Nexus Hospital` |
| Appointment completed | `APPOINTMENT_COMPLETED` | `Your visit is complete. Log in to your portal to review your visit notes. — Ai Nexus Hospital` |
| 24h reminder (daily 8am) | `APPOINTMENT_REMINDER` | `Reminder: Appointment tomorrow {date} at {time} with {doctor}. — Ai Nexus Hospital` |

---

#### 16.2 SMS Delivery

**Acceptance Criteria**:

1. WHEN an appointment is booked, THE System SHALL send an SMS to the patient's registered phone number
2. WHEN an appointment is cancelled, THE System SHALL send an SMS to the patient's registered phone number
3. WHEN an appointment status changes to CONFIRMED or COMPLETED, THE System SHALL send an SMS to the patient's registered phone number
4. WHEN the daily 8am scheduled job runs, THE System SHALL send an SMS reminder for all SCHEDULED or CONFIRMED appointments the following day
5. SMS delivery failure SHALL NOT block or delay the appointment API response — notifications are fire-and-forget
6. SMS SHALL NOT be sent if the patient has no phone number on record
7. PHI (phone number, message content) SHALL NEVER appear in server-side application logs — only `patientId` and delivery `status` are logged
8. Notification events SHALL fire only AFTER the appointment database transaction commits successfully — no notifications on transaction rollback

**SMS Provider Strategy**:

| Condition | Active Provider | Behaviour |
|-----------|-----------------|-----------|
| `TWILIO_ACCOUNT_SID` env var not set or blank | `MockSmsProvider` | Writes to `sms_delivery_log` table; no real SMS sent |
| `TWILIO_ACCOUNT_SID` env var set | `TwilioSmsProvider` | Sends real SMS via Twilio REST API; result recorded in `sms_delivery_log` |

9. IN dev/test mode, THE System SHALL log all SMS to `GET /api/v1/dev/sms-log` accessible by all staff roles
10. SMS log entry SHALL include: `patientId`, `provider` (MOCK or TWILIO), `status` (SENT or FAILED), `message`, `sentAt`, `errorMessage` (if failed), `providerMessageId` (Twilio SID if real)

---

#### 16.3 In-App Notifications

**Acceptance Criteria**:

11. WHEN an appointment event fires, THE System SHALL create an in-app notification record in the `patient_notifications` table
12. WHEN a PATIENT accesses the portal, THE System SHALL show a bell icon with an unread badge count in the portal header
13. WHEN the badge count is 0, THE System SHALL hide the badge (not show "0")
14. WHEN a patient clicks the bell, THE System SHALL open a notification drawer from the right side (380px wide) titled "Notifications"
15. WHEN the drawer opens, THE System SHALL display notifications in reverse chronological order (newest first), up to 50 items
16. WHEN the drawer is empty, THE System SHALL display "No notifications yet" empty state
17. EACH notification SHALL show: type icon (color-coded by type), title (bold if unread), message text, relative timestamp (`2 minutes ago`)
18. UNREAD notifications SHALL have a blue left border (`3px solid #1677ff`) and bold title
19. READ notifications SHALL have normal styling with no border
20. WHEN a patient clicks an unread notification, THE System SHALL mark it as read — the badge count SHALL decrement by 1
21. WHEN a patient clicks "Mark all read" button in the drawer header, THE System SHALL mark all notifications as read and the badge count SHALL become 0
22. "Mark all read" button SHALL only be visible when unread count > 0
23. THE System SHALL auto-refresh the unread badge count every 30 seconds without requiring page reload

**Notification Icons by Type**:

| Type | Icon | Color |
|------|------|-------|
| APPOINTMENT_BOOKED | CalendarOutlined | Green |
| APPOINTMENT_CONFIRMED | CalendarOutlined | Blue |
| APPOINTMENT_CANCELLED | CloseCircleOutlined | Red |
| APPOINTMENT_REMINDER | ClockCircleOutlined | Orange |
| APPOINTMENT_COMPLETED | CheckCircleOutlined | Blue |

---

#### 16.4 Access Control

24. PATIENT role SHALL access only their own notifications — `patientId` resolved from JWT claim
25. STAFF roles (RECEPTIONIST, DOCTOR, NURSE, ADMIN) SHALL receive 403 when accessing `/api/v1/portal/me/notifications/**`
26. PATIENT role SHALL receive 403 when accessing `/api/v1/dev/sms-log`

---

#### 16.5 API Endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/portal/me/notifications` | PATIENT | List all notifications, newest first |
| GET | `/api/v1/portal/me/notifications/unread-count` | PATIENT | `{ "count": N }` |
| PATCH | `/api/v1/portal/me/notifications/{id}/read` | PATIENT | Mark single notification read → 204 |
| PATCH | `/api/v1/portal/me/notifications/read-all` | PATIENT | Mark all notifications read → 204 |
| GET | `/api/v1/dev/sms-log` | All staff | SMS delivery log (newest first) |

---

#### 16.6 Database Schema

**`patient_notifications`** (Migration V15):
```sql
id             BIGSERIAL PRIMARY KEY
patient_id     VARCHAR(10) NOT NULL
type           VARCHAR(50) NOT NULL          -- NotificationType enum
title          VARCHAR(200) NOT NULL
message        TEXT NOT NULL
is_read        BOOLEAN NOT NULL DEFAULT FALSE
appointment_id BIGINT                        -- nullable foreign reference
created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
read_at        TIMESTAMPTZ                   -- set when patient reads notification
```
Indexes: `(patient_id)`, `(patient_id, is_read)` for efficient unread queries

**`sms_delivery_log`** (Migration V16):
```sql
id                   BIGSERIAL PRIMARY KEY
patient_id           VARCHAR(10) NOT NULL
phone_number         VARCHAR(50) NOT NULL
message              TEXT NOT NULL
status               VARCHAR(20) NOT NULL     -- PENDING | SENT | FAILED
provider             VARCHAR(20) NOT NULL     -- MOCK | TWILIO
provider_message_id  VARCHAR(100)             -- Twilio SID (real SMS only)
sent_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
error_message        VARCHAR(500)             -- set on failure
```
Index: `(patient_id)`

---

#### 16.7 Technical Architecture

**Event Flow**:
```
PatientAppointmentService
  └─ publishEvent(AppointmentBookedEvent | AppointmentStatusChangedEvent | AppointmentCancelledEvent)
       └─ AppointmentNotificationListener  (@Async, AFTER_COMMIT)
            ├─ NotificationService.createInApp()  → patient_notifications table
            └─ NotificationService.sendSms()      → SmsProvider
                                                       ├─ MockSmsProvider  (dev)
                                                       └─ TwilioSmsProvider (prod)

ReminderScheduler  (@Scheduled cron "0 0 8 * * *" — daily 8am)
  └─ findByAppointmentDateAndStatusIn(tomorrow, [SCHEDULED, CONFIRMED])
       └─ Same notification pipeline per appointment
```

**Key Design Decisions**:
- `@TransactionalEventListener(phase = AFTER_COMMIT)` — guarantees notifications only fire after successful DB commit; prevents ghost notifications on rollback
- `@Async` — notification delivery runs on a separate thread pool; zero impact on appointment API response time
- `@ConditionalOnProperty(name = "twilio.account-sid")` — TwilioSmsProvider only instantiated when credentials provided; MockSmsProvider fills the gap automatically
- Twilio errors caught silently — `ApiException` stored in SMS log, never rethrown

---

### REQ-1 Enhancement: International Phone Number Support

**User Story**: As a receptionist, I want to enter international phone numbers in E.164 format so that SMS notifications can be delivered to patients in any country.

**Priority**: MEDIUM
**Status**: ✅ Implemented

**Change**: Phone number validation updated from US-only format to accept both formats:

| Format | Example | Previously Accepted | v3.1.0 |
|--------|---------|---------------------|--------|
| US | `(312) 555-0101` | ✅ | ✅ |
| US with +1 | `+1-312-555-0101` | ✅ | ✅ |
| International E.164 | `+917026191993` | ❌ | ✅ |

**Updated Regex** (frontend + backend):
```
^(\+[1-9]\d{6,14}|(\+1-?)?\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4})$
```

**Files Updated**:
- `hospital-patient-ui/src/utils/validation.utils.ts`
- `hospital-patient-service/src/main/java/.../dto/request/PatientCreateRequest.java`
- `hospital-patient-service/src/main/java/.../dto/request/PatientUpdateRequest.java`

> **Note**: Phone numbers stored in DB are AES-256-GCM encrypted. The raw E.164 number is passed to the SMS provider at runtime and never logged.

---

## 3. ENVIRONMENT CONFIGURATION

### New Environment Variables (v3.1.0)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TWILIO_ACCOUNT_SID` | No | (blank) | Twilio Account SID — blank activates MockSmsProvider |
| `TWILIO_AUTH_TOKEN` | No | (blank) | Twilio Auth Token |
| `TWILIO_FROM_NUMBER` | No | (blank) | Sender number in E.164 format (e.g. `+15005550006`) |

### SMS Mode (automatic selection):
```
TWILIO_ACCOUNT_SID blank  →  MockSmsProvider  (logs to DB, no real SMS)
TWILIO_ACCOUNT_SID set    →  TwilioSmsProvider (real SMS via Twilio API)
```

### Twilio Setup (for real SMS):
1. Sign up at https://console.twilio.com (free trial available)
2. Copy Account SID and Auth Token from dashboard
3. Buy or use the provided trial phone number
4. Enable India (or target country) under Messaging → Settings → Geo Permissions
5. On free trial: verify destination numbers under Verify Caller IDs
6. Patient phone number must be in E.164 format (e.g. `+917026191993`)

---

## 4. E2E TEST COVERAGE

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `21-notifications.spec.ts` | 11 | In-app API (booking, cancel, unread-count, mark-read, mark-all-read, staff 403) + UI (bell visible, bell click opens drawer, drawer renders, mark-all clears badge) |
| `22-sms-notifications.spec.ts` | 5 | SMS log has entries, provider=MOCK, status=SENT, message contains date, cancel creates entry, PATIENT role 403 |
| **Total new tests** | **16** | |
| **Overall suite** | **128/128 ✅** | All passing |

---

## 5. ACCEPTANCE CRITERIA SIGN-OFF

| AC | Description | Status |
|----|-------------|--------|
| 16.1 | Booking creates APPOINTMENT_BOOKED in-app notification | ✅ |
| 16.2 | Cancellation creates APPOINTMENT_CANCELLED notification | ✅ |
| 16.3 | Unread count > 0 after new notification | ✅ |
| 16.4 | Mark-read returns 204 and decrements count | ✅ |
| 16.5 | Mark-all-read sets count to 0 | ✅ |
| 16.6 | Staff role gets 403 on portal notifications | ✅ |
| 16.7 | Bell icon visible in portal header | ✅ |
| 16.8 | Clicking bell opens drawer titled "Notifications" | ✅ |
| 16.9 | MockSmsProvider writes entries to sms_delivery_log | ✅ |
| 16.10 | SMS log shows provider=MOCK, status=SENT | ✅ |
| 16.11 | SMS message contains appointment date | ✅ |
| 16.12 | Cancellation creates separate SMS log entry | ✅ |
| 16.13 | PATIENT role gets 403 on dev/sms-log | ✅ |
| REQ-1 | International phone +917026191993 accepted | ✅ |

---

**Document Version**: 3.1.0
**Status**: Implemented & Verified
**Test Coverage**: 128/128 E2E tests passing
**Release Date**: February 21, 2026
**Previous Version**: `patient-module-prd-v3.0.md` (v3.0.0)
