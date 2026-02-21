/**
 * REQ-11 — SMS Notifications (MockSmsProvider, dev profile)
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'
const PATIENT_ID = 'P2026001'

async function getStaffToken(username: string, role: string): Promise<string> {
  const resp = await axios.post(`${BASE}/api/v1/auth/dev-login`, { username, role })
  return resp.data.token
}

async function getPatientToken(patientId: string, username: string): Promise<string> {
  const resp = await axios.post(`${BASE}/api/v1/auth/patient-token`, { patientId, username })
  return resp.data.token
}

let smsTestAppointmentId: number | null = null

test.beforeAll(async () => {
  const token = await getStaffToken('receptionist1', 'RECEPTIONIST')
  const today = new Date().toISOString().split('T')[0]
  const resp = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments`, {
    appointmentDate: today,
    appointmentTime: '09:00',
    appointmentType: 'ROUTINE_CHECKUP',
    doctorName: 'Dr. SMS Test',
    department: 'General Medicine',
    reasonForVisit: 'SMS notification trigger',
  }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
  smsTestAppointmentId = resp.data.id
  // Allow async SMS delivery
  await new Promise(r => setTimeout(r, 1500))
})

test.describe('REQ-11 — SMS Notification Mock Log', () => {
  test('API — dev/sms-log returns entries after appointment booked', async () => {
    const token = await getStaffToken('doctor1', 'DOCTOR')
    const resp = await axios.get(`${BASE}/api/v1/dev/sms-log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(resp.status).toBe(200)
    expect(Array.isArray(resp.data)).toBe(true)
    expect(resp.data.length).toBeGreaterThan(0)
  })

  test('API — SMS log entry has provider=MOCK and status=SENT', async () => {
    const token = await getStaffToken('doctor1', 'DOCTOR')
    const resp = await axios.get(`${BASE}/api/v1/dev/sms-log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entry = resp.data.find((e: any) => e.patientId === PATIENT_ID)
    expect(entry).toBeTruthy()
    expect(entry.provider).toBe('MOCK')
    expect(entry.status).toBe('SENT')
  })

  test('API — SMS log message contains appointment date', async () => {
    const token = await getStaffToken('doctor1', 'DOCTOR')
    const resp = await axios.get(`${BASE}/api/v1/dev/sms-log`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const entries = resp.data.filter((e: any) => e.patientId === PATIENT_ID)
    const today = new Date().toISOString().split('T')[0]
    const hasDateInMessage = entries.some((e: any) => e.message?.includes(today))
    expect(hasDateInMessage).toBe(true)
  })

  test('API — cancellation creates a separate SMS log entry', async () => {
    if (!smsTestAppointmentId) throw new Error('No appointment to cancel')
    const staffToken = await getStaffToken('receptionist1', 'RECEPTIONIST')
    await axios.patch(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/${smsTestAppointmentId}/cancel`, null, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
    await new Promise(r => setTimeout(r, 1500))

    const doctorToken = await getStaffToken('doctor1', 'DOCTOR')
    const resp = await axios.get(`${BASE}/api/v1/dev/sms-log`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    })
    const cancelledSms = resp.data.find(
      (e: any) => e.patientId === PATIENT_ID && e.message?.toLowerCase().includes('cancel'),
    )
    expect(cancelledSms).toBeTruthy()
  })

  test('API — PATIENT role cannot access dev/sms-log (403)', async () => {
    const patientToken = await getPatientToken(PATIENT_ID, 'Jane Doe')
    try {
      await axios.get(`${BASE}/api/v1/dev/sms-log`, {
        headers: { Authorization: `Bearer ${patientToken}` },
      })
      throw new Error('Should have been 403')
    } catch (err: any) {
      expect(err.response?.status).toBe(403)
    }
  })
})
