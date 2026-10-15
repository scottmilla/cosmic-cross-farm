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
      <aside class="readme">
        <b>📜 README</b>
        <p>Ark Labs employee? Use <b>only</b> the <b>Yuzu Lemon</b> (first tree on the left) to test the Arkade SDK integration: add it to your basket and choose <i>Checkout with Arkade</i>. It's priced at $1, and payments are real bitcoin on Arkade mainnet.</p>
      </aside>
      <p class="hint"><span class="for-mouse"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or click the path to walk · click any tree</span><span class="for-touch">Tap the path to walk · tap any tree</span></p>
    </div>
  </Transition>
</template>
