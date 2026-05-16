import { test, expect, type Page } from '@playwright/test'

const TEST_PROJECT_NAME = '[TEST] Playwright Project'

/** Walk through the onboarding wizard to create a test project. Returns the project URL. */
async function createTestProject(page: Page, name = TEST_PROJECT_NAME): Promise<string> {
  await page.goto('/en/onboarding')

  // Step 1: Speech type
  await page.click('text=Speech for the Occasion')
  await page.click('text=Continue')

  // Step 2: Occasion type
  await page.click('text=Wedding')
  await page.click('text=Continue')

  // Step 3: Date
  await page.click('text=Not Yet Known')
  await page.click('text=Continue')

  // Step 4: Context — title + honoree required
  await page.fill('input#title', name)
  await page.fill('input#honoree', 'Playwright Honoree')
  await page.click('text=Create Project')

  // Wait for redirect to the new project
  await page.waitForURL(/\/en\/projects\/\d+/, { timeout: 15_000 })
  return page.url()
}

/** Delete a project via its overview page. */
async function deleteTestProject(page: Page, projectUrl: string) {
  // Navigate to the project overview
  const projectBase = projectUrl.replace(/\/(editor|overview|questionnaire|scheduling).*$/, '')
  await page.goto(`${projectBase}/overview`)
  await page.click('button:has-text("Delete")')
  // Confirm by typing the project name
  const dialog = page.locator('[role="dialog"]')
  await dialog.locator('input').fill(TEST_PROJECT_NAME)
  await dialog.locator('button:has-text("Delete permanently")').click()
  await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 })
}

test.describe('Projects', () => {
  test('dashboard shows the Your Speeches heading', async ({ page }) => {
    await page.goto('/en/dashboard')
    await expect(page.locator('h1')).toContainText('Your Speeches')
  })

  test('dashboard has a Create New Project link', async ({ page }) => {
    await page.goto('/en/dashboard')
    // Empty state shows "Start First Project"; populated state shows "Create New Project" — both link to /onboarding
    await expect(page.locator('a[href*="/onboarding"]').first()).toBeVisible()
  })

  test('create a project via onboarding and land on project page', async ({ page }) => {
    const projectUrl = await createTestProject(page)
    expect(projectUrl).toMatch(/\/en\/projects\/\d+/)

    // Clean up
    await deleteTestProject(page, projectUrl)
  })

  test('newly created project appears on dashboard', async ({ page }) => {
    const projectUrl = await createTestProject(page)

    await page.goto('/en/dashboard')
    await expect(page.getByText(TEST_PROJECT_NAME)).toBeVisible()

    // Clean up
    await deleteTestProject(page, projectUrl)
  })

  test('deleted project is removed from dashboard', async ({ page }) => {
    const projectUrl = await createTestProject(page)
    await deleteTestProject(page, projectUrl)

    await page.goto('/en/dashboard')
    // Project name should no longer be visible
    await expect(page.getByText(TEST_PROJECT_NAME)).not.toBeVisible()
  })
})
