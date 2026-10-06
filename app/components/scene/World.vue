<script setup lang="ts">
import { layout, treePosition } from '~/data/world'

const game = useGame()
const counts = { citrus: 0, pawpaw: 0 }
const placed = game.trees.map((tree, seed) => ({ tree, seed: seed + 1, position: treePosition(tree.row, counts[tree.row]++) }))
</script>

<template>
  <TresFog :args="['#e6d8ea', 32, 88]" attach="fog" />
  <TresHemisphereLight :args="['#fff4e6', '#9fd68a', 1.15]" />
  <TresDirectionalLight :position="[12, 22, 10]" :intensity="2.2" color="#fff3d6" />

  <SkyDome />
  <Ground />
  <CosmicMedallion />
  <Metamorphosis />
  <HarmonyHall />
  <Scenery />

  <FruitTree v-for="p in placed" :key="p.tree.id" :tree="p.tree" :position="p.position" :seed="p.seed" />

  <RowSign text="Citrus" :position="[-(layout.pathHalf + 1.2), 0, 6]" :rotation="[0, 0.5, 0]" />
  <RowSign text="Pawpaws" :position="[layout.pathHalf + 1.2, 0, 6]" :rotation="[0, -0.5, 0]" />

  <GroundTap />
  <Player />
  <CameraRig />
</template>
