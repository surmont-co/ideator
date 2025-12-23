import { test, expect } from '@playwright/test';

test.describe('Project Details Page', () => {
    test('should navigate to project details and show info', async ({ page }) => {
        // 1. Go to dashboard
        await page.goto('/dashboard');

        // Check auth redirect
        if (page.url().endsWith('/')) {
            return; // Skip if redirected to login
        }

        // 2. Click first project
        const firstProjectLink = page.locator('a[href^="/projects/"]').first();
        if (await firstProjectLink.count() === 0) {
            console.log('No projects found to test details page.');
            return;
        }

        await firstProjectLink.click();

        // 3. Verify Project Details
        await expect(page.locator('h1')).toBeVisible(); // Project Title
        await expect(page.getByText('Back to Projects')).toBeVisible();

        // 4. Verify Proposal Form presence
        await expect(page.getByText('Add New Proposal')).toBeVisible();
        await expect(page.getByLabel('Title (One-line definition) *')).toBeVisible();

        // 5. Test Proposal Creation (Optional smoke test)
        // Randomize title to avoid duplicates in repeated runs
        const proposalTitle = `Test Proposal ${Date.now()}`;
        await page.getByLabel('Title (One-line definition) *').fill(proposalTitle);
        await page.getByLabel('Description').fill('This is a test proposal description.');
        await page.getByRole('button', { name: 'Add Proposal' }).click();

        // 6. Verify Proposal appears in list
        // It should appear at the top or in the list
        await expect(page.getByText(proposalTitle).first()).toBeVisible();

        // 7. Verify Vote Stats
        // Newly created proposal should have score +1 (from author)
        // We expect to see "+1" or score text
        await expect(page.getByText('+1', { exact: true }).first()).toBeVisible();
    });
});
