import type { Page } from '@playwright/test'

export class AppointmentListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/appointments')
    await this.page.waitForSelector('.ant-table', { timeout: 10_000 })
  }

  async searchByPatientId(patientId: string) {
    await this.page.locator('.ant-input-search input').fill(patientId)
    await this.page.locator('.ant-input-search button').click()
    await this.page.waitForTimeout(600)
  }

  async filterByStatus(status: string) {
    const sel = this.page.locator('.ant-select-selector').filter({ hasText: 'Status' })
    await sel.click()
    await this.page.waitForSelector('.ant-select-dropdown:visible', { timeout: 3_000 })
    await this.page.locator(`.ant-select-item-option[title="${status}"]`).click()
    await this.page.waitForTimeout(400)
  }

  async filterByType(type: string) {
    const sel = this.page.locator('.ant-select-selector').filter({ hasText: 'Type' })
    await sel.click()
    await this.page.waitForSelector('.ant-select-dropdown:visible', { timeout: 3_000 })
    await this.page.locator(`.ant-select-item-option[title="${type}"]`).click()
    await this.page.waitForTimeout(400)
  }

  tableRows() {
    return this.page.locator('.ant-table-tbody .ant-table-row')
  }

  async getRowCount(): Promise<number> {
    return this.tableRows().count()
  }
}
