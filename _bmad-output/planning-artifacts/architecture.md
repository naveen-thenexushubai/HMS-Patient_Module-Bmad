---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - docs/patient-module-prd.md
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-19'
project_name: 'Hospital_Bmad'
user_name: 'Naveen-Ainexus'
date: '2026-02-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
5 core capabilities: Patient Registration, Search & Filtering, Profile View, Information Update, and Status Management. 52 acceptance criteria across all requirements. The system manages a single primary entity (Patient) with supporting sub-entities (emergency contact, medical info, audit entries). Key behavioral patterns: soft-delete (never hard-delete), full audit trail on all mutations, role-gated write access, real-time search with debounce.

**Non-Functional Requirements (Architecture Drivers):**
- Performance: 300ms search response, 2s page loads, 3s registration — drives DB indexing strategy and connection pooling requirements
- HIPAA: AES-256 at rest, TLS 1.2+, MFA (Auth module), 6-year immutable audit logs — drives data layer design, logging infrastructure, and encryption approach
- Scale: 50,000 patient records, 100 concurrent users — medium scale, single PostgreSQL instance sufficient with proper indexing
- Responsive: 320px–2560px, WCAG 2.1 AA — drives frontend component strategy
- Audit: Every read/write/update/status-change logged with user, action, patient ID, timestamp, IP — cross-cutting concern affecting all layers

**Scale & Complexity:**
- Primary domain: Full-stack web application (REST API + React SPA)
- Complexity level: MEDIUM-HIGH (driven by HIPAA compliance, not feature count)
- Estimated architectural components: 8 (API layer, Service layer, Repository layer, Patient DB schema, Audit log system, Auth integration, React SPA, Docker Compose orchestration)

### Technical Constraints & Dependencies

- Backend: Spring Boot 3.2.x / Java 17 (fixed)
- Frontend: React 18.x (fixed)
- Database: PostgreSQL 15+ in Docker container (fixed)
- Infrastructure: Docker for all services (PostgreSQL, Spring Boot API, React/Nginx)
- Auth Module: Hard dependency — HIPAA MFA and role enforcement require it before production deployment
- Patient ID format: P + year + sequential (e.g., P2026001) — requires DB-level sequence or application-level generation strategy

### Cross-Cutting Concerns Identified

1. **HIPAA Audit Logging** — Every API operation must produce an audit entry; this affects every controller, service, and repository
2. **Role-Based Access Control** — 4 roles with different permissions on every endpoint; must be enforced at API layer, not just UI
3. **PHI Encryption** — AES-256 at rest for all PHI fields; encryption/decryption strategy must be consistent across all data access paths
4. **Soft-Delete Pattern** — No hard deletes anywhere; status field drives all filtering logic across search and list views
5. **Validation** — Phone and email validation must be consistent between frontend and backend; single source of truth for validation rules
6. **Docker Compose** — All services (PostgreSQL, Spring Boot API, React/Nginx) run in Docker; port mapping, networking, and environment config must be defined

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application — Java/Spring Boot REST API backend + React SPA frontend + PostgreSQL database, all containerized with Docker.

### Selected Starters

#### Backend — Spring Initializr (Spring Boot 3.4.13 / Java 17)

**Decision:** Upgraded from PRD-specified 3.2.x to 3.4.13 (current active release). Spring Boot 3.2.x OSS support ended December 2024; 3.4.x receives active security patches and is production-safe.

**Initialization:**
```bash
curl https://start.spring.io/starter.zip \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=3.4.13 \
  -d groupId=com.ainexus \
  -d artifactId=hospital-patient-service \
  -d name=HospitalPatientService \
  -d packageName=com.ainexus.hospital.patient \
  -d javaVersion=17 \
  -d dependencies=web,data-jpa,postgresql,security,validation,lombok,actuator,flyway \
  -o hospital-patient-service.zip
```

**Dependencies included:**
- `spring-boot-starter-web` — REST API layer
- `spring-boot-starter-data-jpa` — ORM / repository layer (Hibernate)
- `postgresql` — JDBC driver
- `spring-boot-starter-security` — role-based access enforcement
- `spring-boot-starter-validation` — Jakarta Bean Validation
- `lombok` — boilerplate reduction
- `spring-boot-starter-actuator` — Docker health check endpoints
- `flyway-core` — version-controlled DB schema migrations

#### Frontend — Vite 7 + React 18.3.1 + TypeScript

**Initialization:**
```bash
npm create vite@latest hospital-patient-ui -- --template react-ts
cd hospital-patient-ui
npm install
npm install axios react-router-dom react-hook-form @hookform/resolvers zod
```

**Libraries:**
- `axios` — HTTP client for REST API calls
- `react-router-dom` — SPA client-side routing
- `react-hook-form` + `zod` — form state management + schema validation (mirrors backend validation rules)

#### Infrastructure — Docker Compose (3 services)

```yaml
services:
  postgres:
    image: postgres:15-alpine
  hospital-api:
    build: ./hospital-patient-service
    depends_on: [postgres]
  hospital-ui:
    build: ./hospital-patient-ui
    depends_on: [hospital-api]
```

### Architectural Decisions Established

| Concern | Decision |
|---------|----------|
| Language | Java 17 (backend) + TypeScript (frontend) |
| Build tools | Maven (backend) + Vite 7 (frontend) |
| ORM | Spring Data JPA / Hibernate |
| DB migrations | Flyway — version-controlled, repeatable |
| Validation | Jakarta Bean Validation (backend) + Zod (frontend) |
| Testing | JUnit 5 + Mockito (backend), Vitest (frontend) |
| Containerization | Docker Compose — PostgreSQL, API, UI/Nginx |

## Core Architectural Decisions

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PHI Encryption | JPA `AttributeConverter` (AES-256) | Transparent encryption at application layer for all PHI fields (phone, email, medical info); PostgreSQL stores encrypted bytes; no pgcrypto extension required |
| Patient ID Generation | Custom Spring `IdentifierGenerator` | Format `P{year}{seq}` (e.g., P2026001) requires year + DB sequence; cannot be satisfied by standard JPA `@GeneratedValue` alone |
| Connection Pool | HikariCP default, `pool-size=10` | Bundled in Spring Boot; sufficient for 100 concurrent users |
| Caching | Deferred post-MVP | 50K records + indexed PostgreSQL queries meet 2s SLA; avoid premature optimization |

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth integration | Spring Security filter reads JWT claims | Auth module owns token issuance; Patient module extracts `role`, `userId`, `username` claims from `Authorization: Bearer <token>` header |
| JWT contract | `{ role, userId, username }` | Minimal claim set; role drives Spring Security `hasRole()` checks on every endpoint |
| Audit logging | Spring AOP `@Around` advice on all `PatientService` methods | Cross-cutting concern; single interceptor writes `AuditLogEntry { userId, role, action, patientId, timestamp, ip }` without polluting business logic |
| CORS | Configured per Spring profile | Dev: allow `localhost:5173`; Prod: restrict to Nginx origin only |

### API & Communication

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST, base path `/api/v1/patients` | Standard; versioned from day one to allow non-breaking evolution |
| Error format | RFC 7807 `ProblemDetail` | Native Spring Boot 3.x support; uniform `{ type, title, status, detail, fieldErrors }` response for all errors |
| API documentation | SpringDoc OpenAPI 3 / Swagger UI | Current standard for Spring Boot 3.x; replaces deprecated Springfox |
| Pagination | Spring Data `Pageable`, default page size 20 | Matches PRD requirement; zero additional code with Spring Data repositories |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Server state | TanStack Query v5 | Handles caching, loading, error, and stale states for all API calls; eliminates boilerplate; no Redux needed for a CRUD app |
| UI components | Ant Design 5.x | Enterprise-ready tables, forms, pagination, modals, and notifications out of the box; ideal for hospital admin UI |
| API client | Axios instance with interceptors | Request interceptor injects `Authorization` header; response interceptor handles 401/403 globally |
| Routes | React Router v6 | `/patients` · `/patients/new` · `/patients/:id` · `/patients/:id/edit` |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Nginx | Serves React SPA + proxies `/api/*` to Spring Boot port 8080 | Single entry point; eliminates browser CORS preflight; TLS termination point |
| Spring profiles | `dev` (local) · `prod` (Docker) | Clean environment separation; datasource and security config differ per profile |
| Secrets | `.env` file injected via Docker Compose `env_file` | DB password, JWT secret never hardcoded; `.env` excluded from version control |
| Logging | Logback structured JSON output | Audit log entries as machine-readable JSON; forward-compatible with log aggregators (ELK, Loki) |
| Health checks | `/actuator/health` wired to Docker `HEALTHCHECK` | Docker restarts unhealthy containers automatically; required for production reliability |

### Decision Impact Analysis

**Implementation Sequence (order matters):**
1. Docker Compose + PostgreSQL — foundation everything runs on
2. Flyway migrations — Patient schema before any JPA entity
3. JPA entities + `AttributeConverter` — encryption before data ever written
4. `PatientService` + AOP audit interceptor — audit from first write
5. Spring Security filter — role enforcement before any endpoint is exposed
6. REST controllers + `ProblemDetail` error handling
7. SpringDoc OpenAPI — documents what's already built
8. React app scaffold + Axios instance + TanStack Query setup
9. Ant Design layout + page routing
10. Feature pages: Patient list → Registration → Profile → Edit → Status

**Cross-Component Dependencies:**
- Audit logging (AOP) depends on Spring Security context being populated (JWT filter must run first)
- Patient ID generation depends on PostgreSQL sequence existing (Flyway migration must create it)
- Frontend Axios interceptor depends on Auth module JWT format (agreed contract: `Authorization: Bearer <token>`)
- Nginx proxy depends on Spring Boot Actuator health endpoint for upstream health checks

## Implementation Patterns & Consistency Rules

**Critical Conflict Points Identified:** 6 areas where AI agents could diverge

### Naming Patterns

**Database Naming (PostgreSQL):**

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | `snake_case`, plural | `patients`, `audit_logs` |
| Columns | `snake_case` | `first_name`, `date_of_birth` |
| DB Primary Key | `id` (BIGSERIAL) | `id BIGSERIAL PRIMARY KEY` |
| Business ID | `patient_id` VARCHAR(10) | stores `"P2026001"` |
| Foreign keys | `{table_singular}_id` | `patient_id BIGINT REFERENCES patients(id)` |
| Indexes | `idx_{table}_{column}` | `idx_patients_phone_number` |
| Sequences | `{table}_seq` | `patient_seq` — for P2026001 generation |

**API Naming (REST):**

| Element | Convention | Example |
|---------|-----------|---------|
| Base path | `/api/v1/{resource}` plural | `/api/v1/patients` |
| Path params | `/{id}` | `/api/v1/patients/{id}` |
| Query params | `camelCase` | `?pageSize=20&sortBy=lastName` |
| HTTP verbs | Standard REST | GET list, POST create, GET `/{id}`, PUT `/{id}` |
| Custom actions | PATCH + body | `PATCH /api/v1/patients/{id}/status` `{"status":"INACTIVE"}` |

**Java Code Naming:**

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase + suffix | `PatientController`, `PatientService`, `PatientRepository` |
| Methods | camelCase, verb-first | `registerPatient()`, `findById()`, `deactivatePatient()` |
| DTOs | `{Entity}{Action}Request/Response` | `PatientCreateRequest`, `PatientResponse` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE = 20` |
| Packages | lowercase, feature-based | `com.ainexus.hospital.patient.controller` |

**TypeScript/React Naming:**

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `PatientList`, `PatientForm`, `PatientProfile` |
| Component files | PascalCase `.tsx` | `PatientList.tsx`, `PatientForm.tsx` |
| Hooks | `use` prefix, camelCase | `usePatients()`, `usePatient(id)` |
| API functions | `{action}{Entity}` | `fetchPatients()`, `createPatient()` |
| Types/Interfaces | PascalCase | `Patient`, `PatientFormData`, `ApiError` |
| Utility files | kebab-case `.ts` | `patient-api.ts`, `date-utils.ts` |

---

### Structure Patterns

**Backend Package Structure:**
```
com.ainexus.hospital.patient
├── controller/       # REST controllers only — no business logic
├── service/          # Business logic, transaction boundaries
├── repository/       # Spring Data JPA interfaces only
├── model/            # JPA entities (Patient, AuditLog)
├── dto/              # Request DTOs (validation annotations) + Response DTOs
├── mapper/           # MapStruct mappers — entity ↔ DTO conversion
├── security/         # JwtAuthFilter, SecurityConfig
├── audit/            # AuditAspect (AOP), AuditLogEntry
├── config/           # AppConfig, EncryptionConfig, OpenApiConfig
└── exception/        # Custom exceptions + GlobalExceptionHandler
```

**Frontend Source Structure:**
```
src/
├── api/              # patientApi.ts — all Axios calls for patients
├── components/       # Shared: StatusBadge, ConfirmModal, PageHeader
├── pages/            # PatientListPage, PatientFormPage, PatientDetailPage
├── hooks/            # usePatients.ts, usePatient.ts, usePatientMutations.ts
├── types/            # patient.types.ts, api.types.ts
├── utils/            # date.utils.ts, validation.utils.ts
└── constants/        # routes.ts (ROUTES.PATIENTS), config.ts
```

**Test Locations:**
- Backend: `src/test/java/...` mirroring main package structure
- Frontend: co-located — `PatientList.test.tsx` next to `PatientList.tsx`

---

### Format Patterns

**API Response Formats:**

List response (Spring Page — no extra wrapper):
```json
{ "content": [...], "totalElements": 150, "totalPages": 8, "number": 0, "size": 20 }
```

Single entity (direct DTO — no wrapper):
```json
{ "patientId": "P2026001", "firstName": "John", "lastName": "Doe" }
```

Error (RFC 7807 ProblemDetail):
```json
{
  "type": "https://hospital.ainexus.com/errors/validation-error",
  "title": "Validation Failed",
  "status": 400,
  "detail": "2 field(s) failed validation",
  "fieldErrors": [{ "field": "phone", "message": "Invalid phone format" }]
}
```

**Date & Time (ISO 8601, always UTC):**

| Type | Format | Example |
|------|--------|---------|
| Date only | `yyyy-MM-dd` | `"2026-02-19"` |
| Timestamp | `yyyy-MM-dd'T'HH:mm:ss'Z'` | `"2026-02-19T10:30:00Z"` |
| ❌ Never | Unix timestamps or locale formats | `1708338600`, `"19/02/2026"` |

**JSON Field Naming: `camelCase` throughout** — never mix `snake_case` in responses.

---

### Communication Patterns

**TanStack Query Key Conventions:**
```typescript
['patients']                       // full patient list
['patients', patientId]            // single patient
['patients', 'search', filters]    // filtered/searched list
```

**Mutation invalidation (always invalidate on success):**
```typescript
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] })
```

**Axios — single shared instance only:**
```typescript
// src/api/axios-instance.ts — NEVER create ad-hoc axios instances elsewhere
const api = axios.create({ baseURL: '/api/v1' })
// Request interceptor → inject Authorization header
// Response interceptor → map ProblemDetail to typed ApiError
```

---

### Process Patterns

**Backend Error Handling:**
- ALL exceptions caught by `GlobalExceptionHandler` (`@ControllerAdvice`)
- `PatientNotFoundException` → 404, `DuplicatePatientException` → 409
- `MethodArgumentNotValidException` → 400 with `fieldErrors` array
- ❌ Never let stack traces reach the API response body

**Frontend Error Handling:**
- TanStack Query `onError` → Ant Design `notification.error({ message: error.title, description: error.detail })`
- Form field errors: map `fieldErrors` from ProblemDetail to react-hook-form `setError(field, message)`
- 401 → Axios interceptor redirects to login
- 403 → show "Access denied" notification, stay on page

**Loading State Pattern:**
```tsx
const { data, isLoading, isError, error } = usePatients(filters)
if (isLoading) return <Spin size="large" />
if (isError) return <Alert type="error" message={error.detail} />
```

---

### PHI Logging Rule — MANDATORY FOR ALL AGENTS

- ❌ NEVER log PHI fields: name, phone, email, address, DOB, medical info
- ✅ Log only non-PHI identifiers: `patientId` (business ID e.g. P2026001), `userId`, `action`, `timestamp`
- Audit log (`AuditLogEntry`) is a separate persistent record — distinct from application log (Logback)
- All PHI entity fields annotated: `@Convert(converter = AesEncryptionConverter.class)`

---

### All Agents MUST Follow These Rules

1. Use `patientId` (business ID `P2026001`) in all API paths and audit logs — never the DB `id`
2. Annotate all PHI fields with `@Convert(converter = AesEncryptionConverter.class)`
3. Every service method that mutates data emits an `AuditLogEntry` via AOP — never skip
4. Return `ProblemDetail` for all errors — never plain strings or custom error shapes
5. Use ISO 8601 UTC dates in all API responses — never timestamps or locale formats
6. Invalidate TanStack Query `['patients']` after every create/update/status mutation
7. Never hard-delete Patient records — only update `status` field to `INACTIVE`

## Project Structure & Boundaries

### Complete Project Directory Structure

```
hospital-patient-system/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── .env                                        ← gitignored
├── .gitignore
├── README.md
│
├── hospital-patient-service/                   ── BACKEND (Spring Boot 3.4.13 / Java 17)
│   ├── Dockerfile
│   ├── pom.xml
│   ├── mvnw
│   └── src/
│       ├── main/
│       │   ├── java/com/ainexus/hospital/patient/
│       │   │   ├── HospitalPatientServiceApplication.java
│       │   │   ├── controller/
│       │   │   │   └── PatientController.java
│       │   │   ├── service/
│       │   │   │   ├── PatientService.java
│       │   │   │   └── PatientIdGeneratorService.java  ← P2026001 logic
│       │   │   ├── repository/
│       │   │   │   ├── PatientRepository.java
│       │   │   │   └── AuditLogRepository.java
│       │   │   ├── model/
│       │   │   │   ├── Patient.java                   ← @Convert on all PHI fields
│       │   │   │   ├── PatientStatus.java             ← enum: ACTIVE, INACTIVE
│       │   │   │   ├── Gender.java                    ← enum: MALE, FEMALE, OTHER
│       │   │   │   └── AuditLog.java
│       │   │   ├── dto/
│       │   │   │   ├── request/
│       │   │   │   │   ├── PatientCreateRequest.java
│       │   │   │   │   ├── PatientUpdateRequest.java
│       │   │   │   │   └── PatientStatusRequest.java
│       │   │   │   └── response/
│       │   │   │       ├── PatientResponse.java        ← full profile (REQ-3)
│       │   │   │       └── PatientSummaryResponse.java ← list row (REQ-2)
│       │   │   ├── mapper/
│       │   │   │   └── PatientMapper.java              ← MapStruct entity ↔ DTO
│       │   │   ├── security/
│       │   │   │   ├── JwtAuthFilter.java
│       │   │   │   ├── SecurityConfig.java
│       │   │   │   └── UserPrincipal.java              ← { userId, username, role }
│       │   │   ├── audit/
│       │   │   │   ├── AuditAspect.java                ← @Around PatientService
│       │   │   │   └── AuditAction.java                ← enum: CREATE, READ, UPDATE, DEACTIVATE, ACTIVATE
│       │   │   ├── config/
│       │   │   │   ├── AesEncryptionConverter.java     ← JPA AttributeConverter AES-256
│       │   │   │   ├── EncryptionConfig.java
│       │   │   │   └── OpenApiConfig.java              ← SpringDoc Swagger UI
│       │   │   └── exception/
│       │   │       ├── PatientNotFoundException.java   ← 404
│       │   │       ├── DuplicatePhoneException.java    ← 409
│       │   │       └── GlobalExceptionHandler.java     ← @ControllerAdvice → ProblemDetail
│       │   └── resources/
│       │       ├── application.yml
│       │       ├── application-dev.yml
│       │       ├── application-prod.yml
│       │       └── db/migration/
│       │           ├── V1__create_patient_sequence.sql
│       │           ├── V2__create_patients_table.sql
│       │           └── V3__create_audit_logs_table.sql
│       └── test/
│           └── java/com/ainexus/hospital/patient/
│               ├── controller/PatientControllerTest.java
│               ├── service/PatientServiceTest.java
│               └── repository/PatientRepositoryTest.java
│
└── hospital-patient-ui/                        ── FRONTEND (React 18 + TypeScript + Vite 7)
    ├── Dockerfile
    ├── nginx.conf                               ← serve SPA + proxy /api/* → hospital-api:8080
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx                             ← QueryClientProvider + Router
        ├── App.tsx                              ← route definitions
        ├── api/
        │   ├── axios-instance.ts               ← single instance + interceptors
        │   └── patient-api.ts                  ← all patient API functions
        ├── components/
        │   ├── StatusBadge.tsx                 ← color + text label (WCAG)
        │   ├── ConfirmModal.tsx                ← deactivation confirmation (REQ-5)
        │   └── PageHeader.tsx
        ├── pages/
        │   ├── PatientListPage.tsx             ← REQ-2: search, filters, table, pagination
        │   ├── PatientDetailPage.tsx           ← REQ-3 + REQ-5: profile + status actions
        │   ├── PatientFormPage.tsx             ← REQ-1 (create) + REQ-4 (edit) dual mode
        │   └── NotFoundPage.tsx
        ├── hooks/
        │   ├── usePatients.ts
        │   ├── usePatient.ts
        │   └── usePatientMutations.ts
        ├── types/
        │   ├── patient.types.ts                ← Patient, PatientSummary, PatientFormData
        │   └── api.types.ts                    ← ApiError, ProblemDetail, PageResponse<T>
        ├── utils/
        │   ├── date.utils.ts                   ← ISO 8601 formatting, age calculation
        │   └── validation.utils.ts             ← Zod schemas mirroring backend rules
        └── constants/
            ├── routes.ts
            └── config.ts
```

### API Boundaries

| Endpoint | Method | Role Access | Requirement |
|----------|--------|-------------|-------------|
| `/api/v1/patients` | GET | ALL roles | REQ-2 Search |
| `/api/v1/patients` | POST | RECEPTIONIST, ADMIN | REQ-1 Register |
| `/api/v1/patients/{patientId}` | GET | ALL roles | REQ-3 Profile |
| `/api/v1/patients/{patientId}` | PUT | RECEPTIONIST, ADMIN | REQ-4 Update |
| `/api/v1/patients/{patientId}/status` | PATCH | ADMIN only | REQ-5 Status |
| `/actuator/health` | GET | No auth | Docker health check |

### Data Flow

```
Browser
  └─► Nginx :80
        ├─► Static files  → React SPA (index.html + JS bundles)
        └─► /api/* proxy  → Spring Boot :8080
                                └─► PostgreSQL :5432
```

### Flyway Migration Order

| Version | File | Creates |
|---------|------|---------|
| V1 | `V1__create_patient_sequence.sql` | `patient_seq` sequence |
| V2 | `V2__create_patients_table.sql` | `patients` table + 4 indexes |
| V3 | `V3__create_audit_logs_table.sql` | `audit_logs` table |

**patients table indexes:**
- `idx_patients_patient_id` — unique, business ID lookup
- `idx_patients_phone_number` — duplicate detection + search
- `idx_patients_status` — filter ACTIVE/INACTIVE
- `idx_patients_last_name_first_name` — name search

### Docker Compose Services

| Service | Image | Exposed Port | Health Check |
|---------|-------|-------------|--------------|
| `postgres` | `postgres:15-alpine` | internal :5432 | `pg_isready` |
| `hospital-api` | built from `./hospital-patient-service` | internal :8080 | `/actuator/health` |
| `hospital-ui` | built from `./hospital-patient-ui` | `80:80` | Nginx default |

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All 8 technology pairings validated — no version conflicts. Spring Boot 3.4.13 + Java 17 is the active LTS combination. TanStack Query v5 + React 18 + Ant Design 5.x are mutually compatible. AOP audit strategy is idiomatic Spring; RFC 7807 ProblemDetail is natively supported by Spring Boot 3.x.

**Pattern Consistency:** Naming conventions are non-overlapping across layers (DB snake_case, Java PascalCase, TypeScript PascalCase, API camelCase query params). Communication patterns (TanStack Query key hierarchy, single Axios instance, ProblemDetail → typed ApiError mapping) form a complete, coherent loop.

**Structure Alignment:** Every architectural decision maps to a concrete file location. No decisions are "floating." Boundaries are clearly enforced: controllers call services, services call repositories — no cross-boundary shortcuts.

### Requirements Coverage Validation ✅

**Functional Requirements:** All 5 PRD requirements (52 acceptance criteria) have full architectural support. Patient ID format (P2026001), soft-delete pattern, role-gated writes, and status toggle are all structurally represented.

**Non-Functional Requirements:** Performance (DB indexes + HikariCP), HIPAA (AesEncryptionConverter + AuditAspect + immutable audit_logs table), scale (50K records + proper indexing), responsive/accessible (Ant Design + WCAG-compliant StatusBadge), audit trail (AuditAction enum covers CREATE/READ/UPDATE/DEACTIVATE/ACTIVATE) — all architecturally addressed.

### Implementation Readiness Validation ✅ (with corrections)

**Decision Completeness:** All critical decisions documented with explicit versions. Two dependency omissions corrected in Gap Resolution below.

**Structure Completeness:** Complete directory trees for both backend and frontend defined. All files named and annotated with their purpose. Integration points (Nginx proxy, Axios interceptors, AOP aspect) fully specified.

**Pattern Completeness:** 7 mandatory agent rules defined. Naming conventions cover all 4 layers. Error handling (backend GlobalExceptionHandler + frontend TanStack Query onError) forms a complete chain.

### Gap Resolution

**GAP-1 RESOLVED — MapStruct added to Maven dependencies:**

Add to `pom.xml` in `<dependencies>`:
```xml
<dependency>
    <groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId>
    <version>1.6.3</version>
</dependency>
```

Add to `maven-compiler-plugin` in `<build><plugins>`:
```xml
<annotationProcessorPaths>
    <path>
        <groupId>org.mapstruct</groupId>
        <artifactId>mapstruct-processor</artifactId>
        <version>1.6.3</version>
    </path>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </path>
    <path>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok-mapstruct-binding</artifactId>
        <version>0.2.0</version>
    </path>
</annotationProcessorPaths>
```

**GAP-2 RESOLVED — Complete frontend install command:**
```bash
npm install antd @ant-design/icons @tanstack/react-query axios react-router-dom react-hook-form @hookform/resolvers zod
```

**GAP-3 RESOLVED — Search debounce pattern:**

Add `src/utils/use-debounce.ts`:
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```
In `usePatients.ts`, pass `debouncedSearchTerm` (from `useDebounce(searchTerm, 300)`) as the TanStack Query key — ensures search fires ≤300ms after last keystroke.

**GAP-4 RESOLVED — Frontend role-based access pattern:**

Add `src/hooks/useCurrentUser.ts`:
```typescript
// Decodes JWT from localStorage and returns current user context
export function useCurrentUser(): { role: string; userId: string; username: string } | null
```
Components use: `const user = useCurrentUser()` — show Edit button only when `user?.role === 'RECEPTIONIST' || user?.role === 'ADMIN'`

**GAP-5 CLARIFIED — TLS scope:**
TLS termination is an infrastructure/deployment concern, not an application code concern. `nginx.conf` handles the HTTP internal proxy within the Docker network. Production TLS certificate binding (Let's Encrypt / organizational cert) is configured at the Nginx container level via mounted cert volume — outside the scope of application code. Dev runs HTTP-only on localhost.

**AES key management (nice-to-have resolved):**
`AES_ENCRYPTION_KEY` lives in `.env` (gitignored), injected into `EncryptionConfig` via:
```java
@Value("${app.encryption.key}")
private String encryptionKey;
```
Mapped via `application.yml`: `app.encryption.key: ${AES_ENCRYPTION_KEY}`. Never hardcoded.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped (HIPAA audit, RBAC, PHI encryption, soft-delete, validation, Docker)

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified (all 12 components versioned)
- [x] Integration patterns defined (JWT contract, ProblemDetail, TanStack Query keys)
- [x] Performance considerations addressed (DB indexes, HikariCP, debounce)

**✅ Implementation Patterns**
- [x] Naming conventions established (4 layers)
- [x] Structure patterns defined (backend packages + frontend src)
- [x] Communication patterns specified (Axios instance, TanStack Query, RFC 7807)
- [x] Process patterns documented (error handling chain, loading states, PHI logging rule)

**✅ Project Structure**
- [x] Complete directory structure defined (both services)
- [x] Component boundaries established (controller/service/repository separation)
- [x] Integration points mapped (Nginx proxy, AOP aspect, JWT filter)
- [x] Requirements to structure mapping complete (all 5 REQs traceable to files)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH — all critical gaps resolved, all 5 requirements architecturally supported, 7 agent consistency rules defined.

**Key Strengths:**
- Zero-ambiguity naming conventions across all 4 layers prevent agent naming conflicts
- AOP audit logging is centralized and non-negotiable — HIPAA compliance built in from layer 1
- MapStruct + Lombok + annotationProcessorPaths correctly configured — no compile-time surprises
- TanStack Query key hierarchy (`['patients']`, `['patients', id]`, `['patients', 'search', filters]`) ensures predictable cache invalidation
- 7 mandatory rules act as agent guard rails — PHI logging, soft-delete, ISO 8601 dates, ProblemDetail, etc.

**Areas for Future Enhancement:**
- Redis caching for search results (post-MVP, when scale exceeds 100K records)
- OpenTelemetry traces to correlate audit logs with distributed traces (post-MVP)
- Patient de-identification for analytics/reporting (Reporting Module — out of scope)

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented — especially the 7 mandatory rules
- Use implementation patterns consistently across all components
- Respect project structure and boundaries — no business logic in controllers, no DB calls in controllers
- Refer to this document for all architectural questions before implementing

**First Implementation Priority:**
1. `docker-compose.yml` — PostgreSQL, Spring Boot API, React/Nginx services
2. `hospital-patient-service/` — Spring Initializr scaffold + corrected `pom.xml` (MapStruct)
3. `hospital-patient-ui/` — Vite scaffold + corrected `npm install` (antd + @tanstack/react-query)
4. Then follow the Decision Impact Analysis implementation sequence (steps 1–10)
