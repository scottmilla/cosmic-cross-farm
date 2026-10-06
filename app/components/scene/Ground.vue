<script setup lang="ts">
import { Color } from 'three'
import { END_Z, layout, START_Z, rng } from '~/data/world'

const PATH_HALF = layout.pathHalf

// Colour as living experience: near the gate the meadow is a warm, advancing yellow-green;
// it cools toward blue-green as it recedes toward the hall.
const Z0 = START_Z + 30
const Z1 = END_Z - 25
const N = 10
const strips = Array.from({ length: N }, (_, i) => {
  const len = (Z0 - Z1) / N
  return {
    z: Z0 - len * (i + 0.5),
    len: len + 0.05,
    color: '#' + new Color('#a6dc58').lerp(new Color('#58bfa4'), i / (N - 1)).getHexString(),
  }
})
const pathLen = Z0 - Z1
const pathMid = (Z0 + Z1) / 2

// path painted in translucent layers (Steiner's lasur technique): each glaze lets the one beneath glow through
const glazes = [
  { w: PATH_HALF * 2 + 1.8, color: '#c7e69a', opacity: 0.45, y: 0.015 },
  { w: PATH_HALF * 2 + 0.2, color: '#f6dba6', opacity: 0.6, y: 0.025 },
  { w: PATH_HALF * 2 - 1.6, color: '#efc38f', opacity: 0.85, y: 0.035 },
]
// loose, overlapping washes of colour on the grass (yellow, blue-green, violet shadow, rose), like bleeding paint
const washColors = ['#ffe27a', '#8fe39a', '#7fb0e0', '#b79adf', '#ff9f7a', '#d6f06a']
const wr = rng(2024)
const washes = Array.from({ length: 34 }, (_, i) => ({
  x: (wr() > 0.5 ? 1 : -1) * (PATH_HALF + 1.5 + wr() * 26),
  z: START_Z + 10 - wr() * (START_Z + 10 - END_Z + 10),
  r: 2 + wr() * 3,
  stretch: 1.4 + wr() * 1.2,
  rot: -0.6 + wr() * 1.2,
  c: washColors[i % washColors.length]!,
  o: 0.16 + wr() * 0.16,
  y: 0.004 + (i % 6) * 0.002,
}))
const stones = Array.from({ length: 22 }, (_, i) => ({
  x: Math.sin(i * 12.9898) * (PATH_HALF - 0.8),
  z: START_Z + 10 - i * 3.6,
  r: 0.12 + ((i * 7) % 5) * 0.03,
}))
</script>

<template>
  <TresMesh v-for="(s, i) in strips" :key="i" :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0, s.z]">
    <TresPlaneGeometry :args="[240, s.len]" />
    <TresMeshStandardMaterial :color="s.color" />
  </TresMesh>
  <TresMesh v-for="(g, i) in glazes" :key="'g' + i" :rotation="[-Math.PI / 2, 0, 0]" :position="[0, g.y, pathMid]">
    <TresPlaneGeometry :args="[g.w, pathLen]" />
    <TresMeshStandardMaterial :color="g.color" :transparent="true" :opacity="g.opacity" :depth-write="false" />
  </TresMesh>
  <TresMesh v-for="(w, i) in washes" :key="'w' + i" :rotation="[-Math.PI / 2, 0, w.rot]" :position="[w.x, w.y, w.z]" :scale="[1, w.stretch, 1]">
    <TresCircleGeometry :args="[w.r, 24]" />
    <TresMeshBasicMaterial :color="w.c" :transparent="true" :opacity="w.o" :depth-write="false" :tone-mapped="false" />
  </TresMesh>
  <TresMesh v-for="(s, i) in stones" :key="i" :position="[s.x, 0.05, s.z]" :scale="[1, 0.4, 1]">
    <TresSphereGeometry :args="[s.r, 6, 5]" />
    <TresMeshStandardMaterial color="#d8c1e0" :flat-shading="true" />
  </TresMesh>
</template>
