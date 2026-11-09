import { type Input, type Point, WIDTH, HEIGHT } from './types';

export class Controls {
  private readonly held = new Set<string>();
  private aim: Point | null = null;
  private pointerFire = false;
  private pendingPower = false;
  private pendingMelee = false;
  private pointerMelee = false;
  constructor(canvas: HTMLCanvasElement, onAction: (key: string) => void, onBlur: () => void) {
    window.addEventListener('keydown', event => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      this.held.add(event.code);
      if (!event.repeat && event.code === 'KeyQ') this.pendingPower = true;
      if (!event.repeat && event.code === 'KeyE') this.pendingMelee = true;
      if (!event.repeat) onAction(event.code);
    });
    window.addEventListener('keyup', event => this.held.delete(event.code));
    window.addEventListener('blur', () => { this.clear(); onBlur(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { this.clear(); onBlur(); } });
    canvas.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const bounds = canvas.getBoundingClientRect();
      this.aim = { x: (event.clientX - bounds.left) * WIDTH / bounds.width, y: (event.clientY - bounds.top) * HEIGHT / bounds.height };
    });
    canvas.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse') return;
      if (event.button === 0) this.pointerFire = true;
      if (event.button === 2) { this.pointerMelee = true; this.pendingMelee = true; }
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    canvas.addEventListener('pointerleave', () => { if (!this.pointerFire) this.aim = null; });
    canvas.addEventListener('pointerup', () => { this.pointerFire = false; this.pointerMelee = false; });
    canvas.addEventListener('pointercancel', () => { this.pointerFire = false; this.pointerMelee = false; });
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-control]')) {
      const code = button.dataset.control!;
      button.addEventListener('pointerdown', event => {
        event.preventDefault(); button.setPointerCapture(event.pointerId); this.held.add(code);
        if (code === 'KeyQ') this.pendingPower = true;
        if (code === 'KeyE') this.pendingMelee = true;
      });
      const release = () => this.held.delete(code);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    }
  }
  clear(): void { this.held.clear(); this.pointerFire = false; this.pointerMelee = false; this.pendingPower = false; this.pendingMelee = false; this.aim = null; }
  read(): Input {
    const held = (...keys: string[]) => keys.some(key => this.held.has(key)) ? 1 : 0;
    const power = this.pendingPower || !!held('KeyQ');
    this.pendingPower = false;
    const melee = this.pendingMelee || this.pointerMelee || !!held('KeyE');
    this.pendingMelee = false;
    return { x: held('KeyD', 'ArrowRight') - held('KeyA', 'ArrowLeft'),
      y: held('KeyS', 'ArrowDown') - held('KeyW', 'ArrowUp'),
      fire: !!held('Space') || this.pointerFire, melee, dash: !!held('ShiftLeft', 'ShiftRight'), power, aim: this.aim };
  }
}
