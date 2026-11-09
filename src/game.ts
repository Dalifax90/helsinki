import { type Boss, type Bullet, type Enemy, type Input, type Item, type Rect } from './types';
import { createPlayer, updatePlayer } from './player';
import { createEnemies } from './enemy';
import { createBoss } from './boss';
import { collectItem, createInventory, itemNames, itemDescriptions } from './powers';
import { Effects } from './effects';
import { crossedDoor, Dungeon, doorRects, type Door } from './dungeon';
import { updateCombat } from './combat';

export class Game {
  player = createPlayer();
  inventory = createInventory();
  enemies = createEnemies(1);
  boss: Boss | null = null;
  bullets: Bullet[] = [];
  items: Item[] = [];
  readonly effects = new Effects();
  dungeon = new Dungeon(1, 0);
  walls: Rect[] = [];
  sector = 1;
  score = 0;
  shots = 0;
  elapsed = 0;
  shake = 0;
  over = false;
  notice = 'Procure as salas de tesouro para encontrar melhorias.';
  noticeTime = 6;
  private rewardSpawned = false;
  constructor(private runSeed = Date.now()) {
    this.dungeon = new Dungeon(1, this.runSeed);
    this.dungeon.current.visited = true;
    this.walls = this.dungeon.wallLayout();
  }
  get exitOpen(): boolean { return this.enemies.length === 0 && !this.boss; }
  get particles() { return this.effects.particles; }
  get smoke() { return this.effects.smoke; }
  get collisionWalls(): Rect[] { return this.exitOpen ? this.walls : [...this.walls, ...this.dungeon.availableDoors().map(door => doorRects[door])]; }

  reset(): void {
    this.player = createPlayer();
    this.inventory = createInventory();
    this.sector = 1;
    this.score = 0;
    this.shots = 0;
    this.elapsed = 0;
    this.shake = 0;
    this.over = false;
    this.dungeon = new Dungeon(1, ++this.runSeed);
    this.prepareRoom();
    this.announce('Procure as salas de tesouro para encontrar melhorias.');
  }

  startBossChallenge(): void {
    this.reset();
    this.sector = 3;
    this.dungeon.current = this.dungeon.rooms.find(room => room.kind === 'boss')!;
    this.inventory.spread = 1;
    this.inventory.rapid = 1;
    this.inventory.shields = 1;
    this.prepareRoom();
  }

  update(elapsed: number, input: Input): void {
    if (this.over) return;
    this.elapsed += elapsed;
    this.shake = Math.max(0, this.shake - elapsed * 25);
    this.noticeTime = Math.max(0, this.noticeTime - elapsed);
    this.inventory.novaCooldown = Math.max(0, this.inventory.novaCooldown - elapsed);
    const walls = this.collisionWalls;
    if (updatePlayer(this.player, input, elapsed, walls)) this.damage();
    if (this.over) return;
    this.collectItems();
    updateCombat(this, elapsed, input, walls);
    this.effects.update(elapsed);
    if (this.exitOpen && !this.rewardSpawned) {
      const rewards = this.dungeon.reward();
      this.items.push(...rewards);
      this.rewardSpawned = true;
      this.dungeon.current.cleared = true;
      this.walls = this.dungeon.wallLayout();
      this.announce(this.dungeon.current.kind === 'boss' ? 'Guardião derrotado! Recolha sua recompensa.'
        : rewards.length ? 'Sala livre! Recolha os itens antes de seguir.' : 'Sala livre! Explore outros caminhos em busca de tesouros.');
    }
    const door = crossedDoor(this.player);
    if (this.exitOpen && door && !this.over) this.advance(door);
  }

  private collectItems(): void {
    this.items = this.items.filter(item => {
      const collected = collectItem(item, this.player, this.inventory);
      if (collected === 'keep') return true;
      if (collected === 'bonus') this.score += 25;
      this.effects.burst(item, '#bdeed1');
      this.announce(`${itemNames[item.kind]} · ${collected === 'bonus' ? 'No máximo: +25 pontos' : itemDescriptions[item.kind]}`);
      return false;
    });
  }

  private defeatEnemy(enemy: Enemy): void {
    this.enemies = this.enemies.filter(current => current !== enemy);
    this.score += 100;
    this.effects.burst(enemy, '#ffd893');
  }

  hitEnemy(enemy: Enemy, amount: number): void {
    enemy.hp = Math.max(0, enemy.hp - amount);
    enemy.flash = 0.14;
    if (this.inventory.frost > 0) enemy.slow = 1 + this.inventory.frost * 0.5;
    if (enemy.hp === 0) this.defeatEnemy(enemy);
  }

  hitBoss(amount: number): void {
    if (!this.boss) return;
    this.boss.hp = Math.max(0, this.boss.hp - amount);
    this.boss.flash = 0.12;
    if (this.boss.hp > 0) return;
    this.effects.burst(this.boss, '#ffb37c');
    this.boss = null;
    this.score += 1000;
    for (const bullet of this.bullets) if (bullet.owner === 'enemy') bullet.life = 0;
    this.shake = 8;
  }

  damage(): void {
    if (this.player.invulnerable > 0 || this.over) return;
    if (this.inventory.shields > 0) { this.inventory.shields--; this.announce('O selo da rocha absorveu o impacto.'); }
    else this.player.lives--;
    this.player.invulnerable = 1.8;
    this.shake = 6;
    this.effects.burst(this.player, '#ef896e');
    this.over = this.player.lives === 0;
  }

  private advance(door: Door): void {
    const next = this.dungeon.neighbor(door);
    if (!this.dungeon.availableDoors().includes(door)) return;
    this.dungeon.current.items = this.items;
    if (next) {
      if (!next.visited) this.score += 50;
      this.dungeon.current = next;
    } else {
      this.dungeon = new Dungeon(this.dungeon.floor + 1, this.runSeed + this.dungeon.floor * 101);
      this.score += 50;
    }
    this.sector = this.dungeon.current.sector;
    this.player.x = door === 'east' ? 96 : door === 'west' ? 864 : 480;
    this.player.y = door === 'north' ? 472 : door === 'south' ? 96 : 288;
    this.player.invulnerable = 1.8;
    this.prepareRoom();
  }

  private announce(message: string): void { this.notice = message; this.noticeTime = 4; }

  private prepareRoom(): void {
    const room = this.dungeon.current;
    const bossRoom = room.kind === 'boss' && !room.cleared;
    this.walls = this.dungeon.wallLayout();
    this.boss = bossRoom ? createBoss(this.sector) : null;
    this.enemies = room.kind === 'combat' && !room.cleared ? createEnemies(this.sector) : [];
    this.items = room.visited ? room.items : [];
    this.bullets = [];
    this.effects.clear();
    this.rewardSpawned = room.cleared;
    room.visited = true;
    this.announce(bossRoom ? 'Akuma despertou. Desvie das rajadas e observe a investida!' : 'Explore, recolha pergaminhos e prepare sua nova espiritual [Q].');
  }
}
