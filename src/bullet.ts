// @ts-nocheck
import { Actor, vec, Sprite, SourceView, CollisionType } from "excalibur";
import { Resources } from "./resources";

export type BulletOwner = "player" | "enemy";

export class Bullet extends Actor {
    private speed: number = 500;
    readonly owner: BulletOwner;

    constructor(direction: vec, position: vec, owner: BulletOwner = "player") {
        super({
            pos: position,
            width: 16,
            height: 16,
            collisionType: CollisionType.Passive
        });

        this.owner = owner;

        // Shuriken: usa o sprite sheet do ninja
        const sourceView: SourceView = {
            x: 48,
            y: 0,
            width: 16,
            height: 16
        };

        (this as any).graphics = new Sprite({
            image: Resources.NinjaSheet,
            sourceView: sourceView
        });

        this.vel = direction.scale(this.speed);
    }

    override onPreUpdate(): void {
        if (this.isOffScreen) {
            this.kill();
        }
    }

    override onCollisionStart(): void {
        this.kill();
    }
}