import { test, expect } from '@playwright/test';
import { Game } from '../src/game';
import { emptyInput } from '../src/types';
import { hasLineOfSight } from '../src/bullet';

test('normaliza diagonal e bloqueia paredes comuns sem causar dano', () => {
  const straight = new Game();
  const diagonal = new Game();
  straight.update(0.1, { ...emptyInput(), x: 1 });
  diagonal.update(0.1, { ...emptyInput(), x: 1, y: -1 });
  expect(Math.hypot(diagonal.player.x - 480, diagonal.player.y - 440)).toBeCloseTo(straight.player.x - 480);
  straight.player.x = 76;
  straight.update(0.1, { ...emptyInput(), x: -1 });
  expect(straight.player.x).toBeGreaterThanOrEqual(76);
  expect(straight.player.lives).toBe(3);
  straight.update(0.1, { ...emptyInput(), x: -1 });
  expect(straight.player.lives).toBe(3);
});

test('shuriken elimina samurai, pontua, abre saída e avança setor', () => {
  const game = new Game();
  game.enemies = [{ x: 480, y: 360, facing: 0, moving: false, cooldown: 10, variant: 0, hp: 3, maxHp: 3, flash: 0, slow: 0 }];
  for (let frame = 0; frame < 420; frame++) game.update(1 / 120, { ...emptyInput(), fire: true });
  expect(game.enemies).toHaveLength(0);
  expect(game.score).toBe(100);
  expect(game.exitOpen).toBe(true);
  game.player.x = 480;
  game.player.y = 60;
  game.update(1 / 120, emptyInput());
  expect(game.sector).toBe(2);
  expect(game.score).toBe(150);
  expect(game.bullets).toHaveLength(0);
  expect(game.enemies.length).toBeGreaterThan(0);
});

test('tiro hostil causa morte, congela jogo e permite reinício completo', () => {
  const game = new Game();
  game.player.lives = 1;
  game.bullets.push({ x: 480, y: 440, vx: 0, vy: 0, owner: 'enemy', life: 2 });
  game.update(1 / 120, emptyInput());
  expect(game.over).toBe(true);
  const previousX = game.player.x;
  game.update(0.1, { ...emptyInput(), x: 1 });
  expect(game.player.x).toBe(previousX);
  game.reset();
  expect(game.player.lives).toBe(3);
  expect(game.sector).toBe(1);
  expect(game.score).toBe(0);
  expect(game.over).toBe(false);
});

test('esquiva acelera o jogador, evita dano e respeita recarga', () => {
  const game = new Game();
  game.update(1 / 120, { ...emptyInput(), x: 1, dash: true });
  expect(game.player.dashTime).toBeGreaterThan(0);
  expect(game.player.dashCooldown).toBeGreaterThan(0);
  const lives = game.player.lives;
  game.bullets.push({ x: game.player.x + 4, y: game.player.y, vx: 0, vy: 0, owner: 'enemy', life: 1 });
  game.update(1 / 120, { ...emptyInput(), x: 1, dash: true });
  expect(game.player.lives).toBe(lives);
  for (let frame = 0; frame < 30; frame++) game.update(1 / 120, { ...emptyInput(), dash: true });
  expect(game.player.dashTime).toBe(0);
  expect(game.player.dashCooldown).toBeGreaterThan(0);
});

test('samurais contornam pilares e tiros não atravessam paredes', () => {
  const game = new Game();
  game.player.x = 480;
  game.player.y = 440;
  game.player.invulnerable = 100;
  game.enemies = [{ x: 272, y: 112, facing: 0, moving: false, cooldown: 100, variant: 0, hp: 3, maxHp: 3, flash: 0, slow: 0 }];
  expect(hasLineOfSight(game.enemies[0], { x: 272, y: 300 }, game.walls)).toBe(false);
  for (let frame = 0; frame < 2400; frame++) game.update(1 / 120, emptyInput());
  expect(Math.hypot(game.enemies[0].x - game.player.x, game.enemies[0].y - game.player.y)).toBeLessThan(55);
});
