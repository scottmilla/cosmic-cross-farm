export const START_Z = 12
export const FIRST_TREE_Z = -6
export const TREE_SPACING = 7.5

// Layout is mutated (before the scene mounts) when the viewport changes between desktop and phone:
// a skinnier path, rows pulled in, a smaller character and a closer camera so a portrait screen isn't mostly meadow.
export const layout = {
  mobile: false,
  pathHalf: 4.6,
  treeX: 8,
  charScale: 1,
  cam: 1,
}
export function applyLayout(mobile: boolean) {
  layout.mobile = mobile
  layout.pathHalf = mobile ? 2.7 : 4.6
  layout.treeX = mobile ? 5.7 : 8
  layout.charScale = mobile ? 0.82 : 1
  layout.cam = mobile ? 0.8 : 1
}
export function detectMobile() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 700px), (max-height: 480px)').matches
}
export const TREE_COUNT = 6 // longest row
export const END_Z = FIRST_TREE_Z - (TREE_COUNT - 1) * TREE_SPACING - 7

export function treeZ(i: number) {
  return FIRST_TREE_Z - i * TREE_SPACING
}

// Citrus on the left, pawpaws on the right (staggered by half a step so the rows interleave).
export function treePosition(row: 'citrus' | 'pawpaw', indexInRow: number): [number, number, number] {
  return row === 'citrus'
    ? [-layout.treeX, 0, treeZ(indexInRow)]
    : [layout.treeX, 0, treeZ(indexInRow) - TREE_SPACING / 2]
}

// Tiny seeded RNG so scenery is stable between renders.
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
