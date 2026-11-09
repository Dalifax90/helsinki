import {
  Actor,
  Collider,
  CollisionContact,
  CollisionType,
  Engine,
  ImageSource,
  Keys,
  Side,
  Sprite,
  vec
} from "excalibur";
import { Resources } from "./resources";
import { Bullet } from "./bullet";

type Direcao = "up" | "down" | "left" | "right";

export class Player extends Actor {
  private speed: number = 200;
  private lives: number = 3;
  private isDead: boolean = false;
  private invulnerability: boolean = false;
  private invulnerabilityTime: number = 2000;
  private invulnerabilityTimer: number = 0;
  private currentDirection: Direcao = "down";
  private readonly sprites = new Map<Direcao, Sprite>();

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
    this.scale = vec(1, 1);
    this.graphics.opacity = 1;
    this.pos = vec(150, 150);
  }

  private fontesPorDirecao(): Record<Direcao, ImageSource> {
    return {
      up: Resources.PlayerUp,
      down: Resources.PlayerDown,
      left: Resources.PlayerLeft,
      right: Resources.PlayerRight
    };
  }

  private prepararSprites(): void {
    const fontes = this.fontesPorDirecao();

    for (const direcao of Object.keys(fontes) as Direcao[]) {
      const fonte = this.removerFundo(fontes[direcao]);

      void fonte.ready.then(() => {
        const sprite = fonte.toSprite({ destSize: this.tamanhoDoSprite(fonte) });
        this.sprites.set(direcao, sprite);

        if (this.currentDirection === direcao) {
          this.graphics.use(sprite);
        }
      });
    }
  }

  private tamanhoDoSprite(fonte: ImageSource): { width: number; height: number } {
    const alturaAlvo = 55;
    const proporcao = fonte.height > 0 ? fonte.width / fonte.height : 1;

    return {
      width: Math.round(alturaAlvo * proporcao),
      height: alturaAlvo
    };
  }

  /**
   * Remove o fundo claro dos sprites mantendo a transparência original.
   * O processamento roda uma única vez por direção, e não a cada troca.
   */
  private removerFundo(fonte: ImageSource): ImageSource {
    const imagem = fonte.image;
    const largura = imagem.naturalWidth;
    const altura = imagem.naturalHeight;

    if (largura === 0 || altura === 0) {
      return fonte;
    }

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      return fonte;
    }

    ctx.drawImage(imagem, 0, 0);
    const dados = ctx.getImageData(0, 0, largura, altura);
    const pixels = dados.data;

    const ehFundoClaro = (indice: number): boolean => {
      const r = pixels[indice];
      const g = pixels[indice + 1];
      const b = pixels[indice + 2];
      const a = pixels[indice + 3];

      if (a === 0) return true;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return max > 195 && max - min < 35;
    };

    const visitado = new Uint8Array(largura * altura);
    const fila: number[] = [];

    const enfileirar = (posicao: number): void => {
      if (visitado[posicao]) return;
      visitado[posicao] = 1;
      fila.push(posicao);
    };

    for (let x = 0; x < largura; x++) {
      enfileirar(x);
      enfileirar((altura - 1) * largura + x);
    }
    for (let y = 0; y < altura; y++) {
      enfileirar(y * largura);
      enfileirar(y * largura + largura - 1);
    }

    for (let i = 0; i < fila.length; i++) {
      const posicao = fila[i];
      const indice = posicao * 4;

      if (!ehFundoClaro(indice)) continue;

      pixels[indice + 3] = 0;

      const x = posicao % largura;
      const y = (posicao - x) / largura;

      if (x > 0) enfileirar(posicao - 1);
      if (x < largura - 1) enfileirar(posicao + 1);
      if (y > 0) enfileirar(posicao - largura);
      if (y < altura - 1) enfileirar(posicao + largura);
    }

    ctx.putImageData(dados, 0, 0);

    return ImageSource.fromHtmlCanvasElement(canvas);
  }

  changeDirection(direction: Direcao): void {
    if (this.currentDirection === direction) {
      return;
    }

    this.currentDirection = direction;

    const sprite = this.sprites.get(direction);
    if (sprite) {
      this.graphics.use(sprite);
    }
  }

  override onInitialize(): void {
    this.prepararSprites();
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
      this.changeDirection("up");
    } else if (engine.input.keyboard.isHeld(Keys.A)) {
      this.vel = vec(-this.speed, 0);
      this.changeDirection("left");
    } else if (engine.input.keyboard.isHeld(Keys.S)) {
      this.vel = vec(0, this.speed);
      this.changeDirection("down");
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
