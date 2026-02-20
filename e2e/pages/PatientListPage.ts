import type { Page } from '@playwright/test'

export class PatientListPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/patients')
    await this.page.waitForSelector('.ant-table', { timeout: 10_000 })
  }

  async openFirstPatient() {
    await this.page.locator('.ant-table-row').first().click()
    await this.page.waitForSelector('text=Personal Information', { timeout: 10_000 })
  }

  async openPatientById(patientId: string) {
    await this.page.goto(`/patients/${patientId}`)
    await this.page.waitForSelector('text=Personal Information', { timeout: 10_000 })
  }

  async search(query: string) {
    const searchInput = this.page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first()
    await searchInput.fill(query)
    await this.page.waitForTimeout(1200) // debounce
  }

  async clickExportCsv() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 10_000 }),
      this.page.locator('button:has-text("Export CSV")').click(),
    ])
    return download
  }

  isExportCsvVisible() {
    return this.page.locator('button:has-text("Export CSV")').count()
  }

  isRegisterButtonVisible() {
    return this.page.locator('button:has-text("Register")').count()
  }
}
