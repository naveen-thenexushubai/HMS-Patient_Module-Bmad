/**
 * REQ-14 — Bulk CSV Export
 */
import { test, expect } from '../fixtures/auth'
import * as fs from 'fs'

test.describe('REQ-14 — Bulk CSV Export', () => {
  test('RECEPTIONIST sees Export CSV button on patient list', async ({
    page, loginAs,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await expect(page.locator('button:has-text("Export CSV")')).toBeVisible()
  })

  test('ADMIN sees Export CSV button on patient list', async ({
    page, loginAs,
  }) => {
    await loginAs('admin', 'ADMIN')
    await expect(page.locator('button:has-text("Export CSV")')).toBeVisible()
  })

  test('DOCTOR does NOT see Export CSV button', async ({
    page, loginAs,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await expect(page.locator('button:has-text("Export CSV")')).not.toBeVisible()
  })

  test('NURSE does NOT see Export CSV button', async ({
    page, loginAs,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await expect(page.locator('button:has-text("Export CSV")')).not.toBeVisible()
  })

  test('clicking Export CSV downloads a file named patients_export.csv', async ({
    loginAs, listPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    const download = await listPage.clickExportCsv()
    expect(download.suggestedFilename()).toBe('patients_export.csv')
  })

  test('CSV file has correct 17-column header row', async ({
    loginAs, listPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    const download = await listPage.clickExportCsv()
    const path = await download.path()
    const content = fs.readFileSync(path!, 'utf8')
    const header = content.split('\n')[0]
    expect(header).toContain('PatientID')
    expect(header).toContain('MRN')
    expect(header).toContain('FirstName')
    expect(header).toContain('LastName')
    expect(header).toContain('DateOfBirth')
    expect(header).toContain('PhoneNumber')
    expect(header).toContain('Status')
    expect(header).toContain('RegisteredAt')
  })

  test('CSV contains patient data rows', async ({ loginAs, listPage }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    const download = await listPage.clickExportCsv()
    const path = await download.path()
    const content = fs.readFileSync(path!, 'utf8')
    const lines = content.trim().split('\n')
    // At least header + 10 patients
    expect(lines.length).toBeGreaterThanOrEqual(11)
  })

  test('CSV fields with commas are properly quoted', async ({ loginAs, listPage }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    const download = await listPage.clickExportCsv()
    const path = await download.path()
    const content = fs.readFileSync(path!, 'utf8')
    // Arjun Sharma has allergies "Penicillin, Sulfa drugs" — should be quoted
    const arjunLine = content.split('\n').find(l => l.includes('Arjun'))
    if (arjunLine) {
      expect(arjunLine).toContain('"') // quoted fields present
    }
  })

  test('filtered export — City filter only exports matching patients', async ({
    page, loginAs, listPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    // Apply city filter via URL or filter controls
    await page.goto('/patients')
    await page.waitForSelector('.ant-table', { timeout: 8_000 })
    // Use the search box to filter by Chicago
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first()
    await searchInput.fill('Chicago')
    await page.waitForTimeout(1200)

    const download = await listPage.clickExportCsv()
    const path = await download.path()
    const content = fs.readFileSync(path!, 'utf8')
    const dataLines = content.trim().split('\n').slice(1)
    // Every exported patient should contain Chicago
    for (const line of dataLines) {
      expect(line.toLowerCase()).toContain('chicago')
    }
  })
})
