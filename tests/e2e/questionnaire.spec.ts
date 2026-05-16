import { test, expect, type Page, type BrowserContext } from '@playwright/test'

const TEST_PROJECT_NAME = '[TEST] Questionnaire Project'

async function createProject(page: Page): Promise<string> {
  await page.goto('/en/onboarding')
  await page.click('text=Speech for the Occasion')
  await page.click('text=Continue')
  await page.click('text=Wedding')
  await page.click('text=Continue')
  await page.click('text=Not Yet Known')
  await page.click('text=Continue')
  await page.fill('input#title', TEST_PROJECT_NAME)
  await page.fill('input#honoree', 'Questionnaire Honoree')
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

/** Get the questionnaire public link by clicking the Copy button and reading the clipboard. */
async function getQuestionnaireLink(page: Page, context: BrowserContext): Promise<string> {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.click('button:has-text("Copy questionnaire link")')
  return page.evaluate(() => navigator.clipboard.readText())
}

test.describe('Questionnaire', () => {
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

  test('questionnaire page loads and shows the editor', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/questionnaire`)
    await expect(page.getByText('Questionnaire')).toBeVisible()
  })

  test('owner can add a custom question', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/questionnaire`)
    const addButton = page.locator('button').filter({ hasText: /add question/i })
    await addButton.click()
    // A new textarea should appear
    const textareas = page.locator('textarea')
    await expect(textareas.last()).toBeVisible()
    await textareas.last().fill('What is your favourite memory?')
    // Auto-save is debounced; just verify the field holds the value
    await expect(textareas.last()).toHaveValue('What is your favourite memory?')
  })

  test('public questionnaire link is accessible without auth', async ({
    page,
    context,
    browser,
  }) => {
    await page.goto(`/en/projects/${projectId}/questionnaire`)
    const link = await getQuestionnaireLink(page, context)
    expect(link).toMatch(/\/questionnaire\//)

    // Open in a fresh unauthenticated context
    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(link)
    // The public form should show the project title area, not redirect to login
    await expect(guestPage).not.toHaveURL(/\/login/)
    await expect(guestPage.locator('h1,h2').first()).toBeVisible({ timeout: 10_000 })
    await guestContext.close()
  })

  test('guest can submit the questionnaire', async ({ page, context, browser }) => {
    await page.goto(`/en/projects/${projectId}/questionnaire`)
    const link = await getQuestionnaireLink(page, context)

    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(link)

    // Step 1: enter submitter name
    await guestPage.fill('input#submitterName', 'Playwright Guest')
    await guestPage.click('text=Continue')

    // Answer any text question(s)
    const textareas = guestPage.locator('textarea')
    if (await textareas.count() > 0) {
      await textareas.first().fill('My favourite memory from Playwright.')
    }

    // Submit the form
    await guestPage.click('button:has-text("Submit")')

    // Success screen
    await expect(guestPage.getByText(/thank you/i)).toBeVisible({ timeout: 10_000 })
    await guestContext.close()
  })

  test('submission appears in the submissions list for the owner', async ({
    page,
    context,
    browser,
  }) => {
    // Ensure at least one submission exists (may have been submitted in previous test)
    await page.goto(`/en/projects/${projectId}/questionnaire`)
    const link = await getQuestionnaireLink(page, context)

    const guestContext = await browser.newContext()
    const guestPage = await guestContext.newPage()
    await guestPage.goto(link)
    await guestPage.fill('input#submitterName', 'Submissions Test Guest')
    await guestPage.click('text=Continue')
    const textareas = guestPage.locator('textarea')
    if (await textareas.count() > 0) {
      await textareas.first().fill('Submission check answer.')
    }
    await guestPage.click('button:has-text("Submit")')
    await expect(guestPage.getByText(/thank you/i)).toBeVisible({ timeout: 10_000 })
    await guestContext.close()

    // Check submissions page
    await page.goto(`/en/projects/${projectId}/submissions`)
    await expect(page.getByText('Submissions Test Guest')).toBeVisible({ timeout: 10_000 })
  })
})
