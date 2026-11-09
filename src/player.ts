// @ts-nocheck
import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Engine,
  Keys,
  vec,
  Sprite,
  Side
} from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";

type Direcao = "up" | "down" | "left" | "right";

const TILE_SIZE = 16;
const SPRITESHEET_COLS = 4; // DOWN=0, UP=1, LEFT=2, RIGHT=3
const SPRITESHEET_ROWS = 7; // IDLE=0, MOVING=0..3, ATTACK=4, JUMP=5, DEAD=6

export class Player extends Actor {
  private speed: number = 200;
  private lives: number = 3;
  private isDead: boolean = false;
  private invulnerability: boolean = false;
  private invulnerabilityTime: number = 2000;
  private invulnerabilityTimer: number = 0;
  private currentDirection: Direcao = "down";
  private currentAnimationRow: number = 0; // 0=IDLE, 1-3=MOVING, 4=ATTACK, 5=JUMP, 6=DEAD
  private movingFrame: number = 0;
  private isMoving: boolean = false;
  private screenShake: number = 0;

  constructor() {
    super({
      collisionType: CollisionType.Active,
      name: "Player",
      pos: vec(150, 150),
      width: 40,
      height: 56
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
    this.invulnerability = true;
    this.invulnerabilityTimer = this.invulnerabilityTime;
    
    // Screen shake effect on damage
    this.screenShake = 15;
  }

  isPlayerDead(): boolean {
    return this.isDead;
  }

  restartPlayer(): void {
    this.lives = 3;
    this.isDead = false;
    this.invulnerability = true;
    this.invulnerabilityTimer = this.invulnerabilityTime;
    this.rotation = 0;
    this.scale = vec(1, 1);
    this.graphics.opacity = 1;
    this.pos = vec(150, 150);
    this.currentDirection = "down";
    this.currentAnimationRow = 0;
    this.movingFrame = 0;
    this.isMoving = false;
    this.screenShake = 0;
    this.updateGraphics();
  }

  private updateGraphics(): void {
    const colMap: Record<Direcao, number> = { down: 0, up: 1, left: 2, right: 3 };
    const col = colMap[this.currentDirection];
    const row = this.currentAnimationRow;
    const x = col * 16;
    const y = row * 16;
    (this as any).graphics = new Sprite({
      image: Resources.NinjaSheet,
      sourceView: { x, y, width: 16, height: 16 }
    });
  }

  changeDirection(direction: Direcao): void {
    if (this.currentDirection === direction) {
      return;
    }
    this.currentDirection = direction;
    // When direction changes, reset to IDLE animation
    if (!this.isMoving) {
      this.currentAnimationRow = 0; // IDLE
      this.updateGraphics();
    }
  }

  startMoving(): void {
    if (!this.isMoving) {
      this.isMoving = true;
      this.currentAnimationRow = 0;
      this.movingFrame = 0;
      this.updateGraphics();
    }
  }

  updateMovingFrame(): void {
    if (!this.isMoving) return;
    this.movingFrame++;
    if (this.movingFrame > 3) this.movingFrame = 0;
    // When moving, advances through MOVING rows (0,1,2,3)
    this.currentAnimationRow = this.movingFrame;
    this.updateGraphics();
  }

  override onInitialize(): void {
    this.updateGraphics();
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Apply screen shake offset
    const shakeOffset = this.getShakeOffset();
    // We need to apply shake to the scene camera or position offset
    // For now, just track the shake amount
    
    this.vel = vec(0, 0);

    if (this.isDead === true) {
      this.rotation = 0;
      this.graphics.opacity = 0.4;
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

    let horizontal = 0;
    let vertical = 0;

    if (engine.input.keyboard.isHeld(Keys.A)) horizontal -= 1;
    if (engine.input.keyboard.isHeld(Keys.D)) horizontal += 1;
    if (engine.input.keyboard.isHeld(Keys.W)) vertical -= 1;
    if (engine.input.keyboard.isHeld(Keys.S)) vertical += 1;

    const wasHolding = this.isMoving;
    if (horizontal !== 0 || vertical !== 0) {
      this.vel = vec(horizontal, vertical).normalize().scale(this.speed);
      this.isMoving = true;

      // Prioriza a horizontal para o sprite não ficar alternando na diagonal
      if (horizontal !== 0) {
        this.changeDirection(horizontal > 0 ? "right" : "left");
      } else {
        this.changeDirection(vertical > 0 ? "down" : "up");
      }
    } else {
      this.isMoving = false;
    }

    // Atualiza frame de movimento
    if (this.isMoving) {
      this.movingFrame++;
      if (this.movingFrame > 3) this.movingFrame = 0;
      // Quando se move, alternamos entre as rows de MOVING (0,1,2,3)
      // ou mantemos na row 0 e mudamos o sourceView
      this.currentAnimationRow = this.movingFrame; // usa frame como row
      this.updateGraphics();
    } else {
      // Parado -> IDLE (row 0)
      this.currentAnimationRow = 0;
      this.updateGraphics();
    }

    if (engine.input.keyboard.wasPressed(Keys.Space)) {
      let direction = vec(0, 1);

      switch (this.currentDirection) {
        case "up":
          direction = vec(0, -1);
          break;
        case "down":
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
        this.pos.add(direction.scale(45)),
        "player"
      );
      this.scene?.add(bullet);
    }
  }

  private getShakeOffset(): vec {
    if (this.screenShake <= 0) return vec(0, 0);
    
    // Decay screen shake
    this.screenShake = Math.max(0, this.screenShake - elapsedMs / 50);
    
    // Random offset for shake
    const x = (Math.random() - 0.5) * this.screenShake;
    const y = (Math.random() - 0.5) * this.screenShake;
    return vec(x, y);
  }

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.invulnerability === true || this.isDead === true) {
      return;
    }

    // O shuriken do jogador não machuca o próprio ninja; paredes e inimigos sim
    if (other.owner instanceof Bullet && other.owner.owner === "player") {
      return;
    }

    this.takeDamage();
    this.invulnerability = true;
    this.invulnerabilityTimer = this.invulnerabilityTime;
  }
}