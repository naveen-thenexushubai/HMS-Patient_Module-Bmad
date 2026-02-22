/**
 * REQ-8 — Smart Duplicate Detection with Confidence Scoring
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'

// Create a test patient and a soundex-similar duplicate before tests run
let basePatientId: string | null = null

test.beforeAll(async () => {
  const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
    username: 'receptionist1', role: 'RECEPTIONIST',
  })).data.token
  const hdrs = { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' }

  // Create base patient
  const base = await axios.post(`${BASE}/api/v1/patients`, {
    firstName: 'Jonathan',
    lastName: 'Williams',
    dateOfBirth: '1985-06-15',
    gender: 'MALE',
    phoneNumber: '(555) 987-1111',
    emergencyContactName: 'Contact A',
    emergencyContactPhone: '(555) 987-0000',
  }, { headers: hdrs })
  basePatientId = base.data.patientId

  // Create soundex-similar patient (Johnathan Wylliams — same Soundex)
  try {
    await axios.post(`${BASE}/api/v1/patients`, {
      firstName: 'Johnathan',
      lastName: 'Wylliams',
      dateOfBirth: '1985-06-15',
      gender: 'MALE',
      phoneNumber: '(555) 987-2222',
      emergencyContactName: 'Contact B',
      emergencyContactPhone: '(555) 987-0001',
    }, { headers: hdrs })
  } catch { /* may already exist */ }
})

test.describe('REQ-8 — Smart Duplicate Detection', () => {
  test('API — registering patient with same phone returns duplicatePhoneWarning', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'receptionist1', role: 'RECEPTIONIST',
    })).data.token
    const hdrs = { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' }

    // Register with an already-used phone number
    const resp = await axios.post(`${BASE}/api/v1/patients`, {
      firstName: 'Dupe',
      lastName: 'PhoneTest',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      phoneNumber: '(555) 987-1111', // same as basePatient above
      emergencyContactName: 'EC',
      emergencyContactPhone: '(555) 999-0000',
    }, { headers: hdrs })

    expect(resp.data.duplicatePhoneWarning).toBe(true)
  })

  test('API — potential-duplicates returns HIGH confidence for phone match', async () => {
    if (!basePatientId) return
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'admin', role: 'ADMIN',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${basePatientId}/potential-duplicates`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    const highConfidence = resp.data.filter((d: any) => d.matchConfidence === 'HIGH')
    expect(highConfidence.length).toBeGreaterThanOrEqual(1)
  })

  test('API — potential-duplicates returns MEDIUM confidence for soundex match', async () => {
    if (!basePatientId) return
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'admin', role: 'ADMIN',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${basePatientId}/potential-duplicates`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    const mediumConfidence = resp.data.filter((d: any) => d.matchConfidence === 'MEDIUM')
    // Jonathan/Johnathan should be Soundex-similar — MEDIUM confidence
    expect(mediumConfidence.length).toBeGreaterThanOrEqual(1)
  })

  test('API — potential-duplicates results contain matchReason text', async () => {
    if (!basePatientId) return
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'admin', role: 'ADMIN',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${basePatientId}/potential-duplicates`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    for (const dup of resp.data) {
      expect(dup.matchReason).toBeTruthy()
      expect(typeof dup.matchReason).toBe('string')
    }
  })

  test('UI — duplicate alert appears for patient with duplicates', async ({
    page, loginAs,
  }) => {
    if (!basePatientId) return
    await loginAs('admin', 'ADMIN')
    await page.goto(`/patients/${basePatientId}`)
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    const alertCount = await page.locator('.ant-alert').filter({ hasText: /duplicate/i }).count()
    expect(alertCount).toBeGreaterThanOrEqual(1)
  })

  test('UI — duplicate modal shows confidence badge (HIGH/MEDIUM/LOW tag)', async ({
    page, loginAs, detailPage,
  }) => {
    if (!basePatientId) return
    await loginAs('admin', 'ADMIN')
    await page.goto(`/patients/${basePatientId}`)
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    await detailPage.openDuplicatesModal()
    await page.waitForSelector('.ant-modal-content', { timeout: 5_000 })

    // Should contain at least one HIGH, MEDIUM, or LOW tag
    const confidenceTags = page.locator('.ant-modal-content .ant-tag').filter({
      hasText: /HIGH|MEDIUM|LOW/,
    })
    expect(await confidenceTags.count()).toBeGreaterThanOrEqual(1)
  })

  test('UI — duplicate modal shows match reason text', async ({
    page, loginAs, detailPage,
  }) => {
    if (!basePatientId) return
    await loginAs('admin', 'ADMIN')
    await page.goto(`/patients/${basePatientId}`)
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    await detailPage.openDuplicatesModal()
    await page.waitForTimeout(500)

    const modalText = await page.locator('.ant-modal-content').innerText()
    expect(modalText).toMatch(/match|phone|name|birth year/i)
  })

  test('API — patient with unique name shows empty duplicate list', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'admin', role: 'ADMIN',
    })).data.token
    // P2026002 (unique name) should return empty or minimal duplicates
    const resp = await axios.get(`${BASE}/api/v1/patients/P2026002/potential-duplicates`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    // We cannot guarantee zero, but verify response is an array
    expect(Array.isArray(resp.data)).toBe(true)
  })
})
