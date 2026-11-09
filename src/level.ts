import { type Point, type Rect, TILE } from './types';

export const roomWalls = (sector: number): Rect[] => {
  const offset = sector % 2 === 0 ? 32 : 0;
  return [
    { x: 64, y: 32, width: 384, height: 32 }, { x: 512, y: 32, width: 384, height: 32 },
    { x: 32, y: 32, width: 32, height: 512 }, { x: 896, y: 32, width: 32, height: 512 },
    { x: 64, y: 512, width: 832, height: 32 },
    { x: 224, y: 160 + offset, width: 128, height: 64 },
    { x: 608, y: 160 + offset, width: 128, height: 64 },
    { x: 224, y: 352 - offset, width: 96, height: 64 },
    { x: 640, y: 352 - offset, width: 96, height: 64 }
  ];
};

export function touchesWall(point: Point, radius: number, walls: Rect[]): boolean {
  return walls.some(wall => point.x + radius > wall.x && point.x - radius < wall.x + wall.width
    && point.y + radius > wall.y && point.y - radius < wall.y + wall.height);
}

export function moveCharacter(point: Point, dx: number, dy: number, walls: Rect[], radius = 12): boolean {
  let blocked = false;
  if (!touchesWall({ x: point.x + dx, y: point.y }, radius, walls)) point.x += dx;
  else blocked = true;
  if (!touchesWall({ x: point.x, y: point.y + dy }, radius, walls)) point.y += dy;
  else blocked = true;
  return blocked;
}

// A shared distance field lets samurais navigate around walls rather than get stuck.
export function distanceField(target: Point, walls: Rect[]): Map<string, number> {
  const key = (x: number, y: number) => `${x},${y}`;
  const origin = { x: Math.floor(target.x / TILE), y: Math.floor(target.y / TILE) };
  const distances = new Map([[key(origin.x, origin.y), 0]]);
  const queue = [origin];
  for (let index = 0; index < queue.length; index++) {
    const cell = queue[index];
    const distance = distances.get(key(cell.x, cell.y))!;
    const neighbors = [{ x: cell.x + 1, y: cell.y }, { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 }, { x: cell.x, y: cell.y - 1 }];
    for (const next of neighbors) {
      if (next.x < 2 || next.x > 27 || next.y < 2 || next.y > 15 || distances.has(key(next.x, next.y))) continue;
      if (touchesWall({ x: next.x * TILE + 16, y: next.y * TILE + 16 }, 12, walls)) continue;
      distances.set(key(next.x, next.y), distance + 1);
      queue.push(next);
    }
  }
  return distances;
}

export function chaseTarget(enemy: Point, player: Point, distances: Map<string, number>): Point {
  const x = Math.floor(enemy.x / TILE);
  const y = Math.floor(enemy.y / TILE);
  if (Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y) < 50) return player;
  const cells = [{ x, y }, { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }];
  const best = cells.reduce((current, cell) => (distances.get(`${cell.x},${cell.y}`) ?? Infinity)
    < (distances.get(`${current.x},${current.y}`) ?? Infinity) ? cell : current);
  return { x: best.x * TILE + 16, y: best.y * TILE + 16 };
}
