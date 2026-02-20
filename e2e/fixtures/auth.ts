import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { PatientListPage } from '../pages/PatientListPage'
import { PatientDetailPage } from '../pages/PatientDetailPage'
import type { Role } from '../pages/LoginPage'

type Fixtures = {
  loginPage: LoginPage
  listPage: PatientListPage
  detailPage: PatientDetailPage
  loginAs: (username: string, role: Role) => Promise<void>
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
  loginAs: async ({ page }, use) => {
    const login = new LoginPage(page)
    await use(async (username, role) => {
      await login.loginAs(username, role)
    })
  },
})

export { expect } from '@playwright/test'
