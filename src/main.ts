import './style.css';
import { loadAssets } from './resources';
import { Game } from './game';
import { Renderer } from './renderer';
import { Controls } from './input';
import { Music } from './audio';
import { canvas, primaryButton, pauseButton, soundButton, challengeButton, showScreen, updateHud, type Screen } from './startScreen';

const game = new Game();
const music = new Music(soundButton);
let screen: Screen = 'loading';
let renderer: Renderer | null = null;
let previousTime = 0;
let accumulator = 0;
let hudTimer = 0;
const step = 1 / 120;

function setScreen(next: Screen, message = ''): void {
  screen = next;
  controls.clear();
  accumulator = 0;
  music.setActive(next === 'playing');
  showScreen(next, message);
}

function startOrResume(): void {
  if (screen === 'error') { void initialize(); return; }
  if (screen === 'loading' || screen === 'playing') return;
  if (screen !== 'paused') game.reset();
  setScreen('playing');
  canvas.focus({ preventScroll: true });
  updateHud(game);
}

function togglePause(): void {
  if (screen === 'playing') setScreen('paused');
  else if (screen === 'paused') startOrResume();
}

function handleKey(key: string): void {
  if (key === 'KeyM') music.toggle();
  if (key === 'Escape' || key === 'KeyP') togglePause();
  if (key === 'Enter' || (key === 'KeyR' && screen === 'over')) startOrResume();
}

const controls = new Controls(canvas, handleKey, () => {
  if (screen === 'playing') setScreen('paused');
});
primaryButton.addEventListener('click', startOrResume);
pauseButton.addEventListener('click', togglePause);
challengeButton.addEventListener('click', () => {
  if (screen !== 'menu') return;
  game.startBossChallenge();
  setScreen('playing');
  canvas.focus({ preventScroll: true });
  updateHud(game);
});

async function initialize(): Promise<void> {
  screen = 'loading';
  primaryButton.disabled = true;
  primaryButton.textContent = 'Carregando o templo…';
  try {
    const assets = await loadAssets();
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Seu navegador não disponibilizou a renderização 2D.');
    renderer = new Renderer(context, assets);
    renderer.draw(game, 0);
    canvas.dataset.ready = 'true';
    updateHud(game);
    setScreen('menu');
  } catch (error) {
    setScreen('error', error instanceof Error ? error.message : 'Ocorreu uma falha inesperada.');
  }
}

function frame(milliseconds: number): void {
  const seconds = Math.min((milliseconds - previousTime) / 1000, 0.1);
  previousTime = milliseconds;
  if (screen === 'playing') {
    accumulator += seconds;
    while (accumulator >= step) {
      game.update(step, controls.read());
      accumulator -= step;
    }
    hudTimer += seconds;
    if (hudTimer >= 0.05) { updateHud(game); hudTimer = 0; }
    music.feedback(game);
    if (game.over) {
      updateHud(game);
      setScreen('over', `Setor ${game.sector} · ${game.score} pontos.`);
    }
  }
  renderer?.draw(game, screen === 'playing' ? game.elapsed : 0);
  requestAnimationFrame(frame);
}

void initialize();
requestAnimationFrame(frame);
