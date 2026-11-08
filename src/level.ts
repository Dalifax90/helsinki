import { Actor, CollisionType, Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Font, FontUnit, Label, Scene, SceneActivationContext, TextAlign, Vector, vec } from "excalibur";
import { Player } from "./player";
import { Bullet } from "./bullet";

type DirecaoPorta = "topo" | "base" | "esquerda" | "direita";

export class MyLevel extends Scene {
    private player!: Player;
    private paredesInternas: Actor[] = [];
    private vidasLabel!: Label;
    private gameOverLabel!: Label;
    private estavaMorto: boolean = false;
    private pontuacao: number = 0;
    private salaAtual: number = 1;
    private pontosLabel!: Label;
    private salaLabel!: Label;

    
    private readonly pontosBaseDeSpawn: Vector[] = [
        vec(400, 110), 
        vec(400, 300), 
        vec(400, 490), 
        vec(120, 460), 
        vec(680, 140), 
        vec(680, 460)  
    ];

    override onInitialize(engine: Engine): void {
        this.backgroundColor = Color.Black;

        this.player = new Player();
        this.add(this.player);

        this.criarBordasComPortas();
        this.gerarLabirintoInterno();
        this.criarHUD();
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
        cor: Color = Color.Blue
    ): void {
        const parede = new Actor({
            name: "Wall",
            pos: vec(x, y),
            width: largura,
            height: altura,
            color: cor,
            collisionType: CollisionType.Fixed
        });
        this.add(parede);

        if (interna) {
            this.paredesInternas.push(parede);
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

        // Canto superior esquerdo: Vidas
        this.vidasLabel = new Label({
            text: `Vidas: ${this.player.getLives()}`,
            pos: vec(35, 40),
            z: 100,
            font: fontePadrao
        });
        this.add(this.vidasLabel);

        // Topo centro-esquerda (antes da porta): Sala atual
        this.salaLabel = new Label({
            text: `Sala: ${this.salaAtual}`,
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

        // Canto superior direito: Pontuação
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

        // Centro da tela: Mensagem de Game Over
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

        // Detecta quando o jogador apertou R após o Game Over
        if (this.estavaMorto && !mortoAgora) {
            this.pontuacao = 0;
            this.salaAtual = 1;
            this.limparTiros();
            this.gerarLabirintoInterno();
        }
        this.estavaMorto = mortoAgora;

        // Atualiza os textos da HUD
        const scoreFormatado = String(this.pontuacao).padStart(4, "0");
        this.vidasLabel.text = `Vidas: ${this.player.getLives()}`;
        this.salaLabel.text = `Sala: ${this.salaAtual}`;
        this.pontosLabel.text = `Score: ${scoreFormatado}`;

        if (mortoAgora) {
            this.gameOverLabel.text = `GAME OVER\nScore Final: ${scoreFormatado} (Sala ${this.salaAtual})\nPressione R para reiniciar`;
        }
        this.gameOverLabel.graphics.isVisible = mortoAgora;

        // Verifica transição pelas 4 portas
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
            this.adicionarPontos(50); // Bônus por avançar de sala
            this.limparTiros();
            this.gerarLabirintoInterno(portaEntrada);
        }
    }

    override onPreLoad(loader: DefaultLoader): void {}
    override onActivate(context: SceneActivationContext<unknown>): void {}
    override onDeactivate(context: SceneActivationContext): void {}
    override onPreUpdate(engine: Engine, elapsedMs: number): void {}
    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}