import { hasLineOfSight } from './bullet';
import { type Point, type Rect } from './types';

export function inSlash(origin: Point, target: Point, angle: number, radius: number, walls: Rect[]): boolean {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const difference = Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle));
  return Math.hypot(dx, dy) <= radius && Math.abs(difference) <= Math.PI * 0.4 && hasLineOfSight(origin, target, walls);
}
