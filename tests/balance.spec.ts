import { test, expect } from '@playwright/test';
import { Game } from '../src/game';
import { Dungeon } from '../src/dungeon';
import { emptyInput } from '../src/types';

test('combate comum não garante buff, tesouro e chefe garantem e a semente mantém o loot', () => {
  const dungeon = new Dungeon(1, 42);
  const rewards = dungeon.rooms.filter(room => room.kind === 'combat').map(room => {
    dungeon.current = room;
    return dungeon.reward();
  });
  expect(rewards.some(items => items.length === 0)).toBe(true);
  expect(rewards.flat().every(item => item.kind === 'heart')).toBe(true);
  for (const room of dungeon.rooms.filter(room => room.kind !== 'combat')) {
    dungeon.current = room;
    expect(dungeon.reward().some(item => item.kind !== 'heart')).toBe(true);
    expect(dungeon.reward()).toEqual(dungeon.reward());
  }
  const game = new Game(42);
  expect(game.items).toHaveLength(0);
});

test('vitalidade aumenta limite, cura um coração e poções usam a nova vida máxima', () => {
  const game = new Game();
  game.player.lives = 2;
  game.items = [{ x: 480, y: 440, kind: 'vitality' }];
  game.update(1 / 120, emptyInput());
  expect(game.player.maxLives).toBe(4);
  expect(game.player.lives).toBe(3);
  expect(game.inventory.vitality).toBe(1);
  game.items = [{ x: 480, y: 440, kind: 'heart' }];
  game.update(1 / 120, emptyInput());
  expect(game.player.lives).toBe(4);
  for (let count = 0; count < 3; count++) {
    game.items = [{ x: 480, y: 440, kind: 'vitality' }];
    game.update(1 / 120, emptyInput());
  }
  expect(game.player.maxLives).toBe(6);
  expect(game.player.lives).toBe(6);
  expect(game.inventory.vitality).toBe(3);
  expect(game.score).toBe(25);
  game.reset();
  expect(game.player.maxLives).toBe(3);
  expect(game.inventory.vitality).toBe(0);
});

test('paredes comuns e portas bloqueiam sem dano, obstáculos perigosos respeitam invulnerabilidade', () => {
  const game = new Game(42);
  game.player.x = 76;
  game.update(0.1, { ...emptyInput(), x: -1 });
  expect(game.player.x).toBe(76);
  expect(game.player.lives).toBe(3);
  game.player.x = 480;
  game.player.y = 76;
  game.update(0.1, { ...emptyInput(), y: -1 });
  expect(game.player.y).toBe(76);
  expect(game.player.lives).toBe(3);
  const hazard = game.walls.find(wall => wall.hazard)!;
  expect(hazard).toBeDefined();
  expect(game.walls.filter(wall => wall.hazard)).toHaveLength(1);
  game.player.x = hazard.x - 12;
  game.player.y = hazard.y + hazard.height / 2;
  game.update(1 / 120, { ...emptyInput(), x: 1 });
  expect(game.player.lives).toBe(2);
  game.update(1 / 120, { ...emptyInput(), x: 1 });
  expect(game.player.lives).toBe(2);
  game.startBossChallenge();
  expect(game.walls.some(wall => wall.hazard)).toBe(false);
});
