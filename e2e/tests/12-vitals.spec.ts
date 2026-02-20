/**
 * REQ-12 — Patient Vitals History
 */
import { test, expect } from '../fixtures/auth'

const PATIENT_ID = 'P2026001'

test.describe('REQ-12 — Patient Vitals History', () => {
  test('NURSE sees Record Vitals button', async ({ loginAs, listPage, detailPage }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    expect(await detailPage.isRecordVitalsVisible()).toBe(1)
  })

  test('DOCTOR sees Record Vitals button', async ({ loginAs, listPage, detailPage }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    expect(await detailPage.isRecordVitalsVisible()).toBe(1)
  })

  test('RECEPTIONIST does NOT see Record Vitals button', async ({ loginAs, listPage, detailPage }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    expect(await detailPage.isRecordVitalsVisible()).toBe(0)
  })

  test('Record Vitals modal opens with 8 input fields', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    await detailPage.openRecordVitalsModal()

    const inputCount = await page.locator('.ant-modal-content .ant-input-number input').count()
    expect(inputCount).toBe(8)
  })

  test('Record Vitals modal shows live BMI preview', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    await detailPage.openRecordVitalsModal()

    await detailPage.fillVitalsModal({ weight: '70', height: '175' })
    const text = await detailPage.getBmiPreviewText()
    // BMI = 70 / (1.75^2) = 22.86
    expect(text).toContain('22')
  })

  test('NURSE can record vitals and they appear in the table', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()

    const beforeCount = await detailPage.vitalsRows().count()

    await detailPage.openRecordVitalsModal()
    await detailPage.fillVitalsModal({
      temperature: '37.2',
      pulse:       '74',
      systolic:    '122',
      diastolic:   '82',
      respRate:    '16',
      spo2:        '98',
      weight:      '72',
      height:      '178',
    })
    await detailPage.submitModal()

    // Success notification confirms the record was saved
    await expect(page.locator('.ant-notification-notice').first()).toBeVisible()

    // Table shows the vitals rows; if already at pagination limit (10) count stays at 10,
    // otherwise it grows — either way it must have at least 1 row
    await detailPage.scrollToVitals()
    const afterCount = await detailPage.vitalsRows().count()
    expect(afterCount).toBeGreaterThanOrEqual(Math.min(beforeCount + 1, 10))
  })

  test('latest vitals shown in Statistic cards', async ({ loginAs, listPage, detailPage }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    const statCount = await detailPage.vitalsStatCards().count()
    expect(statCount).toBeGreaterThanOrEqual(2)
  })

  test('trend chart appears when 2 or more readings exist', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()

    // Ensure at least 2 readings exist by recording a second one
    await detailPage.openRecordVitalsModal()
    await detailPage.fillVitalsModal({ systolic: '116', diastolic: '74', pulse: '66' })
    await detailPage.submitModal()
    await detailPage.scrollToVitals()

    const chartLines = await detailPage.vitalsChartLines().count()
    expect(chartLines).toBeGreaterThanOrEqual(1)
  })

  test('validation — temperature InputNumber clamps value to 45°C max', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToVitals()
    await detailPage.openRecordVitalsModal()

    // Ant Design InputNumber with max=45 clamps out-of-range values on blur
    const tempInput = page.locator('.ant-modal-content .ant-input-number input').nth(0)
    await tempInput.fill('99')
    await tempInput.press('Tab') // trigger blur → clamp
    await page.waitForTimeout(300)

    // Value should be clamped to the max (45) or left at typed value but rejected by backend
    const val = await tempInput.inputValue()
    // Either clamped to 45 by the component, or left as typed
    // Either way the component should not accept 99 as a valid temp
    expect(Number(val)).toBeLessThanOrEqual(45)

    await page.keyboard.press('Escape')
  })
})
