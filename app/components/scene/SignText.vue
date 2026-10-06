<script setup lang="ts">
const { map, bumpMap } = carvedTextures(1024, 270, [
  { text: 'Cosmic Cross Farm', font: '112px Fondamento, cursive', y: 105 },
  { text: 'Biodynamic citrus & pawpaws', font: '54px Fondamento, cursive', y: 205 },
])
</script>

<template>
  <TresMesh :position="[0, 2.2, 0.2]">
    <TresPlaneGeometry :args="[4.7, 1.24]" />
    <TresMeshStandardMaterial :map="map" :bump-map="bumpMap" :bump-scale="2.5" :roughness="1" :transparent="true" :depth-write="false" />
  </TresMesh>
</template>
