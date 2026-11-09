// @ts-nocheck
import { Actor, Color, Engine, Font, FontUnit, Keys, Label, Scene, TextAlign, vec, Sprite, ImageSource } from "excalibur";
import { Resources } from "./resources";

export class StartScreen extends Scene {
    private promptLabel!: Label;

    override onInitialize(engine: Engine): void {
        this.backgroundColor = Color.fromHex("#1a1e2b");

        // Fundo gradiente escuro estilo templo
        const fundo = new Actor({
            pos: vec(400, 300),
            width: 800,
            height: 600,
            color: Color.fromHex("#0f0f23")
        });
        this.add(fundo);

        // Pattern de linhas sutis
        for (let i = 0; i < 30; i++) {
            const linha = new Actor({
                pos: vec(Math.random() * 800, Math.random() * 600),
                width: 1,
                height: Math.random() * 50 + 10,
                color: Color.fromHex("454566"),
                opacity: 0.3
            });
            this.add(linha);
        }

        // Torii gate no centro superior
        const torii = new Actor({
            pos: vec(400, 150),
            width: 200,
            height: 120,
            graphic: new Sprite({
                image: Resources.WallSimple,
                sourceView: { x: 0, y: 0, width: 200, height: 120 }
            })
        });
        this.add(torii);

        // Título principal em fonte pixel
        const titulo = new Label({
            text: "NINJA BERZERK",
            pos: vec(400, 220),
            font: new Font({
                family: "NinjaAdventure",
                size: 42,
                unit: FontUnit.Px,
                color: Color.fromHex("#FFD700"),
                textAlign: TextAlign.Center
            })
        });
        this.add(titulo);

        // Subtítulo
        const subtitulo = new Label({
            text: "Supere os samurais corrompidos",
            pos: vec(400, 280),
            font: new Font({
                family: "NinjaAdventure",
                size: 18,
                unit: FontUnit.Px,
                color: Color.fromHex("#CCCCFF"),
                textAlign: TextAlign.Center
            })
        });
        this.add(subtitulo);

        // Instruções
        const instrucoes = new Label({
            text: "[W, A, S, D] Mover\n[ESPACO] Shuriken\nSupere os inimigos e evite paredes\nPressione ENTER ou ESPACO para começar",
            pos: vec(400, 400),
            font: new Font({
                family: "NinjaAdventure",
                size: 16,
                unit: FontUnit.Px,
                color: Color.fromHex("#A0A0E0"),
                textAlign: TextAlign.Center
            })
        });
        this.add(instrucoes);

        // Vagalumes / partículas flutuantes
        for (let i = 0; i < 20; i++) {
            const vagaLume = new Actor({
                pos: vec(Math.random() * 800, Math.random() * 400),
                width: 3,
                height: 3,
                color: Color.fromHex("FFD700"),
                opacity: Math.random() * 0.5 + 0.3
            });
            this.add(vagaLume);
        }

        // Aviso piscante para começar
        this.promptLabel = new Label({
            text: ">>> PRESSIONE [ENTER] PARA INICIAR <<<",
            pos: vec(400, 550),
            font: new Font({
                family: "NinjaAdventure",
                size: 20,
                unit: FontUnit.Px,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.add(this.promptLabel);
    }

    override onPreUpdate(engine: Engine): void {
        this.promptLabel.graphics.opacity = Math.sin(engine.clock.now() / 220) > -0.2 ? 1 : 0.15;

        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            engine.goToScene("level");
        }
    }
}