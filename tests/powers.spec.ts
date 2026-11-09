import { test, expect } from '@playwright/test';
import { Game } from '../src/game';
import { emptyInput } from '../src/types';

test('coletar pergaminhos combina leque e cadência e preserva poderes entre setores', () => {
  const game = new Game();
  game.items = [{ x: 480, y: 440, kind: 'spread' }, { x: 480, y: 440, kind: 'rapid' }];
  game.update(1 / 120, emptyInput());
  expect(game.inventory.spread).toBe(1);
  expect(game.inventory.rapid).toBe(1);
  expect(game.items).toHaveLength(0);
  game.update(1 / 120, { ...emptyInput(), fire: true });
  expect(game.bullets.filter(bullet => bullet.owner === 'player')).toHaveLength(3);
  expect(game.player.cooldown).toBeLessThan(1);
  game.enemies = [];
  game.player.y = 60;
  game.update(1 / 120, emptyInput());
  expect(game.sector).toBe(2);
  expect(game.inventory.spread).toBe(1);
  game.reset();
  expect(game.inventory.spread).toBe(0);
});

test('poção cura sem ultrapassar limite e permanece no chão com vida cheia', () => {
  const game = new Game();
  game.items = [{ x: 480, y: 440, kind: 'heart' }];
  game.update(1 / 120, emptyInput());
  expect(game.items).toHaveLength(1);
  game.player.lives = 2;
  game.update(1 / 120, emptyInput());
  expect(game.player.lives).toBe(3);
  expect(game.items).toHaveLength(0);
});

test('escudo absorve impacto e nova elimina projéteis com recarga', () => {
  const game = new Game();
  game.inventory.shields = 1;
  game.bullets.push({ x: 480, y: 440, vx: 0, vy: 0, owner: 'enemy', life: 2 });
  game.update(1 / 120, emptyInput());
  expect(game.player.lives).toBe(3);
  expect(game.inventory.shields).toBe(0);
  game.bullets.push({ x: 480, y: 400, vx: 0, vy: 0, owner: 'enemy', life: 2 });
  game.enemies = [{ x: 480, y: 350, facing: 0, moving: false, cooldown: 100, variant: 0, hp: 3, maxHp: 3, flash: 0, slow: 0 }];
  game.update(1 / 120, { ...emptyInput(), power: true });
  expect(game.bullets).toHaveLength(0);
  expect(game.enemies).toHaveLength(1);
  expect(game.enemies[0].hp).toBe(1);
  expect(game.inventory.novaCooldown).toBeGreaterThan(0);
  const cooldown = game.inventory.novaCooldown;
  game.update(1 / 120, { ...emptyInput(), power: true });
  expect(game.inventory.novaCooldown).toBeLessThan(cooldown);
});

test('limpar sala sem drop não repete sorteio e o guardião bloqueia saída', () => {
  const game = new Game(42);
  game.items = [];
  game.enemies = [];
  game.update(1 / 120, emptyInput());
  expect(game.items).toHaveLength(0);
  game.update(1 / 120, emptyInput());
  expect(game.items).toHaveLength(0);
  game.player.y = 60;
  game.update(1 / 120, emptyInput());
  game.enemies = [];
  game.player.y = 60;
  game.update(1 / 120, emptyInput());
  expect(game.sector).toBe(3);
  expect(game.boss).not.toBeNull();
  expect(game.exitOpen).toBe(false);
});

test('guardião alterna rajadas e investida sinalizada e fica enfurecido com meia vida', () => {
  const game = new Game();
  game.startBossChallenge();
  game.player.invulnerable = 100;
  const states = new Set<string>();
  for (let frame = 0; frame < 900; frame++) {
    game.update(1 / 120, emptyInput());
    states.add(game.boss!.state);
  }
  expect(states.has('telegraph')).toBe(true);
  expect(states.has('dash')).toBe(true);
  expect(game.bullets.length).toBeGreaterThan(0);
  game.boss!.hp = game.boss!.maxHp / 2;
  game.update(1 / 120, emptyInput());
  expect(game.boss!.enraged).toBe(true);
});

test('derrotar chefe dá recompensa, abre saída e reiniciar remove combate e poderes', () => {
  const game = new Game();
  game.startBossChallenge();
  game.boss!.hp = 1;
  game.bullets.push({ x: game.boss!.x, y: game.boss!.y, vx: 0, vy: 0, owner: 'player', life: 2 });
  game.update(1 / 120, emptyInput());
  expect(game.boss).toBeNull();
  expect(game.exitOpen).toBe(true);
  expect(game.score).toBe(1000);
  expect(game.items.some(item => item.kind === 'heart')).toBe(true);
  game.reset();
  expect(game.sector).toBe(1);
  expect(game.boss).toBeNull();
  expect(game.inventory.shields).toBe(0);
});
