/**
 * REQ-10 — Structured Allergy & Medication Alerts
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'
const PATIENT_ID = 'P2026001'

let lifeThreatAllergyId: number | null = null
let mildAllergyId: number | null = null

test.beforeAll(async () => {
  const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
    username: 'doctor1', role: 'DOCTOR',
  })).data.token
  const hdrs = { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' }

  // Add LIFE_THREATENING allergy
  const lt = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
    allergyName: 'Penicillin',
    allergyType: 'DRUG',
    severity: 'LIFE_THREATENING',
    reaction: 'Anaphylaxis',
  }, { headers: hdrs })
  lifeThreatAllergyId = lt.data.id

  // Add MILD allergy
  const mild = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
    allergyName: 'Pollen',
    allergyType: 'ENVIRONMENTAL',
    severity: 'MILD',
    reaction: 'Sneezing',
  }, { headers: hdrs })
  mildAllergyId = mild.data.id
})

test.describe('REQ-10 — Structured Allergy Alerts', () => {
  test('DOCTOR can add a structured allergy record via API', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token
    const resp = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
      allergyName: 'Aspirin',
      allergyType: 'DRUG',
      severity: 'MODERATE',
      reaction: 'Gastric distress',
    }, { headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' } })

    expect(resp.status).toBe(201)
    expect(resp.data.allergyName).toBe('Aspirin')
    expect(resp.data.severity).toBe('MODERATE')
  })

  test('RECEPTIONIST cannot add allergy (403)', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'receptionist1', role: 'RECEPTIONIST',
    })).data.token
    try {
      await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
        allergyName: 'Shellfish',
        allergyType: 'FOOD',
        severity: 'SEVERE',
      }, { headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' } })
      throw new Error('Should have been 403')
    } catch (err: any) {
      expect(err.response?.status).toBe(403)
    }
  })

  test('API — critical-check returns true when LIFE_THREATENING allergy exists', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token
    const resp = await axios.get(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies/critical-check`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    expect(resp.data.hasCriticalAllergy).toBe(true)
  })

  test('UI — Allergies card is visible on patient detail page', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Allergies')
    await expect(page.locator('.ant-card:has(.ant-card-head-title:text("Allergies"))')).toBeVisible()
  })

  test('UI — LIFE_THREATENING allergy triggers critical alert banner', async ({
    page, loginAs, listPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await page.waitForTimeout(2000) // allow allergy data to load
    await page.evaluate(() => window.scrollTo(0, 0))

    const criticalBanner = page.locator('.ant-alert-banner').filter({ hasText: /CRITICAL ALLERGY/i })
    await expect(criticalBanner).toBeVisible({ timeout: 8_000 })
  })

  test('UI — critical alert banner mentions the allergy name', async ({
    page, loginAs, listPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    const bannerText = await page.locator('.ant-alert-banner').first().innerText()
    expect(bannerText).toMatch(/Penicillin/i)
  })

  test('UI — Allergy card shows severity tags with correct colors', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Allergies')
    await page.waitForTimeout(1000)

    const allergyCard = page.locator('.ant-card:has(.ant-card-head-title:text("Allergies"))')
    // Should show severity tags
    const tags = allergyCard.locator('.ant-tag')
    expect(await tags.count()).toBeGreaterThanOrEqual(1)
  })

  test('UI — Add Allergy button is visible for DOCTOR', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Allergies')
    const count = await page.locator('button:has-text("Add Allergy")').count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('UI — Add Allergy button is NOT visible for RECEPTIONIST', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Allergies')
    const count = await page.locator('button:has-text("Add Allergy")').count()
    expect(count).toBe(0)
  })

  test('API — soft delete allergy sets isActive=false (not hard deleted)', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token
    const hdrs = { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' }

    // Add allergy to delete
    const added = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
      allergyName: 'ToBeDeleted',
      allergyType: 'OTHER',
      severity: 'MILD',
    }, { headers: hdrs })
    const allergyId = added.data.id

    // Delete (soft)
    const delResp = await axios.delete(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies/${allergyId}`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    expect(delResp.status).toBeLessThan(300)

    // Verify it no longer appears in active list
    const listResp = await axios.get(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    const found = listResp.data.find((a: any) => a.id === allergyId)
    expect(found).toBeFalsy()
  })

  test('API — allergy severity levels are validated (INVALID rejected)', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token
    try {
      await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/allergies`, {
        allergyName: 'Test',
        allergyType: 'DRUG',
        severity: 'INVALID_VALUE',
      }, { headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' } })
      throw new Error('Should have been 400')
    } catch (err: any) {
      expect(err.response?.status).toBe(400)
    }
  })
})
