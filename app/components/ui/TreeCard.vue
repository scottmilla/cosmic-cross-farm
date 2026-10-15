<script setup lang="ts">
import { ref, watch } from 'vue'

const game = useGame()
const shop = useShop()
const more = ref(false)
watch(() => game.selected.value, () => (more.value = false))

async function buy() {
  const t = game.selected.value
  if (!t) return
  await shop.addToCart(t)
  game.addToCart(t)
  game.select(null)
}
async function view() {
  const t = game.selected.value
  if (!t) return
  await shop.viewProduct(t)
  more.value = !more.value
}
</script>

<template>
  <Transition name="pop">
    <div v-if="game.selected.value" class="scrim" @click.self="game.select(null)">
      <article class="card" :style="{ '--accent': game.selected.value.look.fruit }">
        <button class="close" aria-label="Close" @pointerup.stop.prevent="game.select(null)" @click="game.select(null)">✕</button>
        <header>
          <div class="badge">{{ game.selected.value.emoji }}</div>
          <div>
            <p class="type">{{ game.selected.value.type }} tree</p>
            <h2>{{ game.selected.value.variety }}</h2>
            <p class="tag">{{ game.selected.value.tagline }}</p>
          </div>
        </header>
        <p class="desc">{{ game.selected.value.description }}</p>
        <dl v-if="more" class="facts">
          <div v-for="f in game.selected.value.facts" :key="f.label">
            <dt>{{ f.label }}</dt><dd>{{ f.value }}</dd>
          </div>
        </dl>
        <footer>
          <span class="price">{{ formatUsd(game.selected.value.price) }}</span>
          <button class="btn" @click="view">{{ more ? 'Show less' : 'View more' }}</button>
          <button class="btn btn-primary" @click="buy">Buy this tree</button>
        </footer>
      </article>
    </div>
  </Transition>
</template>
