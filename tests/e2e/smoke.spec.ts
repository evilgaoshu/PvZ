import { expect, test } from '@playwright/test';

test('game bootstraps into the menu', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  await expect(page.locator('canvas')).toBeVisible();
  await expect(page).not.toHaveTitle(/404/i);
});

test('adventure mode starts the game scene', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const box = await canvas.boundingBox();
  if (!box) {
    throw new Error('Canvas bounding box is unavailable');
  }

  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.waitForTimeout(1000);

  const activeScenes = await page.evaluate(() => {
    const game = (window as Window & { __debugGame?: { getPhaserGame?: () => any } })
      .__debugGame?.getPhaserGame?.();
    return (
      game?.scene?.getScenes?.(false)?.filter((scene: any) => scene.scene.isActive())?.map((scene: any) => scene.scene.key) || []
    );
  });

  expect(activeScenes).toContain('GameScene');
});
