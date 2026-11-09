import { doorRects } from './dungeon';
import { type Game } from './game';
import { type Assets } from './resources';
import { type Rect } from './types';

export function drawHazards(ctx: CanvasRenderingContext2D, walls: Rect[], time: number): void {
  ctx.save();
  ctx.strokeStyle = '#ef9b69';
  ctx.fillStyle = '#f7b37c';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#f3784c';
  ctx.shadowBlur = 8 + Math.sin(time * 5) * 3;
  for (const wall of walls.filter(wall => wall.hazard)) {
    ctx.strokeRect(wall.x - 1, wall.y - 1, wall.width + 2, wall.height + 2);
    for (let x = wall.x + 10; x < wall.x + wall.width - 6; x += 18) {
      ctx.beginPath(); ctx.moveTo(x - 5, wall.y + 3); ctx.lineTo(x, wall.y - 8); ctx.lineTo(x + 5, wall.y + 3); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 5, wall.y + wall.height - 3); ctx.lineTo(x, wall.y + wall.height + 8); ctx.lineTo(x + 5, wall.y + wall.height - 3); ctx.fill();
    }
    for (let y = wall.y + 12; y < wall.y + wall.height - 6; y += 18) {
      ctx.beginPath(); ctx.moveTo(wall.x + 3, y - 5); ctx.lineTo(wall.x - 8, y); ctx.lineTo(wall.x + 3, y + 5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(wall.x + wall.width - 3, y - 5); ctx.lineTo(wall.x + wall.width + 8, y); ctx.lineTo(wall.x + wall.width - 3, y + 5); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawDoors(ctx: CanvasRenderingContext2D, game: Game, assets: Assets, time: number): void {
  const arrows = { north: '↑', south: '↓', west: '←', east: '→' };
  for (const door of game.dungeon.availableDoors()) {
    const gate = doorRects[door];
    ctx.fillStyle = game.exitOpen ? '#a4e2c7' : '#593c39';
    ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
    ctx.fillStyle = game.exitOpen ? '#234b40' : '#cf8864';
    if (door === 'north' || door === 'south') {
      for (let x = gate.x + 6; x < gate.x + gate.width; x += 12) ctx.fillRect(x, gate.y + 2, 4, gate.height - 4);
    } else {
      for (let y = gate.y + 6; y < gate.y + gate.height; y += 12) ctx.fillRect(gate.x + 2, y, gate.width - 4, 4);
    }
    if (!game.exitOpen) continue;
    ctx.fillStyle = '#e0f4cc'; ctx.font = 'bold 17px monospace'; ctx.textAlign = 'center';
    const offsetY = door === 'north' ? 50 : door === 'south' ? -24 : 5;
    const offsetX = door === 'west' ? 34 : door === 'east' ? -34 : 0;
    ctx.fillText(arrows[door], gate.x + gate.width / 2 + offsetX, gate.y + gate.height / 2 + offsetY + Math.sin(time * 3) * 2);
  }
  if (game.dungeon.availableDoors().includes('north')) ctx.drawImage(assets.elements, 176, 32, 48, 32, 432, 2, 96, 64);
}
