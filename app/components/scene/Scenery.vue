<script setup lang="ts">
import { END_Z, layout, START_Z, rng } from '~/data/world'

const PATH_HALF = layout.pathHalf

const rand = rng(42)

// back-country treeline so the world doesn't feel empty
const far = Array.from({ length: layout.mobile ? 26 : 46 }, () => {
  const side = rand() > 0.5 ? 1 : -1
  return {
    x: side * (16 + rand() * 30),
    z: START_Z + 14 - rand() * (START_Z + 14 - END_Z + 20),
    s: 1 + rand() * 1.3,
    kind: rand() > 0.5 ? 'pine' : 'round',
  }
})

const flowerColors = ['#ff8fb1', '#ffe45e', '#ffffff', '#c59bff', '#ff7a5c']
const flowers = Array.from({ length: layout.mobile ? 80 : 170 }, () => {
  const left = rand() > 0.5
  const edge = PATH_HALF * 0.75 + 0.2
  return {
    x: left ? -edge - rand() * 4.5 : edge + rand() * 4.5,
    z: START_Z + 8 - rand() * (START_Z + 8 - END_Z),
    c: flowerColors[Math.floor(rand() * flowerColors.length)]!,
    s: 0.7 + rand() * 0.6,
  }
})
const tufts = Array.from({ length: layout.mobile ? 60 : 140 }, () => ({
  x: (rand() - 0.5) * 60,
  z: START_Z + 10 - rand() * (START_Z + 10 - END_Z),
  s: 0.6 + rand() * 0.8,
}))
const fenceXs = Array.from({ length: 15 }, (_, i) => -PATH_HALF * 1.25 + i * ((PATH_HALF * 2.5) / 14))
</script>

<template>
  <!-- far treeline -->
  <DecoTree v-for="(d, i) in far" :key="'f' + i" :kind="d.kind" :position="[d.x, 0, d.z]" :scale="d.s * 1.2" />

  <!-- flowers + grass -->
  <TresGroup v-for="(f, i) in flowers" :key="'fl' + i" :position="[f.x, 0, f.z]" :scale="f.s">
    <TresMesh :position="[0, 0.18, 0]">
      <TresCylinderGeometry :args="[0.02, 0.02, 0.36, 4]" />
      <TresMeshStandardMaterial color="#3f9b3a" />
    </TresMesh>
    <TresMesh :position="[0, 0.4, 0]">
      <TresIcosahedronGeometry :args="[0.11, 0]" />
      <TresMeshStandardMaterial :color="f.c" :flat-shading="true" />
    </TresMesh>
  </TresGroup>
  <TresMesh v-for="(t, i) in tufts" :key="'t' + i" :position="[t.x, 0.22 * t.s, t.z]" :scale="[t.s, t.s * 2.2, t.s]">
    <TresSphereGeometry :args="[0.12, 7, 6]" />
    <TresMeshStandardMaterial color="#5fb840" :flat-shading="true" />
  </TresMesh>

  <!-- end of the row: a little farm gate + sign -->
  <TresGroup :position="[0, 0, END_Z + 2]">
    <TresMesh v-for="(x, i) in fenceXs" :key="i" :position="[x, 0.6, 0]" :rotation="[0, 0, Math.sin(i * 2.3) * 0.06]">
      <TresCapsuleGeometry :args="[0.1, 1.0, 3, 7]" />
      <TresMeshStandardMaterial color="#b98456" :flat-shading="true" />
    </TresMesh>
    <TresMesh v-for="y in [0.45, 0.9]" :key="y" :position="[0, y, 0]" :rotation="[0, 0, Math.PI / 2]">
      <TresCylinderGeometry :args="[0.06, 0.06, PATH_HALF * 2.5, 7]" />
      <TresMeshStandardMaterial color="#cf9a64" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0, 2.2, 0]" :scale="[3.5, 1.1, 0.16]">
      <TresSphereGeometry :args="[1, 24, 14]" />
      <TresMeshStandardMaterial color="#a2693a" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[-2.5, 1.1, 0]">
      <TresCapsuleGeometry :args="[0.14, 2.0, 3, 7]" />
      <TresMeshStandardMaterial color="#6f4526" />
    </TresMesh>
    <TresMesh :position="[2.5, 1.1, 0]">
      <TresCapsuleGeometry :args="[0.14, 2.0, 3, 7]" />
      <TresMeshStandardMaterial color="#6f4526" />
    </TresMesh>
    <SignText />
  </TresGroup>
</template>
