import { expect, type Page } from '@playwright/test'

/**
 * Shared e2e helpers for the collaboration/sharing specs. New specs import these;
 * the older specs keep their own local copies to avoid churn.
 */

/** Create a "Speech for the Occasion" wedding project via onboarding. Returns its numeric id. */
export async function createProject(page: Page, name: string): Promise<string> {
    await page.goto('/en/onboarding')
    await page.click('text=Speech for the Occasion')
    await page.click('text=Continue')
    await page.click('text=Wedding')
    await page.click('text=Continue')
    await page.click('text=Not Yet Known')
    await page.click('text=Continue')
    await page.fill('input#title', name)
    await page.fill('input#honoree', 'Test Honoree')
    await page.click('text=Create Project')
    await page.waitForURL(/\/en\/projects\/\d+/, { timeout: 15_000 })
    return page.url().match(/\/en\/projects\/(\d+)/)?.[1] ?? ''
}

/** Delete a project from its overview page (confirms by typing the exact name). */
export async function deleteProject(page: Page, projectId: string, name: string) {
    await page.goto(`/en/projects/${projectId}/overview`)
    await page.click('button:has-text("Delete")')
    const dialog = page.locator('[role="dialog"]')
    await dialog.locator('input').fill(name)
    await dialog.locator('button:has-text("Delete permanently")').click()
    await expect(page).toHaveURL(/\/en\/dashboard/, { timeout: 10_000 })
}

/**
 * Read the collaborator magic-link join URL from the collaborators page.
 * The link is auto-created on mount, so we just copy it. Returns the absolute URL.
 */
export async function getMagicJoinLink(page: Page, projectId: string): Promise<string> {
    await page.goto(`/en/projects/${projectId}/collaborators`)
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.click('button:has-text("Copy invite link")')
    return page.evaluate(() => navigator.clipboard.readText())
}

/** Invite a guest by email from the collaborators page (owner/manager only). */
export async function inviteGuestByEmail(
    page: Page,
    projectId: string,
    email: string,
    name = '',
) {
    await page.goto(`/en/projects/${projectId}/collaborators`)
    if (name) await page.fill('input[placeholder="Name (optional)"]', name)
    await page.fill('input[type="email"]', email)
    await page.click('button:has-text("Send")')
}
