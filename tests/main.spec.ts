import { test, expect } from '@playwright/test';

test('carrega o menu e inicia o jogo sem erros', async ({ page }) => {
  const errosDePagina: string[] = [];
  const respostasComFalha: string[] = [];

  page.on('pageerror', (erro) => errosDePagina.push(erro.message));
  page.on('response', (resposta) => {
    if (resposta.status() >= 400) {
      respostasComFalha.push(`${resposta.status()} ${resposta.url()}`);
    }
  });

  await page.goto('http://localhost:4173/');

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 15000 });

  const botaoJogar = page.locator('#excalibur-play');
  if (await botaoJogar.isVisible()) {
    await botaoJogar.click();
  }

  await page.waitForTimeout(1000);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);

  expect(errosDePagina).toEqual([]);
  expect(respostasComFalha).toEqual([]);
});
