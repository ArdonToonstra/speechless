import { chromium, type Browser, type FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import {
  TEST_EMAIL,
  TEST_PASSWORD,
  TEST_NAME,
  AUTH_FILE,
  TEST_EMAIL_2,
  TEST_PASSWORD_2,
  TEST_NAME_2,
  AUTH_FILE_2,
} from './constants'

const BASE_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

/** True when the auth state file is fresh enough to reuse (session lasts 7 days). */
function isAuthStateFresh(authFile: string): boolean {
  if (!fs.existsSync(authFile)) return false
  const ageMs = Date.now() - fs.statSync(authFile).mtimeMs
  return ageMs < 6 * 24 * 60 * 60 * 1000
}

/**
 * Log a user in (signing them up + verifying via the dev-only OTP endpoint if the
 * account doesn't exist yet) and persist their session to `authFile`.
 */
async function provisionUser(
  browser: Browser,
  email: string,
  password: string,
  name: string,
  authFile: string,
) {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  const context = await browser.newContext()
  const page = await context.newPage()

  // Try logging in first; if it fails, sign up then verify
  await page.goto(`${BASE_URL}/en/login`)
  await page.fill('input#email', email)
  await page.fill('input#password', password)
  await page.click('button[type="submit"]')

  try {
    await page.waitForURL(`${BASE_URL}/en/dashboard`, { timeout: 5_000 })
    console.log(`[setup] Logged in with existing account ${email}`)
  } catch {
    console.log(`[setup] Account ${email} not found, signing up…`)
    await page.goto(`${BASE_URL}/en/signup`)
    await page.fill('input#name', name)
    await page.fill('input#email', email)
    await page.fill('input#password', password)
    await page.fill('input#confirmPassword', password)
    // The signup form rejects submissions made within 1500ms of page load (anti-bot).
    await page.waitForTimeout(1600)
    await page.click('button[type="submit"]')

    await page.waitForURL(/\/en\/verify-email/, { timeout: 15_000 })

    // Fetch OTP directly from the dev-only API — more reliable than clicking the UI button
    const codeRes = await page.request.get(
      `${BASE_URL}/api/auth/test-code?email=${encodeURIComponent(email)}`,
    )
    const codeBody = await codeRes.json()

    if (!codeBody.code) {
      throw new Error(`[setup] Failed to get OTP code for ${email}: ${JSON.stringify(codeBody)}`)
    }

    await page.locator('input[maxlength="6"]').fill(String(codeBody.code))

    await page.waitForFunction(
      () => {
        const btn = document.querySelector('button[type="submit"]') as HTMLButtonElement | null
        return btn !== null && !btn.disabled
      },
      undefined,
      { timeout: 5_000 },
    )

    await page.click('button[type="submit"]')

    // Better Auth doesn't auto-login after OTP verification — it redirects to /login.
    await page.waitForURL(/\/(dashboard|login)/, { timeout: 15_000 })

    if (page.url().includes('/login')) {
      await page.fill('input#email', email)
      await page.fill('input#password', password)
      await page.click('button[type="submit"]')
      await page.waitForURL(`${BASE_URL}/en/dashboard`, { timeout: 15_000 })
    }

    console.log(`[setup] Signed up and verified account ${email}`)
  }

  await context.storageState({ path: authFile })
  await context.close()
}

async function globalSetup(_config: FullConfig) {
  const users: Array<[string, string, string, string]> = [
    [TEST_EMAIL, TEST_PASSWORD, TEST_NAME, AUTH_FILE],
    [TEST_EMAIL_2, TEST_PASSWORD_2, TEST_NAME_2, AUTH_FILE_2],
  ]

  // Reuse fresh auth state for both users when present
  if (users.every(([, , , authFile]) => isAuthStateFresh(authFile))) {
    console.log('[setup] Reusing existing auth state for both users (< 6 days old)')
    return
  }

  const browser = await chromium.launch()
  try {
    for (const [email, password, name, authFile] of users) {
      if (isAuthStateFresh(authFile)) {
        console.log(`[setup] Reusing existing auth state for ${email}`)
        continue
      }
      await provisionUser(browser, email, password, name, authFile)
    }
  } finally {
    await browser.close()
  }
}

export default globalSetup
