import api from './axios-instance'
import type {
  Patient, PatientSummary, PatientFormData, PatientSearchParams, PatientStatus,
  PatientRelationship, AddRelationshipRequest,
  PatientInsurance, PatientInsuranceRequest,
  PatientVitals, PatientVitalsRequest,
  AuditEntry,
  PatientAppointment, AppointmentRequest, AppointmentUpdateRequest,
  PatientAllergy, PatientAllergyRequest,
  PortalContactUpdateRequest,
  PatientNotification,
} from '../types/patient.types'
import type { PageResponse } from '../types/api.types'

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

// ── Appointments ────────────────────────────────────────────────────────────

export async function fetchAppointments(patientId: string): Promise<PatientAppointment[]> {
  const { data } = await api.get(`/patients/${patientId}/appointments`)
  return data
}

export async function fetchUpcomingAppointments(patientId: string): Promise<PatientAppointment[]> {
  const { data } = await api.get(`/patients/${patientId}/appointments/upcoming`)
  return data
}

export async function fetchVisitHistory(patientId: string): Promise<PatientAppointment[]> {
  const { data } = await api.get(`/patients/${patientId}/appointments/history`)
  return data
}

export async function bookAppointment(patientId: string, req: AppointmentRequest): Promise<PatientAppointment> {
  const { data } = await api.post(`/patients/${patientId}/appointments`, req)
  return data
}

export async function updateAppointment(patientId: string, id: number, req: AppointmentUpdateRequest): Promise<PatientAppointment> {
  const { data } = await api.put(`/patients/${patientId}/appointments/${id}`, req)
  return data
}

export async function cancelAppointment(patientId: string, id: number): Promise<PatientAppointment> {
  const { data } = await api.patch(`/patients/${patientId}/appointments/${id}/cancel`)
  return data
}

export interface GlobalAppointmentParams {
  patientId?: string
  status?: string
  appointmentType?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

export async function fetchAllAppointments(params: GlobalAppointmentParams): Promise<PageResponse<PatientAppointment>> {
  const { data } = await api.get('/appointments', { params })
  return data
}

// ── Allergies ───────────────────────────────────────────────────────────────

export async function fetchAllergies(patientId: string): Promise<PatientAllergy[]> {
  const { data } = await api.get(`/patients/${patientId}/allergies`)
  return data
}

export async function checkCriticalAllergy(patientId: string): Promise<boolean> {
  const { data } = await api.get(`/patients/${patientId}/allergies/critical-check`)
  return data?.hasCriticalAllergy ?? data
}

export async function addAllergy(patientId: string, req: PatientAllergyRequest): Promise<PatientAllergy> {
  const { data } = await api.post(`/patients/${patientId}/allergies`, req)
  return data
}

export async function updateAllergy(patientId: string, id: number, req: PatientAllergyRequest): Promise<PatientAllergy> {
  const { data } = await api.put(`/patients/${patientId}/allergies/${id}`, req)
  return data
}

export async function deleteAllergy(patientId: string, id: number): Promise<void> {
  await api.delete(`/patients/${patientId}/allergies/${id}`)
}

// ── Patient Portal ──────────────────────────────────────────────────────────

export async function fetchPortalMe(): Promise<Patient> {
  const { data } = await api.get('/portal/me')
  return data
}

export async function fetchPortalAppointments(): Promise<PatientAppointment[]> {
  const { data } = await api.get('/portal/me/appointments')
  return data
}

export async function fetchPortalAllergies(): Promise<PatientAllergy[]> {
  const { data } = await api.get('/portal/me/allergies')
  return data
}

export async function updatePortalContact(req: PortalContactUpdateRequest): Promise<Patient> {
  const { data } = await api.patch('/portal/me/contact', req)
  return data
}

// ── Notifications ────────────────────────────────────────────────────────────

export async function fetchNotifications(): Promise<PatientNotification[]> {
  const { data } = await api.get('/portal/me/notifications')
  return data
}

export async function fetchUnreadCount(): Promise<{ count: number }> {
  const { data } = await api.get('/portal/me/notifications/unread-count')
  return data
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/portal/me/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/portal/me/notifications/read-all')
}
