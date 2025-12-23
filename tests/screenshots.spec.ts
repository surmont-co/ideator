import { test } from '@playwright/test';

test('capture-screenshots', async ({ page }) => {
  // Landing Page
  await page.goto('/');
  await page.emulateMedia({ colorScheme: 'light' });
  await page.screenshot({ path: 'docs/screenshots/home-light.png' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'docs/screenshots/home-dark.png' });

  // Mockup Page
  await page.goto('/mockup');
  
  // Light Mode
  await page.emulateMedia({ colorScheme: 'light' });
  await page.screenshot({ path: 'docs/screenshots/light-mode.png', fullPage: true });
  
  // Dark Mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.screenshot({ path: 'docs/screenshots/dark-mode.png', fullPage: true });
  
  // Open one accordion for visual check
  await page.getByText('Implementare CI/CD pentru 3 clienți').click();
  await page.screenshot({ path: 'docs/screenshots/dark-mode-expanded.png', fullPage: true });
});
