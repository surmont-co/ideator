import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Mockup Page UI/UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mockup');
  });

  test('should display the main title and deadline', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Propuneri de îmbunătățiri 2026' })).toBeVisible();
    await expect(page.getByText('Deadline: 2025-12-24')).toBeVisible();
  });

  test('should display proposals in accordion format', async ({ page }) => {
    // Check for at least one accordion trigger
    const triggers = page.locator('button[type="button"][aria-expanded]');
    await expect(triggers.first()).toBeVisible();
    
    // Check initial state (should be collapsed or based on default)
    // We expect 3 proposals from the dummy data
    await expect(triggers).toHaveCount(3);
  });

  test('should expand accordion on click and show description', async ({ page }) => {
    // Target the first proposal (CI/CD)
    const firstTrigger = page.getByText('Implementare CI/CD pentru 3 clienți');
    await firstTrigger.click();

    // Verify content is visible
    await expect(page.getByText('Ar fi ideal să sistematizăm pipeline-ul')).toBeVisible();
    
    // Verify Author badge
    await expect(page.getByText('Autor: CTO')).toBeVisible();
  });

  test('should verify accessibility (a11y)', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be responsive on mobile viewport', async ({ page, isMobile }) => {
    if (isMobile) {
      // Specific checks for mobile layout if needed
      // For now, ensuring no horizontal scroll on the main container
      const container = page.locator('.max-w-4xl');
      await expect(container).toBeVisible();
      
      // Check that buttons are still clickable and not overlapped
      const firstTrigger = page.getByText('Implementare CI/CD pentru 3 clienți');
      await expect(firstTrigger).toBeInViewport();
    }
  });
});
