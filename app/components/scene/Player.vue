<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { END_Z, layout, START_Z } from '~/data/world'

const game = useGame()
const player = usePlayer()

const root = ref<any>(null)
const body = ref<any>(null)
const legL = ref<any>(null)
const legR = ref<any>(null)
const armL = ref<any>(null)
const armR = ref<any>(null)
const ring = ref<any>(null)

const SPEED = 5.2
const keyMap: Record<string, 'forward' | 'back' | 'left' | 'right'> = {
  KeyW: 'forward', ArrowUp: 'forward',
  KeyS: 'back', ArrowDown: 'back',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
}
function onKey(down: boolean) {
  return (e: KeyboardEvent) => {
    if (e.code === 'Escape' && down) return game.select(null)
    const k = keyMap[e.code]
    if (!k) return
    e.preventDefault()
    if (down && (!game.started.value || game.selected.value)) return
    game.input[k] = down
  }
}
const kd = onKey(true)
const ku = onKey(false)
onMounted(() => {
  window.addEventListener('keydown', kd)
  window.addEventListener('keyup', ku)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', kd)
  window.removeEventListener('keyup', ku)
})

function lerpAngle(a: number, b: number, t: number) {
  let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * t
}

const { onBeforeRender } = useLoop()
let walk = 0
onBeforeRender(({ delta, elapsed }) => {
  const dt = Math.min(delta, 0.05)
  const i = game.input
  let dx = (i.right ? 1 : 0) - (i.left ? 1 : 0)
  let dz = (i.back ? 1 : 0) - (i.forward ? 1 : 0)
  if (dx !== 0 || dz !== 0) player.target = null // keys override a tapped destination
  const tgt = player.target
  if (tgt && !(dx !== 0 || dz !== 0)) {
    const tx = tgt.x - player.x
    const tz = tgt.z - player.z
    if (Math.hypot(tx, tz) < 0.2) player.target = null
    else {
      dx = tx
      dz = tz
    }
  }
  const active = game.started.value && !game.selected.value && (dx !== 0 || dz !== 0)

  if (active) {
    const len = Math.hypot(dx, dz)
    dx /= len
    dz /= len
    player.x = Math.max(-layout.pathHalf, Math.min(layout.pathHalf, player.x + dx * SPEED * dt))
    player.z = Math.max(END_Z + 4, Math.min(START_Z, player.z + dz * SPEED * dt))
    player.facing = lerpAngle(player.facing, Math.atan2(-dx, -dz), 0.2)
  } else if (game.started.value && !game.selected.value) {
    // settle back facing down the orchard after the title screen
    player.facing = lerpAngle(player.facing, player.facing > 1 ? 0 : player.facing, 0.08)
  }
  if (!game.started.value) player.facing = Math.PI
  player.moving = active
  game.progress.value = (START_Z - player.z) / (START_Z - (END_Z + 4))

  walk += dt * (active ? 11 : 0)
  const swing = active ? Math.sin(walk) * 0.7 : 0
  if (legL.value) legL.value.rotation.x = swing
  if (legR.value) legR.value.rotation.x = -swing
  if (armL.value) armL.value.rotation.x = -swing * 0.8
  if (armR.value) armR.value.rotation.x = swing * 0.8
  if (body.value) {
    body.value.position.y = (active ? Math.abs(Math.sin(walk)) * 0.1 : Math.sin(elapsed * 2) * 0.025) + 0.0
  }
  if (ring.value) {
    ring.value.visible = !!player.target
    if (player.target) {
      ring.value.position.set(player.target.x, 0.06, player.target.z)
      ring.value.scale.setScalar(1 + Math.sin(elapsed * 6) * 0.15)
    }
  }
  if (root.value) {
    root.value.position.set(player.x, 0, player.z)
    root.value.rotation.y = player.facing
  }
})
</script>

<template>
  <!-- tap destination marker -->
  <TresMesh ref="ring" :rotation="[-Math.PI / 2, 0, 0]" :visible="false">
    <TresRingGeometry :args="[0.3, 0.45, 28]" />
    <TresMeshBasicMaterial color="#fff3cf" :transparent="true" :opacity="0.9" :depth-write="false" :tone-mapped="false" />
  </TresMesh>

  <TresGroup ref="root" :position="[0, 0, START_Z]" :scale="layout.charScale">
    <TresMesh :position="[0, 0.03, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresCircleGeometry :args="[0.7, 16]" />
      <TresMeshBasicMaterial color="#5b4a9a" :transparent="true" :opacity="0.35" />
    </TresMesh>

    <TresGroup ref="body">
      <!-- legs -->
      <TresGroup ref="legL" :position="[-0.17, 0.62, 0]">
        <TresMesh :position="[0, -0.28, 0]">
          <TresCapsuleGeometry :args="[0.11, 0.34, 4, 8]" />
          <TresMeshStandardMaterial color="#3b5fa8" :flat-shading="true" />
        </TresMesh>
        <TresMesh :position="[0, -0.56, -0.05]" :scale="[1, 0.65, 1.5]">
          <TresSphereGeometry :args="[0.17, 10, 8]" />
          <TresMeshStandardMaterial color="#5b3a1e" :flat-shading="true" />
        </TresMesh>
      </TresGroup>
      <TresGroup ref="legR" :position="[0.17, 0.62, 0]">
        <TresMesh :position="[0, -0.28, 0]">
          <TresCapsuleGeometry :args="[0.11, 0.34, 4, 8]" />
          <TresMeshStandardMaterial color="#3b5fa8" :flat-shading="true" />
        </TresMesh>
        <TresMesh :position="[0, -0.56, -0.05]" :scale="[1, 0.65, 1.5]">
          <TresSphereGeometry :args="[0.17, 10, 8]" />
          <TresMeshStandardMaterial color="#5b3a1e" :flat-shading="true" />
        </TresMesh>
      </TresGroup>

      <!-- torso -->
      <TresMesh :position="[0, 1.0, 0]">
        <TresCapsuleGeometry :args="[0.34, 0.4, 4, 10]" />
        <TresMeshStandardMaterial color="#ff7a59" :flat-shading="true" />
      </TresMesh>
      <!-- overalls bib -->
      <TresMesh :position="[0, 0.92, -0.3]" :scale="[1.0, 1.0, 0.3]">
        <TresSphereGeometry :args="[0.22, 12, 10]" />
        <TresMeshStandardMaterial color="#3b5fa8" :flat-shading="true" />
      </TresMesh>

      <!-- arms -->
      <TresGroup ref="armL" :position="[-0.46, 1.25, 0]">
        <TresMesh :position="[0, -0.25, 0]">
          <TresCapsuleGeometry :args="[0.1, 0.34, 3, 6]" />
          <TresMeshStandardMaterial color="#ff7a59" :flat-shading="true" />
        </TresMesh>
      </TresGroup>
      <TresGroup ref="armR" :position="[0.46, 1.25, 0]">
        <TresMesh :position="[0, -0.25, 0]">
          <TresCapsuleGeometry :args="[0.1, 0.34, 3, 6]" />
          <TresMeshStandardMaterial color="#ff7a59" :flat-shading="true" />
        </TresMesh>
      </TresGroup>

      <!-- head -->
      <TresMesh :position="[0, 1.78, 0]">
        <TresSphereGeometry :args="[0.46, 20, 16]" />
        <TresMeshStandardMaterial color="#ffd9b3" />
      </TresMesh>
      <!-- eyes (front is -z) -->
      <TresMesh :position="[-0.16, 1.82, -0.41]" :scale="[1, 1.3, 0.6]">
        <TresSphereGeometry :args="[0.06, 8, 8]" />
        <TresMeshBasicMaterial color="#2b1b12" />
      </TresMesh>
      <TresMesh :position="[0.16, 1.82, -0.41]" :scale="[1, 1.3, 0.6]">
        <TresSphereGeometry :args="[0.06, 8, 8]" />
        <TresMeshBasicMaterial color="#2b1b12" />
      </TresMesh>
      <!-- cheeks -->
      <TresMesh :position="[-0.28, 1.7, -0.36]" :scale="[1, 0.7, 0.4]">
        <TresSphereGeometry :args="[0.07, 8, 8]" />
        <TresMeshBasicMaterial color="#ff9d9d" />
      </TresMesh>
      <TresMesh :position="[0.28, 1.7, -0.36]" :scale="[1, 0.7, 0.4]">
        <TresSphereGeometry :args="[0.07, 8, 8]" />
        <TresMeshBasicMaterial color="#ff9d9d" />
      </TresMesh>
      <!-- hair tuft -->
      <TresMesh :position="[0, 1.95, 0.22]">
        <TresSphereGeometry :args="[0.34, 12, 10]" />
        <TresMeshStandardMaterial color="#6b3e22" :flat-shading="true" />
      </TresMesh>
      <!-- straw hat -->
      <TresMesh :position="[0, 2.1, 0]">
        <TresCylinderGeometry :args="[0.78, 0.78, 0.07, 18]" />
        <TresMeshStandardMaterial color="#f2cf6b" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 2.3, 0]">
        <TresCylinderGeometry :args="[0.34, 0.42, 0.4, 14]" />
        <TresMeshStandardMaterial color="#f2cf6b" :flat-shading="true" />
      </TresMesh>
      <TresMesh :position="[0, 2.22, 0]">
        <TresCylinderGeometry :args="[0.43, 0.43, 0.1, 14]" />
        <TresMeshStandardMaterial color="#d94b4b" :flat-shading="true" />
      </TresMesh>
    </TresGroup>
  </TresGroup>
</template>
