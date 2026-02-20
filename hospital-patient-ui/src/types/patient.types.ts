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
