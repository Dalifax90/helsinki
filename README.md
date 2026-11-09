# Ninja Berzerk

Roguelike de ação para a disciplina de jogos. A estrutura de salas fechadas e combate se inspira em **Enter the Gungeon** e **The Binding of Isaac**; a perseguição, os projéteis e as paredes perigosas vêm de **Berzerk**. A identidade visual usa o **Ninja Adventure**, de Pixel-Boy e AAA.

## Jogar localmente

Requer Node.js 22 ou superior e npm.

```sh
npm install
npm run dev
```

Abra http://127.0.0.1:5173. Clique em **Entrar no templo** ou pressione **Enter**. A música começa com essa interação.

## Controles

| Controle | Ação |
| --- | --- |
| WASD ou setas | Mover em oito direções |
| Espaço, segurando | Disparar na direção do personagem |
| Mouse + botão esquerdo | Mirar e disparar independentemente do movimento |
| E ou botão direito do mouse | Golpe corpo a corpo na direção da mira |
| Q ou botão Nova espiritual | Pulso que causa dano próximo e apaga projéteis |
| Shift + movimento | Esquivar, com invulnerabilidade breve e recarga |
| Esc ou P | Pausar / continuar |
| M | Ligar / desligar música e efeitos |
| R ou Enter, após morrer | Reiniciar a jornada |

Em telas pequenas, botões de movimento, esquiva e disparo aparecem abaixo da arena. Ao sair da janela ou trocar de aba, o jogo pausa automaticamente.

## Combate e progressão

- A cadência inicial é **1 tiro por segundo**, com **1 de dano por shuriken**. Os samurais verdes têm **3 pontos de vida** e os azuis **4**, indicados acima de cada personagem.
- O golpe corpo a corpo causa **2 de dano**, alcança 74 unidades e recarrega em 0,65 segundo. A mira determina a direção; o golpe respeita paredes e não atinge alvos atrás do jogador.
- Você começa com **3 vidas**, e itens de vitalidade podem elevar a vida máxima até **6**. Apenas obstáculos marcados com **espinhos e brilho laranja**, samurais e projéteis causam dano. Paredes comuns e portas apenas bloqueiam o movimento. Após um impacto, há 1,8 segundo de invulnerabilidade.
- A esquiva dura 0,16 segundo e recarrega em 1,1 segundo. A nova espiritual causa **2 de dano** em samurais próximos, **5 no chefe**, elimina projéteis em um raio de 160 unidades e recarrega em **8 segundos**.
- Cada andar contém um mapa gerado por semente, com **9 salas conectadas**, caminhos laterais e salas de tesouro. O minimapa revela salas próximas conforme você explora.
- Limpar uma sala abre as portas conectadas. É possível voltar a salas limpas; inimigos não reaparecem, itens deixados no chão são preservados e revisitas não repetem a pontuação.
- Eliminar um samurai vale 100 pontos. Explorar uma sala nova vale 50. Derrotar o guardião vale 1000.
- Os itens acumulam durante a tentativa e combinam seus efeitos. Morrer ou começar outra jornada restaura vida, inventário, mapa e pontuação iniciais.

## Itens e poderes

Aproxime-se de um item para coletar. A jornada começa **sem buffs gratuitos**. Salas de combate comuns não concedem melhorias permanentes: têm **25% de chance de deixar apenas uma poção de cura**. Salas de tesouro e chefes garantem uma melhoria. As recompensas são determinadas pela semente da tentativa e não mudam ao revisitar uma sala.

| Item | Efeito |
| --- | --- |
| Leque de shurikens | 3 projéteis por disparo no nível 1; 5 no nível 2 |
| Ímpeto do trovão | Cadência de 1,35 tiro/s no nível 1 e 1,70 no nível 2 |
| Selo da rocha | Absorve um impacto por carga, até 2 cargas |
| Selo do gelo | Tiros e golpes desaceleram samurais atingidos |
| Lâmina ancestral | +1 de dano e +12 de alcance corpo a corpo por nível |
| Poção de vida | Recupera 1 vida até sua vida máxima atual; permanece no chão se estiver cheio |
| Coração ancestral | +1 vida máxima e recupera 1 coração, até o limite de 6 vidas |

Os pergaminhos têm limite de 2 níveis; vitalidade pode ser adquirida 3 vezes. Um item já maximizado concede 25 pontos. O painel mostra os itens equipados, níveis e a recarga da nova espiritual.

## Akuma, o guardião rubro

O chefe ocupa o santuário de cada andar. Ele alterna **rajadas circulares**, **disparos direcionados** e uma **investida sinalizada** por linha e círculo no chão. Com metade da vida, entra na segunda fase: mais projéteis e intervalos menores. Durante a recuperação após investir, há uma abertura para atacar.

Derrotá-lo libera uma recompensa e a passagem ao norte para outro andar, preservando os poderes da tentativa. A vida do chefe aumenta nos andares seguintes. O santuário do chefe e as salas de tesouro têm paredes seguras; nas salas de combate, apenas um dos obstáculos internos recebe espinhos, sem transformar bordas e portas em armadilhas.

O botão **Desafiar o guardião** no menu inicia um treino diretamente na luta, com leque, cadência e escudo no nível 1. A jornada normal começa sem esses upgrades equipados.

## Implementação

A reconstrução usa **TypeScript estrito, Canvas 2D e Vite**, sem dependências de execução. O Excalibur foi removido. A renderização 2D não exige WebGL e desenha uma camada estática por setor, separada de personagens, projéteis e efeitos.

A simulação usa passos fixos de 1/120 segundo. As colisões acompanham o tamanho dos personagens, o movimento diagonal é normalizado, e os inimigos compartilham um mapa de distâncias para encontrar caminhos livres. Os sprites usam quadros de 16×16, direções nas colunas e animação nas linhas. As shurikens e bolas de fogo vêm dos arquivos próprios do pacote.

Os recursos essenciais são carregados antes de liberar o início. Uma falha mostra uma mensagem e um botão para tentar novamente. URLs respeitam a base relativa do Vite para publicação em subdiretórios.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/main.ts` | Inicialização, estados e ciclo do jogo |
| `src/game.ts` | Regras, pontuação, dano e progressão |
| `src/level.ts`, `src/dungeon.ts` | Colisões, caminhos e mapa procedural |
| `src/combat.ts`, `src/melee.ts` | Disparos, nova e corpo a corpo |
| `src/powers.ts`, `src/powerHud.ts` | Itens, buffs e inventário |
| `src/boss.ts` | Fases e ataques de Akuma |
| `src/minimap.ts` | Mapa da exploração |
| `src/player.ts`, `src/enemy.ts`, `src/bullet.ts` | Movimento e combate |
| `src/renderer.ts` | Cenário, sprites, animações e efeitos |
| `src/resources.ts` | Manifesto e carregamento de imagens |
| `src/input.ts` | Teclado, mouse e toque |
| `src/audio.ts` | Música e efeitos sonoros |
| `src/startScreen.ts`, `src/styles/` | Menus, painel e apresentação |

## Verificação

```sh
npm run build
npx playwright install chromium
npm test
```

Para usar o Microsoft Edge já instalado, no PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge'
npm test
```

Os testes verificam a renderização com cores reais no canvas, inicialização, movimento, disparo, pausa, som, tela pequena e recuperação após falha no carregamento. A simulação tem testes de colisão, invulnerabilidade, esquiva, navegação dos inimigos, pontuação, troca de setor, morte e reinício. Os testes adicionais cobrem cadência, múltiplos hits, alcance do golpe, itens, escudo, recarga de poderes, fases e derrota do chefe, exploração, revisitas e preservação da build ao mudar de andar.

As capturas ficam em `test-results/`; o relatório fica em `playwright-report/`.

## Publicação

```sh
npm run build
npm run serve
```

O build fica em `dist/`. O workflow existente publica no GitHub Pages quando há um push na branch `main`. Nenhum push ou publicação é necessário para jogar localmente.

## Arte, áudio e licença

- **Ninja Adventure**, por **Pixel-Boy e AAA**: https://pixel-boy.itch.io/ninja-adventure-asset-pack
- Recursos licenciados em **CC0 1.0 Universal**. A licença original e o README do pacote estão em `public/assets/ninja/LICENSE.txt` e `public/assets/ninja/PACK-README.md`.
- O pacote oficial foi baixado para integrar shurikens, bolas de fogo, fumaça, árvores, elementos do templo e efeitos sonoros. Apenas os recursos usados pelo projeto precisam acompanhar a publicação; o ZIP de trabalho fica em `.cache/`, ignorado pelo Git.
- O projeto começou com o template `excaliburjs/template-ts-vite`. Sua licença BSD 2-Clause foi preservada em `LICENSE`.

## Codex no Zed com sua conta ChatGPT

O adaptador oficial `codex-acp` já está instalado no Zed deste computador, e a conexão local foi verificada criando uma sessão sem enviar um pedido ao modelo. O Codex local reconhece o login **ChatGPT**.

No painel de agentes do Zed, abra uma nova conversa e escolha **Codex**. Se for solicitado login, escolha **ChatGPT**, usando a conta da sua assinatura Plus. Não é necessário adicionar uma chave de API para usar essa modalidade. Os limites de uso da assinatura continuam valendo.

Referências: https://zed.dev/docs/ai/external-agents e https://zed.dev/docs/ai/use-an-existing-subscription

## Interface

A interface usa fundo off-white, tinta quase preta e um único acento vermelho. Títulos em Fraunces, corpo em Public Sans, ambos hospedados localmente em `public/assets/fonts/`, com suas licenças OFL. A navegação, o painel do jogo, os controles em tabela e os créditos mantêm linhas e bordas retas, sem gradientes.
