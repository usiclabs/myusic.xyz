"use client"

import { useState } from "react"
import useSWR from "swr"
import { usePathname } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { TokenMetricsModal } from "@/components/token-metrics-modal"

const address = '0x987603A52d8B966E10FBD29DcB1A574049E25B07'
const compactUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 })
function numeric(value: unknown) {
  if ((typeof value !== 'string' && typeof value !== 'number') || String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
async function loadQuote(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Quote unavailable')
  const { pairs } = await response.json()
  const pair = Array.isArray(pairs) ? pairs.find(item => item.chainId === 'base' && item.baseToken?.address?.toLowerCase() === address.toLowerCase() && numeric(item.priceUsd) !== null) : null
  if (!pair) return null
  const price = numeric(pair.priceUsd)!, change = numeric(pair.priceChange?.h24), volume = numeric(pair.volume?.h24), cap = numeric(pair.marketCap)
  return { symbol: '$USI', price: `$${price.toFixed(price < .01 ? 6 : price < 1 ? 4 : 2)}`, change: change === null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`, volume: volume === null ? '—' : compactUSD.format(volume), marketCap: cap === null ? '—' : compactUSD.format(cap), contractAddress: address }
}

export function BlockchainTicker() {
  const path = usePathname()
  const financeView = /^\/(wallet|swap|staking|tokens|rewards|lp-manager)(\/|$)/.test(path || '')
  const { data, error } = useSWR(financeView ? `https://api.dexscreener.com/latest/dex/tokens/${address}` : null, loadQuote, { refreshInterval: 30000 })
  const [open, setOpen] = useState(false)
  if (!financeView) return null
  return <aside aria-label="Token market" className="border-b border-border bg-card text-card-foreground">
    <div className="mx-auto flex min-h-11 max-w-[1512px] items-center justify-between gap-3 px-5 font-mono text-xs sm:px-[4.5%]"><span className="text-muted-foreground">Base / $USI</span>
      {data && !error ? <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-3" aria-label="View detailed token metrics">{data.price}<span className="text-muted-foreground">{data.change} · 24h</span><ArrowUpRight size={16}/></button> : <span className="text-muted-foreground">{data === undefined && !error ? 'Checking quote…' : 'Quote unavailable'}</span>}
    </div>{data && !error && <TokenMetricsModal open={open} onOpenChange={setOpen} tokenData={data} />}
  </aside>
}
