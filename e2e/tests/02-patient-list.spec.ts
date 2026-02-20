import { test, expect } from '../fixtures/auth'

test.describe('Patient List Page', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('admin', 'ADMIN')
  })

  test('displays patient table with correct columns', async ({ page }) => {
    await expect(page.locator('.ant-table-thead')).toContainText('Patient ID')
    await expect(page.locator('.ant-table-thead')).toContainText('Name')
    await expect(page.locator('.ant-table-thead')).toContainText('Status')
  })

  test('search filters patient list', async ({ page, listPage }) => {
    await listPage.search('Arjun')
    const rows = await page.locator('.ant-table-row').count()
    expect(rows).toBeGreaterThanOrEqual(1)
    await expect(page.locator('.ant-table-row').first()).toContainText('Arjun')
  })

  test('search with no match shows empty state', async ({ page, listPage }) => {
    await listPage.search('ZZZNOMATCH99999')
    await expect(page.locator('.ant-empty, .ant-table-placeholder')).toBeVisible()
  })

  test('clicking a patient row opens detail page', async ({ page, listPage }) => {
    await listPage.openFirstPatient()
    await expect(page).toHaveURL(/\/patients\/P\d+/)
    await expect(page.locator('text=Personal Information')).toBeVisible()
  })

  test('ADMIN sees Register New Patient button', async ({ page }) => {
    await expect(page.locator('button:has-text("Register")')).toBeVisible()
  })

  test('DOCTOR does not see Register New Patient button', async ({ page, loginAs }) => {
    await loginAs('doctor1', 'DOCTOR')
    await expect(page.locator('button:has-text("Register")')).not.toBeVisible()
  })
})
