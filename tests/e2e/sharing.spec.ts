import { test, expect, type Page } from '@playwright/test'

const TEST_PROJECT_NAME = '[TEST] Sharing Project'

async function createProject(page: Page): Promise<string> {
  await page.goto('/en/onboarding')
  await page.click('text=Speech for the Occasion')
  await page.click('text=Continue')
  await page.click('text=Wedding')
  await page.click('text=Continue')
  await page.click('text=Not Yet Known')
  await page.click('text=Continue')
  await page.fill('input#title', TEST_PROJECT_NAME)
  await page.fill('input#honoree', 'Sharing Honoree')
  await page.click('text=Continue')
  await page.waitForURL(/\/en\/projects\/\d+/, { timeout: 15_000 })
  return page.url().match(/\/en\/projects\/(\d+)/)?.[1] ?? ''
}

async function deleteProject(page: Page, projectId: string) {
  await page.goto(`/en/projects/${projectId}/overview`)
  await page.click('button:has-text("Delete")')
  const dialog = page.locator('[role="dialog"]')
  await dialog.locator('input').fill(TEST_PROJECT_NAME)
  await dialog.locator('button:has-text("Delete permanently")').click()
  await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 })
}

test.describe('Public Sharing', () => {
  let projectId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    projectId = await createProject(page)
    await page.close()
  })

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage()
    await deleteProject(page, projectId)
    await page.close()
  })

  test('share dialog opens and shows a share URL input', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    // Find the sharing section / button that opens the dialog
    await page.click('button:has-text("Share")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('input[readonly]')).toBeVisible({ timeout: 5_000 })
  })

  test('enabling sharing makes the share URL accessible without auth', async ({
    page,
    browser,
  }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    await page.click('button:has-text("Share")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Toggle sharing on if it isn't already
    const toggle = dialog.locator('button[role="switch"], input[type="checkbox"]').first()
    const isEnabled = await toggle.getAttribute('aria-checked')
    if (isEnabled !== 'true') {
      await toggle.click()
      await page.waitForTimeout(1_000) // wait for server action
    }

    // Get the share URL from the read-only input
    const shareUrl = await dialog.locator('input[readonly]').inputValue()
    expect(shareUrl).toMatch(/\/share\//)

    // Open as unauthenticated user
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(shareUrl)
    await expect(guestPage).not.toHaveURL(/\/login/)
    // The speech viewer should render some content
    await expect(guestPage.locator('main, [role="main"], article').first()).toBeVisible({
      timeout: 10_000,
    })
    await guestContext.close()
  })

  test('disabling sharing makes the share URL inaccessible', async ({ page, browser }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    await page.click('button:has-text("Share")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Make sure we have the share URL before disabling
    const shareUrl = await dialog.locator('input[readonly]').inputValue()
    expect(shareUrl).toMatch(/\/share\//)

    // Turn sharing off
    const toggle = dialog.locator('button[role="switch"], input[type="checkbox"]').first()
    const isEnabled = await toggle.getAttribute('aria-checked')
    if (isEnabled === 'true') {
      await toggle.click()
      await page.waitForTimeout(1_000)
    }

    // The URL should now be blocked (redirect to login or 404)
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(shareUrl)
    // Expect a redirect to login or an error / not-found page
    const finalUrl = guestPage.url()
    const isBlocked =
      finalUrl.includes('/login') ||
      finalUrl.includes('/not-found') ||
      (await guestPage.locator('text=/not found|access denied|sign in/i').count()) > 0
    expect(isBlocked).toBe(true)
    await guestContext.close()
  })
})
