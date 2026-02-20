/**
 * REQ-11 — Insurance Information
 */
import { test, expect } from '../fixtures/auth'

const PATIENT_ID = 'P2026001'

test.describe('REQ-11 — Insurance Information', () => {
  test('RECEPTIONIST can see Insurance card and Add Insurance button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()
    const btnCount = await detailPage.isAddInsuranceVisible()
    expect(btnCount).toBe(1)
  })

  test('RECEPTIONIST can add an insurance record', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()

    const beforeCount = await detailPage.insuranceRows().count()

    await detailPage.openAddInsuranceModal()
    await detailPage.fillInsuranceModal({
      providerName: 'United Health Care',
      coverageType: 'INDIVIDUAL',
      policyNumber: 'UHC-001122',
      groupNumber:  'GRP-UHC',
      subscriberName: 'Test Subscriber',
      isPrimary: true,
    })
    await detailPage.submitModal()

    await detailPage.scrollToInsurance()
    const afterCount = await detailPage.insuranceRows().count()
    expect(afterCount).toBeGreaterThan(beforeCount)

    // Check success notification
    await expect(page.locator('.ant-notification-notice')).toBeVisible()
  })

  test('added insurance shows green Primary badge', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()

    const primaryTags = await detailPage.insurancePrimaryTags().count()
    expect(primaryTags).toBeGreaterThanOrEqual(1)
  })

  test('RECEPTIONIST can edit an existing insurance record', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()

    await detailPage.clickEditInsurance(0)

    // Change provider name
    const providerInput = page.locator('input[placeholder*="Blue Cross"], input[id="providerName"]').first()
    await providerInput.clear()
    await providerInput.fill('Cigna Health — Updated')
    await detailPage.submitModal()

    await detailPage.scrollToInsurance()
    await expect(page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information"))')).toContainText('Cigna Health — Updated')
  })

  test('RECEPTIONIST can delete an insurance record with confirmation', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()

    const beforeCount = await detailPage.insuranceRows().count()
    await detailPage.clickRemoveInsurance(0)

    const afterCount = await detailPage.insuranceRows().count()
    expect(afterCount).toBeLessThan(beforeCount)
  })

  test('DOCTOR: Add/Edit/Remove controls are hidden', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()

    expect(await detailPage.isAddInsuranceVisible()).toBe(0)
    expect(await page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) button:has-text("Edit")').count()).toBe(0)
    expect(await page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) button:has-text("Remove")').count()).toBe(0)
  })

  test('NURSE: Add/Edit/Remove controls are hidden', async ({
    loginAs, listPage, detailPage,
  }) => {
    await loginAs('nurse1', 'NURSE')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToInsurance()
    expect(await detailPage.isAddInsuranceVisible()).toBe(0)
  })
})
