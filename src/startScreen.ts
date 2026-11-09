import { type Game } from './game';
import { setPowerControls, updatePowerHud } from './powerHud';
import { updateMinimap } from './minimap';

export type Screen = 'loading' | 'menu' | 'playing' | 'paused' | 'over' | 'error';
const element = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Elemento ausente: ${id}`);
  return found as T;
};
export const canvas = element<HTMLCanvasElement>('game');
export const primaryButton = element<HTMLButtonElement>('primary');
export const pauseButton = element<HTMLButtonElement>('pause');
export const soundButton = element<HTMLButtonElement>('sound');
export const challengeButton = element<HTMLButtonElement>('boss-challenge');
const overlay = element('overlay');
const title = element('overlay-title');
const kicker = element('overlay-kicker');
const description = element('overlay-description');
const hint = element('overlay-hint');
const status = element('status');
const sector = element('sector');
const score = element('score');
const hearts = element('hearts');
const sectorName = document.querySelector('.sector-name')!;
const sectorNames = ['Pátio dos ecos', 'Jardim das sombras', 'Santuário perdido', 'Refúgio dos ventos'];

export function showScreen(screen: Screen, message = ''): void {
  overlay.hidden = screen === 'playing';
  challengeButton.hidden = screen !== 'menu';
  setPowerControls(screen === 'playing');
  pauseButton.disabled = !['playing', 'paused'].includes(screen);
  pauseButton.setAttribute('aria-label', screen === 'paused' ? 'Continuar jogo' : 'Pausar jogo');
  if (screen === 'playing' || screen === 'loading') return;
  const copy = {
    menu: ['PARTIDA', 'Nova partida.', 'Explore salas, encontre itens e derrote o guardião de cada andar. Ao morrer, a partida recomeça sem melhorias.', 'Entrar no templo', 'ENTER para iniciar'],
    paused: ['PAUSA', 'Pausado.', 'A partida continua de onde você parou.', 'Continuar', 'ESC para continuar'],
    over: ['RESULTADO', 'Fim da partida.', message, 'Tentar outra vez', 'R para reiniciar'],
    error: ['CARREGAMENTO', 'O templo não carregou.', message, 'Tentar novamente', 'Verifique sua conexão e tente outra vez.']
  }[screen];
  kicker.textContent = copy[0];
  title.innerHTML = copy[1];
  description.textContent = copy[2];
  primaryButton.textContent = copy[3];
  primaryButton.setAttribute('aria-label', copy[3]);
  primaryButton.disabled = false;
  hint.textContent = copy[4];
  if (screen === 'menu') status.textContent = 'Pronto para jogar. WASD: mover · Espaço: disparar · E: lâmina · Q: nova.';
  if (screen === 'paused') status.textContent = 'Jogo pausado.';
  if (screen === 'error') status.textContent = 'Falha ao carregar. Tente novamente.';
  if (screen === 'over') status.textContent = 'Partida encerrada.';
}

export function updateHud(game: Game): void {
  updatePowerHud(game);
  updateMinimap(game);
  sector.textContent = String(game.sector).padStart(2, '0');
  sectorName.textContent = game.boss ? 'Santuário de Akuma' : sectorNames[(game.sector - 1) % sectorNames.length];
  score.textContent = String(game.score).padStart(6, '0');
  hearts.setAttribute('aria-label', `${game.player.lives} de ${game.player.maxLives} vidas`);
  if (hearts.children.length !== game.player.maxLives) {
    hearts.replaceChildren(...Array.from({ length: game.player.maxLives }, () => {
      const heart = document.createElement('span');
      heart.className = 'heart';
      return heart;
    }));
  }
  for (const [index, heart] of [...hearts.children].entries()) heart.classList.toggle('empty', index >= game.player.lives);
  status.textContent = game.exitOpen ? 'Sala livre! Recolha o loot e escolha uma porta iluminada no minimapa.'
    : game.boss ? 'AKUMA · Desvie das rajadas, use a nova [Q] e ataque durante a recuperação.'
    : `Elimine os samurais · ${game.enemies.length} no pátio · Apenas as paredes com espinhos causam dano.`;
  canvas.dataset.playerX = game.player.x.toFixed(2);
  canvas.dataset.playerY = game.player.y.toFixed(2);
  canvas.dataset.shots = String(game.shots);
  canvas.dataset.enemies = String(game.enemies.length);
  canvas.dataset.sector = String(game.sector);
}
