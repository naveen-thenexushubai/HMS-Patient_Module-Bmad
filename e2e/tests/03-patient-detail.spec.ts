import { test, expect } from '../fixtures/auth'

test.describe('Patient Detail Page', () => {
  test.beforeEach(async ({ loginAs, listPage }) => {
    await loginAs('admin', 'ADMIN')
    await listPage.openFirstPatient()
  })

  test('shows all information cards', async ({ page }) => {
    await expect(page.locator('text=Personal Information')).toBeVisible()
    await expect(page.locator('text=Contact Information')).toBeVisible()
    await expect(page.locator('text=Emergency Contact')).toBeVisible()
    await expect(page.locator('text=Medical Information')).toBeVisible()
    await expect(page.locator('text=Family & Relationships')).toBeVisible()
    await expect(page.locator('text=Insurance Information')).toBeVisible()
    await expect(page.locator('text=Vitals History')).toBeVisible()
    await expect(page.locator('text=Record Information')).toBeVisible()
  })

  test('shows patient ID and MRN in page header', async ({ page }) => {
    await expect(page.locator('text=Patient ID:')).toBeVisible()
    await expect(page.locator('.ant-tag:has-text("MRN")')).toBeVisible()
  })

  test('ADMIN sees Edit Patient, Audit Trail, Print ID Card, Deactivate buttons', async ({ page }) => {
    await expect(page.locator('button:has-text("Edit Patient")')).toBeVisible()
    await expect(page.locator('button:has-text("Audit Trail")')).toBeVisible()
    await expect(page.locator('button:has-text("Print ID Card")')).toBeVisible()
    await expect(page.locator('button:has-text("Deactivate Patient"), button:has-text("Activate Patient")')).toBeVisible()
  })

  test('DOCTOR sees only read-only controls', async ({ page, loginAs, listPage }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openFirstPatient()
    await expect(page.locator('button:has-text("Edit Patient")')).not.toBeVisible()
    await expect(page.locator('button:has-text("Audit Trail")')).not.toBeVisible()
    await expect(page.locator('button:has-text("Deactivate")')).not.toBeVisible()
  })

  test('Back to List button navigates to patient list', async ({ page }) => {
    await page.locator('button:has-text("Back to List")').click()
    await expect(page).toHaveURL(/\/patients$/)
  })
})
