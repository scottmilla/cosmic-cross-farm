<script setup lang="ts">
import { ref } from 'vue'
import { Vector3 } from 'three'
import { layout } from '~/data/world'

const game = useGame()
const player = usePlayer()
const cam = ref<any>(null)
const look = new Vector3()
const want = new Vector3()
let ready = false

const { onBeforeRender } = useLoop()
onBeforeRender(({ delta }) => {
  const c = cam.value
  if (!c) return
  const k = 1 - Math.pow(0.0015, Math.min(delta, 0.1)) // frame-rate independent ease

  // keep roughly the same horizontal view on tall phone screens by widening the vertical FOV
  const aspect = window.innerWidth / Math.max(window.innerHeight, 1)
  const fov = aspect < 1 ? Math.min(92, 52 + (1 - aspect) * 72) : 52
  if (Math.abs(c.fov - fov) > 0.05) {
    c.fov = fov
    c.updateProjectionMatrix()
  }
  const cm = layout.cam

  if (!game.started.value) {
    // title screen: low, close, character faces us with the orchard stretching behind
    want.set(player.x + 1.4, layout.mobile ? 2.4 : 1.9, player.z + (layout.mobile ? 8 : 5.2))
    look.set(player.x, 3.3, player.z - 2)
  } else if (game.selected.value) {
    const f = player.focus
    if (layout.mobile && f) {
      // frame the whole tree from the front, centred in the strip of screen above the bottom sheet
      const tall = game.selected.value?.look.shape === 'pawpaw' // pawpaws stand taller, so back off further
      want.set(f.x * 0.08, tall ? 4.6 : 3.8, f.z + (tall ? 12.5 : 9))
      look.set(f.x * 0.85, tall ? 0.2 : -0.4, f.z)
    } else {
      // desktop: lean in a touch toward the chosen tree
      want.set(player.x + 0.5, 3.4 * cm, player.z + 6.2 * cm)
      look.set(player.x - 1.5, 2.4, player.z - 3.5)
    }
  } else {
    want.set(player.x * 0.6, 4.3 * cm, player.z + 8.2 * cm)
    look.set(player.x * 0.8, 1.7, player.z - 4)
  }
  if (!ready) {
    c.position.copy(want)
    ready = true
  } else {
    c.position.lerp(want, k)
  }
  const cur = (c.userData.look ??= look.clone()) as Vector3
  cur.lerp(look, k)
  c.lookAt(cur)
})
</script>

<template>
  <TresPerspectiveCamera ref="cam" :position="[1.4, 1.9, 17]" :fov="52" :near="0.1" :far="200" make-default />
</template>
