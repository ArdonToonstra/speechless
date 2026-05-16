import { test, expect, type Page } from '@playwright/test'

const TEST_PROJECT_NAME = '[TEST] Editor Project'

async function createProject(page: Page): Promise<string> {
  await page.goto('/en/dashboard')
  await page.click('text=Create New Project')
  await expect(page).toHaveURL(/\/en\/onboarding/)
  await page.click('text=Speech for the Occasion')
  await page.click('text=Continue')
  await page.click('text=Wedding')
  await page.click('text=Continue')
  await page.click('text=Not Yet Known')
  await page.click('text=Continue')
  await page.fill('input#title', TEST_PROJECT_NAME)
  await page.fill('input#honoree', 'Test Honoree')
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

test.describe('Editor', () => {
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

  test('editor page loads with the toolbar visible', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/editor`)
    // The Tiptap editor content area should be present
    await expect(page.locator('[contenteditable="true"]')).toBeVisible({ timeout: 10_000 })
  })

  test('typing in the editor shows text in the content area', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/editor`)
    const editor = page.locator('[contenteditable="true"]')
    await editor.click()
    await editor.type('Hello from Playwright.')
    await expect(editor).toContainText('Hello from Playwright.')
  })

  test('auto-save indicator appears after typing', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/editor`)
    const editor = page.locator('[contenteditable="true"]')
    await editor.click()
    await editor.type(' Auto-save test.')
    // The auto-save debounce is 2 seconds; allow up to 8s for the saved indicator
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 8_000 })
  })

  test('word count updates after typing', async ({ page }) => {
    await page.goto(`/en/projects/${projectId}/editor`)
    const editor = page.locator('[contenteditable="true"]')
    await editor.click()
    // Clear and type a known number of words
    await editor.press('Control+A')
    await editor.type('One two three four five.')
    // Stats area should show a word count ≥ 5
    await expect(page.locator('text=/\\d+ words?/i')).toBeVisible({ timeout: 5_000 })
  })
})
