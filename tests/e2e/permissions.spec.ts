import { test, expect } from '@playwright/test'
import { AUTH_FILE, AUTH_FILE_2 } from './constants'
import { createProject, deleteProject } from './helpers'

const PROJECT_NAME = '[TEST] Permissions Project'

/**
 * Regression for the by-id access boundary:
 * - The [id] layout blocks non-members entirely (404 on any subpage).
 * - The invites page additionally requires manage rights, so an accepted
 *   non-manager member is blocked there even though they can see other pages.
 *
 * User A owns the project; User B is the outsider / non-manager.
 */
test.describe('Project access control', () => {
    let projectId: string

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE })
        const page = await context.newPage()
        projectId = await createProject(page, PROJECT_NAME)
        await context.close()
    })

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE })
        const page = await context.newPage()
        await deleteProject(page, projectId, PROJECT_NAME)
        await context.close()
    })

    // All tests in this file act as User B (a different account).
    test.use({ storageState: AUTH_FILE_2 })

    for (const sub of ['overview', 'invites', 'submissions', 'collaborators', 'settings']) {
        test(`non-member gets 404 on /${sub} and sees no project data`, async ({ page }) => {
            const res = await page.goto(`/en/projects/${projectId}/${sub}`)
            expect(res?.status()).toBe(404)
            // The project name (and therefore its contents) must not leak on the 404 page.
            await expect(page.getByText(PROJECT_NAME)).toHaveCount(0)
        })
    }
})
