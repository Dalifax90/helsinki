import { type Bullet, type Point, type Rect } from './types';
import { touchesWall } from './level';

export function createBullet(origin: Point, target: Point, owner: Bullet['owner']): Bullet {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const length = Math.hypot(dx, dy) || 1;
  const speed = owner === 'player' ? 460 : 155;
  return { x: origin.x + dx / length * 18, y: origin.y + dy / length * 18,
    vx: dx / length * speed, vy: dy / length * speed, owner, life: 3 };
}

export function updateBullet(bullet: Bullet, elapsed: number, walls: Rect[]): boolean {
  bullet.x += bullet.vx * elapsed;
  bullet.y += bullet.vy * elapsed;
  bullet.life -= elapsed;
  return bullet.life > 0 && bullet.x > 32 && bullet.x < 928 && bullet.y > 20 && bullet.y < 544
    && !touchesWall(bullet, 4, walls);
}

export const hits = (first: Point, second: Point, radius = 18): boolean => Math.hypot(first.x - second.x, first.y - second.y) < radius;

export function hasLineOfSight(origin: Point, target: Point, walls: Rect[]): boolean {
  const steps = Math.ceil(Math.hypot(target.x - origin.x, target.y - origin.y) / 12);
  for (let step = 1; step < steps; step++) {
    if (touchesWall({ x: origin.x + (target.x - origin.x) * step / steps,
      y: origin.y + (target.y - origin.y) * step / steps }, 4, walls)) return false;
  }
  return true;
}
