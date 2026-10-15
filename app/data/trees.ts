// Mock catalogue. Shaped like a Shopify product so the Storefront API can replace it later
// (see app/composables/useShop.ts for the single seam to swap).
// NOTE: descriptions, prices and growing facts are placeholder copy — replace with real data.
export type TreeShape = 'citrus' | 'thorny' | 'pawpaw'
export type Row = 'citrus' | 'pawpaw'

export interface FruitTreeProduct {
  id: string
  handle: string
  row: Row
  variety: string
  type: string
  emoji: string
  tagline: string
  description: string
  price: number
  facts: { label: string; value: string }[]
  look: {
    shape: TreeShape
    leaf: string
    leafAlt: string
    trunk: string
    fruit: string
    fruitMix?: string[] // cycles through these instead of `fruit` (chimera)
    fruitSize: number
    fruitStretch: number
    fruitCount: number
    bumpy?: boolean
    blossoms?: boolean
  }
}

const citrusFacts = (harvest: string, height: string, zones: string) => [
  { label: 'Harvest', value: harvest },
  { label: 'Mature height', value: height },
  { label: 'Sun', value: 'Full sun' },
  { label: 'Hardy zones', value: zones },
]
const pawpawFacts = (harvest = 'Sept–Oct') => [
  { label: 'Harvest', value: harvest },
  { label: 'Mature height', value: '12–20 ft' },
  { label: 'Sun', value: 'Part to full sun' },
  { label: 'Hardy zones', value: '5–8' },
]

export const trees: FruitTreeProduct[] = [
  // ── Left row: cold-hardy citrus ──────────────────────────────────────────
  {
    id: 'yuzu', handle: 'yuzu-lemon', row: 'citrus', variety: 'Yuzu', type: 'Lemon', emoji: '🍋',
    tagline: 'Fragrant, bumpy, brave in the cold.',
    description: 'A prized aromatic citrus with knobbly yellow fruit and a perfume unlike any other lemon. One of the hardiest edible citrus you can grow outdoors.',
    price: 1, facts: citrusFacts('Nov–Dec', '6–10 ft', '6–10'),
    look: { shape: 'citrus', leaf: '#2e8b57', leafAlt: '#267a4c', trunk: '#7a5230', fruit: '#f6d63a', fruitSize: 0.24, fruitStretch: 1, fruitCount: 16, bumpy: true, blossoms: true },
  },
  {
    id: 'carolina-lime', handle: 'carolina-lime', row: 'citrus', variety: 'Carolina', type: 'Lime', emoji: '🍈',
    tagline: 'Zesty green limes, tougher than they look.',
    description: 'Bright, tart limes on a cold-tolerant tree. Squeeze them into everything.',
    price: 75, facts: citrusFacts('Fall–Winter', '6–10 ft', '7–10'),
    look: { shape: 'citrus', leaf: '#3a9a4f', leafAlt: '#2f8842', trunk: '#785034', fruit: '#8fd13a', fruitSize: 0.18, fruitStretch: 1.05, fruitCount: 22, blossoms: true },
  },
  {
    id: 'prague-chimera', handle: 'prague-chimera', row: 'citrus', variety: 'Prague', type: 'Chimera', emoji: '✨',
    tagline: 'Several citrus in one tree.',
    description: 'A grafted-together curiosity that can show off different fruit on the same tree. The ultimate conversation piece in a cold-hardy citrus collection.',
    price: 120, facts: citrusFacts('Fall–Winter', '6–10 ft', '7–10'),
    look: { shape: 'citrus', leaf: '#2c8a5a', leafAlt: '#237a4e', trunk: '#6f4a2e', fruit: '#ff9a1f', fruitMix: ['#ff9a1f', '#f6d63a', '#8fd13a', '#ffb347'], fruitSize: 0.21, fruitStretch: 1, fruitCount: 22, blossoms: true },
  },
  {
    id: 'ten-degree-tangerine', handle: '10-degree-tangerine', row: 'citrus', variety: '10 Degree', type: 'Tangerine', emoji: '🍊',
    tagline: 'Sweet tangerines that shrug off the frost.',
    description: 'Easy-peel, sweet-tart tangerines on a tree named for how cold it can handle. A solid pick for pushing citrus north.',
    price: 90, facts: citrusFacts('Nov–Jan', '8–12 ft', '8–10'),
    look: { shape: 'citrus', leaf: '#2f9255', leafAlt: '#278048', trunk: '#7c5232', fruit: '#ff8c1a', fruitSize: 0.22, fruitStretch: 0.9, fruitCount: 20, blossoms: true },
  },
  {
    id: 'changsha-mandarin', handle: 'changsha-mandarin', row: 'citrus', variety: 'Changsha', type: 'Mandarin', emoji: '🍊',
    tagline: 'Little flat mandarins, loaded with flavor.',
    description: 'A very cold-hardy mandarin that sets heavy crops of small, flattened, richly flavored fruit.',
    price: 80, facts: citrusFacts('Oct–Dec', '8–12 ft', '7–10'),
    look: { shape: 'citrus', leaf: '#348f50', leafAlt: '#2a7c42', trunk: '#7a5030', fruit: '#ff7d14', fruitSize: 0.18, fruitStretch: 0.78, fruitCount: 28, blossoms: true },
  },
  {
    id: 'trifoliate-orange', handle: 'trifoliate-orange', row: 'citrus', variety: 'Trifoliate', type: 'Orange', emoji: '🌿',
    tagline: 'The toughest citrus there is. Thorns included.',
    description: 'Fuzzy golf-ball fruit, sweet-smelling spring blossoms and fierce green thorns. Hardy far beyond any other citrus, and a legendary hedge.',
    price: 55, facts: citrusFacts('Sept–Oct', '8–15 ft', '5–9'),
    look: { shape: 'thorny', leaf: '#6fc04a', leafAlt: '#5aae3c', trunk: '#5f9a3c', fruit: '#f0c93a', fruitSize: 0.17, fruitStretch: 1, fruitCount: 12, blossoms: true },
  },

  // ── Right row: pawpaws ───────────────────────────────────────────────────
  {
    id: 'florence-white', handle: 'florence-white-pawpaw', row: 'pawpaw', variety: 'Florence White', type: 'Pawpaw', emoji: '🥭',
    tagline: 'Pale, creamy, custardy.',
    description: 'A white-fleshed pawpaw with a soft, custard-like texture and tropical flavor. Plant two varieties for the best crops.',
    price: 48, facts: pawpawFacts(),
    look: { shape: 'pawpaw', leaf: '#6dbb4a', leafAlt: '#5aa83d', trunk: '#6b5a48', fruit: '#c9d96a', fruitSize: 0.2, fruitStretch: 1.7, fruitCount: 4 },
  },
  {
    id: 'al-horns-white', handle: 'al-horns-white-pawpaw', row: 'pawpaw', variety: "Al Horn's White", type: 'Pawpaw', emoji: '🥭',
    tagline: 'A rare white-fleshed treasure.',
    description: 'A sought-after pale-fleshed selection with big, sweet, banana-and-mango flavors. A great partner for any other pawpaw.',
    price: 52, facts: pawpawFacts('Late Sept'),
    look: { shape: 'pawpaw', leaf: '#74c04f', leafAlt: '#60ac41', trunk: '#6b5a48', fruit: '#d6e27a', fruitSize: 0.21, fruitStretch: 1.6, fruitCount: 3 },
  },
  {
    id: 'avatar', handle: 'avatar-pawpaw', row: 'pawpaw', variety: 'Avatar', type: 'Pawpaw', emoji: '🥭',
    tagline: 'Big clusters of big fruit.',
    description: 'A vigorous grower known for generous crops of large fruit with rich, sweet flesh.',
    price: 50, facts: pawpawFacts(),
    look: { shape: 'pawpaw', leaf: '#62b043', leafAlt: '#519c37', trunk: '#66553f', fruit: '#9cc64a', fruitSize: 0.22, fruitStretch: 1.7, fruitCount: 5 },
  },
  {
    id: 'mango-x-wabash', handle: 'mango-x-wabash-pawpaw', row: 'pawpaw', variety: 'Mango × Wabash', type: 'Pawpaw', emoji: '🥭',
    tagline: 'Two great parents, one great tree.',
    description: 'A cross between two top varieties, bred for big flavor and heavy fruit set. Tastes like a tropical dessert grown in the woods.',
    price: 54, facts: pawpawFacts('Late Sept'),
    look: { shape: 'pawpaw', leaf: '#68b646', leafAlt: '#559f3a', trunk: '#6b5a48', fruit: '#bdd05a', fruitSize: 0.21, fruitStretch: 1.65, fruitCount: 4 },
  },
  {
    id: 'marshmallow', handle: 'marshmallow-pawpaw', row: 'pawpaw', variety: 'Marshmallow', type: 'Pawpaw', emoji: '🥭',
    tagline: 'Soft, sweet and impossible to resist.',
    description: 'A fun, creamy-fleshed pawpaw with a mellow sweetness and fluffy texture. A crowd-pleaser for first-time pawpaw eaters.',
    price: 49, facts: pawpawFacts(),
    look: { shape: 'pawpaw', leaf: '#78c452', leafAlt: '#63b044', trunk: '#6b5a48', fruit: '#dfe88c', fruitSize: 0.2, fruitStretch: 1.6, fruitCount: 4 },
  },
]
