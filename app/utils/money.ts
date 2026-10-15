/** Whole dollars stay "$85"; fractional prices show cents ("$0.10"). Rounds away float noise (0.1 × 3). */
export function formatUsd(amount: number): string {
  const cents = Math.round(amount * 100)
  return '$' + (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2))
}
