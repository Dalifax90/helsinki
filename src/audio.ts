import { assetUrl } from './resources';
import { type Game } from './game';

type EffectName = 'throw' | 'hit' | 'clear';

export class Music {
  private readonly audio = new Audio(assetUrl('audio/theme_lost_village.ogg'));
  private enabled = true;
  private active = false;
  private previous = { shots: 0, score: 0, lives: 3, sector: 1 };
  private readonly effects: Record<EffectName, HTMLAudioElement[]> = {
    throw: [], hit: [], clear: []
  };
  private readonly unavailable = new Set<EffectName>();
  constructor(private readonly button: HTMLButtonElement) {
    this.audio.loop = true;
    this.audio.volume = 0.3;
    for (const name of Object.keys(this.effects) as EffectName[]) {
      this.effects[name] = Array.from({ length: 3 }, () => {
        const audio = new Audio(assetUrl(`audio/${name}.wav`));
        audio.volume = name === 'throw' ? 0.12 : 0.25;
        return audio;
      });
    }
    button.addEventListener('click', () => this.toggle());
    this.updateLabel();
  }
  toggle(): void { this.enabled = !this.enabled; this.sync(); }
  setActive(active: boolean): void { this.active = active; this.sync(); }
  feedback(game: Game): void {
    if (game.shots > this.previous.shots) this.playEffect('throw');
    if (game.player.lives < this.previous.lives || game.score > this.previous.score) this.playEffect('hit');
    if (game.sector > this.previous.sector) this.playEffect('clear');
    this.previous = { shots: game.shots, score: game.score, lives: game.player.lives, sector: game.sector };
  }
  private playEffect(name: EffectName): void {
    if (!this.enabled || !this.active || this.unavailable.has(name)) return;
    const audio = this.effects[name].find(effect => effect.paused || effect.ended);
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => this.unavailable.add(name));
  }
  private sync(): void {
    if (!this.enabled || !this.active) { this.audio.pause(); this.updateLabel(); return; }
    this.audio.play().then(() => this.updateLabel()).catch(() => {
      this.enabled = false;
      this.updateLabel();
    });
    this.updateLabel();
  }
  private updateLabel(): void {
    this.button.textContent = this.enabled ? 'Som ligado' : 'Som desligado';
    this.button.setAttribute('aria-label', this.enabled ? 'Desativar som' : 'Ativar som');
    this.button.setAttribute('aria-pressed', String(this.enabled));
  }
}
