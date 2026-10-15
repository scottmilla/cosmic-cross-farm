import { reactive, ref, computed } from 'vue'
import { trees, type FruitTreeProduct } from '~/data/trees'

// Shared singleton game state (client-only app, so module scope is safe).
const started = ref(false)
const selected = ref<FruitTreeProduct | null>(null)
const hovered = ref<string | null>(null)
const cart = ref<{ tree: FruitTreeProduct; qty: number }[]>([])
const toast = ref('')
const input = reactive({ forward: false, back: false, left: false, right: false })
const progress = ref(0) // 0..1 how far down the orchard the player is

let toastTimer: ReturnType<typeof setTimeout> | undefined

export function useGame() {
  const cartCount = computed(() => cart.value.reduce((n, l) => n + l.qty, 0))
  const cartTotal = computed(() => Math.round(cart.value.reduce((n, l) => n + l.qty * l.tree.price, 0) * 100) / 100)

  function start() {
    started.value = true
  }
  function select(tree: FruitTreeProduct | null) {
    selected.value = tree
    if (!tree) usePlayer().focus = null
    if (tree) {
      usePlayer().target = null
      input.forward = input.back = input.left = input.right = false
    }
  }
  function addToCart(tree: FruitTreeProduct) {
    const line = cart.value.find((l) => l.tree.id === tree.id)
    if (line) line.qty++
    else cart.value.push({ tree, qty: 1 })
    say(`🌳 ${tree.variety} ${tree.type} added to your cart`)
  }
  function say(msg: string) {
    toast.value = msg
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (toast.value = ''), 2600)
  }

  return { trees, started, selected, hovered, cart, cartCount, cartTotal, toast, input, progress, start, select, addToCart, say }
}
