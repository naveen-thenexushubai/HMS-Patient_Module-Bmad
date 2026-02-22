/**
 * Photo Upload / Replace / Delete — Patient Photo Management
 *
 * Covers:
 *   - Role-based visibility (Upload button shown for RECEPTIONIST/ADMIN, hidden for DOCTOR/NURSE)
 *   - Upload a valid JPEG → photo appears, "Replace" button shown
 *   - Replace existing photo → new upload accepted
 *   - Delete photo with Popconfirm → avatar (initials) shown again
 *   - Uploading a non-image file is rejected with an error notification
 */
import * as path from 'path'
import * as os from 'os'
import { test, expect } from '../fixtures/auth'
import { createTestImage, createTextFile } from '../fixtures/create-test-image'

// Use P2026002 to avoid collisions with other test suites
const PATIENT_ID = 'P2026002'

// Paths for temp test files (created once, reused across tests)
const TEST_JPEG = path.join(os.tmpdir(), 'hospital-e2e', 'test-photo.jpg')
const TEST_TEXT = path.join(os.tmpdir(), 'hospital-e2e', 'not-an-image.txt')

test.describe('Patient Photo Upload', () => {
  test.beforeAll(() => {
    // Generate the physical test files used by upload tests
    createTestImage(TEST_JPEG)
    createTextFile(TEST_TEXT)
  })

  // ── Role-based visibility ────────────────────────────────────────────────

  test('step 1 — ADMIN sees Upload / Replace button in Personal Information', async ({
    loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as ADMIN and open patient detail', async () => {
      await loginAs('admin', 'ADMIN')
      await listPage.openPatientById(PATIENT_ID)
    })

    await test.step('Scroll to Personal Information card', async () => {
      await detailPage.scrollToPersonalInfo()
    })

    await test.step('Verify Upload or Replace button is visible', async () => {
      const count = await detailPage.isUploadButtonVisible()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test('step 2 — RECEPTIONIST sees Upload / Replace button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as RECEPTIONIST', async () => {
      await loginAs('receptionist1', 'RECEPTIONIST')
      await listPage.openPatientById(PATIENT_ID)
    })

    await test.step('Scroll to Personal Information card', async () => {
      await detailPage.scrollToPersonalInfo()
    })

    await test.step('Upload button should be visible', async () => {
      const count = await detailPage.isUploadButtonVisible()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test('step 3 — DOCTOR does NOT see Upload / Replace button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as DOCTOR', async () => {
      await loginAs('doctor1', 'DOCTOR')
      await listPage.openPatientById(PATIENT_ID)
    })

    await test.step('Scroll to Personal Information card', async () => {
      await detailPage.scrollToPersonalInfo()
    })

    await test.step('Upload button should NOT be visible for DOCTOR', async () => {
      const count = await detailPage.isUploadButtonVisible()
      expect(count).toBe(0)
    })
  })

  test('step 4 — NURSE does NOT see Upload / Replace button', async ({
    loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as NURSE', async () => {
      await loginAs('nurse1', 'NURSE')
      await listPage.openPatientById(PATIENT_ID)
    })

    await test.step('Scroll to Personal Information card', async () => {
      await detailPage.scrollToPersonalInfo()
    })

    await test.step('Upload button should NOT be visible for NURSE', async () => {
      const count = await detailPage.isUploadButtonVisible()
      expect(count).toBe(0)
    })
  })

  // ── Upload a new photo ───────────────────────────────────────────────────

  test('step 5 — ADMIN can upload a patient photo', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as ADMIN and open patient', async () => {
      await loginAs('admin', 'ADMIN')
      await listPage.openPatientById(PATIENT_ID)
      await detailPage.scrollToPersonalInfo()
    })

    // If a photo already exists, delete it first so we test the "Upload" flow
    await test.step('Remove any existing photo so Upload button is shown', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      if (label === 'replace') {
        await detailPage.deletePhoto()
        await detailPage.scrollToPersonalInfo()
      }
    })

    await test.step('Verify "Upload" button is shown before upload', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      expect(label).toBe('upload')
    })

    await test.step('Upload JPEG photo using file chooser', async () => {
      await detailPage.uploadPhoto(TEST_JPEG)
    })

    await test.step('Success notification should appear', async () => {
      await expect(page.locator('.ant-notification-notice').first()).toBeVisible()
    })

    await test.step('After upload, "Replace" button is shown (photo now exists)', async () => {
      await detailPage.scrollToPersonalInfo()
      const label = await detailPage.getPhotoButtonLabel()
      expect(label).toBe('replace')
    })

    await test.step('Patient photo image is visible in the card', async () => {
      const imgCount = await detailPage.isPhotoImageVisible()
      expect(imgCount).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Replace existing photo ───────────────────────────────────────────────

  test('step 6 — ADMIN can replace an existing photo', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as ADMIN and open patient', async () => {
      await loginAs('admin', 'ADMIN')
      await listPage.openPatientById(PATIENT_ID)
      await detailPage.scrollToPersonalInfo()
    })

    // Ensure a photo exists before we try to replace it
    await test.step('Ensure a photo exists (upload if not present)', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      if (label === 'upload') {
        await detailPage.uploadPhoto(TEST_JPEG)
        await detailPage.scrollToPersonalInfo()
      }
    })

    await test.step('"Replace" button should be shown', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      expect(label).toBe('replace')
    })

    await test.step('Click Replace and upload the same JPEG again', async () => {
      await detailPage.uploadPhoto(TEST_JPEG)
    })

    await test.step('Success notification after replace', async () => {
      await expect(page.locator('.ant-notification-notice').first()).toBeVisible()
    })

    await test.step('Photo is still displayed after replace', async () => {
      await detailPage.scrollToPersonalInfo()
      const imgCount = await detailPage.isPhotoImageVisible()
      expect(imgCount).toBeGreaterThanOrEqual(1)
    })
  })

  // ── Delete photo ─────────────────────────────────────────────────────────

  test('step 7 — ADMIN can delete the patient photo', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as ADMIN and open patient', async () => {
      await loginAs('admin', 'ADMIN')
      await listPage.openPatientById(PATIENT_ID)
      await detailPage.scrollToPersonalInfo()
    })

    // Ensure a photo exists so the delete button is available
    await test.step('Ensure a photo exists before deletion', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      if (label === 'upload') {
        await detailPage.uploadPhoto(TEST_JPEG)
        await detailPage.scrollToPersonalInfo()
      }
    })

    await test.step('Delete button (trash icon) should be visible', async () => {
      const count = await detailPage.isDeletePhotoVisible()
      expect(count).toBeGreaterThanOrEqual(1)
    })

    await test.step('Click delete and confirm in Popconfirm', async () => {
      await detailPage.deletePhoto()
    })

    await test.step('Success notification appears after deletion', async () => {
      await expect(page.locator('.ant-notification-notice').first()).toBeVisible()
    })

    await test.step('After deletion, "Upload" button is shown again (no photo)', async () => {
      await detailPage.scrollToPersonalInfo()
      const label = await detailPage.getPhotoButtonLabel()
      expect(label).toBe('upload')
    })

    await test.step('Avatar (initials) is shown instead of photo', async () => {
      const avatarCount = await detailPage.isAvatarVisible()
      expect(avatarCount).toBeGreaterThanOrEqual(1)
    })

    await test.step('Photo image element is no longer visible', async () => {
      const imgCount = await detailPage.isPhotoImageVisible()
      expect(imgCount).toBe(0)
    })
  })

  // ── Non-image file rejected ──────────────────────────────────────────────

  test('step 8 — uploading a non-image file shows an error notification', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as ADMIN and open patient', async () => {
      await loginAs('admin', 'ADMIN')
      await listPage.openPatientById(PATIENT_ID)
      await detailPage.scrollToPersonalInfo()
    })

    // Ensure we are in the "Upload" state (no photo) for a clean test
    await test.step('Remove existing photo if present', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      if (label === 'replace') {
        await detailPage.deletePhoto()
        await detailPage.scrollToPersonalInfo()
      }
    })

    await test.step('Attempt to upload a plain text file and verify rejection', async () => {
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 8_000 }),
        page.locator('button:has-text("Upload"), button:has-text("Replace")').first().click(),
      ])
      // Start watching for the error notification BEFORE setFiles triggers beforeUpload.
      // This avoids a slowMo race condition: notification.error() fires synchronously in
      // beforeUpload (right after setFiles), but slowMo delays the next Playwright action
      // by 5s — longer than Ant Design's default 4.5s notification duration.
      const notifWatcher = page.waitForSelector(
        '.ant-notification-notice',
        { state: 'visible', timeout: 8_000 },
      )
      await fileChooser.setFiles(TEST_TEXT)
      // notifWatcher already resolved when notification appeared during setFiles
      await notifWatcher
    })

    await test.step('Photo should still NOT be present (upload rejected)', async () => {
      await detailPage.scrollToPersonalInfo()
      const imgCount = await detailPage.isPhotoImageVisible()
      expect(imgCount).toBe(0)
    })
  })

  // ── RECEPTIONIST full flow ───────────────────────────────────────────────

  test('step 9 — RECEPTIONIST can upload and delete photo', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await test.step('Login as RECEPTIONIST', async () => {
      await loginAs('receptionist1', 'RECEPTIONIST')
      await listPage.openPatientById(PATIENT_ID)
      await detailPage.scrollToPersonalInfo()
    })

    // Remove any existing photo
    await test.step('Clear existing photo if present', async () => {
      const label = await detailPage.getPhotoButtonLabel()
      if (label === 'replace') {
        await detailPage.deletePhoto()
        await detailPage.scrollToPersonalInfo()
      }
    })

    await test.step('RECEPTIONIST uploads a photo', async () => {
      await detailPage.uploadPhoto(TEST_JPEG)
      await expect(page.locator('.ant-notification-notice').first()).toBeVisible()
    })

    await test.step('Photo is now displayed', async () => {
      await detailPage.scrollToPersonalInfo()
      expect(await detailPage.isPhotoImageVisible()).toBeGreaterThanOrEqual(1)
    })

    await test.step('RECEPTIONIST deletes the photo', async () => {
      await detailPage.deletePhoto()
      await expect(page.locator('.ant-notification-notice').first()).toBeVisible()
    })

    await test.step('Avatar shown again after deletion', async () => {
      await detailPage.scrollToPersonalInfo()
      expect(await detailPage.getPhotoButtonLabel()).toBe('upload')
      expect(await detailPage.isAvatarVisible()).toBeGreaterThanOrEqual(1)
    })
  })
})
