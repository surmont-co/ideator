import { test, expect } from '@playwright/test';

test.describe('Navigation Security', () => {
    test('should redirect unauthenticated users from protected routes to splash', async ({ page }) => {
        const protectedRoutes = [
            '/dashboard',
            '/projects/new',
            '/projects/my',
            '/contributions'
        ];

        for (const route of protectedRoutes) {
            await page.goto(route);
            await expect(page).toHaveURL(/.*\/$/); // Should end in / (root/splash)
            await expect(page.getByText('Ideator')).toBeVisible();
            await expect(page.getByText('Platforma de prioritizare democratică')).toBeVisible();
        }
    });
});
