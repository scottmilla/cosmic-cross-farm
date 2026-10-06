<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { FruitTreeProduct } from '~/data/trees'
import { rng } from '~/data/world'

const props = defineProps<{ tree: FruitTreeProduct; seed: number }>()
const game = useGame()
const look = computed(() => props.tree.look)
const shape = computed(() => look.value.shape)

const root = ref<any>(null)
const canopy = ref<any>(null)
const marker = ref<any>(null)
const hot = ref(false)

type V3 = [number, number, number]
const TAU = Math.PI * 2

// ── Citrus: compact, dense, glossy evergreen dome pruned low ────────────────
const citrusBlobs: { p: V3; r: number; s: V3; alt?: boolean }[] = [
  { p: [0, 2.35, 0], r: 1.65, s: [1.2, 0.95, 1.2] },
  { p: [1.0, 1.7, 0.5], r: 1.0, s: [1, 0.9, 1], alt: true },
  { p: [-1.0, 1.75, -0.4], r: 1.05, s: [1, 0.9, 1], alt: true },
  { p: [0.1, 3.25, -0.1], r: 0.95, s: [1, 0.85, 1], alt: true },
]

// fruit dotted over the dome, mostly on the outer shell, biased toward the path
const citrusFruit = computed(() => {
  const r = rng(props.seed * 977)
  const b = citrusBlobs[0]!
  const out: { p: V3; c: string }[] = []
  const mix = look.value.fruitMix
  let guard = 0
  while (out.length < look.value.fruitCount && guard++ < 600) {
    const u = r() * 2 - 1
    const t = r() * TAU
    const q = Math.sqrt(1 - u * u)
    const d: V3 = [q * Math.cos(t), u, q * Math.sin(t)]
    if (d[1] < -0.45) continue
    if (d[0] * Math.sign(props.tree.row === 'citrus' ? 1 : -1) < -0.3 && r() < 0.7) continue
    out.push({
      p: [b.p[0] + d[0] * b.r * b.s[0] * 0.97, b.p[1] + d[1] * b.r * b.s[1] * 0.97, b.p[2] + d[2] * b.r * b.s[2] * 0.97],
      c: mix ? mix[out.length % mix.length]! : look.value.fruit,
    })
  }
  return out
})

// small white blossoms scattered on the dome
const blossoms = computed(() => {
  if (!look.value.blossoms) return []
  const r = rng(props.seed * 31)
  return Array.from({ length: shape.value === 'thorny' ? 16 : 9 }, () => {
    const t = r() * TAU
    const u = r() * 1.2 - 0.3
    const q = Math.sqrt(1 - u * u)
    const rad = shape.value === 'thorny' ? 1.9 : 1.7
    return { p: [Math.cos(t) * q * rad, (shape.value === 'thorny' ? 2.9 : 2.35) + u * rad * 0.9, Math.sin(t) * q * rad] as V3 }
  })
})

// ── Trifoliate: open, zig-zag green stems with sparse leaf clusters + thorns ──
const thorny = computed(() => {
  const r = rng(props.seed * 313)
  const branches = Array.from({ length: 7 }, (_, i) => ({
    ay: (i / 7) * TAU + r() * 0.5,
    tilt: 0.45 + r() * 0.55,
    len: 1.7 + r() * 0.8,
  }))
  const clusters: { p: V3; s: number }[] = []
  const thorns: { p: V3; rot: V3 }[] = []
  for (const b of branches) {
    const tip: V3 = [Math.cos(b.ay) * Math.sin(b.tilt) * b.len, 2.1 + Math.cos(b.tilt) * b.len, -Math.sin(b.ay) * Math.sin(b.tilt) * b.len]
    const mid: V3 = [tip[0] * 0.55, 2.1 + (tip[1] - 2.1) * 0.55, tip[2] * 0.55]
    clusters.push({ p: tip, s: 0.75 + r() * 0.35 }, { p: [mid[0] + (r() - 0.5) * 0.6, mid[1] + 0.2, mid[2] + (r() - 0.5) * 0.6], s: 0.5 + r() * 0.3 })
    for (let k = 0; k < 2; k++) {
      const f = 0.3 + k * 0.35
      thorns.push({
        p: [Math.cos(b.ay) * Math.sin(b.tilt) * b.len * f, 2.1 + Math.cos(b.tilt) * b.len * f, -Math.sin(b.ay) * Math.sin(b.tilt) * b.len * f],
        rot: [r() * 3, r() * 3, r() * 3],
      })
    }
  }
  const fruit = Array.from({ length: look.value.fruitCount }, () => {
    const c = clusters[Math.floor(r() * clusters.length)]!
    return { p: [c.p[0] + (r() - 0.5) * 0.7, c.p[1] - 0.25 - r() * 0.2, c.p[2] + (r() - 0.5) * 0.7] as V3 }
  })
  return { branches, clusters, thorns, fruit }
})

// ── Pawpaw: straight trunk, layered whorls of big drooping leaves, hanging fruit ──
const pawpaw = computed(() => {
  const r = rng(props.seed * 571)
  const tiers = [
    { y: 1.9, reach: 2.0, n: 7 },
    { y: 2.7, reach: 1.8, n: 7 },
    { y: 3.5, reach: 1.45, n: 6 },
    { y: 4.2, reach: 1.05, n: 5 },
    { y: 4.8, reach: 0.65, n: 4 },
  ]
  const leaves: { ay: number; y: number; d: number; len: number; droop: number }[] = []
  tiers.forEach((t, ti) => {
    const off = r() * TAU
    for (let i = 0; i < t.n; i++) {
      leaves.push({ ay: off + (i / t.n) * TAU + (r() - 0.5) * 0.3, y: t.y + (r() - 0.5) * 0.15, d: t.reach * 0.5, len: t.reach * 0.55 + 0.25, droop: 0.4 + ti * 0.05 + r() * 0.2 })
    }
  })
  // top crown leaves point up and out
  for (let i = 0; i < 3; i++) leaves.push({ ay: (i / 3) * TAU + r(), y: 5.1, d: 0.3, len: 0.7, droop: -0.5 })

  const fruit: { p: V3; clusterTilt: number; n: number }[] = []
  for (let i = 0; i < look.value.fruitCount; i++) {
    const t = tiers[1 + (i % 3)]!
    const a = r() * TAU
    fruit.push({ p: [Math.cos(a) * t.reach * 0.55, t.y - 0.45, Math.sin(a) * t.reach * 0.55], clusterTilt: r() * TAU, n: 2 + Math.floor(r() * 2) })
  }
  return { leaves, fruit }
})

// warmer red-brown trunks, as in the painting
const trunkColor = computed(() => (shape.value === 'thorny' ? look.value.trunk : look.value.trunk))

// ── Interaction ──────────────────────────────────────────────────────────────
const proxy = computed(() =>
  shape.value === 'pawpaw'
    ? { p: [0, 3.2, 0] as V3, r: 2.4, s: [1, 1.3, 1] as V3 }
    : shape.value === 'thorny'
      ? { p: [0, 2.9, 0] as V3, r: 2.3, s: [1, 1, 1] as V3 }
      : { p: [0, 2.4, 0] as V3, r: 2.3, s: [1.05, 1, 1.05] as V3 },
)
const trunkH = computed(() => (shape.value === 'pawpaw' ? 4.6 : shape.value === 'thorny' ? 2.3 : 2.0))
const markerY = computed(() => (shape.value === 'pawpaw' ? 7.0 : 5.6))
const lit = computed(() => hot.value || game.selected.value?.id === props.tree.id)
const glow = computed(() => ({ emissive: lit.value ? '#fff2a8' : '#000000', emissiveIntensity: lit.value ? 0.22 : 0 }))

function over() {
  hot.value = true
  game.hovered.value = props.tree.id
  document.body.style.cursor = 'pointer'
}
function out() {
  hot.value = false
  if (game.hovered.value === props.tree.id) game.hovered.value = null
  document.body.style.cursor = ''
}
onBeforeUnmount(() => (document.body.style.cursor = ''))
watch(() => game.selected.value, () => out())

const { onBeforeRender } = useLoop()
let scale = 1
onBeforeRender(({ elapsed }) => {
  scale += ((lit.value ? 1.07 : 1) - scale) * 0.15
  if (canopy.value) {
    // a slow breathing wave travelling down the orchard, so the rows move together like a eurythmy gesture
    const z = root.value?.position.z ?? 0
    const wave = Math.sin(elapsed * 0.9 - z * 0.28)
    canopy.value.scale.setScalar(scale * (1 + wave * 0.018))
    canopy.value.rotation.z = -0.05 + wave * 0.026 * (shape.value === 'pawpaw' ? 0.7 : 1)
    canopy.value.rotation.x = Math.cos(elapsed * 0.9 - z * 0.28) * 0.012
  }
  if (marker.value) {
    marker.value.position.y = markerY.value + Math.sin(elapsed * 3 + props.seed) * 0.22
    marker.value.rotation.y = elapsed * 1.6
  }
})
</script>

<template>
  <TresGroup ref="root">
    <!-- blob shadow -->
    <TresMesh :position="[0, 0.03, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[shape === 'pawpaw' ? 2.8 : 2.5, 20]" />
      <TresMeshBasicMaterial color="#5b4a9a" :transparent="true" :opacity="0.38" />
    </TresMesh>

    <!-- trunk (clickable) -->
    <TresMesh :position="[0, trunkH / 2, 0]" :user-data="{ pick: 'tree', id: tree.id }" @pointerenter="over" @pointerleave="out">
      <TresCylinderGeometry :args="[shape === 'pawpaw' ? 0.2 : 0.3, shape === 'pawpaw' ? 0.3 : 0.42, trunkH, 7]" />
      <TresMeshStandardMaterial :color="trunkColor" :flat-shading="true" />
    </TresMesh>

    <!-- invisible hit volume so we don't raycast dozens of leaves -->
    <TresMesh :position="proxy.p" :scale="proxy.s" :user-data="{ pick: 'tree', id: tree.id }" @pointerenter="over" @pointerleave="out">
      <TresSphereGeometry :args="[proxy.r, 10, 8]" />
      <TresMeshBasicMaterial :color-write="false" :depth-write="false" />
    </TresMesh>

    <TresGroup ref="canopy">
      <!-- ───────── CITRUS ───────── -->
      <template v-if="shape === 'citrus'">
        <TresMesh v-for="(b, i) in citrusBlobs" :key="i" :position="b.p" :scale="b.s">
          <TresIcosahedronGeometry :args="[b.r, 1]" />
          <TresMeshStandardMaterial :color="b.alt ? look.leafAlt : look.leaf" :roughness="0.5" :emissive="glow.emissive" :emissive-intensity="glow.emissiveIntensity" :flat-shading="true" />
        </TresMesh>
        <TresMesh v-for="(f, i) in citrusFruit" :key="'f' + i" :position="f.p" :scale="[1, look.fruitStretch, 1]">
          <TresIcosahedronGeometry v-if="look.bumpy" :args="[look.fruitSize, 1]" />
          <TresSphereGeometry v-else :args="[look.fruitSize, 10, 8]" />
          <TresMeshStandardMaterial :color="f.c" :roughness="0.3" :flat-shading="!!look.bumpy" />
        </TresMesh>
      </template>

      <!-- ───────── TRIFOLIATE (thorny, open) ───────── -->
      <template v-else-if="shape === 'thorny'">
        <TresGroup v-for="(b, i) in thorny.branches" :key="'b' + i" :position="[0, 2.1, 0]" :rotation="[0, b.ay, -b.tilt]">
          <TresMesh :position="[0, b.len / 2, 0]">
            <TresCylinderGeometry :args="[0.05, 0.12, b.len, 5]" />
            <TresMeshStandardMaterial :color="look.trunk" :flat-shading="true" />
          </TresMesh>
        </TresGroup>
        <TresMesh v-for="(t, i) in thorny.thorns" :key="'t' + i" :position="t.p" :rotation="t.rot">
          <TresConeGeometry :args="[0.045, 0.34, 4]" />
          <TresMeshStandardMaterial color="#3f7a2a" :flat-shading="true" />
        </TresMesh>
        <TresMesh v-for="(c, i) in thorny.clusters" :key="'c' + i" :position="c.p" :scale="[c.s * 1.2, c.s, c.s * 1.2]">
          <TresIcosahedronGeometry :args="[0.55, 0]" />
          <TresMeshStandardMaterial :color="i % 2 ? look.leaf : look.leafAlt" :emissive="glow.emissive" :emissive-intensity="glow.emissiveIntensity" :flat-shading="true" />
        </TresMesh>
        <TresMesh v-for="(f, i) in thorny.fruit" :key="'f' + i" :position="f.p">
          <TresIcosahedronGeometry :args="[look.fruitSize, 1]" />
          <TresMeshStandardMaterial :color="look.fruit" :roughness="0.9" :flat-shading="true" />
        </TresMesh>
      </template>

      <!-- ───────── PAWPAW ───────── -->
      <template v-else>
        <TresGroup v-for="(l, i) in pawpaw.leaves" :key="'l' + i" :position="[0, l.y, 0]" :rotation="[0, l.ay, 0]">
          <TresMesh :position="[l.d + l.len * 0.5, -l.droop * 0.5, 0]" :rotation="[0, 0, -l.droop]" :scale="[l.len, 0.06, 0.42]">
            <TresSphereGeometry :args="[1, 8, 5]" />
            <TresMeshStandardMaterial :color="i % 2 ? look.leaf : look.leafAlt" :emissive="glow.emissive" :emissive-intensity="glow.emissiveIntensity" :flat-shading="true" :side="2" />
          </TresMesh>
        </TresGroup>
        <!-- hanging fruit clusters -->
        <TresGroup v-for="(f, i) in pawpaw.fruit" :key="'f' + i" :position="f.p" :rotation="[0, f.clusterTilt, 0]">
          <TresMesh
            v-for="k in f.n"
            :key="k"
            :position="[(k - 1) * 0.22 - (f.n - 1) * 0.11, -0.22 - (k % 2) * 0.06, (k % 2) * 0.12]"
            :rotation="[0, 0, (k - 1.5) * 0.35]"
            :scale="[1.1, look.fruitStretch, 0.95]"
          >
            <TresSphereGeometry :args="[look.fruitSize, 10, 8]" />
            <TresMeshStandardMaterial :color="look.fruit" :roughness="0.55" />
          </TresMesh>
        </TresGroup>
      </template>

      <TresMesh v-for="(b, i) in blossoms" :key="'bl' + i" :position="b.p">
        <TresIcosahedronGeometry :args="[0.1, 0]" />
        <TresMeshStandardMaterial color="#ffffff" :flat-shading="true" />
      </TresMesh>
    </TresGroup>

    <!-- floating gem so you know it's interactive -->
    <TresMesh ref="marker" :position="[0, markerY, 0]" :visible="game.started.value && game.selected.value?.id !== tree.id">
      <TresOctahedronGeometry :args="[0.28, 0]" />
      <TresMeshStandardMaterial :color="look.fruitMix ? look.fruitMix[0] : look.fruit" emissive="#ffffff" :emissive-intensity="0.35" :flat-shading="true" />
    </TresMesh>
  </TresGroup>
</template>
