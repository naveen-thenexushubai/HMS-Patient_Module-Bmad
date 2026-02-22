import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { PatientListPage } from '../pages/PatientListPage'
import { PatientDetailPage } from '../pages/PatientDetailPage'
import { AppointmentListPage } from '../pages/AppointmentListPage'
import { PatientPortalPage } from '../pages/PatientPortalPage'
import type { Role } from '../pages/LoginPage'

type Fixtures = {
  loginPage: LoginPage
  listPage: PatientListPage
  detailPage: PatientDetailPage
  appointmentListPage: AppointmentListPage
  portalPage: PatientPortalPage
  loginAs: (username: string, role: Role) => Promise<void>
  loginAsPatient: (patientId: string, username: string) => Promise<void>
}

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  listPage: async ({ page }, use) => {
    await use(new PatientListPage(page))
  },
  detailPage: async ({ page }, use) => {
    await use(new PatientDetailPage(page))
  },
  appointmentListPage: async ({ page }, use) => {
    await use(new AppointmentListPage(page))
  },
  portalPage: async ({ page }, use) => {
    await use(new PatientPortalPage(page))
  },
  loginAs: async ({ page }, use) => {
    const login = new LoginPage(page)
    await use(async (username, role) => {
      await login.loginAs(username, role)
    })
  },
  loginAsPatient: async ({ page }, use) => {
    await use(async (patientId: string, username: string) => {
      await page.goto('/login')
      await page.waitForSelector('.ant-card', { timeout: 10_000 })
      await page.locator('input[id="username"]').fill(username)
      // Select PATIENT role in the select dropdown
      await page.locator('.ant-select-selector').first().click()
      await page.waitForSelector('.ant-select-dropdown:visible', { timeout: 5_000 })
      await page.locator('.ant-select-item[title="PATIENT"]').click()
      await page.waitForTimeout(200)
      // Fill patientId if a patientId field is present (the login page may have it for PATIENT role)
      const patientIdInput = page.locator('input[id="patientId"]')
      if (await patientIdInput.count() > 0) {
        await patientIdInput.fill(patientId)
      }
      await page.locator('button[type="submit"]').click()
      await page.waitForURL('**/portal', { timeout: 10_000 })
    })
  },
})

export { expect } from '@playwright/test'
