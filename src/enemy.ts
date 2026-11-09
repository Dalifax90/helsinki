import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Color,
  Engine,
  GraphicsGroup,
  Rectangle,
  Side,
  Vector,
  vec
} from "excalibur";
import { Bullet } from "./bullet";
import type { Player } from "./player";

const DIRECOES_CARDINAIS = [vec(0, -1), vec(0, 1), vec(-1, 0), vec(1, 0)];

export class Enemy extends Actor {
  private readonly speed: number;
  private readonly fireInterval: number;
  private fireTimer: number;
  private wanderTimer: number = 0;
  private direction: Vector;
  private readonly target: Player;
  private readonly onDeath: () => void;

  constructor(position: Vector, target: Player, difficulty: number, onDeath: () => void) {
    super({
      name: "Enemy",
      pos: position,
      width: 30,
      height: 30,
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
    // Soldado imperial simplificado: corpo branco com visor vermelho
    const corpo = new Rectangle({
      width: 30,
      height: 30,
      color: Color.fromHex("#E2E8F0"),
      strokeColor: Color.fromHex("#1A202C"),
      lineWidth: 3
    });
    const visor = new Rectangle({
      width: 18,
      height: 5,
      color: Color.Red
    });

    this.graphics.use(
      new GraphicsGroup({
        members: [
          { graphic: corpo, offset: vec(0, 0) },
          { graphic: visor, offset: vec(0, -4) }
        ]
      })
    );
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    const distanciaAteJogador = this.target.pos.sub(this.pos);

    // Como no Berzerk, o inimigo anda em linha reta e troca de direção de tempo em tempo
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
  }

  override onCollisionStart(self: Collider, other: Collider, side: Side, contact: CollisionContact): void {
    if (other.owner instanceof Bullet && other.owner.owner === "player") {
      this.morrer();
    }
  }

  private escolherDirecao(paraJogador?: Vector): Vector {
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
    this.onDeath();
    this.kill();
  }
}
