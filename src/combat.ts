import { type Game } from './game';
import { type Input, type Enemy, type Rect } from './types';
import { updateEnemy } from './enemy';
import { createBullet, hasLineOfSight, hits, updateBullet } from './bullet';
import { distanceField } from './level';
import { updateBoss } from './boss';
import { fireShurikens, NOVA_COOLDOWN, NOVA_RADIUS } from './powers';
import { inSlash } from './melee';

const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

export function updateCombat(game: Game, elapsed: number, input: Input, walls: Rect[]): void {
  if (input.power && game.inventory.novaCooldown === 0) activateNova(game);
  if (input.melee && game.player.meleeCooldown === 0) swingBlade(game, input);
  shoot(game, input);
  const distances = game.enemies.length ? distanceField(game.player, walls) : new Map<string, number>();
  for (const enemy of game.enemies) updateSamurai(game, enemy, elapsed, walls, distances);
  if (game.boss) {
    game.bullets.push(...updateBoss(game.boss, game.player, elapsed, walls));
    if (hits(game.boss, game.player, 44)) game.damage();
  }
  updateProjectiles(game, elapsed, walls);
}

function activateNova(game: Game): void {
  game.inventory.novaCooldown = NOVA_COOLDOWN;
  game.player.invulnerable = Math.max(game.player.invulnerable, 0.4);
  game.effects.novas.push({ x: game.player.x, y: game.player.y, life: 0.5 });
  game.bullets = game.bullets.filter(bullet => bullet.owner === 'player' || !hits(bullet, game.player, NOVA_RADIUS));
  for (const enemy of [...game.enemies]) if (hits(enemy, game.player, NOVA_RADIUS)) game.hitEnemy(enemy, 2);
  if (game.boss && hits(game.boss, game.player, NOVA_RADIUS + 30)) game.hitBoss(5);
}

function shoot(game: Game, input: Input): void {
  if (!input.fire || game.player.cooldown > 0) return;
  const direction = directions[game.player.facing];
  const target = input.aim ?? { x: game.player.x + direction.x, y: game.player.y + direction.y };
  game.bullets.push(...fireShurikens(game.player, target, game.inventory));
  game.player.cooldown = 1 / (1 + game.inventory.rapid * 0.35);
  game.shots++;
}

function updateSamurai(game: Game, enemy: Enemy, elapsed: number, walls: Rect[], distances: Map<string, number>): void {
  updateEnemy(enemy, game.player, elapsed, game.sector, walls, distances);
  if (hits(enemy, game.player, 26)) game.damage();
  if (enemy.cooldown > 0 || !hasLineOfSight(enemy, game.player, walls)) return;
  game.bullets.push(createBullet(enemy, game.player, 'enemy'));
  enemy.cooldown = Math.max(1.1, 2.8 - game.sector * 0.1);
}

function updateProjectiles(game: Game, elapsed: number, walls: Rect[]): void {
  game.bullets = game.bullets.filter(bullet => {
    if (!updateBullet(bullet, elapsed, walls)) return false;
    if (bullet.owner === 'enemy' && hits(bullet, game.player)) { game.damage(); return false; }
    if (bullet.owner !== 'player') return true;
    if (game.boss && hits(bullet, game.boss, 36)) { game.hitBoss(1); return false; }
    const victim = game.enemies.find(enemy => hits(bullet, enemy));
    if (!victim) return true;
    game.hitEnemy(victim, 1);
    return false;
  });
}

function swingBlade(game: Game, input: Input): void {
  const facing = directions[game.player.facing];
  const angle = input.aim ? Math.atan2(input.aim.y - game.player.y, input.aim.x - game.player.x) : Math.atan2(facing.y, facing.x);
  const radius = 74 + game.inventory.blade * 12;
  const damage = 2 + game.inventory.blade;
  game.player.meleeCooldown = 0.65;
  game.effects.slashes.push({ x: game.player.x, y: game.player.y, angle, radius, life: 0.22 });
  for (const enemy of [...game.enemies]) if (inSlash(game.player, enemy, angle, radius, game.walls)) game.hitEnemy(enemy, damage);
  if (game.boss && inSlash(game.player, game.boss, angle, radius + 20, game.walls)) game.hitBoss(damage);
}
