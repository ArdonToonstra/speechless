import { chromium, type FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { TEST_EMAIL, TEST_PASSWORD, TEST_NAME, AUTH_FILE } from './constants'

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

async function globalSetup(_config: FullConfig) {
  // Skip setup if auth state is fresh (less than 6 days old — session lasts 7 days)
  if (fs.existsSync(AUTH_FILE)) {
    const stat = fs.statSync(AUTH_FILE)
    const ageMs = Date.now() - stat.mtimeMs
    if (ageMs < 6 * 24 * 60 * 60 * 1000) {
      console.log('[setup] Reusing existing auth state (< 6 days old)')
      return
    }
  }

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Try logging in first; if it fails, sign up then verify
  await page.goto(`${BASE_URL}/en/login`)
  await page.fill('input#email', TEST_EMAIL)
  await page.fill('input#password', TEST_PASSWORD)
  await page.click('button[type="submit"]')

  // Wait briefly to see if login succeeded (redirected to dashboard)
  try {
    await page.waitForURL(`${BASE_URL}/en/dashboard`, { timeout: 5_000 })
    console.log('[setup] Logged in with existing test account')
  } catch {
    // Account doesn't exist yet — sign up
    console.log('[setup] Account not found, signing up…')
    await page.goto(`${BASE_URL}/en/signup`)
    await page.fill('input#name', TEST_NAME)
    await page.fill('input#email', TEST_EMAIL)
    await page.fill('input#password', TEST_PASSWORD)
    await page.fill('input#confirmPassword', TEST_PASSWORD)
    // The signup form rejects submissions made within 1500ms of page load (anti-bot).
    // Wait long enough to pass that guard before submitting.
    await page.waitForTimeout(1600)
    await page.click('button[type="submit"]')

    // Wait for redirect to verify-email page (URL includes ?email=... query params)
    await page.waitForURL(/\/en\/verify-email/, { timeout: 15_000 })

    // Use the dev-only "Get Code" button to auto-fill the OTP, then wait for the
    // input to have a value (JS sets the .value property, not the HTML attribute)
    await page.click('button:has-text("Get Code")')
    await page.waitForFunction(
      () => {
        const input = document.querySelector('input[maxlength="6"]') as HTMLInputElement | null
        return input !== null && input.value.length === 6
      },
      { timeout: 10_000 },
    )

    // Submit verification
    await page.click('button[type="submit"]:has-text("Verify Email")')
    await page.waitForURL(`${BASE_URL}/en/dashboard`, { timeout: 15_000 })
    console.log('[setup] Signed up and verified test account')
  }

  await context.storageState({ path: AUTH_FILE })
  await browser.close()
}

export default globalSetup
