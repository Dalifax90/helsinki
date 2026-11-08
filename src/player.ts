import { Actor, Collider, CollisionContact, Engine, Side, vec, Keys, CollisionType } from "excalibur";
import { Resources } from "./resources";
import { ImageSource } from "excalibur";
import { Bullet } from "./bullet";




// Actors are the main unit of composition you'll likely use, anything that you want to draw and move around the screen
// is likely built with an actor

// They contain a bunch of useful components that you might use
// actor.transform
// actor.motion
// actor.graphics
// actor.body
// actor.collider
// actor.actions
// actor.pointer

export class Player extends Actor {
  private speed: number = 200;
  private lives: number = 3;
  getLives(): number{
    return this.lives;
  }
  private isDead: boolean = false;
  private invulnerability: boolean = false;
  private invulnerabilityTime: number = 2000;
  private invulnerabilityTimer: number = 0;
  private currentDirection: string = "front";


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
  }


  constructor() {
    super({
      collisionType: CollisionType.Active,
      // Giving your actor a name is optional, but helps in debugging using the dev tools or debug mode
      // https://github.com/excaliburjs/excalibur-extension/
      // Chrome: https://chromewebstore.google.com/detail/excalibur-dev-tools/dinddaeielhddflijbbcmpefamfffekc
      // Firefox: https://addons.mozilla.org/en-US/firefox/addon/excalibur-dev-tools/
      name: 'Player',
      pos: vec(150, 150),
      width: 100,
      height: 100,
      // anchor: vec(0, 0), // Actors default center colliders and graphics with anchor (0.5, 0.5)
      // collisionType: CollisionType.Active, // Collision Type Active means this participates in collisions read more https://excaliburjs.com/docs/collisiontypes
    });
    
  }

   changeDirection(direction: string): void{
      if (this.currentDirection === direction){
        return;
      }

    this.currentDirection = direction;
    switch(direction){
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

  override onInitialize() {
    this.graphics.use(Resources.PlayerFront.toSprite());
    // Generally recommended to stick logic in the "On initialize"
    // This runs before the first update
    // Useful when
    // 1. You need things to be loaded like Images for graphics
    // 2. You need excalibur to be initialized & started 
    // 3. Deferring logic to run time instead of constructor time
    // 4. Lazy instantiation
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame before Actor builtins
    this.vel=vec(0,0);

    if (this.isDead === true) {
      if (engine.input.keyboard.wasPressed(Keys.R)) {
        this.restartPlayer();
      }
      else {
        return;
      }
    }

    if( engine.input.keyboard.isHeld(Keys.W)){
      this.vel=vec(0,-this.speed);
      this.changeDirection("front");
    }

    else if( engine.input.keyboard.isHeld(Keys.A)){
      this.vel=vec(-this.speed,0);
      this.changeDirection("left");
    }

    else if( engine.input.keyboard.isHeld(Keys.S)){
      this.vel=vec(0,this.speed);
      this.changeDirection("back");
    }

    else if ( engine.input.keyboard.isHeld(Keys.D)){
      this.vel=vec(this.speed,0);
      this.changeDirection("right");
    }

    if(engine.input.keyboard.wasPressed(Keys.Space)){
      let direction = vec(0,1);

      switch(this.currentDirection){
        case "front":
          direction = vec(0,-1);
          break;

        case "back":
          direction = vec(0,1);
          break;

        case "right":
          direction = vec(1,0);
          break;

        case "left":
          direction = vec(-1,0);
          break;
      }

      const bullet = new Bullet(
        direction,
        this.pos.add(direction.scale(60))
      );
      this.scene.add(bullet);
    }

    if (this.invulnerability === true) {
    this.invulnerabilityTimer -= elapsedMs;

    if (this.invulnerabilityTimer <= 0) {
        this.invulnerability = false;
        this.invulnerabilityTimer = 0;
    }
}
  }

  override onPostUpdate(engine: Engine, elapsedMs: number): void {
    // Put any update logic here runs every frame after Actor builtins
  }

  override onPreCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called before a collision is resolved, if you want to opt out of this specific collision call contact.cancel()
  }

  override onPostCollisionResolve(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (this.invulnerability === false && this.isDead === false) {
      this.takeDamage()
      this.invulnerability = true;
      this.invulnerabilityTimer = this.invulnerabilityTime;
    }
    // Called every time a collision is resolved and overlap is solved
}

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    // Called when a pair of objects are in contact
    }

  override onCollisionEnd(self: Collider, other: Collider, side: Side, lastContact: CollisionContact): void {
    // Called when a pair of objects separates
  }
}
