import { createBullet } from './bullet';
import { moveCharacter } from './level';
import { type Boss, type Bullet, type Point, type Rect } from './types';

export const createBoss = (sector: number): Boss => ({ x: 480, y: 168, hp: 30 + Math.max(0, sector - 3) * 3,
  maxHp: 30 + Math.max(0, sector - 3) * 3, state: 'arrival', timer: 1.4, shotTimer: 0.5,
  volleys: 0, target: { x: 480, y: 440 }, direction: { x: 0, y: 1 }, enraged: false, flash: 0 });

export function updateBoss(boss: Boss, player: Point, elapsed: number, walls: Rect[]): Bullet[] {
  boss.timer -= elapsed;
  boss.flash = Math.max(0, boss.flash - elapsed);
  boss.enraged = boss.hp <= boss.maxHp / 2;
  if (boss.state === 'volley') return updateVolley(boss, player, elapsed);
  if (boss.state === 'dash') {
    const blocked = moveCharacter(boss, boss.direction.x * 420 * elapsed, boss.direction.y * 420 * elapsed, walls, 30);
    if (blocked || boss.timer <= 0) { boss.state = 'recover'; boss.timer = boss.enraged ? 0.6 : 1; }
    return [];
  }
  if (boss.timer > 0) return [];
  if (boss.state === 'telegraph') {
    const dx = boss.target.x - boss.x;
    const dy = boss.target.y - boss.y;
    const length = Math.hypot(dx, dy) || 1;
    boss.direction = { x: dx / length, y: dy / length };
    boss.state = 'dash';
    boss.timer = 0.7;
    return [];
  }
  boss.state = 'volley';
  boss.volleys = 0;
  boss.shotTimer = 0.2;
  return [];
}

function updateVolley(boss: Boss, player: Point, elapsed: number): Bullet[] {
  boss.shotTimer -= elapsed;
  if (boss.shotTimer > 0) return [];
  const bullets = boss.volleys % 2 === 0 ? radialVolley(boss) : aimedVolley(boss, player);
  boss.volleys++;
  boss.shotTimer = boss.enraged ? 0.6 : 0.85;
  if (boss.volleys >= 4) {
    boss.state = 'telegraph';
    boss.timer = boss.enraged ? 0.7 : 1;
    boss.target = { x: player.x, y: player.y };
  }
  return bullets;
}

function radialVolley(boss: Boss): Bullet[] {
  const count = boss.enraged ? 16 : 10;
  return Array.from({ length: count }, (_, index) => bossBullet(boss, index * Math.PI * 2 / count + boss.volleys * 0.13));
}

function aimedVolley(boss: Boss, player: Point): Bullet[] {
  const count = boss.enraged ? 5 : 3;
  const center = Math.atan2(player.y - boss.y, player.x - boss.x);
  return Array.from({ length: count }, (_, index) => bossBullet(boss, center + (index - (count - 1) / 2) * 0.21));
}

function bossBullet(boss: Boss, angle: number): Bullet {
  const bullet = createBullet(boss, { x: boss.x + Math.cos(angle), y: boss.y + Math.sin(angle) }, 'enemy');
  bullet.vx *= boss.enraged ? 1.15 : 0.9;
  bullet.vy *= boss.enraged ? 1.15 : 0.9;
  bullet.life = 6;
  return bullet;
}
