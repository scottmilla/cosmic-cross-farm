<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { applyLayout, detectMobile } from '~/data/world'

// The scene reads `layout` once when it mounts, so crossing the phone/desktop breakpoint remounts it.
const mobile = ref(detectMobile())
applyLayout(mobile.value)

function onResize() {
  const m = detectMobile()
  if (m !== mobile.value) {
    applyLayout(m)
    mobile.value = m
  }
}
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))
</script>

<template>
  <TresCanvas clear-color="#a8e0ff" window-size :antialias="true" :dpr="[1, mobile ? 1.5 : 2]">
    <World :key="String(mobile)" />
  </TresCanvas>
</template>
