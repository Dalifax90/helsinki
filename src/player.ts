import { type Input, type Player, type Rect } from './types';
import { moveCharacter, touchesWall } from './level';

export const createPlayer = (): Player => ({ x: 480, y: 440, lives: 3, maxLives: 3, facing: 1, moving: false,
  invulnerable: 0, cooldown: 0, meleeCooldown: 0, dashTime: 0, dashCooldown: 0, dashDirection: { x: 0, y: -1 } });

export function updatePlayer(player: Player, input: Input, elapsed: number, walls: Rect[]): boolean {
  player.invulnerable = Math.max(0, player.invulnerable - elapsed);
  player.cooldown = Math.max(0, player.cooldown - elapsed);
  player.meleeCooldown = Math.max(0, player.meleeCooldown - elapsed);
  player.dashTime = Math.max(0, player.dashTime - elapsed);
  player.dashCooldown = Math.max(0, player.dashCooldown - elapsed);
  const length = Math.hypot(input.x, input.y) || 1;
  player.moving = !!(input.x || input.y);
  if (player.moving) player.facing = Math.abs(input.x) > Math.abs(input.y) ? (input.x > 0 ? 3 : 2) : (input.y > 0 ? 0 : 1);
  if (input.dash && player.dashCooldown === 0 && player.moving) {
    player.dashTime = 0.16;
    player.dashCooldown = 1.1;
    player.invulnerable = Math.max(player.invulnerable, 0.22);
    player.dashDirection = { x: input.x / length, y: input.y / length };
  }
  if (player.dashTime > 0) return movePlayer(player,
    player.dashDirection.x * 490 * elapsed, player.dashDirection.y * 490 * elapsed, walls);
  return movePlayer(player, input.x / length * 185 * elapsed, input.y / length * 185 * elapsed, walls);
}

function movePlayer(player: Player, dx: number, dy: number, walls: Rect[]): boolean {
  const hazards = walls.filter(wall => wall.hazard);
  const horizontalHazard = dx !== 0 && touchesWall({ x: player.x + dx, y: player.y }, 12, hazards);
  moveCharacter(player, dx, 0, walls);
  const verticalHazard = dy !== 0 && touchesWall({ x: player.x, y: player.y + dy }, 12, hazards);
  moveCharacter(player, 0, dy, walls);
  return horizontalHazard || verticalHazard;
}
