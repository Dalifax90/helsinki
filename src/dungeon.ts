import { type Item, type ItemKind, type Point, type Rect } from './types';
import { roomWalls } from './level';

export type Door = 'north' | 'south' | 'west' | 'east';
export type Room = Point & { id: string; kind: 'combat' | 'treasure' | 'boss'; visited: boolean; cleared: boolean; items: Item[]; sector: number };
export const doorOffsets: Record<Door, Point> = { north: { x: 0, y: -1 }, south: { x: 0, y: 1 }, west: { x: -1, y: 0 }, east: { x: 1, y: 0 } };
export const doorRects: Record<Door, Rect> = {
  north: { x: 448, y: 32, width: 64, height: 32 }, south: { x: 448, y: 512, width: 64, height: 32 },
  west: { x: 32, y: 256, width: 32, height: 64 }, east: { x: 896, y: 256, width: 32, height: 64 }
};
export const doors = Object.keys(doorOffsets) as Door[];

export class Dungeon {
  rooms: Room[];
  current: Room;
  constructor(readonly floor: number, readonly seed: number) {
    const main: Array<[number, number, Room['kind']]> = [[0, 2, 'combat'], [0, 1, 'combat'], [0, 0, 'boss']];
    const layout: Array<[number, number, Room['kind']]> = [...main, [-1, 2, 'combat'], [1, 2, 'combat']];
    let randomState = seed >>> 0;
    const random = () => { randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0; return randomState / 4294967296; };
    for (let attempt = 0; layout.length < 9 && attempt < 200; attempt++) {
      const parent = layout[Math.floor(random() * layout.length)];
      const offset = doorOffsets[doors[Math.floor(random() * doors.length)]];
      const x = parent[0] + offset.x;
      const y = parent[1] + offset.y;
      if (x < -2 || x > 2 || y < 0 || y > 3 || layout.some(room => room[0] === x && room[1] === y)) continue;
      layout.push([x, y, layout.length % 3 === 2 ? 'treasure' : 'combat']);
    }
    this.rooms = layout.map(([x, y, kind]) => ({ x, y, kind, id: `${x},${y}`,
      visited: false, cleared: false, items: [], sector: (floor - 1) * 3 + (y === 0 ? 3 : y === 1 ? 2 : 1) }));
    this.current = this.rooms[0];
  }
  neighbor(door: Door): Room | undefined {
    const offset = doorOffsets[door];
    return this.rooms.find(room => room.x === this.current.x + offset.x && room.y === this.current.y + offset.y);
  }
  availableDoors(): Door[] {
    return doors.filter(door => !!this.neighbor(door) || (door === 'north' && this.current.kind === 'boss' && this.current.cleared));
  }
  wallLayout(): Rect[] {
    const borders: Rect[] = [
      { x: 64, y: 32, width: 384, height: 32 }, { x: 512, y: 32, width: 384, height: 32 },
      { x: 64, y: 512, width: 384, height: 32 }, { x: 512, y: 512, width: 384, height: 32 },
      { x: 32, y: 32, width: 32, height: 224 }, { x: 32, y: 320, width: 32, height: 224 },
      { x: 896, y: 32, width: 32, height: 224 }, { x: 896, y: 320, width: 32, height: 224 }
    ];
    const available = this.availableDoors();
    const sealed = doors.filter(door => !available.includes(door)).map(door => doorRects[door]);
    const obstacles = this.current.kind === 'combat' ? roomWalls(this.current.sector).slice(5) : [];
    const hazardIndex = Math.abs(this.seed + this.current.x * 7 + this.current.y * 11) % 4;
    return [...borders, ...sealed, ...obstacles.map((wall, index) => ({ ...wall, hazard: index === hazardIndex }))];
  }
  reward(): Item[] {
    const pool: ItemKind[] = ['spread', 'rapid', 'shield', 'frost', 'blade', 'vitality'];
    const index = Math.abs((this.seed + this.current.x * 17 + this.current.y * 31 + this.floor * 7) % pool.length);
    if (this.current.kind === 'boss') return [{ x: 448, y: 288, kind: pool[index] }, { x: 512, y: 288, kind: 'heart' }];
    if (this.current.kind === 'combat') {
      const roll = Math.abs(this.seed + this.current.x * 37 + this.current.y * 53 + this.floor * 13) % 4;
      return roll === 0 ? [{ x: 480, y: 288, kind: 'heart' }] : [];
    }
    const rewards: Item[] = [{ x: 480, y: 288, kind: pool[index] }];
    if (this.current.kind === 'treasure') rewards.push({ x: 544, y: 288, kind: 'heart' });
    return rewards;
  }
}

export function crossedDoor(player: Point): Door | null {
  if (player.y < 62 && player.x > 448 && player.x < 512) return 'north';
  if (player.y > 514 && player.x > 448 && player.x < 512) return 'south';
  if (player.x < 62 && player.y > 256 && player.y < 320) return 'west';
  if (player.x > 898 && player.y > 256 && player.y < 320) return 'east';
  return null;
}
