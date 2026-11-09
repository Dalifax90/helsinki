import { Actor, CollisionType, Circle, Color, Vector } from "excalibur";

export type BulletOwner = "player" | "enemy";

export class Bullet extends Actor {
    private speed: number = 400;
    readonly owner: BulletOwner;

    constructor(direction: Vector, position: Vector, owner: BulletOwner = "player") {
        super({
            pos: position,
            width: 15,
            height: 15,
            collisionType: CollisionType.Passive
        });

        this.owner = owner;

        this.graphics.use(
            new Circle({
                radius: 7.5,
                color: owner === "player" ? Color.Yellow : Color.Red
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
