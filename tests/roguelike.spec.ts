import { test, expect } from '@playwright/test';
import { Game } from '../src/game';
import { createEnemies } from '../src/enemy';
import { emptyInput } from '../src/types';
import { Dungeon } from '../src/dungeon';

test('cadência começa em um tiro por segundo e samurais suportam três ou quatro hits', () => {
  const game = new Game(42);
  game.enemies = [];
  for (let frame = 0; frame < 120; frame++) game.update(1 / 120, { ...emptyInput(), fire: true });
  expect(game.shots).toBe(1);
  for (let frame = 0; frame < 3; frame++) game.update(1 / 120, { ...emptyInput(), fire: true });
  expect(game.shots).toBe(2);
  expect(createEnemies(1).map(enemy => enemy.hp)).toEqual([3, 4, 3]);
  game.enemies = [createEnemies(1)[0]];
  game.enemies[0].x = 400;
  game.enemies[0].y = 280;
  for (let hit = 0; hit < 3; hit++) {
    const enemy = game.enemies[0];
    game.bullets.push({ x: enemy.x, y: enemy.y, vx: 0, vy: 0, owner: 'player', life: 1 });
    game.update(1 / 120, emptyInput());
    expect(game.enemies.length).toBe(hit === 2 ? 0 : 1);
  }
});

test('golpe acerta alvos à frente, respeita alcance, paredes e recarga', () => {
  const game = new Game();
  const enemy = createEnemies(1)[0];
  game.enemies = [enemy];
  enemy.x = 480;
  enemy.y = 392;
  game.update(1 / 120, { ...emptyInput(), melee: true });
  expect(enemy.hp).toBe(1);
  game.update(1 / 120, { ...emptyInput(), melee: true });
  expect(enemy.hp).toBe(1);
  game.player.meleeCooldown = 0;
  enemy.y = 480;
  game.update(1 / 120, { ...emptyInput(), melee: true });
  expect(enemy.hp).toBe(1);
  game.player.meleeCooldown = 0;
  enemy.x = 480;
  enemy.y = 392;
  game.walls.push({ x: 460, y: 408, width: 40, height: 8 });
  game.update(1 / 120, { ...emptyInput(), melee: true });
  expect(enemy.hp).toBe(1);
});

test('salas laterais podem ser revisitadas com loot preservado, sem repetir pontuação', () => {
  const game = new Game(42);
  game.enemies = [];
  game.items = [{ x: 400, y: 288, kind: 'frost' }];
  game.update(1 / 120, emptyInput());
  const originalRoom = game.dungeon.current.id;
  game.player.x = 60;
  game.player.y = 288;
  game.update(1 / 120, emptyInput());
  expect(game.dungeon.current.id).not.toBe(originalRoom);
  game.enemies = [];
  game.update(1 / 120, emptyInput());
  const score = game.score;
  game.player.x = 900;
  game.player.y = 288;
  game.update(1 / 120, emptyInput());
  expect(game.dungeon.current.id).toBe(originalRoom);
  expect(game.enemies).toHaveLength(0);
  expect(game.items.some(item => item.kind === 'frost')).toBe(true);
  expect(game.score).toBe(score);
  expect(game.dungeon.rooms.filter(room => room.visited)).toHaveLength(2);
});

test('itens de gelo e lâmina mudam o combate e morte reinicia o inventário e o mapa', () => {
  const game = new Game();
  game.items = [{ x: 480, y: 440, kind: 'frost' }, { x: 480, y: 440, kind: 'blade' }];
  game.update(1 / 120, emptyInput());
  expect(game.inventory.frost).toBe(1);
  expect(game.inventory.blade).toBe(1);
  const enemy = createEnemies(1)[0];
  enemy.x = 480;
  enemy.y = 390;
  game.enemies = [enemy];
  game.bullets.push({ x: 480, y: 390, vx: 0, vy: 0, owner: 'player', life: 1 });
  game.update(1 / 120, emptyInput());
  expect(enemy.slow).toBeGreaterThan(0);
  game.update(1 / 120, { ...emptyInput(), melee: true });
  expect(game.enemies).toHaveLength(0);
  game.reset();
  expect(game.inventory.frost).toBe(0);
  expect(game.inventory.blade).toBe(0);
  expect(game.dungeon.rooms.filter(room => room.visited)).toHaveLength(1);
});

test('derrotar guardião permite próximo andar preservando a build e gera novo mapa', () => {
  const game = new Game(42);
  game.startBossChallenge();
  game.boss!.hp = 1;
  game.bullets.push({ x: game.boss!.x, y: game.boss!.y, vx: 0, vy: 0, owner: 'player', life: 1 });
  game.update(1 / 120, emptyInput());
  game.player.x = 480;
  game.player.y = 60;
  game.update(1 / 120, emptyInput());
  expect(game.dungeon.floor).toBe(2);
  expect(game.sector).toBe(4);
  expect(game.inventory.spread).toBe(1);
  expect(game.inventory.rapid).toBe(1);
  expect(game.enemies.length).toBeGreaterThan(0);
  expect(new Dungeon(1, 42).rooms.map(room => room.id)).not.toEqual(new Dungeon(1, 175).rooms.map(room => room.id));
});

test('upgrade maximizado dá bônus sem ultrapassar dois níveis', () => {
  const game = new Game();
  game.inventory.rapid = 2;
  game.items = [{ x: 480, y: 440, kind: 'rapid' }];
  game.update(1 / 120, emptyInput());
  expect(game.inventory.rapid).toBe(2);
  expect(game.score).toBe(25);
  expect(game.items).toHaveLength(0);
});
