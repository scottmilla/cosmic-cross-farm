<script setup lang="ts">
import { onBeforeUnmount, onMounted, unref } from 'vue'
import { Raycaster, Vector2, type Object3D } from 'three'
import { END_Z, layout, START_Z } from '~/data/world'

// All tap/click input goes through one raycast we run ourselves on pointer down/up, so a bare finger tap
// (which never "hovers" first) always hits what's under it.
//  • tap a tree  → open its card
//  • tap ground  → walk there (hold + drag to steer); tapping ground with a card open just closes the card
const game = useGame()
const player = usePlayer()
const { camera, renderer, scene } = useTres()

const ray = new Raycaster()
const ndc = new Vector2()
let dragging = false
let pendingTreeId: string | null = null
let startX = 0
let startY = 0
let dom: HTMLCanvasElement | null = null

function cast(e: PointerEvent) {
  const cam = unref(camera)
  if (!dom || !cam) return null
  const rect = dom.getBoundingClientRect()
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
  ray.setFromCamera(ndc, cam)
  const targets: Object3D[] = []
  unref(scene).traverse((o) => {
    if (o.userData?.pick) targets.push(o)
  })
  const hit = ray.intersectObjects(targets, false)[0]
  return hit ? { kind: hit.object.userData.pick as 'tree' | 'ground', id: hit.object.userData.id as string | undefined, point: hit.point } : null
}

function walkTo(p: { x: number; z: number }) {
  const lim = layout.pathHalf
  player.target = { x: Math.max(-lim, Math.min(lim, p.x)), z: Math.max(END_Z + 4, Math.min(START_Z, p.z)) }
}

function down(e: PointerEvent) {
  if (!game.started.value) return
  startX = e.clientX
  startY = e.clientY
  const h = cast(e)
  pendingTreeId = null
  if (h?.kind === 'tree') pendingTreeId = h.id ?? null
  else if (h?.kind === 'ground') {
    if (game.selected.value) game.select(null)
    else {
      dragging = true
      walkTo(h.point)
    }
  } else if (game.selected.value) game.select(null)
}
function move(e: PointerEvent) {
  if (!dragging) return
  const h = cast(e)
  if (h?.kind === 'ground') walkTo(h.point)
}
function up(e: PointerEvent) {
  dragging = false
  if (!pendingTreeId) return
  const id = pendingTreeId
  pendingTreeId = null
  if (Math.hypot(e.clientX - startX, e.clientY - startY) > 12) return // it was a drag, not a tap
  const h = cast(e)
  if (h?.kind === 'tree' && h.id === id) {
    // remember where the tree is so the camera can frame it, whichever row it's in
    const pos = ray.intersectObjects(
      (() => {
        const t: Object3D[] = []
        unref(scene).traverse((o) => o.userData?.pick === 'tree' && o.userData.id === id && t.push(o))
        return t
      })(),
      false,
    )[0]?.object.parent?.position
    if (pos) player.focus = { x: pos.x, z: pos.z }
    game.select(game.trees.find((t) => t.id === id) ?? null)
  }
}
function cancel() {
  dragging = false
  pendingTreeId = null
}

onMounted(() => {
  dom = unref(renderer)?.domElement ?? document.querySelector('canvas')
  dom?.addEventListener('pointerdown', down)
  dom?.addEventListener('pointermove', move)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', cancel)
})
onBeforeUnmount(() => {
  dom?.removeEventListener('pointerdown', down)
  dom?.removeEventListener('pointermove', move)
  window.removeEventListener('pointerup', up)
  window.removeEventListener('pointercancel', cancel)
})
</script>

<template>
  <TresMesh :rotation="[-Math.PI / 2, 0, 0]" :position="[0, 0.001, (START_Z + END_Z) / 2]" :user-data="{ pick: 'ground' }">
    <TresPlaneGeometry :args="[160, START_Z - END_Z + 60]" />
    <TresMeshBasicMaterial :color-write="false" :depth-write="false" />
  </TresMesh>
</template>
