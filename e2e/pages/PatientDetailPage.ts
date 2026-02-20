import type { Page } from '@playwright/test'

export class PatientDetailPage {
  constructor(private page: Page) {}

  async scrollToCard(title: string) {
    await this.page.evaluate((t) => {
      for (const el of document.querySelectorAll('.ant-card-head-title'))
        if (el.textContent?.trim() === t) { (el as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'center' }); break }
    }, title)
    await this.page.waitForTimeout(400)
  }

  // ── Photo ─────────────────────────────────────────────────────────────────

  async scrollToPersonalInfo() { await this.scrollToCard('Personal Information') }

  /** Returns 'upload', 'replace', or 'none' depending on current photo state */
  async getPhotoButtonLabel(): Promise<'upload' | 'replace' | 'none'> {
    const uploadBtn   = this.page.locator('button:has-text("Upload")').first()
    const replaceBtn  = this.page.locator('button:has-text("Replace")').first()
    if (await replaceBtn.count() > 0) return 'replace'
    if (await uploadBtn.count()  > 0) return 'upload'
    return 'none'
  }

  isUploadButtonVisible()  { return this.page.locator('button:has-text("Upload"), button:has-text("Replace")').count() }
  isDeletePhotoVisible()   { return this.page.locator('button[danger][aria-label], .ant-space button.ant-btn-dangerous').count() }
  isPhotoImageVisible()    { return this.page.locator('img[alt="Patient photo"]').count() }
  isAvatarVisible()        { return this.page.locator('.ant-avatar').count() }

  async uploadPhoto(imagePath: string) {
    // Ant Design Upload renders a hidden <input type="file"> inside the Upload wrapper
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser', { timeout: 8_000 }),
      this.page.locator('button:has-text("Upload"), button:has-text("Replace")').first().click(),
    ])
    await fileChooser.setFiles(imagePath)
    // Wait for success notification
    await this.page.waitForSelector('.ant-notification-notice', { timeout: 10_000 })
    await this.page.waitForTimeout(800)
  }

  async deletePhoto() {
    // Scope to Personal Information card to avoid matching insurance Remove buttons
    const card = this.page.locator('.ant-card').filter({ hasText: 'Personal Information' }).first()
    await card.locator('button.ant-btn-dangerous').first().click()
    // Wait for the Popconfirm popover (Ant Design 5 uses .ant-popover root; .ant-popconfirm is added too)
    await this.page.waitForSelector('.ant-popover-inner, .ant-popconfirm', { timeout: 5_000 })
    await this.page.locator('.ant-popover button:has-text("Remove"), .ant-popconfirm button:has-text("Remove")').first().click()
    await this.page.waitForSelector('.ant-notification-notice', { timeout: 8_000 })
    await this.page.waitForTimeout(800)
  }

  // ── Insurance ─────────────────────────────────────────────────────────────

  async scrollToInsurance() { await this.scrollToCard('Insurance Information') }

  isAddInsuranceVisible() {
    return this.page.locator('button:has-text("Add Insurance")').count()
  }

  async openAddInsuranceModal() {
    await this.page.locator('button:has-text("Add Insurance")').click()
    await this.page.waitForSelector('.ant-modal-content', { timeout: 5_000 })
  }

  async fillInsuranceModal(data: {
    providerName: string
    coverageType?: string
    policyNumber?: string
    groupNumber?: string
    subscriberName?: string
    isPrimary?: boolean
  }) {
    await this.page.locator('input[placeholder*="Blue Cross"], input[placeholder*="provider"], input[id="providerName"]').first().fill(data.providerName)

    if (data.coverageType) {
      const covSel = this.page.locator('.ant-modal-content .ant-form-item')
        .filter({ hasText: 'Coverage Type' })
        .locator('.ant-select-selector')
      await covSel.click()
      await this.page.waitForSelector('.ant-select-dropdown:visible', { timeout: 3_000 })
      await this.page.locator(`.ant-select-item[title="${data.coverageType}"]`).click()
      await this.page.waitForTimeout(200)
    }

    if (data.policyNumber)
      await this.page.locator('input[placeholder="Policy #"]').fill(data.policyNumber)

    if (data.groupNumber)
      await this.page.locator('input[placeholder="Group #"]').fill(data.groupNumber)

    if (data.subscriberName)
      await this.page.locator('input[placeholder="Name on policy"]').fill(data.subscriberName)

    // Toggle isPrimary switch ON if requested
    if (data.isPrimary) {
      const sw = this.page.locator('.ant-modal-content button[role="switch"]').first()
      const checked = await sw.getAttribute('aria-checked')
      if (checked !== 'true') {
        await sw.click()
        await this.page.waitForTimeout(300)
      }
    }
  }

  async submitModal() {
    await this.page.locator('.ant-modal-footer button.ant-btn-primary').click()
    await this.page.waitForSelector('.ant-modal-content', { state: 'hidden', timeout: 8_000 })
    await this.page.waitForTimeout(600)
  }

  insuranceRows() {
    return this.page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) .ant-table-row')
  }

  insurancePrimaryTags() {
    return this.page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) .ant-tag:text("Primary")')
  }

  async clickEditInsurance(rowIndex = 0) {
    const row = this.page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) .ant-table-row').nth(rowIndex)
    await row.locator('button:has-text("Edit")').click()
    await this.page.waitForSelector('.ant-modal-content', { timeout: 5_000 })
  }

  async clickRemoveInsurance(rowIndex = 0) {
    const row = this.page.locator('.ant-card:has(.ant-card-head-title:text("Insurance Information")) .ant-table-row').nth(rowIndex)
    await row.locator('button:has-text("Remove")').click()
    // Confirm popconfirm
    await this.page.waitForSelector('.ant-popconfirm', { timeout: 3_000 })
    await this.page.locator('.ant-popconfirm button:has-text("Remove")').click()
    await this.page.waitForTimeout(800)
  }

  // ── Vitals ────────────────────────────────────────────────────────────────

  async scrollToVitals() { await this.scrollToCard('Vitals History') }

  isRecordVitalsVisible() {
    return this.page.locator('button:has-text("Record Vitals")').count()
  }

  async openRecordVitalsModal() {
    await this.page.locator('button:has-text("Record Vitals")').click()
    await this.page.waitForSelector('.ant-modal-content', { timeout: 5_000 })
  }

  async fillVitalsModal(data: {
    temperature?: string
    pulse?: string
    systolic?: string
    diastolic?: string
    respRate?: string
    spo2?: string
    weight?: string
    height?: string
    notes?: string
  }) {
    const inputs = this.page.locator('.ant-modal-content .ant-input-number input')
    // Field order: temperature, pulse, systolic, diastolic, respRate, spo2, weight, height
    const fields = [data.temperature, data.pulse, data.systolic, data.diastolic,
                    data.respRate, data.spo2, data.weight, data.height]
    for (let i = 0; i < fields.length; i++) {
      if (fields[i]) await inputs.nth(i).fill(fields[i]!)
    }
    if (data.notes) {
      await this.page.locator('.ant-modal-content textarea').fill(data.notes)
    }
    await this.page.waitForTimeout(500) // allow BMI to compute
  }

  getBmiPreviewText() {
    return this.page.locator('.ant-modal-content').innerText()
  }

  vitalsRows() {
    return this.page.locator('.ant-card:has(.ant-card-head-title:text("Vitals History")) .ant-table-row')
  }

  vitalsChartLines() {
    return this.page.locator('.recharts-line')
  }

  vitalsStatCards() {
    return this.page.locator('.ant-statistic')
  }

  // ── Audit Trail ───────────────────────────────────────────────────────────

  isAuditTrailButtonVisible() {
    return this.page.locator('button:has-text("Audit Trail")').count()
  }

  async openAuditTrailModal() {
    await this.page.locator('button:has-text("Audit Trail")').click()
    await this.page.waitForSelector('.ant-modal-content', { timeout: 5_000 })
    await this.page.waitForTimeout(600)
  }

  auditTrailRows() {
    return this.page.locator('.ant-modal-content .ant-table-row')
  }

  async auditTrailActionTags() {
    const tags = await this.page.locator('.ant-modal-content .ant-tag').allTextContents()
    return [...new Set(tags)]
  }

  async closeModal() {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(400)
  }

  // ── Duplicate Alert ───────────────────────────────────────────────────────

  async waitForDuplicateAlert() {
    await this.page.waitForSelector('.ant-alert', { timeout: 5_000 })
  }

  isDuplicateAlertVisible() {
    return this.page.locator('.ant-alert').filter({ hasText: /duplicate/i }).count()
  }

  async getDuplicateAlertText() {
    return this.page.locator('.ant-alert').first().innerText()
  }

  async openDuplicatesModal() {
    await this.page.locator('.ant-alert button:has-text("View Duplicates")').click()
    await this.page.waitForSelector('.ant-modal-content', { timeout: 5_000 })
    await this.page.waitForTimeout(400)
  }
}
