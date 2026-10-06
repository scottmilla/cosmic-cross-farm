<script setup lang="ts">
import { ref } from 'vue'

const game = useGame()
const open = ref(false)

// biodynamic farming keeps time with the moon, so show today's phase
const phases = [['🌑', 'New moon'], ['🌒', 'Waxing crescent'], ['🌓', 'First quarter'], ['🌔', 'Waxing gibbous'], ['🌕', 'Full moon'], ['🌖', 'Waning gibbous'], ['🌗', 'Last quarter'], ['🌘', 'Waning crescent']] as const
const SYNODIC = 29.530588853
const age = ((Date.now() - Date.UTC(2000, 0, 6, 18, 14)) / 86400000) % SYNODIC
const moon = phases[Math.floor(((age < 0 ? age + SYNODIC : age) / SYNODIC) * 8 + 0.5) % 8]!

</script>

<template>
  <div v-if="game.started.value" class="hud">
    <div class="hud-top">
      <div class="brand">
        <span class="logo">✦</span> Cosmic Cross Farm
        <div class="bar"><i :style="{ width: Math.round(game.progress.value * 100) + '%' }" /></div>
        <div class="moon">{{ moon[0] }} {{ moon[1] }}</div>
      </div>
      <button class="cart-btn" @click="open = !open">
        🧺 Cart <b v-if="game.cartCount.value">{{ game.cartCount.value }}</b>
      </button>
    </div>

    <div v-if="open" class="cart-panel">
      <p v-if="!game.cart.value.length" class="muted">Your basket is empty. Go find a tree!</p>
      <ul v-else>
        <li v-for="l in game.cart.value" :key="l.tree.id">
          <span>{{ l.tree.variety }} {{ l.tree.type }} × {{ l.qty }}</span>
          <b>${{ l.tree.price * l.qty }}</b>
        </li>
      </ul>
      <div v-if="game.cart.value.length" class="total">
        <span>Total</span><b>${{ game.cartTotal.value }}</b>
      </div>
      <button v-if="game.cart.value.length" class="btn btn-primary" disabled title="Checkout arrives with Shopify">
        Checkout (coming soon)
      </button>
    </div>

    <div class="hud-bottom">
      <p class="keys"><span class="for-mouse"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or click the path to walk · click a tree · <kbd>Esc</kbd> close</span><span class="for-touch">Tap the path to walk · tap a tree</span></p>
    </div>

    <Transition name="toast"><div v-if="game.toast.value" class="toast">{{ game.toast.value }}</div></Transition>
  </div>
</template>
