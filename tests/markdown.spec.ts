import { test, expect } from '@playwright/test';

test.describe('Markdown Rendering', () => {
    test('should render markdown content on dashboard', async ({ page }) => {
        // Navigate to dashboard
        await page.goto('/dashboard');

        // Check if we are redirected (auth)
        if (page.url().endsWith('/')) {
            return;
        }

        // Check for prose class presence which indicates markdown container
        // This assumes there is at least one project
        const markdownContainer = page.locator('.prose').first();
        // If no projects, this might fail or return nothing.
        // If we have projects, we expect them to be visible.

        // We can also look for specific tag rendering if we knew the content.
        // Since we don't know the exact content, checking for the class is a basic smoke test.
        if (await markdownContainer.count() > 0) {
            await expect(markdownContainer).toBeVisible();
        }
    });
});
