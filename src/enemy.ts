import { type Enemy, type Player, type Rect } from './types';
import { chaseTarget, moveCharacter } from './level';

export function createEnemies(sector: number): Enemy[] {
  const spawns = [{ x: 480, y: 144 }, { x: 800, y: 288 }, { x: 144, y: 144 },
    { x: 800, y: 112 }, { x: 144, y: 464 }, { x: 816, y: 464 }];
  return spawns.slice(0, Math.min(2 + sector, 6)).map((spawn, index) => ({ ...spawn,
    facing: 0, moving: false, cooldown: 2.4 + index * 0.55, variant: index % 2,
    hp: 3 + index % 2, maxHp: 3 + index % 2, flash: 0, slow: 0 }));
}

export function updateEnemy(enemy: Enemy, player: Player, elapsed: number, sector: number, walls: Rect[], distances: Map<string, number>): void {
  const target = chaseTarget(enemy, player, distances);
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const length = Math.hypot(dx, dy);
  enemy.cooldown -= elapsed;
  enemy.flash = Math.max(0, enemy.flash - elapsed);
  enemy.slow = Math.max(0, enemy.slow - elapsed);
  enemy.moving = length > 3;
  if (!enemy.moving) return;
  enemy.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 3 : 2) : (dy > 0 ? 0 : 1);
  const travel = Math.min(length, (28 + Math.min(sector, 12) * 3) * elapsed * (enemy.slow > 0 ? 0.45 : 1));
  moveCharacter(enemy, dx / length * travel, dy / length * travel, walls);
}
