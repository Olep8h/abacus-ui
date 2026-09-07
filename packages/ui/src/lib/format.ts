const compact = new Intl.NumberFormat("en-GB", { notation: "compact", maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat("en-GB", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
})

/** Currency with a fixed code, e.g. "€12,450.00". Cached per currency. */
const currencyFormatters = new Map<string, Intl.NumberFormat>()
export function formatCurrency(value: number, currency = "EUR", fractionDigits = 2): string {
  const key = `${currency}:${fractionDigits}`
  let fmt = currencyFormatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
    currencyFormatters.set(key, fmt)
  }
  return fmt.format(value)
}

/** "12.4K", "1.2M" — for axes and sparkline labels. */
export function formatCompact(value: number): string {
  return compact.format(value)
}

/** "+4.2%", "−1.8%" — always signed except zero. */
export function formatPercentDelta(ratio: number): string {
  return percent.format(ratio)
}
