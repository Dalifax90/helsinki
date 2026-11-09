import { type Game } from './game';

const grid = document.getElementById('map-grid')!;
const floorLabel = document.getElementById('floor-label')!;
let previousState = '';

export function updateMinimap(game: Game): void {
  const dungeon = game.dungeon;
  const state = `${dungeon.floor}:${dungeon.seed}:${dungeon.current.id}:${dungeon.rooms.map(room => `${room.visited}${room.cleared}`).join('')}`;
  if (state === previousState) return;
  previousState = state;
  floorLabel.textContent = `ANDAR ${String(dungeon.floor).padStart(2, '0')}`;
  grid.replaceChildren();
  const minX = Math.min(...dungeon.rooms.map(room => room.x));
  const maxX = Math.max(...dungeon.rooms.map(room => room.x));
  grid.style.gridTemplateColumns = `repeat(${maxX - minX + 1}, 15px)`;
  for (const room of dungeon.rooms) {
    const revealed = room.visited || dungeon.rooms.some(visited => visited.visited && Math.abs(visited.x - room.x) + Math.abs(visited.y - room.y) === 1);
    if (!revealed) continue;
    const tile = document.createElement('span');
    const current = room.id === dungeon.current.id;
    tile.className = `map-room${current ? ' current' : ''}${room.cleared ? ' cleared' : ''}${room.visited ? '' : ' unexplored'}`;
    tile.style.gridColumn = String(room.x - minX + 1);
    tile.style.gridRow = String(room.y + 1);
    tile.textContent = room.kind === 'boss' ? '◆' : room.kind === 'treasure' && room.visited ? '✦' : '';
    const name = room.kind === 'boss' ? 'Guardião' : room.kind === 'treasure' && room.visited ? 'Tesouro' : 'Sala';
    tile.title = `${name}${current ? ' atual' : room.cleared ? ' limpa' : room.visited ? ' visitada' : ' não explorada'}`;
    tile.setAttribute('aria-label', tile.title);
    grid.append(tile);
  }
}
