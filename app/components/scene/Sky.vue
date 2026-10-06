<script setup lang="ts">
import { ref } from 'vue'

const clouds = Array.from({ length: 9 }, (_, i) => ({
  x: -60 + i * 15 + (i % 2) * 6,
  y: 34 + (i % 3) * 4,
  z: -10 - ((i * 13) % 55),
  s: 1.1 + (i % 4) * 0.25,
  speed: 0.25 + (i % 3) * 0.08,
}))
const refs = ref<any[]>([])
const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  refs.value.forEach((g, i) => {
    if (!g) return
    g.position.x += clouds[i]!.speed * delta
    if (g.position.x > 75) g.position.x = -75
  })
})
</script>

<template>
  <TresGroup
    v-for="(c, i) in clouds"
    :key="i"
    :ref="(el: any) => (refs[i] = el)"
    :position="[c.x, c.y, c.z]"
    :scale="c.s"
  >
    <TresMesh v-for="(b, j) in [[0, 0, 0, 3], [3, -0.5, 0.3, 2.3], [-3, -0.6, -0.2, 2.1], [1, 1.2, 0, 2.2]]" :key="j" :position="[b[0]!, b[1]!, b[2]!]">
      <TresIcosahedronGeometry :args="[b[3]!, 1]" />
      <TresMeshStandardMaterial color="#ffffff" :flat-shading="true" :fog="false" />
    </TresMesh>
  </TresGroup>
</template>
