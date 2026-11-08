import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, CollisionType, ImageSource } from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";

export class Player extends Actor {
  private speed: number = 200;
  private lives: number = 3;
  private isDead: boolean = false;
  private invulnerability: boolean = false;
  private invulnerabilityTime: number = 2000;
  private invulnerabilityTimer: number = 0;
  private currentDirection: string = "front";

  constructor() {
    super({
      collisionType: CollisionType.Active,
      name: "Player",
      pos: vec(150, 150),
      width: 40, // Hitbox levemente menor que o visual para facilitar passar nas portas
      height: 45
    });
  }

  getLives(): number {
    return this.lives;
  }

  takeDamage(): void {
    if (this.lives > 0) {
      this.lives--;
    }

    if (this.lives === 0) {
      this.isDead = true;
    }
  }

  isPlayerDead(): boolean {
    return this.isDead;
  }

  restartPlayer(): void {
    this.lives = 3;
    this.isDead = false;
    this.invulnerability = false;
    this.invulnerabilityTimer = 0;
    this.rotation = 0;
    this.graphics.opacity = 1;
    this.pos = vec(150, 150);
  }

  private aplicarSprite(recurso: ImageSource): void {
    const imgOriginal = recurso.image;
    const w = imgOriginal.width;
    const h = imgOriginal.height;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    if (ctx && w > 0 && h > 0) {
      ctx.drawImage(imgOriginal, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      
      const ehFundoClaro = (idx: number) => {
        const r = d[idx], g = d[idx + 1], b = d[idx + 2], a = d[idx + 3];
        if (a === 0) return true;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
       
        return max > 195 && (max - min) < 35;
      };

      
      const visitado = new Uint8Array(w * h);
      const fila: number[] = [];

      for (let x = 0; x < w; x++) {
        fila.push(x, (h - 1) * w + x);
      }
      for (let y = 0; y < h; y++) {
        fila.push(y * w, y * w + (w - 1));
      }

      while (fila.length > 0) {
        const pos = fila.pop()!;
        if (visitado[pos]) continue;
        visitado[pos] = 1;

        const idx = pos * 4;
        if (ehFundoClaro(idx)) {
          d[idx + 3] = 0; 
          const x = pos % w;
          const y = Math.floor(pos / w);
          if (x > 0) fila.push(pos - 1);
          if (x < w - 1) fila.push(pos + 1);
          if (y > 0) fila.push(pos - w);
          if (y < h - 1) fila.push(pos + w);
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    const fonteLimpa = new ImageSource(canvas.toDataURL());
    fonteLimpa.load().then(() => {
      const sprite = fonteLimpa.toSprite();
      const alturaAlvo = 55;
      const proporcao = h > 0 ? w / h : 1;

      sprite.destSize = {
        width: Math.round(alturaAlvo * proporcao),
        height: alturaAlvo
      };
      this.graphics.use(sprite);
    });
  }

  changeDirection(direction: string): void {
    if (this.currentDirection === direction) {
      return;
    }

    this.currentDirection = direction;
    switch (direction) {
      case "front":
        this.aplicarSprite(Resources.PlayerFront);
        break;
      case "back":
        this.aplicarSprite(Resources.PlayerBack);
        break;
      case "right":
        this.aplicarSprite(Resources.PlayerRight);
        break;
      case "left":
        this.aplicarSprite(Resources.PlayerLeft);
        break;
    }
  }

  override onInitialize(): void {
    this.aplicarSprite(Resources.PlayerFront);
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    this.vel = vec(0, 0);

    if (this.isDead === true) {
      this.rotation = 0;
      this.graphics.opacity = 0.4; // Fica translúcido no Game Over
      if (engine.input.keyboard.wasPressed(Keys.R)) {
        this.restartPlayer();
      }
      return;
    }

    // Controle de invulnerabilidade + efeito de piscar ao tomar dano
    if (this.invulnerability === true) {
      this.invulnerabilityTimer -= elapsedMs;
      this.graphics.opacity = Math.sin(engine.clock.now() / 40) > 0 ? 0.3 : 1;

      if (this.invulnerabilityTimer <= 0) {
        this.invulnerability = false;
        this.invulnerabilityTimer = 0;
        this.graphics.opacity = 1;
      }
    } else {
      this.graphics.opacity = 1;
    }

    if (engine.input.keyboard.isHeld(Keys.W)) {
      this.vel = vec(0, -this.speed);
      this.changeDirection("front");
    } else if (engine.input.keyboard.isHeld(Keys.A)) {
      this.vel = vec(-this.speed, 0);
      this.changeDirection("left");
    } else if (engine.input.keyboard.isHeld(Keys.S)) {
      this.vel = vec(0, this.speed);
      this.changeDirection("back");
    } else if (engine.input.keyboard.isHeld(Keys.D)) {
      this.vel = vec(this.speed, 0);
      this.changeDirection("right");
    }

    // Efeito procedural de passos (oscilação suave de caminhada + leve pulinho na escala)
    if (this.vel.size > 0) {
      const ciclo = engine.clock.now() / 55;
      this.rotation = Math.sin(ciclo) * 0.12;
      this.scale = vec(1, 1 + Math.abs(Math.cos(ciclo)) * 0.06);
    } else {
      this.rotation = 0;
      this.scale = vec(1, 1);
    }

    if (engine.input.keyboard.wasPressed(Keys.Space)) {
      let direction = vec(0, 1);

      switch (this.currentDirection) {
        case "front":
          direction = vec(0, -1);
          break;
        case "back":
          direction = vec(0, 1);
          break;
        case "right":
          direction = vec(1, 0);
          break;
        case "left":
          direction = vec(-1, 0);
          break;
      }

      const bullet = new Bullet(
        direction,
        this.pos.add(direction.scale(45))
      );
      this.scene?.add(bullet);
    }
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {}

  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.invulnerability === false && this.isDead === false) {
      this.takeDamage();
      this.invulnerability = true;
      this.invulnerabilityTimer = this.invulnerabilityTime;
    }
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {}

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {}
}