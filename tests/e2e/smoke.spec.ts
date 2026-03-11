import { expect, test } from '@playwright/test';

test('game bootstraps into the menu', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  await expect(page.locator('canvas')).toBeVisible();
  await expect(page).not.toHaveTitle(/404/i);
});
