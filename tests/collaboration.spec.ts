import { test, expect } from '@playwright/test';

test.describe('Collaboration Flow', () => {
    // Generate random user credentials for this run
    const ownerEmail = `owner_${Date.now()}@example.com`;
    const collaboratorEmail = `collab_${Date.now()}@example.com`;
    const password = 'password123';
    const projectName = `Test Project ${Date.now()}`;

    test('Owner can invite collaborator and collaborator can access', async ({ browser }) => {
        // 1. Create Owner Account and Project
        const ownerContext = await browser.newContext();
        const ownerPage = await ownerContext.newPage();

        // Sign up Owner
        await ownerPage.goto('/signup');
        await ownerPage.fill('#name', 'Alice Owner');
        await ownerPage.fill('#email', ownerEmail);
        await ownerPage.fill('#password', password);
        await ownerPage.fill('#confirmPassword', password);
        await ownerPage.click('button:has-text("Sign Up")');
        await expect(ownerPage).toHaveURL(/\/dashboard/);

        // Create Project (Onboarding Wizard)
        await ownerPage.click('a[href="/onboarding"]');
        await expect(ownerPage).toHaveURL(/.*onboarding/);

        // Step 1: Occasion
        // Click the button that contains "Wedding"
        await ownerPage.click('button:has-text("Wedding")');
        await ownerPage.click('button:has-text("Continue")');

        // Step 2: Date
        // Select a day. Calendar often has .rdp-day class.
        // We wait for calendar to appear.
        // Depending on shadcn Calendar/react-day-picker version
        const dayButton = ownerPage.locator('.rdp-day:not(.rdp-day_outside):not([disabled])').first();
        await dayButton.waitFor();
        await dayButton.click();
        await ownerPage.click('button:has-text("Continue")');

        // Step 3: Title
        await ownerPage.fill('#title', projectName);
        // Wait for validation/state update if needed
        await ownerPage.click('button:has-text("Continue")');

        // Step 4: Receiver
        await ownerPage.fill('#speechReceiverName', 'Sarah');
        // Final button might be "Create Project" or "Finish"
        // Adjust based on Wizard implementation.
        // If Wizard is generic, it might be "Finish" or "Complete".
        // OnboardingPage calls createProject onComplete.
        // Let's try finding a button that is NOT "Back".
        await ownerPage.click('button:has-text("Create Project")');

        // Wait for project to be created and redirected to dashboard or editor
        // OnboardingPage pushes to /dashboard
        await expect(ownerPage).toHaveURL(/\/dashboard/);

        // Navigate to project (find by text)
        await ownerPage.click(`text=${projectName}`);

        // Should land on overview or editor. 
        // Let's assume overview first, get ID.
        await ownerPage.waitForURL(/\/projects\/\d+/);
        const projectUrl = ownerPage.url();
        const projectId = projectUrl.match(/\/projects\/(\d+)/)?.[1];
        expect(projectId).toBeDefined();

        // 2. Invite Collaborator
        await ownerPage.goto(`/projects/${projectId}/collaborators`);
        await ownerPage.fill('input[id="email"]', collaboratorEmail);
        await ownerPage.fill('input[id="name"]', 'Bob Collaborator');
        await ownerPage.click('button:has-text("Add Collaborator")');
        await expect(ownerPage.locator(`text=${collaboratorEmail}`)).toBeVisible();

        // 3. Create Collaborator Account (Pre-requisite to login)
        const collabContext = await browser.newContext();
        const collabPage = await collabContext.newPage();

        await collabPage.goto('/signup');
        await collabPage.fill('#name', 'Bob Collaborator');
        await collabPage.fill('#email', collaboratorEmail);
        await collabPage.fill('#password', password);
        await collabPage.fill('#confirmPassword', password);
        await collabPage.click('button:has-text("Sign Up")');
        await expect(collabPage).toHaveURL(/\/dashboard/);

        // 4. Verify Access
        await collabPage.goto(`/projects/${projectId}/overview`);
        await expect(collabPage.locator(`text=${projectName}`)).toBeVisible();

        // 6. Verify Deletion (Back to Owner)
        await ownerPage.bringToFront();
        await ownerPage.goto(`/projects/${projectId}/collaborators`);

        // Handle confirm dialog
        ownerPage.on('dialog', dialog => dialog.accept());

        // Click delete button (trash icon)
        // Find the specific row for safety
        const row = ownerPage.locator('div', { has: ownerPage.locator(`text=${collaboratorEmail}`) }).last();
        // Inside row, find a button with trash icon. 
        // Or just the button with trash icon if only one.
        // Be specific:
        await ownerPage.click('button:has(svg.lucide-trash-2)');

        // Wait for success message or disappearance
        await expect(ownerPage.locator(`text=${collaboratorEmail}`)).not.toBeVisible();
        await expect(ownerPage.locator('text=Guest removed successfully')).toBeVisible();

        // Cleanup
        await ownerContext.close();
        await collabContext.close();
    });
});
