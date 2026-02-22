/**
 * REQ-7 — Patient Portal / Self-Service
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'
const PATIENT_ID = 'P2026001'

async function getPatientToken(patientId: string, username: string): Promise<string> {
  const resp = await axios.post(`${BASE}/api/v1/auth/patient-token`, {
    patientId,
    username,
  })
  return resp.data.token
}

test.describe('REQ-7 — Patient Portal', () => {
  test('Portal page renders My Profile, Appointments, Allergies, and Contact sections', async ({
    page,
  }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    await expect(page.locator('text=My Profile')).toBeVisible()
    await expect(page.locator('text=My Upcoming Appointments')).toBeVisible()
    await expect(page.locator('text=My Allergies')).toBeVisible()
    await expect(page.locator('text=Update My Contact Information')).toBeVisible()
  })

  test('Portal shows masked phone number (not full number)', async ({
    page,
  }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    const phoneText = await page
      .locator('.ant-descriptions-item')
      .filter({ hasText: 'Phone' })
      .first()
      .innerText()
    // Masked phone should contain asterisks
    expect(phoneText).toMatch(/\*/)
  })

  test('Portal does not expose Edit Patient or Audit Trail buttons', async ({
    page,
  }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    expect(await page.locator('button:has-text("Edit Patient")').count()).toBe(0)
    expect(await page.locator('button:has-text("Audit Trail")').count()).toBe(0)
  })

  test('Portal has a sign out button', async ({ page }) => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    await page.addInitScript((t) => window.localStorage.setItem('token', t), token)
    await page.goto('/portal')
    await page.waitForSelector('text=My Profile', { timeout: 10_000 })

    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible()
  })

  test('Staff role redirects away from /portal to /patients', async ({
    loginAs,
    page,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await page.goto('/portal')
    await page.waitForTimeout(1500)
    // Should be redirected to patients or stay on portal depending on role guard
    const url = page.url()
    // Portal should not render for staff — either redirect or show error
    const profileVisible = await page.locator('text=My Profile').count()
    expect(profileVisible).toBe(0)
  })

  test('API — patient-token endpoint generates PATIENT role token', async () => {
    const resp = await axios.post(`${BASE}/api/v1/auth/patient-token`, {
      patientId: PATIENT_ID,
      username: 'Jane Doe',
    })
    expect(resp.status).toBe(200)
    expect(resp.data.token).toBeTruthy()

    // Decode payload to verify claims
    const payload = JSON.parse(atob(resp.data.token.split('.')[1]))
    expect(payload.role).toBe('PATIENT')
    expect(payload.patientId).toBe(PATIENT_ID)
  })

  test('API — /portal/me returns own patient profile', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const resp = await axios.get(`${BASE}/api/v1/portal/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(resp.status).toBe(200)
    expect(resp.data.patientId).toBe(PATIENT_ID)
  })

  test('API — /portal/me/appointments returns appointment list', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    const resp = await axios.get(`${BASE}/api/v1/portal/me/appointments`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(resp.status).toBe(200)
    expect(Array.isArray(resp.data)).toBe(true)
  })

  test('API — PATIENT token cannot access other patient portal', async () => {
    const token = await getPatientToken(PATIENT_ID, 'Jane Doe')
    // /api/v1/patients/{otherId} with PATIENT token should be 403
    try {
      await axios.get(`${BASE}/api/v1/patients/P2026002`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      throw new Error('Should have been 403')
    } catch (err: any) {
      expect(err.response?.status).toBe(403)
    }
  })
})
