import type { Page } from '@playwright/test'

export class PatientPortalPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/portal')
    await this.page.waitForSelector('text=My Profile', { timeout: 10_000 })
  }

  async getProfileName(): Promise<string> {
    const nameItem = this.page.locator('.ant-descriptions-item').filter({ hasText: 'Name' }).first()
    return nameItem.locator('.ant-descriptions-item-content').innerText()
  }

  async getUpcomingAppointmentCount(): Promise<number> {
    return this.page
      .locator('.ant-card:has-text("My Upcoming Appointments") .ant-table-row')
      .count()
  }

  async getAllergySeverities(): Promise<string[]> {
    return this.page
      .locator('.ant-card:has-text("My Allergies") .ant-tag')
      .allTextContents()
  }

  async updateContact(data: {
    phoneNumber?: string
    email?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }) {
    const form = this.page.locator('.ant-card:has-text("Update My Contact Information")')

    if (data.phoneNumber) {
      await form.locator('input[placeholder="New phone number"]').fill(data.phoneNumber)
    }
    if (data.email) {
      await form.locator('input[placeholder="New email address"]').fill(data.email)
    }
    if (data.address) {
      await form.locator('input[placeholder="Street address"]').fill(data.address)
    }
    if (data.city) {
      await form.locator('input').filter({ hasText: '' }).nth(3).fill(data.city)
    }

    await form.locator('button:has-text("Update Contact Info")').click()
    await this.page.waitForSelector('.ant-notification-notice', { timeout: 8_000 })
    await this.page.waitForTimeout(500)
  }
}
