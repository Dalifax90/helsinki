import {
    Actor,
    CollisionType,
    Color,
    DefaultLoader,
    Engine,
    ExcaliburGraphicsContext,
    Font,
    FontUnit,
    Label,
    Scene,
    SceneActivationContext,
    TextAlign,
    Vector,
    vec
} from "excalibur";
import { Player } from "./player";
import { Bullet } from "./bullet";
import { Enemy } from "./enemy";

type DirecaoPorta = "topo" | "base" | "esquerda" | "direita";

export class MyLevel extends Scene {
    private player!: Player;
    private paredesInternas: Actor[] = [];
    private paredesBorda: Actor[] = [];
    private inimigos: Enemy[] = [];
    private vidasLabel!: Label;
    private gameOverLabel!: Label;
    private estavaMorto: boolean = false;
    private pontuacao: number = 0;
    private salaAtual: number = 1;
    private pontosLabel!: Label;
    private salaLabel!: Label;

    private readonly coresSetores: Color[] = [
        Color.fromHex("#718096"), 
        Color.fromHex("#3182CE"), 
        Color.fromHex("#D69E2E"), 
        Color.fromHex("#38B2AC"), 
        Color.fromHex("#805AD5")  
    ];

    private readonly pontosBaseDeSpawn: Vector[] = [
        vec(400, 110),
        vec(400, 300),
        vec(400, 490),
        vec(120, 460),
        vec(680, 140),
        vec(680, 460)
    ];

    override onInitialize(engine: Engine): void {
        this.backgroundColor = Color.fromHex("#111317");

        this.player = new Player();
        this.add(this.player);

        this.criarBordasComPortas();
        this.prepararSala();
        this.criarHUD();
    }

    private obterCorDoSetorAtual(): Color {
        return this.coresSetores[(this.salaAtual - 1) % this.coresSetores.length];
    }

    private criarBordasComPortas(): void {
        const espessura = 20;

        
        this.criarParede(170, 10, 340, espessura, false);
        this.criarParede(630, 10, 340, espessura, false);

        
        this.criarParede(170, 590, 340, espessura, false);
        this.criarParede(630, 590, 340, espessura, false);

        
        this.criarParede(10, 120, espessura, 240, false);
        this.criarParede(10, 480, espessura, 240, false);

        
        this.criarParede(790, 120, espessura, 240, false);
        this.criarParede(790, 480, espessura, 240, false);
    }

    private gerarLabirintoInterno(portaEntrada?: DirecaoPorta): void {
        const corDoSetor = this.obterCorDoSetorAtual();

        
        for (const borda of this.paredesBorda) {
            borda.color = corDoSetor;
        }

        
        for (const parede of this.paredesInternas) {
            parede.kill();
        }
        this.paredesInternas = [];

        const pilares = [
            { x: 280, y: 200 },
            { x: 520, y: 200 },
            { x: 280, y: 400 },
            { x: 520, y: 400 }
        ];

        for (const pilar of pilares) {
            const direcao = Math.floor(Math.random() * 4);

            if (direcao === 0) {
                this.criarParede(pilar.x, pilar.y - 50, 20, 120, true);
            } else if (direcao === 1) {
                this.criarParede(pilar.x, pilar.y + 50, 20, 120, true);
            } else if (direcao === 2) {
                this.criarParede(pilar.x - 60, pilar.y, 140, 20, true);
            } else {
                this.criarParede(pilar.x + 60, pilar.y, 140, 20, true);
            }
        }

        if (portaEntrada) {
            this.fecharPortaDeEntrada(portaEntrada);
        }
    }

    private fecharPortaDeEntrada(porta: DirecaoPorta): void {
        const corBarreira = Color.Red;

        if (porta === "esquerda") {
            this.criarParede(10, 300, 20, 120, true, corBarreira);
        } else if (porta === "direita") {
            this.criarParede(790, 300, 20, 120, true, corBarreira);
        } else if (porta === "topo") {
            this.criarParede(400, 10, 120, 20, true, corBarreira);
        } else if (porta === "base") {
            this.criarParede(400, 590, 120, 20, true, corBarreira);
        }
    }

    private prepararSala(portaEntrada?: DirecaoPorta): void {
        this.gerarLabirintoInterno(portaEntrada);
        this.gerarInimigos();
    }

    private gerarInimigos(): void {
        for (const inimigo of this.inimigos) {
            inimigo.kill();
        }
        this.inimigos = [];

        const quantidade = Math.min(2 + Math.floor((this.salaAtual - 1) / 2), 6);
        const dificuldade = Math.min(this.salaAtual, 10);
        const pontosDeSpawn = this.obterPontosDeSpawn(quantidade);

        for (const ponto of pontosDeSpawn) {
            const inimigo = new Enemy(ponto, this.player, dificuldade, () => {
                this.adicionarPontos(100);
                this.inimigos = this.inimigos.filter((atual) => atual !== inimigo);
            });

            this.inimigos.push(inimigo);
            this.add(inimigo);
        }
    }

    public obterPontosDeSpawn(quantidade: number = 3): Vector[] {
        const pontosSeguros = this.pontosBaseDeSpawn.filter(
            ponto => ponto.distance(this.player.pos) > 200
        );

        const embaralhados = [...pontosSeguros].sort(() => Math.random() - 0.5);
        return embaralhados.slice(0, quantidade);
    }

    private criarParede(
        x: number,
        y: number,
        largura: number,
        altura: number,
        interna: boolean,
        cor?: Color
    ): void {
        const corEscolhida = cor ?? this.obterCorDoSetorAtual();

        const parede = new Actor({
            name: "Wall",
            pos: vec(x, y),
            width: largura,
            height: altura,
            color: corEscolhida,
            collisionType: CollisionType.Fixed
        });
        this.add(parede);

        if (interna) {
            this.paredesInternas.push(parede);
        } else {
            this.paredesBorda.push(parede);
        }
    }

    public adicionarPontos(valor: number): void {
        this.pontuacao += valor;
    }

    private criarHUD(): void {
        const fontePadrao = new Font({
            family: "monospace",
            size: 20,
            unit: FontUnit.Px,
            color: Color.White
        });

        this.vidasLabel = new Label({
            text: `Vidas: ${this.player.getLives()}`,
            pos: vec(35, 40),
            z: 100,
            font: fontePadrao
        });
        this.add(this.vidasLabel);

        this.salaLabel = new Label({
            text: `Setor: ${this.salaAtual}`,
            pos: vec(190, 40),
            z: 100,
            font: new Font({
                family: "monospace",
                size: 20,
                unit: FontUnit.Px,
                color: Color.Cyan
            })
        });
        this.add(this.salaLabel);

        this.pontosLabel = new Label({
            text: "Score: 0000",
            pos: vec(765, 40),
            z: 100,
            font: new Font({
                family: "monospace",
                size: 20,
                unit: FontUnit.Px,
                color: Color.Yellow,
                textAlign: TextAlign.Right
            })
        });
        this.add(this.pontosLabel);

        this.gameOverLabel = new Label({
            text: "GAME OVER\nPressione R para reiniciar",
            pos: vec(400, 280),
            z: 100,
            font: new Font({
                family: "monospace",
                size: 26,
                unit: FontUnit.Px,
                color: Color.Red,
                textAlign: TextAlign.Center
            })
        });
        this.gameOverLabel.graphics.isVisible = false;
        this.add(this.gameOverLabel);
    }

    private limparTiros(): void {
        this.actors.filter(a => a instanceof Bullet).forEach(b => b.kill());
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        const mortoAgora = this.player.isPlayerDead();

        if (this.estavaMorto && !mortoAgora) {
            this.pontuacao = 0;
            this.salaAtual = 1;
            this.limparTiros();
            this.prepararSala();
        }
        this.estavaMorto = mortoAgora;

        const scoreFormatado = String(this.pontuacao).padStart(4, "0");
        this.vidasLabel.text = `Vidas: ${this.player.getLives()}`;
        this.salaLabel.text = `Setor: ${this.salaAtual}`;
        this.pontosLabel.text = `Score: ${scoreFormatado}`;

        if (mortoAgora) {
            this.gameOverLabel.text = `GAME OVER\nScore Final: ${scoreFormatado} (Setor ${this.salaAtual})\nPressione R para reiniciar`;
        }
        this.gameOverLabel.graphics.isVisible = mortoAgora;

        let portaEntrada: DirecaoPorta | undefined;

        if (this.player.pos.x > 800) {
            this.player.pos.x = 55;
            portaEntrada = "esquerda";
        } else if (this.player.pos.x < 0) {
            this.player.pos.x = 745;
            portaEntrada = "direita";
        } else if (this.player.pos.y > 600) {
            this.player.pos.y = 55;
            portaEntrada = "topo";
        } else if (this.player.pos.y < 0) {
            this.player.pos.y = 545;
            portaEntrada = "base";
        }

        if (portaEntrada) {
            this.salaAtual++;
            this.adicionarPontos(50);
            this.limparTiros();
            this.prepararSala(portaEntrada);
        }
    }

    override onPreLoad(loader: DefaultLoader): void {}
    override onActivate(context: SceneActivationContext<unknown>): void {}
    override onDeactivate(context: SceneActivationContext): void {}
    override onPreUpdate(engine: Engine, elapsedMs: number): void {}
    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}