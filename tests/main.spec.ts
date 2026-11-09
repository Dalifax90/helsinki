import { test, expect } from '@playwright/test';

test('renderiza, inicia, move, dispara, pausa e controla áudio sem falhas', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Entrar no templo' })).toBeEnabled();
  await expect(page.locator('canvas')).toHaveAttribute('data-ready', 'true');
  const visibleColors = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    const colors = new Set<string>();
    for (let index = 0; index < pixels.length; index += 64) colors.add(`${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`);
    return colors.size;
  });
  expect(visibleColors).toBeGreaterThan(100);
  await page.screenshot({ path: 'test-results/menu.png', fullPage: true });
  await page.getByRole('button', { name: 'Entrar no templo' }).click();
  await expect(page.locator('#status')).toContainText('Elimine');
  const initial = Number(await page.locator('canvas').getAttribute('data-player-x'));
  await page.keyboard.down('d');
  await page.waitForTimeout(250);
  await page.keyboard.up('d');
  expect(Number(await page.locator('canvas').getAttribute('data-player-x'))).toBeGreaterThan(initial + 20);
  await page.keyboard.down('Space');
  await expect(page.locator('canvas')).toHaveAttribute('data-shots', /^[1-9]\d*$/);
  await page.keyboard.up('Space');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Pausado.' })).toBeVisible();
  const paused = await page.locator('canvas').getAttribute('data-player-x');
  await page.keyboard.down('a');
  await page.waitForTimeout(150);
  await page.keyboard.up('a');
  expect(await page.locator('canvas').getAttribute('data-player-x')).toBe(paused);
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.screenshot({ path: 'test-results/gameplay.png', fullPage: true });
  await page.keyboard.press('m');
  await expect(page.getByRole('button', { name: 'Ativar som' })).toBeVisible();
  expect(failures).toEqual([]);
});

test('falha nos assets mostra erro e permite tentar novamente', async ({ page }) => {
  await page.route('**/characters/ninja_blue.png', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'O templo não carregou.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
  await page.unroute('**/characters/ninja_blue.png');
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByRole('button', { name: 'Entrar no templo' })).toBeEnabled();
});

test('cabe em tela pequena e inicia por teclado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Entrar no templo' })).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await page.keyboard.press('Enter');
  await expect(page.locator('#overlay')).toBeHidden();
  await page.locator('canvas').scrollIntoViewIfNeeded();
  await expect(page.locator('.map-room.current')).toBeVisible();
  const frameBounds = await page.locator('.game-frame').boundingBox();
  const canvasBounds = await page.locator('canvas').boundingBox();
  expect(canvasBounds!.width).toBeLessThanOrEqual(frameBounds!.width);
  await expect(page.locator('.minimap')).toBeInViewport();
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('começa sem buffs e ativa nova pelo botão', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Entrar no templo' }).click();
  await expect(page.locator('#slot-spread')).toHaveAttribute('aria-label', 'Leque de shurikens: 0/2');
  await expect(page.locator('#slot-vitality')).toHaveAttribute('aria-label', 'Coração ancestral: 0/3');
  await expect(page.locator('#hearts')).toHaveAttribute('aria-label', '3 de 3 vidas');
  await page.keyboard.press('e');
  await page.getByRole('button', { name: 'Usar nova espiritual' }).click();
  await expect(page.locator('#nova-status')).toContainText('8s');
  await page.screenshot({ path: 'test-results/powers.png', fullPage: true });
  await page.keyboard.press('Escape');
  const cooldown = await page.locator('#nova-status').textContent();
  await page.waitForTimeout(200);
  expect(await page.locator('#nova-status').textContent()).toBe(cooldown);
});

test('desafio inicia luta real, tiros reduzem vida e investida recebe aviso', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Desafiar o guardião' }).click();
  await expect(page.locator('#sector')).toHaveText('03');
  const health = page.getByRole('progressbar', { name: 'Vida de Akuma' });
  await expect(health).toBeVisible();
  await expect(health).toHaveAttribute('aria-valuenow', '30');
  await page.keyboard.down('Space');
  await expect.poll(async () => Number(await health.getAttribute('aria-valuenow'))).toBeLessThan(30);
  await page.keyboard.up('Space');
  await page.keyboard.press('q');
  await expect(page.locator('#nova-status')).toContainText('s');
  await page.screenshot({ path: 'test-results/boss.png', fullPage: true });
  await expect(page.locator('#boss-phase')).toHaveText('INVESTIDA! SAIA DA MARCA', { timeout: 6500 });
  await page.screenshot({ path: 'test-results/boss-warning.png', fullPage: true });
  expect(failures).toEqual([]);
});
