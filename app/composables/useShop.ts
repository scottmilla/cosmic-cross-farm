import { trees, type FruitTreeProduct } from '~/data/trees'

// The only file that should need to change when Shopify is wired up:
// swap these for Storefront API calls (products query, cartLinesAdd / checkout URL).
export function useShop() {
  async function getTrees(): Promise<FruitTreeProduct[]> {
    return trees
  }

  async function addToCart(_tree: FruitTreeProduct): Promise<void> {
    // TODO(shopify): cartLinesAdd mutation
  }

  async function viewProduct(_tree: FruitTreeProduct): Promise<void> {
    // TODO(shopify): navigate to /products/:handle or fetch full product detail
  }

  return { getTrees, addToCart, viewProduct }
}
