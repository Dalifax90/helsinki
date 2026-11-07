import { Actor, CollisionType, Color, DefaultLoader, Engine, ExcaliburGraphicsContext, Scene, SceneActivationContext, vec } from "excalibur";
import { Player } from "./player";

export class MyLevel extends Scene {
    override onInitialize(engine: Engine): void {
        const player = new Player();
        this.add(player);

        // Bordas externas da sala (800x600)
        this.criarParede(400, 10, 800, 20);  // Topo
        this.criarParede(400, 590, 800, 20); // Base
        this.criarParede(10, 300, 20, 600);  // Esquerda
        this.criarParede(790, 300, 20, 600); // Direita

        // Obstáculos internos do labirinto (deixando espaço para o Player em 150, 150)
        this.criarParede(300, 220, 20, 250); // Pilar vertical esquerdo
        this.criarParede(520, 380, 20, 250); // Pilar vertical direito
        this.criarParede(410, 300, 150, 20); // Barreira horizontal central
    }

    private criarParede(x: number, y: number, largura: number, altura: number): void {
        const parede = new Actor({
            name: "Wall",
            pos: vec(x, y),
            width: largura,
            height: altura,
            color: Color.Blue,
            collisionType: CollisionType.Fixed
        });
        this.add(parede);
    }

    override onPreLoad(loader: DefaultLoader): void {}
    override onActivate(context: SceneActivationContext<unknown>): void {}
    override onDeactivate(context: SceneActivationContext): void {}
    override onPreUpdate(engine: Engine, elapsedMs: number): void {}
    override onPostUpdate(engine: Engine, elapsedMs: number): void {}
    override onPreDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
    override onPostDraw(ctx: ExcaliburGraphicsContext, elapsedMs: number): void {}
}