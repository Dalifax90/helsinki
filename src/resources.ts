export const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}assets/ninja/${path}`;

const imagePaths = {
  ninja: 'characters/ninja_blue.png',
  green: 'characters/samurai_green.png',
  blue: 'characters/samurai_blue.png',
  floor: 'tiles/floor.png',
  wall: 'tiles/wall.png',
  crate: 'props/crate.png',
  pot: 'props/pot.png',
  heart: 'ui/heart.png',
  shuriken: 'fx/shuriken.png',
  fireball: 'fx/fireball.png',
  smoke: 'fx/smoke.png',
  nature: 'tiles/nature.png',
  elements: 'tiles/elements.png',
  dungeon: 'tiles/dungeon.png',
  bossIdle: 'boss/idle.png',
  bossCharge: 'boss/charge.png',
  bossAttack: 'boss/attack.png',
  bossHit: 'boss/hit.png',
  scrollFire: 'items/scroll-fire.png',
  scrollThunder: 'items/scroll-thunder.png',
  scrollRock: 'items/scroll-rock.png',
  potion: 'items/potion.png',
  nova: 'fx/nova.png',
  scrollIce: 'items/scroll-ice.png',
  blade: 'items/blade.png',
  melee: 'fx/melee.png',
  vitality: 'items/vitality.png'
} as const;

export type Assets = Record<keyof typeof imagePaths, HTMLImageElement>;

export async function loadAssets(): Promise<Assets> {
  const entries = await Promise.all(Object.entries(imagePaths).map(async ([name, path]) => {
    const image = new Image();
    image.src = assetUrl(path);
    try { await image.decode(); }
    catch { throw new Error(`Não foi possível carregar ${path}.`); }
    return [name, image] as const;
  }));
  return Object.fromEntries(entries) as Assets;
}
