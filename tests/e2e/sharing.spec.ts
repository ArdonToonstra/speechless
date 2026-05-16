import { test, expect, type Page } from '@playwright/test'
import { AUTH_FILE } from './constants'

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
  await page.click('text=Create Project')
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

/** Open the share modal, generate the magic link if it doesn't exist yet, and ensure sharing is enabled. */
async function openShareAndEnsureEnabled(page: Page): Promise<string> {
  await page.click('button:has-text("Share")')
  await expect(page.locator('text=Share your Speech')).toBeVisible()

  // If no token yet, generate the magic link (also auto-enables it)
  const generateBtn = page.locator('button:has-text("Generate Magic Link")')
  if (await generateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await generateBtn.click()
    await page.waitForTimeout(2_000)
  }

  // Enable if currently disabled
  const enableBtn = page.locator('button:has-text("Enable")')
  if (await enableBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await enableBtn.click()
    await page.waitForTimeout(1_000)
  }

  return page.locator('input[readonly]').inputValue()
}

test.describe('Public Sharing', () => {
  let projectId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE })
    const page = await context.newPage()
    projectId = await createProject(page)
    await context.close()
  })

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: AUTH_FILE })
    const page = await context.newPage()
    await deleteProject(page, projectId)
    await context.close()
  })

  test('share dialog opens and shows a share URL input', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    await page.click('button:has-text("Share")')
    await expect(page.locator('text=Share your Speech')).toBeVisible()

    // Generate magic link if not yet created
    const generateBtn = page.locator('button:has-text("Generate Magic Link")')
    if (await generateBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await generateBtn.click()
      await page.waitForTimeout(2_000)
    }

    // Readonly URL input is shown when sharing is enabled (auto-enabled after generation)
    await expect(page.locator('input[readonly]')).toBeVisible({ timeout: 5_000 })
  })

  test('enabling sharing makes the share URL accessible without auth', async ({
    page,
    browser,
  }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    const shareUrl = await openShareAndEnsureEnabled(page)
    expect(shareUrl).toMatch(/\/share\//)

    // Open as unauthenticated user
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(shareUrl)
    await expect(guestPage).not.toHaveURL(/\/login/)
    await expect(guestPage.locator('main, [role="main"], article').first()).toBeVisible({
      timeout: 10_000,
    })
    await guestContext.close()
  })

  test('disabling sharing makes the share URL inaccessible', async ({ page, browser }) => {
    await page.goto(`/en/projects/${projectId}/overview`)
    // Ensure we have a URL and it's enabled first
    const shareUrl = await openShareAndEnsureEnabled(page)
    expect(shareUrl).toMatch(/\/share\//)

    // Disable sharing
    const disableBtn = page.locator('button:has-text("Disable")')
    if (await disableBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await disableBtn.click()
      await page.waitForTimeout(1_000)
    }

    // The URL should now be blocked
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(shareUrl)
    const finalUrl = guestPage.url()
    const isBlocked =
      finalUrl.includes('/login') ||
      finalUrl.includes('/not-found') ||
      (await guestPage.locator('text=/not found|access denied|sign in/i').count()) > 0
    expect(isBlocked).toBe(true)
    await guestContext.close()
  })

  test('disabling sharing does not block the questionnaire link', async ({ page, browser }) => {
    // The questionnaire link uses the same shareToken but is independent of isPubliclyShared.
    // Disabling public speech sharing must not block questionnaire submissions.
    await page.goto(`/en/projects/${projectId}/questionnaire`)

    // Copy the questionnaire link
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.click('button:has-text("Copy questionnaire link")')
    const questionnaireUrl = await page.evaluate(() => navigator.clipboard.readText())
    expect(questionnaireUrl).toMatch(/\/questionnaire\//)

    // Make sure sharing is disabled
    await page.goto(`/en/projects/${projectId}/overview`)
    await page.click('button:has-text("Share")')
    await expect(page.locator('text=Share your Speech')).toBeVisible()
    const disableBtn = page.locator('button:has-text("Disable")')
    if (await disableBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await disableBtn.click()
      await page.waitForTimeout(1_000)
    }
    await page.keyboard.press('Escape')

    // The questionnaire must still be accessible
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(questionnaireUrl)
    await expect(guestPage).not.toHaveURL(/\/login/)
    await expect(guestPage.locator('h1, h2').first()).toBeVisible({ timeout: 10_000 })
    await guestContext.close()
  })
})
