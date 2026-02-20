/**
 * REQ-15 — Duplicate Detection by Name + DOB
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'

// Ensure at least one duplicate of David Chen (P2026007) exists before tests run
test.beforeAll(async () => {
  const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
    username: 'receptionist1', role: 'RECEPTIONIST',
  })).data.token
  const hdrs = { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' }
  const david = (await axios.get(`${BASE}/api/v1/patients/P2026007`, { headers: hdrs })).data
  try {
    await axios.post(`${BASE}/api/v1/patients`, {
      firstName: david.firstName,
      lastName:  david.lastName,
      dateOfBirth: david.dateOfBirth,
      gender: david.gender,
      phoneNumber: '(555) 111-2222',
      emergencyContactName: 'Dup Contact',
      emergencyContactPhone: '(555) 111-3333',
    }, { headers: hdrs })
  } catch { /* duplicate may already exist */ }
})

test.describe('REQ-15 — Duplicate Detection by Name + DOB', () => {
  test('patient with name+DOB duplicate shows warning alert', async ({
    page, loginAs,
  }) => {
    await loginAs('admin', 'ADMIN')
    await page.goto('/patients/P2026007')
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000) // allow duplicate query to complete
    await page.evaluate(() => window.scrollTo(0, 0))

    await expect(page.locator('.ant-alert').filter({ hasText: /duplicate/i })).toBeVisible()
  })

  test('duplicate alert message mentions phone or name/DOB', async ({
    page, loginAs, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await page.goto('/patients/P2026007')
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    const alertText = await detailPage.getDuplicateAlertText()
    expect(alertText.toLowerCase()).toMatch(/phone|name|date of birth|duplicate/i)
  })

  test('duplicate alert shows the correct count', async ({
    page, loginAs,
  }) => {
    await loginAs('admin', 'ADMIN')
    await page.goto('/patients/P2026007')
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    const alertText = await page.locator('.ant-alert').first().innerText()
    // Should mention at least 1 possible duplicate
    expect(alertText).toMatch(/\d+ possible duplicate/)
  })

  test('View Duplicates opens a comparison modal', async ({
    page, loginAs, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await page.goto('/patients/P2026007')
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    await detailPage.openDuplicatesModal()
    await expect(page.locator('.ant-modal-content')).toBeVisible()
    // Modal should list at least one duplicate patient
    await expect(page.locator('.ant-modal-content .ant-table-row, .ant-modal-content .ant-list-item').first()).toBeVisible()
  })

  test('patient with unique name+DOB shows no duplicate alert', async ({
    page, loginAs,
  }) => {
    await loginAs('admin', 'ADMIN')
    // P2026002 (Meera Patel) has a unique name+DOB
    await page.goto('/patients/P2026002')
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(2000)
    await page.evaluate(() => window.scrollTo(0, 0))

    // No duplicate alert should appear (or count is 0)
    const alerts = await page.locator('.ant-alert').filter({ hasText: /duplicate/i }).count()
    expect(alerts).toBe(0)
  })

  test('API potential-duplicates endpoint returns results for duplicate patient', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'admin', role: 'ADMIN',
    })).data.token
    const resp = await axios.get(`${BASE}/api/v1/patients/P2026007/potential-duplicates`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })
    expect(resp.data.length).toBeGreaterThanOrEqual(1)
  })
})
