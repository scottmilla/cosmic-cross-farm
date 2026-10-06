<script setup lang="ts">
import { END_Z } from '~/data/world'

// A farm hall that nods to the Goetheanum: two overlapping domes of different size, sculpted as if poured and
// pressed rather than built, with no right angles, and stained-glass colours glowing in a rising arc.
const windows = [
  { a: -0.5, e: 0.28, c: '#7f6ee0' }, { a: -0.3, e: 0.42, c: '#6aa8ff' }, { a: -0.1, e: 0.52, c: '#6fd6b4' },
  { a: 0.1, e: 0.52, c: '#ffe27a' }, { a: 0.3, e: 0.42, c: '#ffb15c' }, { a: 0.5, e: 0.28, c: '#ff7a8a' },
]
const R = 7
const SX = 1.25
const SZ = 1.1
</script>

<template>
  <TresGroup :position="[0, 0, END_Z - 12]">
    <!-- poured base -->
    <TresMesh :position="[0, 0, 1]" :scale="[1.55, 0.42, 1.05]">
      <TresSphereGeometry :args="[R, 24, 12]" />
      <TresMeshStandardMaterial color="#cdbfe0" :roughness="0.95" :flat-shading="true" />
    </TresMesh>
    <!-- great dome -->
    <TresMesh :position="[-2.5, 0, 0]" :scale="[SX, 1, SZ]">
      <TresSphereGeometry :args="[R, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]" />
      <TresMeshStandardMaterial color="#e7dcf2" :roughness="0.9" :flat-shading="true" />
    </TresMesh>
    <!-- lesser dome, joined -->
    <TresMesh :position="[6.2, 0, 1.5]" :scale="[1.1, 0.95, 1]">
      <TresSphereGeometry :args="[R * 0.68, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]" />
      <TresMeshStandardMaterial color="#f2dbe6" :roughness="0.9" :flat-shading="true" />
    </TresMesh>
    <!-- softly swelling buttresses -->
    <TresMesh v-for="(b, i) in [[-10.5, 0.4, 3.5, 2.6], [-8, 0.3, 6.2, 2.2], [11, 0.3, 5, 2.2]]" :key="i" :position="[b[0]!, b[1]!, b[2]!]" :scale="[1, 1.2, 1]">
      <TresSphereGeometry :args="[b[3]!, 14, 10]" />
      <TresMeshStandardMaterial color="#d9cdea" :roughness="0.95" :flat-shading="true" />
    </TresMesh>
    <!-- entrance, a rounded mouth -->
    <TresMesh :position="[-2.5, 1.6, R * SZ - 0.25]" :scale="[1.4, 1.9, 0.5]">
      <TresSphereGeometry :args="[1, 16, 12]" />
      <TresMeshStandardMaterial color="#5a4a82" :roughness="0.7" />
    </TresMesh>
    <!-- stained-glass lights -->
    <TresMesh
      v-for="(w, i) in windows"
      :key="i"
      :position="[-2.5 + R * SX * Math.cos(w.e + 0.1) * Math.sin(w.a * 1.6), R * Math.sin(w.e + 0.1), R * SZ * Math.cos(w.e + 0.1) * Math.cos(w.a * 1.6) - 0.1]"
      :rotation="[-w.e * 0.6, w.a * 1.6, 0]"
      :scale="[0.55, 0.9, 0.2]"
    >
      <TresSphereGeometry :args="[1, 12, 10]" />
      <TresMeshStandardMaterial :color="w.c" :emissive="w.c" :emissive-intensity="0.7" />
    </TresMesh>
  </TresGroup>
</template>
