import {
    Actor,
    Color,
    Engine,
    Font,
    FontUnit,
    Keys,
    Label,
    Scene,
    TextAlign,
    vec
} from "excalibur";

export class StartScreen extends Scene {
    private promptLabel!: Label;

    override onInitialize(engine: Engine): void {
        this.backgroundColor = Color.fromHex("#080A0F");

        // Gera estrelas no fundo para dar clima espacial
        for (let i = 0; i < 65; i++) {
            const tamanho = Math.random() > 0.8 ? 3 : 2;
            const estrela = new Actor({
                pos: vec(Math.random() * 800, Math.random() * 600),
                width: tamanho,
                height: tamanho,
                color: Math.random() > 0.3 ? Color.White : Color.Cyan
            });
            estrela.graphics.opacity = 0.3 + Math.random() * 0.7;
            this.add(estrela);
        }

        // Subtítulo superior
        const subtitulo = new Label({
            text: "TRANSMISSAO DA ALIANCA REBELDE",
            pos: vec(400, 130),
            font: new Font({
                family: "monospace",
                size: 16,
                unit: FontUnit.Px,
                color: Color.Cyan,
                textAlign: TextAlign.Center
            })
        });
        this.add(subtitulo);

        // Título principal no amarelo clássico de Star Wars
        const titulo = new Label({
            text: "STAR BERZERK",
            pos: vec(400, 195),
            font: new Font({
                family: "monospace",
                size: 36,
                unit: FontUnit.Px,
                color: Color.fromHex("#FFE81F"),
                textAlign: TextAlign.Center
            })
        });
        this.add(titulo);

        // Caixa de instruções e controles
        const controles = new Label({
            text: "[W, A, S, D] Mover Luke pelos setores\n[ESPACO] Disparar Blaster\n\nElimine os soldados imperiais (+100 pontos).\nCuidado: paredes eletrificadas causam dano!\nAvance pelas portas para somar +50 pontos.",
            pos: vec(400, 340),
            font: new Font({
                family: "monospace",
                size: 17,
                unit: FontUnit.Px,
                color: Color.fromHex("#CBD5E0"),
                textAlign: TextAlign.Center
            })
        });
        this.add(controles);

        // Aviso piscante para começar
        this.promptLabel = new Label({
            text: ">>> PRESSIONE [ENTER] OU [ESPACO] PARA INICIAR <<<",
            pos: vec(400, 510),
            font: new Font({
                family: "monospace",
                size: 20,
                unit: FontUnit.Px,
                color: Color.White,
                textAlign: TextAlign.Center
            })
        });
        this.add(this.promptLabel);
    }

    override onPreUpdate(engine: Engine): void {
        // Faz o texto de "Pressione Enter" piscar suavemente estilo arcade
        this.promptLabel.graphics.opacity = Math.sin(engine.clock.now() / 220) > -0.2 ? 1 : 0.15;

        // Inicia o jogo ao apertar Enter ou Espaço
        if (
            engine.input.keyboard.wasPressed(Keys.Enter) ||
            engine.input.keyboard.wasPressed(Keys.Space)
        ) {
            engine.goToScene("level");
        }
    }
}