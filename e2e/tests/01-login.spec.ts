import { test, expect } from '../fixtures/auth'

test.describe('Login Page', () => {
  test('shows dev login form with role selector', async ({ page, loginPage }) => {
    await loginPage.goto()
    await expect(page.locator('h3:has-text("Ai Nexus"), .ant-typography:has-text("Ai Nexus")').first()).toBeVisible()
    await expect(page.locator('text=Development mode only')).toBeVisible()
    await expect(page.locator('.ant-select-selector')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('RECEPTIONIST can log in and see patient list', async ({ page, loginAs }) => {
    await loginAs('receptionist1', 'RECEPTIONIST')
    await expect(page).toHaveURL(/\/patients/)
    await expect(page.locator('.ant-table')).toBeVisible()
  })

  test('DOCTOR can log in and see patient list', async ({ page, loginAs }) => {
    await loginAs('doctor1', 'DOCTOR')
    await expect(page).toHaveURL(/\/patients/)
    await expect(page.locator('.ant-table')).toBeVisible()
  })

  test('NURSE can log in and see patient list', async ({ page, loginAs }) => {
    await loginAs('nurse1', 'NURSE')
    await expect(page).toHaveURL(/\/patients/)
    await expect(page.locator('.ant-table')).toBeVisible()
  })

  test('ADMIN can log in and see patient list', async ({ page, loginAs }) => {
    await loginAs('admin', 'ADMIN')
    await expect(page).toHaveURL(/\/patients/)
    await expect(page.locator('.ant-table')).toBeVisible()
  })

  test('patient list shows at least one patient row', async ({ page, loginAs }) => {
    await loginAs('admin', 'ADMIN')
    await expect(page.locator('.ant-table-row').first()).toBeVisible()
  })
})
