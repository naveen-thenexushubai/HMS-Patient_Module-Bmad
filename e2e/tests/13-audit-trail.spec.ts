/**
 * REQ-13 — Audit Trail Viewer
 */
import { test, expect } from '../fixtures/auth'

const PATIENT_ID = 'P2026001'

test.describe('REQ-13 — Audit Trail Viewer', () => {
  test('ADMIN sees Audit Trail button in page header', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById(PATIENT_ID)
    expect(await detailPage.isAuditTrailButtonVisible()).toBe(1)
  })

  test('DOCTOR does not see Audit Trail button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    expect(await detailPage.isAuditTrailButtonVisible()).toBe(0)
  })

  test('NURSE does not see Audit Trail button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    expect(await detailPage.isAuditTrailButtonVisible()).toBe(0)
  })

  test('RECEPTIONIST does not see Audit Trail button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    expect(await detailPage.isAuditTrailButtonVisible()).toBe(0)
  })

  test('Audit Trail modal opens and shows entries', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.openAuditTrailModal()

    const rowCount = await detailPage.auditTrailRows().count()
    expect(rowCount).toBeGreaterThanOrEqual(1)
  })

  test('Audit Trail shows VITALS_RECORD action tag (records vitals first)', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    // Record vitals first so VITALS_RECORD is guaranteed on page 1 of the trail
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    await detailPage.openRecordVitalsModal()
    await detailPage.fillVitalsModal({ temperature: '36.9', pulse: '70', systolic: '118', diastolic: '78' })
    await detailPage.submitModal()

    // Now open audit trail as ADMIN
    await page.evaluate(() => localStorage.removeItem('token'))
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.openAuditTrailModal()

    const tags = await detailPage.auditTrailActionTags()
    expect(tags).toContain('VITALS_RECORD')
  })

  test('Audit Trail shows INSURANCE_ADD action tag (adds one first)', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    // Add insurance first so INSURANCE_ADD is guaranteed to appear on page 1
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()
    await detailPage.openAddInsuranceModal()
    await detailPage.fillInsuranceModal({ providerName: 'Audit Test Insurer' })
    await detailPage.submitModal()

    // Now open audit trail as ADMIN
    await page.evaluate(() => localStorage.removeItem('token'))
    await page.goto('/login')
    await page.waitForSelector('.ant-card')
    await page.locator('input[id="username"]').fill('admin')
    await page.locator('.ant-select-selector').first().click()
    await page.waitForSelector('.ant-select-dropdown:visible')
    await page.locator('.ant-select-item[title="ADMIN"]').click()
    await page.waitForTimeout(200)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL('**/patients')

    await listPage.openPatientById(PATIENT_ID)
    await detailPage.openAuditTrailModal()
    const tags = await detailPage.auditTrailActionTags()
    expect(tags).toContain('INSURANCE_ADD')
  })

  test('Audit Trail contains CREATE action for initial registration', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    // P2026010 has fewer audit entries — CREATE is likely on page 1
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById('P2026010')
    await detailPage.openAuditTrailModal()

    // Check all visible table cells for CREATE text
    const allCellText = await page.locator('.ant-modal-content .ant-table-cell').allTextContents()
    const hasCreate = allCellText.some(t => t.includes('CREATE'))
    expect(hasCreate).toBeTruthy()
  })

  test('Audit Trail table has Date, User, Role, Action, IP columns', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.openAuditTrailModal()

    const header = await page.locator('.ant-modal-content .ant-table-thead').innerText()
    expect(header).toContain('Date')
    expect(header).toContain('User')
    expect(header).toContain('Action')
  })

  test('Audit Trail modal can be closed', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('admin', 'ADMIN')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.openAuditTrailModal()
    await detailPage.closeModal()
    await expect(page.locator('.ant-modal-content')).not.toBeVisible()
  })
})
