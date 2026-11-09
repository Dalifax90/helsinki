import { createBullet, hits } from './bullet';
import { type Bullet, type Inventory, type Item, type ItemKind, type Player, type Point } from './types';

export const NOVA_COOLDOWN = 8;
export const NOVA_RADIUS = 160;
export const itemNames: Record<ItemKind, string> = {
  spread: 'Leque de shurikens', rapid: 'Ímpeto do trovão', shield: 'Selo da rocha', heart: 'Poção de vida',
  frost: 'Selo do gelo', blade: 'Lâmina ancestral', vitality: 'Coração ancestral'
};
export const itemDescriptions: Record<ItemKind, string> = {
  spread: '+2 shurikens por disparo a cada nível.', rapid: '+35% de cadência por nível.',
  shield: 'Absorve um impacto por carga.', heart: 'Recupera uma vida.',
  frost: 'Desacelera os samurais atingidos.', blade: '+1 de dano e +12 de alcance da lâmina por nível.',
  vitality: '+1 de vida máxima e recupera um coração. Limite: 6 vidas.'
};
export const createInventory = (): Inventory => ({ spread: 0, rapid: 0, shields: 0, frost: 0, blade: 0, vitality: 0, novaCooldown: 0 });

export function fireShurikens(player: Player, target: Point, inventory: Inventory): Bullet[] {
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  const count = 1 + inventory.spread * 2;
  return Array.from({ length: count }, (_, index) => {
    const direction = angle + (index - (count - 1) / 2) * 0.17;
    return createBullet(player, { x: player.x + Math.cos(direction), y: player.y + Math.sin(direction) }, 'player');
  });
}

export function collectItem(item: Item, player: Player, inventory: Inventory): 'collected' | 'bonus' | 'keep' {
  if (!hits(item, player, 28)) return 'keep';
  if (item.kind === 'heart') {
    if (player.lives >= player.maxLives) return 'keep';
    player.lives++;
    return 'collected';
  }
  if (item.kind === 'vitality') {
    if (player.maxLives >= 6) return 'bonus';
    player.maxLives++;
    player.lives++;
    inventory.vitality++;
    return 'collected';
  }
  const key = item.kind === 'shield' ? 'shields' : item.kind;
  if (inventory[key] >= 2) return 'bonus';
  inventory[key]++;
  return 'collected';
}
