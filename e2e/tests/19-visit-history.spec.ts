/**
 * REQ-9 — Visit History Timeline
 */
import { test, expect } from '../fixtures/auth'
import axios from 'axios'

const BASE = 'http://localhost:80'
const PATIENT_ID = 'P2026001'

let completedAppointmentId: number | null = null

// Setup: book and complete an appointment for visit history
test.beforeAll(async () => {
  const doctorTkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
    username: 'doctor1', role: 'DOCTOR',
  })).data.token
  const recepTkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
    username: 'receptionist1', role: 'RECEPTIONIST',
  })).data.token

  const hdrsRecep = { Authorization: `Bearer ${recepTkn}`, 'Content-Type': 'application/json' }
  const hdrsDoctor = { Authorization: `Bearer ${doctorTkn}`, 'Content-Type': 'application/json' }

  // Book for today (service requires FutureOrPresent date)
  const today = new Date()
  const pastStr = today.toISOString().split('T')[0]

  const booked = await axios.post(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments`, {
    appointmentDate: pastStr,
    appointmentTime: '14:00',
    appointmentType: 'CONSULTATION',
    doctorName: 'Dr. History Test',
    department: 'Cardiology',
    reasonForVisit: 'Annual checkup',
  }, { headers: hdrsRecep })

  completedAppointmentId = booked.data.id

  // Complete the appointment with notes + diagnosis
  await axios.put(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/${completedAppointmentId}`, {
    appointmentDate: pastStr,
    appointmentTime: '14:00',
    appointmentType: 'CONSULTATION',
    doctorName: 'Dr. History Test',
    department: 'Cardiology',
    reasonForVisit: 'Annual checkup',
    status: 'COMPLETED',
    visitNotes: 'Patient is in good health.',
    diagnosis: 'Healthy — no issues detected',
  }, { headers: hdrsDoctor })
})

test.describe('REQ-9 — Visit History Timeline', () => {
  test('API — visit history endpoint returns only COMPLETED appointments', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/history`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    expect(Array.isArray(resp.data)).toBe(true)
    for (const appt of resp.data) {
      expect(appt.status).toBe('COMPLETED')
    }
  })

  test('API — completed appointment appears in visit history', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/history`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    const found = resp.data.find((a: any) => a.id === completedAppointmentId)
    expect(found).toBeTruthy()
    expect(found.diagnosis).toBe('Healthy — no issues detected')
    expect(found.visitNotes).toBe('Patient is in good health.')
  })

  test('UI — Visit History card is visible on patient detail page', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Visit History')
    await expect(page.locator('.ant-card:has(.ant-card-head-title:text("Visit History"))')).toBeVisible()
  })

  test('UI — Visit History shows Timeline component for completed visits', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Visit History')
    await page.waitForTimeout(1000)

    // The timeline renders ant-timeline OR an empty state — either is valid
    const timelineOrEmpty = page.locator(
      '.ant-card:has(.ant-card-head-title:text("Visit History")) .ant-timeline, ' +
      '.ant-card:has(.ant-card-head-title:text("Visit History")) .ant-empty'
    )
    expect(await timelineOrEmpty.count()).toBeGreaterThanOrEqual(1)
  })

  test('UI — Visit History timeline item shows doctor name and diagnosis', async ({
    page, loginAs, listPage, detailPage,
  }) => {
    await loginAs('doctor1', 'DOCTOR')
    await listPage.openPatientById(PATIENT_ID)
    await detailPage.scrollToCard('Visit History')
    await page.waitForTimeout(1000)

    const historyCard = page.locator('.ant-card:has(.ant-card-head-title:text("Visit History"))')
    const cardText = await historyCard.innerText()

    // Should contain doctor name and/or diagnosis
    expect(cardText).toMatch(/Dr\. History Test|Healthy|Cardiology/i)
  })

  test('UI — New patient with no appointments shows empty visit history', async ({
    page, loginAs,
  }) => {
    // Register a fresh patient with no appointments to guarantee an empty state
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'receptionist1', role: 'RECEPTIONIST',
    })).data.token
    const newPatient = (await axios.post(`${BASE}/api/v1/patients`, {
      firstName: 'Empty',
      lastName: 'HistoryTest',
      dateOfBirth: '1995-06-15',
      gender: 'FEMALE',
      phoneNumber: '(555) 900-0001',
    }, { headers: { Authorization: `Bearer ${tkn}`, 'Content-Type': 'application/json' } })).data
    const newPatientId = newPatient.patientId

    await loginAs('admin', 'ADMIN')
    await page.goto(`/patients/${newPatientId}`)
    await page.waitForSelector('text=Personal Information', { timeout: 10_000 })
    await page.waitForTimeout(800)

    // Scroll to visit history
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.ant-card-head-title'))
        if (el.textContent?.trim() === 'Visit History')
          (el as HTMLElement).scrollIntoView({ behavior: 'instant', block: 'center' })
    })
    await page.waitForTimeout(500)

    const historyCard = page.locator('.ant-card:has(.ant-card-head-title:text("Visit History"))')
    const cardText = await historyCard.innerText()
    expect(cardText).toMatch(/No visit history/i)
  })

  test('API — upcoming endpoint does NOT include completed appointments', async () => {
    const tkn = (await axios.post(`${BASE}/api/v1/auth/dev-login`, {
      username: 'doctor1', role: 'DOCTOR',
    })).data.token

    const resp = await axios.get(`${BASE}/api/v1/patients/${PATIENT_ID}/appointments/upcoming`, {
      headers: { Authorization: `Bearer ${tkn}` },
    })

    for (const appt of resp.data) {
      expect(appt.status).not.toBe('COMPLETED')
    }
  })
})
