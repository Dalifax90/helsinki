import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, CollisionType } from "excalibur";
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
      width: 50,
      height: 50
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
    this.pos = vec(150, 150);
  }

  changeDirection(direction: string): void {
    if (this.currentDirection === direction) {
      return;
    }

    this.currentDirection = direction;
    switch (direction) {
      case "front":
        this.graphics.use(Resources.PlayerFront.toSprite());
        break;
      case "back":
        this.graphics.use(Resources.PlayerBack.toSprite());
        break;
      case "right":
        this.graphics.use(Resources.PlayerRight.toSprite());
        break;
      case "left":
        this.graphics.use(Resources.PlayerLeft.toSprite());
        break;
    }
  }

  override onInitialize(): void {
    this.graphics.use(Resources.PlayerFront.toSprite());
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    this.vel = vec(0, 0);

    if (this.isDead === true) {
      if (engine.input.keyboard.wasPressed(Keys.R)) {
        this.restartPlayer();
      } else {
        return;
      }
    }

    if (this.invulnerability === true) {
      this.invulnerabilityTimer -= elapsedMs;

      if (this.invulnerabilityTimer <= 0) {
        this.invulnerability = false;
        this.invulnerabilityTimer = 0;
      }
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