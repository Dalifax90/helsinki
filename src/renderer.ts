import { type Assets } from './resources';
import { type Character, type Rect, WIDTH, HEIGHT } from './types';
import { type Game } from './game';
import { drawBoss, drawItems, drawPowerEffects } from './powerRenderer';
import { drawDoors, drawHazards } from './roomRenderer';

export class Renderer {
  private readonly backdrop = document.createElement('canvas');
  private cachedRoom = '';
  constructor(private readonly context: CanvasRenderingContext2D, private readonly assets: Assets) {
    this.backdrop.width = WIDTH;
    this.backdrop.height = HEIGHT;
    context.imageSmoothingEnabled = false;
  }

  draw(game: Game, time: number): void {
    const roomKey = `${game.dungeon.seed}:${game.dungeon.floor}:${game.dungeon.current.id}:${game.dungeon.current.cleared}`;
    if (this.cachedRoom !== roomKey) { this.drawBackdrop(game); this.cachedRoom = roomKey; }
    const ctx = this.context;
    ctx.save();
    if (game.shake > 0) ctx.translate(Math.sin(time * 80) * game.shake, Math.cos(time * 65) * game.shake);
    ctx.drawImage(this.backdrop, 0, 0);
    drawDoors(ctx, game, this.assets, time);
    drawHazards(ctx, game.walls, time);
    drawItems(ctx, game, this.assets, time);
    if (game.boss) drawBoss(ctx, game.boss, this.assets, time);
    const characters = [...game.enemies.map(enemy => ({ character: enemy, sheet: enemy.variant ? this.assets.blue : this.assets.green, player: false })),
      { character: game.player, sheet: this.assets.ninja, player: true }].sort((a, b) => a.character.y - b.character.y);
    for (const entry of characters) {
      const blinking = entry.player && game.player.invulnerable > 0 && Math.floor(time * 12) % 2 === 0;
      ctx.globalAlpha = blinking ? 0.35 : 1;
      this.drawCharacter(entry.character, entry.sheet, time, entry.player);
    }
    ctx.globalAlpha = 1;
    for (const enemy of game.enemies) {
      ctx.fillStyle = enemy.slow > 0 ? '#7fc9e5' : enemy.flash > 0 ? '#fff3c0' : '#d79575';
      for (let hp = 0; hp < enemy.maxHp; hp++) {
        ctx.globalAlpha = hp < enemy.hp ? 1 : 0.18;
        ctx.fillRect(enemy.x - enemy.maxHp * 4 + hp * 8, enemy.y - 38, 6, 3);
      }
    }
    ctx.globalAlpha = 1;
    for (const bullet of game.bullets) {
      ctx.save();
      ctx.translate(bullet.x, bullet.y);
      ctx.rotate(bullet.owner === 'player' ? time * 16 : Math.atan2(bullet.vy, bullet.vx));
      ctx.shadowColor = bullet.owner === 'player' ? '#dcf7ed' : '#f1996d';
      ctx.shadowBlur = 10;
      const projectile = bullet.owner === 'player' ? this.assets.shuriken : this.assets.fireball;
      const sourceX = bullet.owner === 'player' ? 0 : Math.floor(time * 10) % 4 * 16;
      ctx.drawImage(projectile, sourceX, 0, 16, 16, -12, -12, 24, 24);
      ctx.restore();
    }
    for (const particle of game.particles) {
      ctx.globalAlpha = Math.max(0, particle.life / 0.45);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, 4, 4);
    }
    ctx.globalAlpha = 1;
    drawPowerEffects(ctx, game, this.assets);
    for (const effect of game.smoke) {
      const smokeFrame = Math.min(14, Math.floor((1 - Math.max(0, effect.life) / 0.5) * 15));
      ctx.drawImage(this.assets.smoke, smokeFrame * 16, 0, 16, 14, effect.x - 32, effect.y - 28, 64, 56);
    }
    this.drawAtmosphere(time);
    ctx.restore();
  }

  private drawBackdrop(game: Game): void {
    const ctx = this.backdrop.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#1b2d2a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let y = 64; y < 512; y += 32) {
      for (let x = 64; x < 896; x += 32) {
        const paletteX = game.sector % 3 === 2 ? 0 : 192;
        ctx.drawImage(this.assets.floor, paletteX + ((x / 32 + y / 32) % 3) * 16, 224, 16, 16, x, y, 32, 32);
      }
    }
    ctx.fillStyle = '#c6ab7530';
    ctx.fillRect(448, 64, 64, 448);
    for (const wall of game.walls) this.drawWall(ctx, wall);
    this.drawDecor(ctx);
  }

  private drawWall(ctx: CanvasRenderingContext2D, wall: Rect): void {
    ctx.fillStyle = '#101d2590';
    ctx.fillRect(wall.x + 5, wall.y + 12, wall.width, wall.height);
    ctx.fillStyle = '#665f4d';
    ctx.fillRect(wall.x + 4, wall.y + 4, wall.width - 8, wall.height - 8);
    for (let y = 0; y < wall.height; y += 16) {
      for (let x = 0; x < wall.width; x += 16) {
        const sourceX = x === 0 ? 0 : x === wall.width - 16 ? 64 : 16;
        const sourceY = y === 0 ? 0 : y === wall.height - 16 ? 64 : 16;
        ctx.drawImage(this.assets.dungeon, 32, 16, 16, 16, wall.x + x, wall.y + y, 16, 16);
        ctx.drawImage(this.assets.wall, sourceX, sourceY, 16, 16, wall.x + x, wall.y + y, 16, 16);
      }
    }
    ctx.fillStyle = '#b9a98660';
    ctx.fillRect(wall.x + 8, wall.y + wall.height - 3, wall.width - 16, 2);
  }

  private drawDecor(ctx: CanvasRenderingContext2D): void {
    const props = [
      { x: 92, y: 90, image: this.assets.crate }, { x: 122, y: 90, image: this.assets.crate },
      { x: 850, y: 475, image: this.assets.crate }, { x: 820, y: 475, image: this.assets.pot },
      { x: 92, y: 475, image: this.assets.pot }, { x: 860, y: 92, image: this.assets.pot }
    ];
    for (const prop of props) ctx.drawImage(prop.image, prop.x, prop.y, 28, 32);
    for (let index = 0; index < 12; index++) {
      const x = index % 2 ? -28 : 924;
      const y = 12 + Math.floor(index / 2) * 100;
      ctx.drawImage(this.assets.nature, 0, 0, 32, 32, x, y, 64, 64);
    }
    for (const x of [180, 780]) {
      ctx.fillStyle = '#322c28';
      ctx.fillRect(x - 4, 48, 8, 22);
      ctx.fillStyle = '#efba73';
      ctx.fillRect(x - 8, 42, 16, 16);
      ctx.fillStyle = '#ffe4a4';
      ctx.fillRect(x - 3, 44, 6, 12);
    }
    ctx.strokeStyle = '#d5b67d50';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(480, 288, 57, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(480, 288, 50, 0, Math.PI * 2); ctx.stroke();
    ctx.save();
    ctx.translate(480, 288); ctx.rotate(Math.PI / 4);
    ctx.strokeRect(-24, -24, 48, 48);
    ctx.restore();
  }

  private drawCharacter(character: Character, sheet: HTMLImageElement, time: number, player: boolean): void {
    const ctx = this.context;
    ctx.fillStyle = '#101b2360';
    ctx.beginPath(); ctx.ellipse(character.x, character.y + 12, 17, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (player) {
      ctx.strokeStyle = '#b7e2cf80';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(character.x, character.y + 12, 21, 10, 0, 0, Math.PI * 2); ctx.stroke();
    }
    const frame = character.moving ? 1 + Math.floor(time * 8) % 3 : 0;
    // Ninja Adventure uses columns for directions and rows for animation frames.
    ctx.drawImage(sheet, character.facing * 16, frame * 16, 16, 16,
      Math.round(character.x - 24), Math.round(character.y - 30), 48, 48);
  }

  private drawAtmosphere(time: number): void {
    const ctx = this.context;
    const vignette = ctx.createRadialGradient(480, 288, 170, 480, 288, 560);
    vignette.addColorStop(0, '#101e2200');
    vignette.addColorStop(1, '#101e2265');
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (let index = 0; index < 18; index++) {
      const x = (index * 137 + time * (4 + index % 3)) % WIDTH;
      const y = (index * 73 + Math.sin(time + index) * 14 + HEIGHT) % HEIGHT;
      ctx.globalAlpha = 0.2 + (Math.sin(time * 2 + index) + 1) * 0.18;
      ctx.fillStyle = '#ffe3ac'; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}
