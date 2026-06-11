import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './constants'
import { createProject, deleteProject, inviteGuestByEmail } from './helpers'

const PROJECT_NAME = '[TEST] Guest Invite Project'
const INVITEE_EMAIL = 'invitee@example.test'
const INVITEE_NAME = 'Invitee Person'

test.describe('Guest invite by email', () => {
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

    test('owner can invite a collaborator by email and sees them in the team list', async ({
        page,
    }) => {
        await inviteGuestByEmail(page, projectId, INVITEE_EMAIL, INVITEE_NAME)

        // The action inserts the guest before sending the email (email failures are
        // swallowed), so a success toast appears and the invitee shows up after refresh.
        await expect(page.getByText('Invite sent!')).toBeVisible({ timeout: 10_000 })
        await expect(page.getByText(INVITEE_EMAIL)).toBeVisible({ timeout: 10_000 })
    })
})
