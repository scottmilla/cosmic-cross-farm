<script setup lang="ts">
const props = defineProps<{ text: string }>()

const { map, bumpMap } = carvedTextures(640, 200, [{ text: props.text, font: '118px Fondamento, cursive', y: 104 }])
</script>

<template>
  <TresGroup>
    <TresMesh :position="[0, 0.8, 0]">
      <TresCylinderGeometry :args="[0.09, 0.11, 1.6, 6]" />
      <TresMeshStandardMaterial color="#6f4526" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0, 1.75, 0]" :scale="[1.75, 0.64, 0.07]">
      <TresSphereGeometry :args="[1, 20, 12]" />
      <TresMeshStandardMaterial color="#a2693a" :flat-shading="true" />
    </TresMesh>
    <TresMesh :position="[0, 1.75, 0.08]">
      <TresPlaneGeometry :args="[2.0, 0.625]" />
      <TresMeshStandardMaterial :map="map" :bump-map="bumpMap" :bump-scale="2.5" :roughness="1" :transparent="true" :depth-write="false" />
    </TresMesh>
  </TresGroup>
</template>
