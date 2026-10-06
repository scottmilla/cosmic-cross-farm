<script setup lang="ts">
import { Color } from 'three'
import { END_Z, layout } from '~/data/world'

// Goethe's metamorphosis of the plant, as Steiner carried into the Goetheanum's carved column capitals:
// each form grows out of the one before. Walking the path, you read the plant's life as a series of
// posts: seed → sprouting leaves → bud → blossom → fruit.
const N = 12
const posts = Array.from({ length: N }, (_, i) => ({ t: i / (N - 1), z: 2 - i * ((2 - (END_Z + 6)) / (N - 1)) }))

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (x: number) => Math.min(1, Math.max(0, x))
const ramp = (stops: [number, string][], t: number) => {
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i]![0]) {
      const [t0, c0] = stops[i - 1]!
      const [t1, c1] = stops[i]!
      return '#' + new Color(c0).lerp(new Color(c1), (t - t0) / (t1 - t0)).getHexString()
    }
  }
  return stops[stops.length - 1]![1]
}

function form(t: number) {
  const bloom = clamp((t - 0.35) / 0.35)
  const fall = clamp((t - 0.8) / 0.2)
  return {
    stemH: 0.25 + 0.95 * clamp(t / 0.45),
    bulb: lerp(0.13, 0.3, clamp((t - 0.55) / 0.45)),
    petals: t < 0.15 ? 0 : clamp((t - 0.15) / 0.25) * (1 - fall * 0.85),
    tilt: lerp(0.2, 1.35, bloom) - fall * 0.8,
    leafY: clamp(t / 0.35),
    bulbColor: ramp([[0, '#8b5e3c'], [0.3, '#7bc96f'], [0.6, '#ffe27a'], [1, '#ff8c1a']], t),
    petalColor: ramp([[0, '#7fcf6a'], [0.4, '#9ad77a'], [0.6, '#ffb3d1'], [1, '#ffd36b']], t),
  }
}
const sides = [-1, 1]
</script>

<template>
  <template v-for="side in sides" :key="side">
    <TresGroup v-for="(p, i) in posts" :key="side + '-' + i" :position="[side * (layout.pathHalf + 0.9), 0, p.z]" :rotation="[0, side * 0.4 + i, 0]">
      <!-- soft sculpted plinth, no flat edges -->
      <TresMesh :position="[0, 0.12, 0]" :scale="[1, 0.5, 1]">
        <TresSphereGeometry :args="[0.34, 12, 8]" />
        <TresMeshStandardMaterial color="#d6cbe6" :roughness="0.9" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 0.2 + form(p.t).stemH / 2, 0]">
        <TresCylinderGeometry :args="[0.045, 0.085, form(p.t).stemH, 7]" />
        <TresMeshStandardMaterial color="#6fb858" :flat-shading="true" />
      </TresMesh>
      <TresGroup :position="[0, 0.2 + form(p.t).stemH, 0]">
        <!-- the bulb: seed, then bud, then fruit -->
        <TresMesh :scale="[1, 1.25 - form(p.t).petals * 0.2, 1]">
          <TresSphereGeometry :args="[form(p.t).bulb, 12, 10]" />
          <TresMeshStandardMaterial :color="form(p.t).bulbColor" :roughness="0.5" />
        </TresMesh>
        <!-- petals/leaves open and close around it -->
        <TresGroup v-for="k in 6" :key="k" :rotation="[0, (k / 6) * Math.PI * 2, 0]">
          <TresGroup :rotation="[0, 0, -form(p.t).tilt]">
            <TresMesh :position="[0, 0.04 + 0.34 * form(p.t).petals, 0]" :scale="[0.13, 0.05 + 0.34 * form(p.t).petals, 0.045]">
              <TresSphereGeometry :args="[1, 8, 6]" />
              <TresMeshStandardMaterial :color="form(p.t).petalColor" :flat-shading="true" />
            </TresMesh>
          </TresGroup>
        </TresGroup>
      </TresGroup>
    </TresGroup>
  </template>
</template>
