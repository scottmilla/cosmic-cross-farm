<script setup lang="ts">
import { CanvasTexture, SRGBColorSpace } from 'three'
import { layout, START_Z } from '~/data/world'

// A "cosmic cross" pressed into the path where you begin: four large petals (the cross)
// resting between four smaller ones, ringed like a seed-sowing mandala. Drawn with vesica curves, not straight lines.
const S = 1024
const c = document.createElement('canvas')
c.width = c.height = S
const ctx = c.getContext('2d')!
ctx.translate(S / 2, S / 2)

function petal(len: number, w: number, fill: string, angle: number) {
  ctx.save()
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(w, -len * 0.3, w, -len * 0.8, 0, -len)
  ctx.bezierCurveTo(-w, -len * 0.8, -w, -len * 0.3, 0, 0)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()
}
ctx.beginPath(); ctx.arc(0, 0, 500, 0, Math.PI * 2); ctx.fillStyle = '#f2dfb6'; ctx.fill()
ctx.lineWidth = 14
ctx.strokeStyle = '#b79adf'; ctx.beginPath(); ctx.arc(0, 0, 486, 0, Math.PI * 2); ctx.stroke()
ctx.strokeStyle = '#f0a8bf'; ctx.beginPath(); ctx.arc(0, 0, 440, 0, Math.PI * 2); ctx.stroke()
for (let i = 0; i < 4; i++) petal(330, 110, '#9fd0b0', (i + 0.5) * (Math.PI / 2))
for (let i = 0; i < 4; i++) petal(430, 130, '#7f9be0', i * (Math.PI / 2))
for (let i = 0; i < 4; i++) petal(250, 70, '#ffd36b', i * (Math.PI / 2))
for (let i = 0; i < 12; i++) {
  ctx.fillStyle = '#ffffffcc'
  ctx.beginPath(); ctx.arc(Math.cos(i * Math.PI / 6) * 465, Math.sin(i * Math.PI / 6) * 465, 9, 0, Math.PI * 2); ctx.fill()
}
ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fillStyle = '#ff8c5a'; ctx.fill()
ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = '#fff3cf'; ctx.fill()

const texture = new CanvasTexture(c)
texture.colorSpace = SRGBColorSpace
</script>

<template>
  <TresMesh :position="[0, 0.05, START_Z]" :rotation="[-Math.PI / 2, 0, 0]">
    <TresCircleGeometry :args="[layout.pathHalf * 0.74, 48]" />
    <TresMeshBasicMaterial :map="texture" :transparent="true" :tone-mapped="false" />
  </TresMesh>
</template>
