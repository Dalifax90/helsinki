import { type Game } from './game';
import { assetUrl } from './resources';
import { itemDescriptions, NOVA_COOLDOWN } from './powers';

const inventory = document.getElementById('inventory')!;
const novaButton = document.getElementById('nova-button') as HTMLButtonElement;
const novaStatus = document.getElementById('nova-status')!;
const notice = document.getElementById('loot-notice')!;
const bossPanel = document.getElementById('boss-panel')!;
const bossFill = document.getElementById('boss-fill')!;
const bossHealth = document.getElementById('boss-health')!;
const bossPhase = document.getElementById('boss-phase')!;
const slots = [
  { key: 'spread', name: 'Leque de shurikens', image: 'scroll-fire.png' },
  { key: 'rapid', name: 'Ímpeto do trovão', image: 'scroll-thunder.png' },
  { key: 'shields', name: 'Selo da rocha', image: 'scroll-rock.png' },
  { key: 'frost', name: 'Selo do gelo', image: 'scroll-ice.png' },
  { key: 'blade', name: 'Lâmina ancestral', image: 'blade.png' },
  { key: 'vitality', name: 'Coração ancestral', image: 'vitality.png' }
] as const;
for (const slot of slots) {
  const element = document.createElement('span');
  element.className = 'item-slot';
  element.id = `slot-${slot.key}`;
  element.title = `${slot.name}: ainda não coletado`;
  const image = document.createElement('img');
  image.src = assetUrl(`items/${slot.image}`);
  image.alt = slot.name;
  const level = document.createElement('small');
  level.textContent = '0';
  element.append(image, level);
  inventory.append(element);
}

export function setPowerControls(playing: boolean): void { novaButton.disabled = !playing; }

export function updatePowerHud(game: Game): void {
  const cooldown = game.inventory.novaCooldown;
  novaStatus.textContent = cooldown > 0 ? `Q · ${Math.ceil(cooldown)}s` : 'Q · PRONTA';
  novaButton.classList.toggle('recharging', cooldown > 0);
  novaButton.style.setProperty('--charge', `${(1 - cooldown / NOVA_COOLDOWN) * 100}%`);
  novaButton.setAttribute('aria-label', cooldown > 0 ? `Nova espiritual recarregando: ${Math.ceil(cooldown)} segundos` : 'Usar nova espiritual');
  for (const slot of slots) {
    const element = document.getElementById(`slot-${slot.key}`)!;
    const amount = game.inventory[slot.key];
    const limit = slot.key === 'vitality' ? 3 : 2;
    element.classList.toggle('equipped', amount > 0);
    element.title = `${slot.name}: ${amount}/${limit} · ${itemDescriptions[slot.key === 'shields' ? 'shield' : slot.key]}`;
    element.setAttribute('aria-label', `${slot.name}: ${amount}/${limit}`);
    element.querySelector('small')!.textContent = String(amount);
  }
  notice.textContent = game.noticeTime > 0 ? game.notice : `${(1 + game.inventory.rapid * 0.35).toFixed(2)} tiro/s · E: lâmina · Q: nova · Explore o minimapa`;
  bossPanel.hidden = !game.boss;
  if (!game.boss) return;
  const boss = game.boss;
  bossFill.style.width = `${boss.hp / boss.maxHp * 100}%`;
  bossHealth.setAttribute('aria-valuenow', String(boss.hp));
  bossHealth.setAttribute('aria-valuemax', String(boss.maxHp));
  bossPhase.textContent = boss.state === 'telegraph' ? 'INVESTIDA! SAIA DA MARCA' : boss.enraged ? 'FASE II · FÚRIA RUBRA' : 'FASE I · GUARDIÃO DO TEMPLO';
  bossPanel.classList.toggle('enraged', boss.enraged);
}
