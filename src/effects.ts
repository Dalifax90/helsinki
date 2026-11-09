import { type Nova, type Particle, type Point, type Smoke, type Slash } from './types';

export class Effects {
  particles: Particle[] = [];
  smoke: Smoke[] = [];
  novas: Nova[] = [];
  slashes: Slash[] = [];
  update(elapsed: number): void {
    this.smoke = this.smoke.filter(effect => effect.life > 0);
    this.novas = this.novas.filter(effect => effect.life > 0);
    this.slashes = this.slashes.filter(effect => effect.life > 0);
    this.particles = this.particles.filter(particle => particle.life > 0);
    for (const effect of [...this.smoke, ...this.novas, ...this.slashes]) effect.life -= elapsed;
    for (const particle of this.particles) {
      particle.x += particle.vx * elapsed;
      particle.y += particle.vy * elapsed;
      particle.life -= elapsed;
    }
  }
  burst(origin: Point, color: string): void {
    this.smoke.push({ x: origin.x, y: origin.y, life: 0.5 });
    for (let index = 0; index < 12; index++) {
      const angle = index * Math.PI / 6;
      this.particles.push({ x: origin.x, y: origin.y, vx: Math.cos(angle) * 85,
        vy: Math.sin(angle) * 85, life: 0.45, color });
    }
  }
  clear(): void { this.smoke = []; this.novas = []; this.particles = []; this.slashes = []; }
}
