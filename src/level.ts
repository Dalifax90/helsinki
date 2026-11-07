import { Actor, CollisionType, Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext, vec, Font, FontUnit, Label, TextAlign } from "excalibur";
import { Player } from "./player";
import { Bullet } from "./bullet";

export class MyLevel extends Scene {
    private player!: Player;
    private paredesInternas: Actor[] = [];
    private vidasLabel!: Label;
    private gameOverLabel!: Label;
    override onInitialize(engine: Engine): void {
        
        this.backgroundColor = Color.Black;

        this.player = new Player();
        this.add(this.player);

        this.criarBordasComPortas();
        this.gerarLabirintoInterno();
        this.criarHUD();
    }

    private criarHUD(): void {
        this.vidasLabel = new Label({
            text: 'Vidas: ${this.player.getLives()}',
            pos: vec(35,35),
            z: 100,
            font: new Font({
                family: "monospace",
                size: 20,
                unit: FontUnit.Px,
                color: Color.White,
            })

    });
        this.add(this.vidasLabel);

        this.gameOverLabel = new Label({
            text: 'Game Over -- Pressione R para reiniciar',
            pos: vec(400, 300),
            z: 100,
            font: new Font({
                family: "monospace",
                size: 28,
                unit: FontUnit.Px,
                color: Color.Red,
                textAlign: TextAlign.Center
            })
        });
        this.gameOverLabel.graphics.isVisible = false;
        this.add(this.gameOverLabel);
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

    private gerarLabirintoInterno(): void {
        
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
    }

    private criarParede(x: number, y: number, largura: number, altura: number, interna: boolean): void {
        const parede = new Actor({
            name: "Wall",
            pos: vec(x, y),
            width: largura,
            height: altura,
            color: Color.Blue,
            collisionType: CollisionType.Fixed
        });
        this.add(parede);

        if (interna) {
            this.paredesInternas.push(parede);
        }
    }

    override onPostUpdate(engine: Engine, elapsedMs: number): void {
        
        let trocouDeSala = false;

        this.vidasLabel.text = `Vidas: ${this.player.getLives()}`;
        this.gameOverLabel.graphics.isVisible = this.player.isPlayerDead();
        
        if (this.player.pos.x > 800) {
            this.player.pos.x = 45; 
            trocouDeSala = true;
        } else if (this.player.pos.x < 0) {
            this.player.pos.x = 755; 
            trocouDeSala = true;
        } else if (this.player.pos.y > 600) {
            this.player.pos.y = 45; 
            trocouDeSala = true;
        } else if (this.player.pos.y < 0) {
            this.player.pos.y = 555; 
            trocouDeSala = true;
        }

        if (trocouDeSala) {
            this.actors.filter(a => a instanceof Bullet).forEach(b => b.kill());
            this.gerarLabirintoInterno();
        }
    }

    override onPreLoad(loader: DefaultLoader): void {}
    override onActivate(context: SceneActivationContext<unknown>): void {}
    override onDeactivate(context: SceneActivationContext): void {}
    override onPreUpdate(engine: Engine, elapsedMs: number): void {}
    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}