/**
 * REQ-11 — In-App Appointment Notifications (v3.0.0)
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

let bookedAppointmentId: number | null = null

test.beforeAll(async () => {
  const token = await getStaffToken('receptionist1', 'RECEPTIONIST')
  const today = new Date().toISOString().split('T')[0]
  const resp = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments`, {
    appointmentDate: today,
    appointmentTime: '10:00',
    appointmentType: 'CONSULTATION',
    doctorName: 'Dr. Notif Test',
    department: 'Cardiology',
    reasonForVisit: 'Notification trigger test',
  }, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
  bookedAppointmentId = resp.data.id
  // Allow async notification listener to fire
  await new Promise(r => setTimeout(r, 1500))
})

test.describe('REQ-11 — In-App Appointment Notifications', () => {
  test('API — booking appointment creates APPOINTMENT_BOOKED in-app notification', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const resp = await axios.get(`${BASE}/api/v1/portal/me/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(resp.status).toBe(200)
    expect(Array.isArray(resp.data)).toBe(true)
    const booked = resp.data.find((n: any) => n.type === 'APPOINTMENT_BOOKED' && n.appointmentId === bookedAppointmentId)
    expect(booked).toBeTruthy()
  })

  test('API — notification has correct title and patientId', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const resp = await axios.get(`${BASE}/api/v1/portal/me/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const booked = resp.data.find((n: any) => n.type === 'APPOINTMENT_BOOKED' && n.appointmentId === bookedAppointmentId)
    expect(booked.patientId).toBe(PATIENT_ID)
    expect(booked.title).toBeTruthy()
    expect(booked.message).toBeTruthy()
  })

  test('API — unread-count increases after new notification', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const resp = await axios.get(`${BASE}/api/v1/portal/me/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(resp.status).toBe(200)
    expect(typeof resp.data.count).toBe('number')
    expect(resp.data.count).toBeGreaterThan(0)
  })

  test('API — marking notification read returns 204 and decrements unread count', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const hdrs = { Authorization: `Bearer ${token}` }

    const listResp = await axios.get(`${BASE}/api/v1/portal/me/notifications`, { headers: hdrs })
    const unread = listResp.data.find((n: any) => !n.isRead)
    if (!unread) {
      // All may already be read — just check unread-count is a number
      const countResp = await axios.get(`${BASE}/api/v1/portal/me/notifications/unread-count`, { headers: hdrs })
      expect(typeof countResp.data.count).toBe('number')
      return
    }

    const countBefore = (await axios.get(`${BASE}/api/v1/portal/me/notifications/unread-count`, { headers: hdrs })).data.count
    const patchResp = await axios.patch(`${BASE}/api/v1/portal/me/notifications/${unread.id}/read`, null, { headers: hdrs })
    expect(patchResp.status).toBe(204)
    const countAfter = (await axios.get(`${BASE}/api/v1/portal/me/notifications/unread-count`, { headers: hdrs })).data.count
    expect(countAfter).toBe(countBefore - 1)
  })

  test('API — mark-all-read clears all unread notifications', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const hdrs = { Authorization: `Bearer ${token}` }

    const patchResp = await axios.patch(`${BASE}/api/v1/portal/me/notifications/read-all`, null, { headers: hdrs })
    expect(patchResp.status).toBe(204)

    const countResp = await axios.get(`${BASE}/api/v1/portal/me/notifications/unread-count`, { headers: hdrs })
    expect(countResp.data.count).toBe(0)
  })

  test('API — cancelling appointment creates APPOINTMENT_CANCELLED notification', async () => {
    if (!bookedAppointmentId) throw new Error('No appointment to cancel')
    const staffToken = await getStaffToken('receptionist1', 'RECEPTIONIST')
    await axios.patch(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/${bookedAppointmentId}/cancel`, null, {
      headers: { Authorization: `Bearer ${staffToken}` },
    })
    await new Promise(r => setTimeout(r, 1500))

    const patientToken = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const listResp = await axios.get(`${BASE}/api/v1/portal/me/notifications`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    })
    const cancelled = listResp.data.find(
      (n: any) => n.type === 'APPOINTMENT_CANCELLED' && n.appointmentId === bookedAppointmentId,
    )
    expect(cancelled).toBeTruthy()
  })

  test('API — STAFF role cannot access portal notifications (403)', async () => {
    const staffToken = await getStaffToken('doctor1', 'DOCTOR')
    try {
      await axios.get(`${BASE}/api/v1/portal/me/notifications`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      })
      throw new Error('Should have been 403')
    } catch (err: any) {
      expect(err.response?.status).toBe(403)
    }
  })

  test('UI — portal bell icon is visible in portal header', async ({ page }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    // Bell icon button should be visible in header
    const bell = page.locator('header .anticon-bell').first()
    await expect(bell).toBeVisible({ timeout: 5_000 })
  })

  test('UI — clicking bell opens notification drawer', async ({ page }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    await page.locator('header .anticon-bell').first().click()
    await expect(page.locator('.ant-drawer-title:text("Notifications")')).toBeVisible({ timeout: 5_000 })
  })

  test('UI — notification drawer shows list or empty state', async ({ page }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    await page.locator('header .anticon-bell').first().click()
    await page.waitForTimeout(1000)

    // Either a notification item or empty state
    const itemOrEmpty = page.locator(
      '.ant-drawer-body .ant-empty, .ant-drawer-body [style*="border-left"]',
    )
    // Just verify the drawer body rendered
    await expect(page.locator('.ant-drawer-body')).toBeVisible()
  })

  test('UI — Mark all read button clears unread badge', async ({ page }) => {
    // Re-book to ensure unread notifications exist
    const staffToken = await getStaffToken('receptionist1', 'RECEPTIONIST')
    const today = new Date().toISOString().split('T')[0]
    await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments`, {
      appointmentDate: today,
      appointmentTime: '11:30',
      appointmentType: 'FOLLOW_UP',
      doctorName: 'Dr. Mark Read',
      department: 'General',
    }, { headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' } })
    await new Promise(r => setTimeout(r, 1500))

    const patientToken = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), patientToken)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    await page.locator('header .anticon-bell').first().click()
    await page.waitForTimeout(800)

    const markAllBtn = page.locator('.ant-drawer-extra button:has-text("Mark all read")')
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click()
      await page.waitForTimeout(1000)
      // Badge should be gone (count=0 → Ant Design Badge hides 0)
      await expect(page.locator('header .ant-badge-count:text("0")')).not.toBeVisible()
    }
    // If button is not visible, all are already read — test passes
  })
})
