import api from './axios-instance'
import type {
  Patient, PatientSummary, PatientFormData, PatientSearchParams, PatientStatus,
  PatientRelationship, AddRelationshipRequest,
} from '../types/patient.types'
import type { PageResponse } from '../types/api.types'
import type {
  PatientInsurance, PatientInsuranceRequest,
  PatientVitals, PatientVitalsRequest,
  AuditEntry,
} from '../types/patient.types'

export async function fetchPatients(params: PatientSearchParams): Promise<PageResponse<PatientSummary>> {
  const { data } = await api.get('/patients', { params })
  return data
}

export async function fetchPatient(patientId: string): Promise<Patient> {
  const { data } = await api.get(`/patients/${patientId}`)
  return data
}

export async function createPatient(payload: PatientFormData): Promise<Patient> {
  const { data } = await api.post('/patients', payload)
  return data
}

export async function updatePatient(patientId: string, payload: PatientFormData): Promise<Patient> {
  const { data } = await api.put(`/patients/${patientId}`, payload)
  return data
}

export async function updatePatientStatus(patientId: string, status: PatientStatus): Promise<Patient> {
  const { data } = await api.patch(`/patients/${patientId}/status`, { status })
  return data
}

// ── Photo ──────────────────────────────────────────────────────────────────

export async function uploadPatientPhoto(patientId: string, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  await api.post(`/patients/${patientId}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function fetchPatientPhotoBlob(patientId: string): Promise<string> {
  // Fetch photo with JWT header via the shared axios instance, return a blob URL
  const response = await api.get(`/patients/${patientId}/photo`, { responseType: 'blob' })
  return URL.createObjectURL(response.data)
}

export async function deletePatientPhoto(patientId: string): Promise<void> {
  await api.delete(`/patients/${patientId}/photo`)
}

// ── Potential Duplicates ───────────────────────────────────────────────────

export async function fetchPotentialDuplicates(patientId: string): Promise<PatientSummary[]> {
  const { data } = await api.get(`/patients/${patientId}/potential-duplicates`)
  return data
}

// ── Relationships ──────────────────────────────────────────────────────────

export async function fetchRelationships(patientId: string): Promise<PatientRelationship[]> {
  const { data } = await api.get(`/patients/${patientId}/relationships`)
  return data
}

export async function addRelationship(
  patientId: string,
  req: AddRelationshipRequest,
): Promise<PatientRelationship> {
  const { data } = await api.post(`/patients/${patientId}/relationships`, req)
  return data
}

export async function removeRelationship(
  patientId: string,
  relatedPatientId: string,
): Promise<void> {
  await api.delete(`/patients/${patientId}/relationships/${relatedPatientId}`)
}

// ── Insurance ──────────────────────────────────────────────────────────────

export async function fetchInsurance(patientId: string): Promise<PatientInsurance[]> {
  const { data } = await api.get(`/patients/${patientId}/insurance`)
  return data
}

export async function addInsurance(patientId: string, req: PatientInsuranceRequest): Promise<PatientInsurance> {
  const { data } = await api.post(`/patients/${patientId}/insurance`, req)
  return data
}

export async function updateInsurance(patientId: string, id: number, req: PatientInsuranceRequest): Promise<PatientInsurance> {
  const { data } = await api.put(`/patients/${patientId}/insurance/${id}`, req)
  return data
}

export async function deleteInsurance(patientId: string, id: number): Promise<void> {
  await api.delete(`/patients/${patientId}/insurance/${id}`)
}

// ── Vitals ─────────────────────────────────────────────────────────────────

export async function fetchVitals(patientId: string): Promise<PatientVitals[]> {
  const { data } = await api.get(`/patients/${patientId}/vitals`)
  return data
}

export async function recordVitals(patientId: string, req: PatientVitalsRequest): Promise<PatientVitals> {
  const { data } = await api.post(`/patients/${patientId}/vitals`, req)
  return data
}

// ── Audit Trail ────────────────────────────────────────────────────────────

export async function fetchAuditTrail(patientId: string): Promise<AuditEntry[]> {
  const { data } = await api.get(`/patients/${patientId}/audit-trail`)
  return data
}

// ── CSV Export ─────────────────────────────────────────────────────────────

export async function exportPatientsCsv(params: PatientSearchParams): Promise<Blob> {
  const response = await api.get('/patients/export', { params, responseType: 'blob' })
  return response.data
}
