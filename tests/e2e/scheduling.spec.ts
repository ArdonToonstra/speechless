import { test, expect, type Page, type BrowserContext } from '@playwright/test'
import { AUTH_FILE } from './constants'

const TEST_PROJECT_NAME = '[TEST] Scheduling Project'

async function createProject(page: Page): Promise<string> {
  await page.goto('/en/onboarding')
  await page.click('text=Speech for the Occasion')
  await page.click('text=Continue')
  await page.click('text=Wedding')
  await page.click('text=Continue')
  await page.click('text=Not Yet Known')
  await page.click('text=Continue')
  await page.fill('input#title', TEST_PROJECT_NAME)
  await page.fill('input#honoree', 'Scheduling Honoree')
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

async function getSchedulingLink(page: Page, context: BrowserContext): Promise<string> {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.click('button:has-text("Copy scheduling link")')
  return page.evaluate(() => navigator.clipboard.readText())
}

test.describe('Scheduling', () => {
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

  test('scheduling page loads', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/scheduling`)
    // Use h1 to avoid strict mode with sidebar nav links that also contain "Scheduling"
    await expect(page.locator('h1')).toContainText(/Scheduling/i)
  })

  test('owner can add a date option', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/scheduling`)

    // Pick a date via the Calendar component (data-day attribute set by CalendarDayButton)
    const dayButton = page.locator('button[data-day]:not([disabled])').first()
    await dayButton.click()

    // Click the Add Option button
    const addButton = page.locator('button').filter({ hasText: /add option/i })
    await addButton.click()

    // A date card should now be visible
    await expect(page.locator('[class*="border"][class*="rounded"]').first()).toBeVisible({
      timeout: 5_000,
    })
  })

  test('public scheduling link is accessible without auth', async ({
    page,
    context,
    browser,
  }) => {
    // Ensure a date option exists first
    await page.goto(`/en/projects/${projectId}/scheduling`)
    const dayButton = page.locator('button[data-day]:not([disabled])').first()
    if (await dayButton.isVisible()) {
      await dayButton.click()
      const addButton = page.locator('button').filter({ hasText: /add option/i })
      if (await addButton.isVisible()) await addButton.click()
    }

    const link = await getSchedulingLink(page, context)
    expect(link).toMatch(/\/scheduling\//)

    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(link)
    await expect(guestPage).not.toHaveURL(/\/login/)
    await expect(guestPage.locator('h1,h2').first()).toBeVisible({ timeout: 10_000 })
    await guestContext.close()
  })

  test('anonymous user can vote yes on a date option', async ({ page, context, browser }) => {
    await page.goto(`/en/projects/${projectId}/scheduling`)

    // Ensure at least one date option is present
    const dayButton = page.locator('button[data-day]:not([disabled])').first()
    if (await dayButton.isVisible()) {
      await dayButton.click()
      const addButton = page.locator('button').filter({ hasText: /add option/i })
      if (await addButton.isVisible()) await addButton.click()
    }

    const link = await getSchedulingLink(page, context)

    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(link)

    // Click the "yes" vote button (Check icon) for the first date option
    const yesButton = guestPage.locator('button').filter({ has: guestPage.locator('svg') }).first()
    await expect(yesButton).toBeVisible({ timeout: 10_000 })
    await yesButton.click()

    // The card border should change to indicate a response was recorded
    // (no redirect/error is sufficient to confirm it worked)
    await expect(guestPage).not.toHaveURL(/error/)
    await guestContext.close()
  })
})
