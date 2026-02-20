import type { Page } from '@playwright/test'

export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
    await this.page.waitForSelector('.ant-card', { timeout: 10_000 })
  }

  async loginAs(username: string, role: Role) {
    await this.goto()
    await this.page.locator('input[id="username"]').fill(username)

    // Ant Design Select for role
    await this.page.locator('.ant-select-selector').first().click()
    await this.page.waitForSelector('.ant-select-dropdown:visible', { timeout: 5_000 })
    await this.page.locator(`.ant-select-item[title="${role}"]`).click()
    await this.page.waitForTimeout(200)

    await this.page.locator('button[type="submit"]').click()
    await this.page.waitForURL('**/patients', { timeout: 10_000 })
  }

  async logout() {
    await this.page.evaluate(() => localStorage.removeItem('token'))
  }
}
