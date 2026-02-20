# HMS — Hospital Patient Module

A full-stack, HIPAA-aware **Hospital Management System** patient module built with Spring Boot 3 and React 18. Covers the complete patient lifecycle: registration through discharge, with PHI encryption, role-based access control, and an immutable audit trail.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 17 | Runtime |
| Spring Boot | 3.4.1 | Application framework |
| Spring Security | 6 | Authentication & RBAC |
| PostgreSQL | 15 | Primary database |
| Flyway | 10 | Database migrations |
| MapStruct | 1.6 | DTO ↔ Entity mapping |
| JJWT | 0.12.6 | JWT generation & validation |
| Hibernate / JPA | 6 | ORM |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 6 | Build tool & dev server |
| Ant Design | 5 | Component library |
| TanStack Query | v5 | Server state & caching |
| react-hook-form | 7 | Form management |
| Zod | 3 | Schema validation |
| Axios | 1 | HTTP client |
| Recharts | 2 | Vitals trend charts |
| qrcode.react | 4 | Patient ID card QR code |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker Compose | Multi-service orchestration |
| Nginx | Frontend reverse proxy |
| PostgreSQL 15 | Persistent data store |

---

## Features

| # | Feature | Roles |
|---|---|---|
| 1 | **Login & Authentication** — JWT (HMAC-SHA256, 8 hr), Spring Security | ALL |
| 2 | **Patient Registration** — MRN auto-gen, duplicate pre-check | RECEPTIONIST, ADMIN |
| 3 | **Advanced Search & Filter** — name, DOB, phone, city, state, age range, allergies flag | ALL |
| 4 | **Patient Profile** — 9 sections, full PHI, MRN badge | ALL (read) |
| 5 | **Edit Patient** — inline editing with change tracking | RECEPTIONIST, ADMIN |
| 6 | **Deactivate / Activate** — soft-delete with status reason | ADMIN |
| 7 | **Role-Based Access Control** — 4 roles, 15+ UI-gated elements | Spring Security |
| 8 | **Sign Out** — JWT invalidation, forced redirect | ALL |
| 9 | **Audit Trail** — 14 action types, 6-year retention, modal UI | ADMIN |
| 10 | **Vitals History** — Recharts trend chart, multi-recording support | DOCTOR, NURSE, ADMIN |
| 11 | **Patient Insurance** — add/edit/delete, primary badge | RECEPTIONIST, ADMIN |
| 12 | **Family Relationships** — 6 types, bidirectional, colour-coded | RECEPTIONIST, ADMIN |
| 13 | **Photo Upload** — 2 MB max, JPEG/PNG, authenticated blob serving | RECEPTIONIST, ADMIN |
| 14 | **Patient ID Card** — QR code, print CSS, sharable | ALL |
| 15 | **Duplicate Detection** — HMAC hash + name+DOB match on registration | RECEPTIONIST, ADMIN |
| 16 | **CSV Export** — streaming export respecting all active filters | RECEPTIONIST, ADMIN |

---

## API Endpoints

### Authentication
```
POST   /api/v1/auth/login          Login — returns JWT
POST   /api/v1/auth/logout         Logout — invalidates token
```

### Patients
```
GET    /api/v1/patients            List / search patients (paginated)
POST   /api/v1/patients            Register new patient
GET    /api/v1/patients/{id}       Get patient profile
PUT    /api/v1/patients/{id}       Update patient profile
PATCH  /api/v1/patients/{id}/status  Activate / Deactivate (ADMIN only)
GET    /api/v1/patients/export/csv  Stream CSV export (filters forwarded)
```

### Vitals
```
GET    /api/v1/patients/{id}/vitals         List vitals history
POST   /api/v1/patients/{id}/vitals         Record new vitals
```

### Insurance
```
GET    /api/v1/patients/{id}/insurance      List insurance records
POST   /api/v1/patients/{id}/insurance      Add insurance
PUT    /api/v1/patients/{id}/insurance/{iid}  Update insurance
DELETE /api/v1/patients/{id}/insurance/{iid}  Remove insurance
```

### Family Relationships
```
GET    /api/v1/patients/{id}/relationships        List relationships
POST   /api/v1/patients/{id}/relationships        Add relationship
DELETE /api/v1/patients/{id}/relationships/{rid}  Remove relationship
```

### Photo
```
POST   /api/v1/patients/{id}/photo   Upload patient photo
GET    /api/v1/patients/{id}/photo   Retrieve patient photo (authenticated)
```

### Audit
```
GET    /api/v1/audit?patientId=&page=&size=   Query audit log (ADMIN only)
```

> All routes require `Authorization: Bearer <token>`. Errors follow **RFC 7807 ProblemDetail**.

---

## RBAC — Role Permissions

| Action | ADMIN | DOCTOR | NURSE | RECEPTIONIST |
|---|:---:|:---:|:---:|:---:|
| View patient list | ✅ | ✅ | ✅ | ✅ |
| Register patient | ✅ | | | ✅ |
| Edit patient | ✅ | | | ✅ |
| Activate / Deactivate | ✅ | | | |
| Record vitals | ✅ | ✅ | ✅ | |
| Manage insurance | ✅ | | | ✅ |
| Manage relationships | ✅ | | | ✅ |
| Export CSV | ✅ | | | ✅ |
| View audit trail | ✅ | | | |

---

## Project Structure

```
Hospital_Bmad/
├── hospital-patient-service/          # Spring Boot backend
│   ├── src/main/java/com/ainexus/hospital/patient/
│   │   ├── controller/                # REST controllers
│   │   ├── service/                   # Business logic
│   │   ├── repository/                # JPA repositories
│   │   ├── entity/                    # JPA entities
│   │   ├── dto/                       # Request / Response DTOs
│   │   ├── security/                  # JWT filter, Spring Security config
│   │   ├── audit/                     # AOP audit logging (AuditAspect)
│   │   └── config/                    # App config, encryption
│   └── src/main/resources/
│       ├── db/migration/              # Flyway SQL migrations
│       └── application*.yml           # Environment configs
│
├── hospital-patient-ui/               # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/                     # Route-level page components
│   │   ├── components/                # Shared UI components
│   │   ├── hooks/                     # Custom React hooks (TanStack Query)
│   │   ├── api/                       # Axios API client functions
│   │   ├── types/                     # TypeScript interfaces
│   │   └── utils/                     # Helpers, formatters
│   └── nginx.conf                     # Nginx reverse-proxy config
│
├── docs/
│   └── patient-module-prd.md          # Product Requirements Document v1.1.0
├── _bmad-output/planning-artifacts/
│   └── architecture.md                # System architecture document
├── bmad-patient-module-features-ui-test-flow.pdf  # Test guide v1.2.0 (16 features)
├── docker-compose.yml                 # Production-style compose
├── docker-compose.dev.yml             # Dev compose (DB only)
└── .env.example                       # Environment variable template
```

---

## Architecture Highlights

- **PHI Encryption** — All sensitive fields (`firstName`, `lastName`, `phone`, `email`, `address`, `dob`) use `AesEncryptionConverter` (AES-256-GCM) at the JPA layer. Never stored in plaintext.
- **Searchable Encrypted Fields** — Plaintext index columns (`first_name_search`, `last_name_search`) and HMAC hashes (`phone_number_hash`, `email_hash`) enable search without decrypting the full dataset.
- **Immutable Audit Trail** — AOP `@AfterReturning` advice on every `PatientService` method writes to a separate audit table in a `REQUIRES_NEW` transaction. PostgreSQL trigger prevents row modification/deletion.
- **Patient ID** — Business ID format `P{year}{3-digit-seq}` (e.g. `P2026001`) generated from PostgreSQL sequence `patient_seq`. Never exposes the internal DB `id`.
- **Soft Delete** — Patients are never hard-deleted. Status transitions: `ACTIVE → INACTIVE → ACTIVE`.
- **ISO 8601 UTC** — All API date/time fields serialise to UTC ISO 8601.

---

## Running Locally

### Prerequisites
- Docker & Docker Compose
- Java 17+
- Node.js 18+

### 1 — Start the Database
```bash
docker compose -f docker-compose.dev.yml up -d
```
PostgreSQL starts on `localhost:5432`.

### 2 — Start the Backend
```bash
cd hospital-patient-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
API available at `http://localhost:8080`.

### 3 — Start the Frontend
```bash
cd hospital-patient-ui
npm install
npm run dev
```
UI available at `http://localhost:5173`.

### Full Stack (Docker)
```bash
cp .env.example .env   # set secrets
docker compose up -d
```
UI → `http://localhost` (port 80), API → `http://localhost:8080`.

---

## Environment Variables

Copy `.env.example` to `.env` and set:

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `JWT_SECRET` | HMAC-SHA256 secret (min 32 chars) |
| `AES_SECRET_KEY` | AES-256 key for PHI encryption (32 bytes, base64) |
| `SPRING_PROFILES_ACTIVE` | `dev` or `prod` |

---

## Documentation

- **PRD** — `docs/patient-module-prd.md`
- **Architecture** — `_bmad-output/planning-artifacts/architecture.md`
- **UI Test Guide** — `bmad-patient-module-features-ui-test-flow.pdf` (v1.2.0, 35 pages — covers all 16 features with step-by-step test flows)

---

## Default Credentials (Dev)

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Doctor | `doctor` | `doctor123` |
| Nurse | `nurse` | `nurse123` |
| Receptionist | `receptionist` | `recept123` |

> **Note:** Change all credentials before any production deployment.
