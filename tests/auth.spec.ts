import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    const timestamp = Date.now();
    const userEmail = `auth_user_${timestamp}@example.com`;
    const password = 'password123';
    const userName = 'Auth User';

    test('Sign Up Flow', async ({ page }) => {
        // Navigate to signup page
        await page.goto('/signup');

        // Fill in signup form
        await page.fill('#name', userName);
        await page.fill('#email', userEmail);
        await page.fill('#password', password);
        await page.fill('#confirmPassword', password);

        // Submit form
        await page.click('button:has-text("Sign Up")');

        // Verify redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);

        // Verify user name is potentially visible or welcome message exists (optional, depending on dashboard)
        // For now, URL check is strong enough for "can sign up"
    });

    test('Sign In Flow', async ({ page }) => {
        // IMPORTANT: Because tests run in parallel/isolation, we need to create a user for this specific test
        // OR rely on the user created in the previous test if running serially? 
        // Playwright tests should be isolated. 
        // So we need to create a user first. 
        // Ideally we'd do this via API to be fast, but for now we can do it via UI or just use a new user.

        // Let's use a NEW user for the sign-in test to ensure isolation.
        const signInEmail = `signin_${timestamp}@example.com`;

        // 1. Create user (Sign Up) - Helper step
        await page.goto('/signup');
        await page.fill('#name', 'Sign In User');
        await page.fill('#email', signInEmail);
        await page.fill('#password', password);
        await page.fill('#confirmPassword', password);
        await page.click('button:has-text("Sign Up")');
        await expect(page).toHaveURL(/\/dashboard/);

        // 2. Sign Out
        // Need to find sign out button. Usually in a user menu or settings.
        // If unknown, we can clear cookies or just goto login? 
        // Clearing cookies/storage is cleaner for "Sign In" test.
        await page.context().clearCookies();

        // 3. Sign In
        await page.goto('/login');

        await page.fill('#email', signInEmail);
        await page.fill('#password', password);
        await page.click('button:has-text("Sign In")'); // Adjust text if it's "Log In"

        // 4. Verify Success
        await expect(page).toHaveURL(/\/dashboard/);
    });
});
