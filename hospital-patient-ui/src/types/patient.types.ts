export type PatientStatus = 'ACTIVE' | 'INACTIVE'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type RelationshipType = 'SPOUSE' | 'PARENT' | 'CHILD' | 'SIBLING' | 'GUARDIAN' | 'WARD' | 'OTHER'

export interface Patient {
  patientId: string
  mrn?: string
  hasPhoto?: boolean
  firstName: string
  lastName: string
  dateOfBirth: string
  age: number
  gender: Gender
  phoneNumber: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  bloodGroup?: string
  knownAllergies?: string
  chronicConditions?: string
  hasAllergies?: boolean
  hasChronicConditions?: boolean
  duplicatePhoneWarning?: boolean
  status: PatientStatus
  registeredBy: string
  registeredAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface PatientSummary {
  patientId: string
  mrn?: string
  firstName: string
  lastName: string
  age: number
  gender: Gender
  phoneNumber: string
  status: PatientStatus
  /** Only populated in duplicate detection results — null otherwise */
  matchConfidence?: 'HIGH' | 'MEDIUM' | 'LOW'
  matchReason?: string
}

export interface PatientFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  phoneNumber: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  bloodGroup?: string
  knownAllergies?: string
  chronicConditions?: string
}

export interface PatientSearchParams {
  search?: string
  status?: PatientStatus
  gender?: Gender
  bloodGroup?: string
  city?: string
  state?: string
  birthYearFrom?: number
  birthYearTo?: number
  hasAllergies?: boolean
  hasChronicConditions?: boolean
  page?: number
  size?: number
}

export interface PatientRelationship {
  relatedPatientId: string
  relatedPatientName: string
  relationshipType: RelationshipType
  createdBy: string
  createdAt: string
}

export interface AddRelationshipRequest {
  relatedPatientId: string
  relationshipType: RelationshipType
}

// ── v3.0 additions ────────────────────────────────────────────────────────────

export type CoverageType = 'INDIVIDUAL' | 'FAMILY' | 'MEDICARE' | 'MEDICAID' | 'OTHER'

export interface PatientInsurance {
  id: number
  patientId: string
  providerName: string
  policyNumber?: string
  groupNumber?: string
  coverageType?: CoverageType
  subscriberName?: string
  subscriberDob?: string
  validFrom?: string
  validTo?: string
  isPrimary: boolean
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface PatientInsuranceRequest {
  providerName: string
  policyNumber?: string
  groupNumber?: string
  coverageType?: CoverageType
  subscriberName?: string
  subscriberDob?: string
  validFrom?: string
  validTo?: string
  isPrimary?: boolean
}

export interface PatientVitals {
  id: number
  patientId: string
  recordedAt: string
  recordedBy: string
  temperatureCelsius?: number
  pulseRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weightKg?: number
  heightCm?: number
  bmi?: number
  notes?: string
}

export interface PatientVitalsRequest {
  temperatureCelsius?: number
  pulseRate?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  respiratoryRate?: number
  oxygenSaturation?: number
  weightKg?: number
  heightCm?: number
  notes?: string
}

export interface AuditEntry {
  id: number
  userId: string
  username: string
  userRole: string
  action: string
  patientId: string
  ipAddress?: string
  occurredAt: string
}

// ── v2.0.0 Appointment types ──────────────────────────────────────────────────

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
export type AppointmentType = 'CONSULTATION' | 'FOLLOW_UP' | 'PROCEDURE' | 'ROUTINE_CHECKUP' | 'EMERGENCY'

export interface PatientAppointment {
  id: number
  patientId: string
  appointmentDate: string
  appointmentTime: string
  appointmentType: AppointmentType
  status: AppointmentStatus
  doctorName?: string
  department?: string
  reasonForVisit?: string
  visitNotes?: string
  diagnosis?: string
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface AppointmentRequest {
  appointmentDate: string
  appointmentTime: string
  appointmentType: AppointmentType
  doctorName?: string
  department?: string
  reasonForVisit?: string
}

export interface AppointmentUpdateRequest extends AppointmentRequest {
  status?: AppointmentStatus
  visitNotes?: string
  diagnosis?: string
}

// ── v2.0.0 Allergy types ──────────────────────────────────────────────────────

export type AllergyType = 'DRUG' | 'FOOD' | 'ENVIRONMENTAL' | 'OTHER'
export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING'

export interface PatientAllergy {
  id: number
  patientId: string
  allergyName: string
  allergyType: AllergyType
  severity: AllergySeverity
  reaction?: string
  onsetDate?: string
  notes?: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedBy?: string
  updatedAt?: string
}

export interface PatientAllergyRequest {
  allergyName: string
  allergyType: AllergyType
  severity: AllergySeverity
  reaction?: string
  onsetDate?: string
  notes?: string
}

// ── v2.0.0 Portal types ───────────────────────────────────────────────────────

export interface PortalContactUpdateRequest {
  phoneNumber?: string
  email?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

// ── v3.0.0 Notification types ─────────────────────────────────────────────────

export type NotificationType =
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_REMINDER'
  | 'APPOINTMENT_COMPLETED'

export interface PatientNotification {
  id: number
  patientId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  appointmentId?: number
  createdAt: string
  readAt?: string
}
