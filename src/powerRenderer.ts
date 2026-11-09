import { type Assets } from './resources';
import { type Game } from './game';
import { type Boss, type ItemKind } from './types';
import { NOVA_RADIUS } from './powers';

export function drawItems(ctx: CanvasRenderingContext2D, game: Game, assets: Assets, time: number): void {
  const sprites: Record<ItemKind, HTMLImageElement> = {
    spread: assets.scrollFire, rapid: assets.scrollThunder, shield: assets.scrollRock, heart: assets.potion,
    frost: assets.scrollIce, blade: assets.blade, vitality: assets.vitality
  };
  for (const item of game.items) {
    const bob = Math.sin(time * 3 + item.x) * 3;
    ctx.save();
    ctx.fillStyle = '#d6c48b30';
    ctx.beginPath(); ctx.ellipse(item.x, item.y + 15, 22, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = item.kind === 'heart' ? '#fa9882' : '#e7d49a';
    ctx.shadowBlur = 18;
    const sprite = sprites[item.kind];
    const width = item.kind === 'heart' ? 24 : item.kind === 'blade' ? 14 : 32;
    ctx.drawImage(sprite, item.x - width / 2, item.y - 20 + bob, width, 32);
    ctx.restore();
  }
}

export function drawPowerEffects(ctx: CanvasRenderingContext2D, game: Game, assets: Assets): void {
  for (const slash of game.effects.slashes) {
    const progress = 1 - Math.max(0, slash.life) / 0.22;
    ctx.save(); ctx.translate(slash.x, slash.y); ctx.rotate(slash.angle);
    ctx.globalAlpha = 1 - progress * 0.7;
    ctx.strokeStyle = '#e0f1d9'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, slash.radius * (0.6 + progress * 0.4), -Math.PI * 0.4, Math.PI * 0.4); ctx.stroke();
    ctx.drawImage(assets.melee, Math.min(3, Math.floor(progress * 4)) * 32, 0, 32, 32, 0, -slash.radius / 2, slash.radius, slash.radius);
    ctx.restore();
  }
  for (const nova of game.effects.novas) {
    const progress = 1 - Math.max(0, nova.life) / 0.5;
    const radius = NOVA_RADIUS * Math.min(1, progress * 2);
    ctx.save();
    ctx.globalAlpha = 1 - progress;
    ctx.strokeStyle = '#d0f9e7'; ctx.lineWidth = 5;
    ctx.shadowBlur = 24; ctx.shadowColor = '#a1f4d4';
    ctx.beginPath(); ctx.arc(nova.x, nova.y, radius, 0, Math.PI * 2); ctx.stroke();
    const frame = Math.min(5, Math.floor(progress * 6));
    ctx.drawImage(assets.nova, frame * 32, 0, 32, 32, nova.x - radius, nova.y - radius, radius * 2, radius * 2);
    ctx.restore();
  }
  if (game.inventory.shields === 0) return;
  ctx.save(); ctx.strokeStyle = '#b7dbef90'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(game.player.x, game.player.y - 4, 28, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

export function drawBoss(ctx: CanvasRenderingContext2D, boss: Boss, assets: Assets, time: number): void {
  if (boss.state === 'telegraph') drawWarning(ctx, boss, time);
  const charging = boss.state === 'telegraph';
  const attacking = boss.state === 'dash';
  const sheet = boss.flash > 0 ? assets.bossHit : charging ? assets.bossCharge : attacking ? assets.bossAttack : assets.bossIdle;
  const height = sheet.height;
  const count = sheet.width / 96;
  const frame = Math.floor(time * (attacking ? 12 : 7)) % count;
  ctx.save();
  ctx.fillStyle = '#10182070';
  ctx.beginPath(); ctx.ellipse(boss.x, boss.y + 25, 39, 13, 0, 0, Math.PI * 2); ctx.fill();
  if (boss.enraged) { ctx.shadowColor = '#ef6b4e'; ctx.shadowBlur = 16; }
  ctx.drawImage(sheet, frame * 96, 0, 96, height, boss.x - 96, boss.y + 40 - height * 2, 192, height * 2);
  ctx.restore();
}

function drawWarning(ctx: CanvasRenderingContext2D, boss: Boss, time: number): void {
  ctx.save();
  ctx.strokeStyle = '#ffb393';
  ctx.fillStyle = '#ef654d30';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]); ctx.lineDashOffset = -time * 35;
  ctx.beginPath(); ctx.moveTo(boss.x, boss.y); ctx.lineTo(boss.target.x, boss.target.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(boss.target.x, boss.target.y, 38 + Math.sin(time * 15) * 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
