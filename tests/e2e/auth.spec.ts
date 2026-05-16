import { test, expect } from '@playwright/test'
import { TEST_EMAIL, TEST_PASSWORD } from './constants'

// Override auth state — these tests cover unauthenticated flows
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Authentication', () => {
  test('redirects to /login when visiting /dashboard unauthenticated', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL(/\/en\/login/)
  })

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/en/login')
    await page.fill('input#email', TEST_EMAIL)
    await page.fill('input#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/en\/dashboard/)
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/en/login')
    await page.fill('input#email', TEST_EMAIL)
    await page.fill('input#password', 'WrongPassword!')
    await page.click('button[type="submit"]')
    // Should stay on login page and show an error
    await expect(page).toHaveURL(/\/en\/login/)
    await expect(page.locator('text=/invalid|incorrect|wrong|error/i')).toBeVisible({
      timeout: 5_000,
    })
  })

  test('logout clears session and redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/en/login')
    await page.fill('input#email', TEST_EMAIL)
    await page.fill('input#password', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/en\/dashboard/)

    // Open user menu and log out
    await page.click('button:has-text("Log out")')
    await expect(page).toHaveURL(/\/en\/login/, { timeout: 10_000 })

    // Navigating to dashboard should redirect back to login
    await page.goto('/en/dashboard')
    await expect(page).toHaveURL(/\/en\/login/)
  })
})
