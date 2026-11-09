// @ts-nocheck
import {
    Actor,
    Collider,
    CollisionContact,
    CollisionType,
    Engine,
    vec,
    Sprite,
    SourceView,
    Side
} from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";
import type { Player } from "./player";

const DIRECOES_CARDINAIS = [vec(0, -1), vec(0, 1), vec(-1, 0), vec(1, 0)];
const TILE_SIZE = 16;

type Direcao = "up" | "down" | "left" | "right";

export class Enemy extends Actor {
    private readonly speed: number;
    private readonly fireInterval: number;
    private fireTimer: number;
    private wanderTimer: number = 0;
    private direction: vec;
    private readonly target: Player;
    private readonly onDeath: () => void;
    private morto: boolean = false;
    private currentDirection: Direcao = "down";
    private currentAnimationRow: number = 0;

    constructor(position: vec, target: Player, difficulty: number, onDeath: () => void) {
        super({
            name: "Enemy",
            pos: position,
            width: 40,
            height: 56,
            collisionType: CollisionType.Active
        });

        this.target = target;
        this.onDeath = onDeath;
        this.speed = 45 + Math.min(difficulty, 10) * 5;
        this.fireInterval = Math.max(800, 2400 - difficulty * 150);
        this.fireTimer = 600 + Math.random() * 900;
        this.direction = this.escolherDirecao();
    }

    override onInitialize(): void {
        this.atualizarSprite(0, "down");
    }

    private atualizarSprite(animRow: number, dir: Direcao): void {
        const colMap: Record<Direcao, number> = { down: 0, up: 1, left: 2, right: 3 };
        const col = colMap[dir];
        const row = animRow;
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;
        const sourceView: SourceView = { x, y, width: TILE_SIZE, height: TILE_SIZE };
        (this as any).graphics = new Sprite({
            image: Resources.SamuraiGreenSheet,
            sourceView: sourceView
        });
    }

    override onPreUpdate(engine: Engine, elapsedMs: number): void {
        const distanciaAteJogador = this.target.pos.sub(this.pos);

        this.wanderTimer -= elapsedMs;
        if (this.wanderTimer <= 0) {
            this.wanderTimer = 500 + Math.random() * 700;
            this.direction = this.escolherDirecao(distanciaAteJogador);
        }

        this.vel = this.direction.scale(this.speed);

        this.fireTimer -= elapsedMs;
        if (this.fireTimer <= 0) {
            this.fireTimer = this.fireInterval * (0.7 + Math.random() * 0.6);
            this.atirar();
        }

        // Atualização de animação
        if (this.vel.size > 0) {
            (this as any).isMoving = true;
            (this as any).movingFrame++;
            if ((this as any).movingFrame > 3) (this as any).movingFrame = 0;
            this.currentAnimationRow = (this as any).movingFrame;
            this.atualizarSprite(this.currentAnimationRow, this.currentDirection);
        } else {
            (this as any).isMoving = false;
            this.currentAnimationRow = 0;
            this.atualizarSprite(0, this.currentDirection);
        }
    }

    override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
        if (other.owner instanceof Bullet && other.owner.owner === "player") {
            this.morrer();
        }
    }

    private escolherDirecao(paraJogador?: vec): vec {
        if (paraJogador && paraJogador.size > 0 && Math.random() > 0.3) {
            if (Math.abs(paraJogador.x) > Math.abs(paraJogador.y)) {
                return vec(Math.sign(paraJogador.x), 0);
            }
            return vec(0, Math.sign(paraJogador.y));
        }

        return DIRECOES_CARDINAIS[Math.floor(Math.random() * DIRECOES_CARDINAIS.length)];
    }

    private atirar(): void {
        const paraJogador = this.target.pos.sub(this.pos);

        if (paraJogador.size === 0) {
            return;
        }

        const direction =
            Math.abs(paraJogador.x) > Math.abs(paraJogador.y)
                ? vec(Math.sign(paraJogador.x), 0)
                : vec(0, Math.sign(paraJogador.y));

        const bullet = new Bullet(direction, this.pos.add(direction.scale(30)), "enemy");
        this.scene?.add(bullet);
    }

    private morrer(): void {
        if (this.morto) {
            return;
        }

        this.morto = true;
        this.onDeath();
        this.kill();
    }
}