<script setup lang="ts">
const game = useGame()
</script>

<template>
  <Transition name="fade">
    <div v-if="!game.started.value" class="title">
      <p class="eyebrow">✦ welcome to ✦</p>
      <h1>Cosmic Cross Farm</h1>
      <p class="sub">Cold-hardy citrus & pawpaw trees. Stroll in, pick one, take it home.</p>
      <button class="btn btn-primary big" @click="game.start()">Start walking</button>
      <p class="hint"><span class="for-mouse"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or click the path to walk · click any tree</span><span class="for-touch">Tap the path to walk · tap any tree</span></p>
    </div>
  </Transition>
</template>
