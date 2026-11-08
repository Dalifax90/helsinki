import { Actor, CollisionType, vec, Circle, Color } from "excalibur";

export class Bullet extends Actor {
 private speed: number = 400;

  constructor(direction: any, position: any) {
    super({
      pos: position,
      width: 15,
      height: 15,
      collisionType: CollisionType.Passive
    });

    this.graphics.use(
      new Circle({
        radius: 7,
        color: Color.Yellow
      })
    );

    this.vel = direction.scale(this.speed);
  }
}