<script setup lang="ts">
defineProps<{ kind: string }>()
</script>

<template>
  <TresGroup>
    <TresMesh :position="[0, 0.02, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[1.6, 16]" />
      <TresMeshBasicMaterial color="#5b4a9a" :transparent="true" :opacity="0.35" />
    </TresMesh>

    <template v-if="kind === 'pine'">
      <TresMesh :position="[0, 0.6, 0]">
        <TresCylinderGeometry :args="[0.22, 0.3, 1.2, 6]" />
        <TresMeshStandardMaterial color="#7a4e2d" :flat-shading="true" />
      </TresMesh>
      <TresMesh v-for="(r, i) in [1.7, 1.35, 1.0]" :key="i" :position="[0, 1.6 + i * 1.0, 0]" :scale="[1, 0.85, 1]">
        <TresSphereGeometry :args="[r * 0.95, 10, 8]" />
        <TresMeshStandardMaterial :color="['#2f8f5b', '#38a066', '#43b274'][i]" :flat-shading="true" />
      </TresMesh>
    </template>

    <template v-else-if="kind === 'birch'">
      <TresMesh :position="[0, 1.5, 0]">
        <TresCylinderGeometry :args="[0.2, 0.26, 3, 6]" />
        <TresMeshStandardMaterial color="#efeadd" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 3.6, 0]" :scale="[1, 1.3, 1]">
        <TresIcosahedronGeometry :args="[1.3, 1]" />
        <TresMeshStandardMaterial color="#b9e35a" :flat-shading="true" />
      </TresMesh>
    </template>

    <template v-else>
      <TresMesh :position="[0, 0.8, 0]">
        <TresCylinderGeometry :args="[0.25, 0.35, 1.6, 6]" />
        <TresMeshStandardMaterial color="#7a4e2d" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 2.8, 0]">
        <TresIcosahedronGeometry :args="[1.7, 1]" />
        <TresMeshStandardMaterial color="#4fb852" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0.9, 2.2, 0.5]">
        <TresIcosahedronGeometry :args="[1.0, 1]" />
        <TresMeshStandardMaterial color="#45a84a" :flat-shading="true" />
      </TresMesh>
    </template>
  </TresGroup>
</template>
