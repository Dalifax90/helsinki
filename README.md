# Star Berzerk

Jogo arcade 2D inspirado em **Berzerk**, com tema de **Star Wars**, desenvolvido com
[Excalibur.js](https://excaliburjs.com), TypeScript e Vite.

Você controla Luke Skywalker em uma sequência de setores de uma estação imperial.
Cada setor tem um labirinto gerado aleatoriamente, soldados imperiais e paredes
eletrificadas. Atravesse as portas para avançar, elimine inimigos e sobreviva o
máximo que puder.

## Controles

| Tecla | Ação |
| --- | --- |
| `W`, `A`, `S`, `D` | Mover (inclusive na diagonal) |
| `Espaço` | Disparar o blaster |
| `Enter` | Iniciar o jogo no menu |
| `R` | Reiniciar após o game over |

## Mecânicas

- **Vidas:** o jogador começa com 3 vidas.
- **Invulnerabilidade:** após levar dano, o personagem fica invulnerável por 2
  segundos e pisca durante o efeito.
- **Paredes eletrificadas:** qualquer contato com parede causa dano.
- **Setores:** ao cruzar uma porta, um novo labirinto é gerado, a cor do setor
  muda e a dificuldade aumenta.
- **Inimigos:** soldados perseguem o jogador e atiram. Cada abate vale 100 pontos.
- **Pontuação:** +50 por setor concluído e +100 por inimigo eliminado.
- **Game over:** ao perder as 3 vidas. Pressione `R` para recomeçar.

## Tecnologias

- [Excalibur.js](https://excaliburjs.com) — engine de jogos 2D
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Playwright](https://playwright.dev/) — testes de integração

## Como executar

Pré-requisitos: Node.js 22 (versão indicada em `.nvmrc`) e npm.

```sh
npm install
npm run dev
```

O Vite abre o jogo em `http://localhost:5173`.

### Outros comandos

```sh
npm run build    # checagem de tipos + build de produção em dist/
npm run serve    # serve o build de produção em http://localhost:4173
npm test         # build + testes de integração com Playwright
```

Na primeira execução dos testes é necessário instalar o navegador do Playwright:

```sh
npx playwright install chromium
```

## Estrutura

```
src/
  main.ts         configuração da engine e das cenas
  startScreen.ts  tela inicial
  level.ts        setores, labirinto, HUD, pontuação e game over
  player.ts       movimentação, sprites, dano e disparo
  enemy.ts        IA dos soldados imperiais
  bullet.ts       projéteis do jogador e dos inimigos
  resources.ts    carregamento dos sprites
public/images/    sprites do jogo
tests/            testes de integração
```

## Deploy

O workflow em `.github/workflows/deploy.yml` publica o build no GitHub Pages a
cada push na branch `main`.

## Créditos

Baseado no template oficial
[`excaliburjs/template-ts-vite`](https://github.com/excaliburjs/template-ts-vite),
licenciado sob BSD 2-Clause (veja `LICENSE`).
