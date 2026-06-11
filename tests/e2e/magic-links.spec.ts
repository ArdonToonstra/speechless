import { test, expect } from '@playwright/test'
import { AUTH_FILE, AUTH_FILE_2 } from './constants'
import { createProject, deleteProject, getMagicJoinLink } from './helpers'

const PROJECT_NAME = '[TEST] Magic Link Project'

/**
 * Collaborator magic-link join flow (/join/[token]). User A owns the project and
 * generates the link; User B joins through it. Serial so the "join" state persists
 * into the privilege-boundary test that depends on it.
 */
test.describe.configure({ mode: 'serial' })

test.describe('Magic link join', () => {
    let projectId: string
    let joinPath: string

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE })
        const page = await context.newPage()
        projectId = await createProject(page, PROJECT_NAME)
        const joinUrl = await getMagicJoinLink(page, projectId)
        expect(joinUrl).toMatch(/\/join\//)
        joinPath = new URL(joinUrl).pathname
        await context.close()
    })

    test.afterAll(async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE })
        const page = await context.newPage()
        await deleteProject(page, projectId, PROJECT_NAME)
        await context.close()
    })

    test('a garbage token shows the invalid-link screen', async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE_2 })
        const page = await context.newPage()
        await page.goto('/en/join/deadbeefdeadbeefdeadbeef')
        await expect(page.getByText('Invalid Link')).toBeVisible()
        await context.close()
    })

    test('the owner cannot join their own project via the link', async ({ browser }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE })
        const page = await context.newPage()
        await page.goto(joinPath)
        await expect(page.getByText('Unable to Join')).toBeVisible()
        await expect(page.getByText('You are the owner of this project')).toBeVisible()
        await context.close()
    })

    test('a second user joins as collaborator, and re-joining reports already-a-member', async ({
        browser,
    }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE_2 })
        const page = await context.newPage()

        await page.goto(joinPath)
        await expect(page.getByText('Welcome to the Team!')).toBeVisible({ timeout: 10_000 })

        // Re-joining: already a member → redirected into the project
        await page.goto(joinPath)
        await expect(page).toHaveURL(new RegExp(`/projects/${projectId}`), { timeout: 10_000 })

        await context.close()
    })

    test('the joined collaborator can view collaborators but is blocked from invites', async ({
        browser,
    }) => {
        const context = await browser.newContext({ storageState: AUTH_FILE_2 })
        const page = await context.newPage()

        const collaborators = await page.goto(`/en/projects/${projectId}/collaborators`)
        expect(collaborators?.status()).toBe(200)

        // Invites is manage-only — a plain collaborator must be denied.
        const invites = await page.goto(`/en/projects/${projectId}/invites`)
        expect(invites?.status()).toBe(404)

        await context.close()
    })
})
