import { Actor, CollisionType, Circle, Color, Vector } from "excalibur";

export class Bullet extends Actor {
    private speed: number = 400;

    constructor(direction: Vector, position: Vector) {
        super({
            pos: position,
            width: 15,
            height: 15,
            collisionType: CollisionType.Passive
        });

        this.graphics.use(
            new Circle({
                radius: 7.5,
                color: Color.Yellow
            })
        );

        this.vel = direction.scale(this.speed);
    }

    override onCollisionStart(): void {
        this.kill();
    }

    override onPreUpdate(): void {
        if (this.isOffScreen) {
            this.kill();
        }
    }
}