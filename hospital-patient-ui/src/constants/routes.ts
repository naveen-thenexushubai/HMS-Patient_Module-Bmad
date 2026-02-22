export const ROUTES = {
  PATIENTS:       '/patients',
  PATIENT_NEW:    '/patients/new',
  PATIENT_DETAIL: '/patients/:id',
  PATIENT_EDIT:   '/patients/:id/edit',
  APPOINTMENTS:   '/appointments',
  PORTAL:         '/portal',
} as const

export const buildPatientDetailPath = (id: string) => `/patients/${id}`
export const buildPatientEditPath   = (id: string) => `/patients/${id}/edit`
