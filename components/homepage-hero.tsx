"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Music, Sparkles, ArrowDown, Zap, Activity } from "lucide-react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function HomepageHero() {
  const [isVisible, setIsVisible] = useState(false)
  const [animatedStats, setAnimatedStats] = useState({ tracks: 0, artists: 0, paidOut: 0 })
  const { data: stats, isLoading } = useSWR("/api/stats/homepage", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  useEffect(() => setIsVisible(true), [])

  useEffect(() => {
    if (!stats) return
    const duration = 1600
    const steps = 48
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep += 1
      const progress = currentStep / steps
      setAnimatedStats({
        tracks: Math.floor(stats.tracks.raw * progress),
        artists: Math.floor(stats.artists.raw * progress),
        paidOut: Math.floor(stats.paidOut.raw * progress),
      })
      if (currentStep >= steps) {
        clearInterval(interval)
        setAnimatedStats({ tracks: stats.tracks.raw, artists: stats.artists.raw, paidOut: stats.paidOut.raw })
      }
    }, duration / steps)
    return () => clearInterval(interval)
  }, [stats])

  const formatStat = (value: number, type: "tracks" | "artists" | "paidOut") => {
    if (type === "paidOut") {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      if (value >= 1) return `$${value.toFixed(0)}`
      return `$${value.toFixed(2)}`
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1)}K+` : `${value}+`
  }

  const statsList = [
    { value: isLoading ? "..." : formatStat(animatedStats.tracks, "tracks"), label: "Tracks", icon: Music },
    { value: isLoading ? "..." : formatStat(animatedStats.artists, "artists"), label: "Artists", icon: Sparkles },
    { value: isLoading ? "..." : formatStat(animatedStats.paidOut, "paidOut"), label: "Paid out", icon: Zap },
  ]

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-border/70 bg-background px-4 py-20 sm:px-6 lg:min-h-[760px]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[url('/grid.svg')] opacity-[0.035]" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px bg-border/30" />

      <div className="container relative mx-auto max-w-7xl">
        <div className="grid items-end gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="max-w-3xl">
            <div className={`mb-8 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-accent/60 text-accent"><Sparkles className="h-3.5 w-3.5" /></span>
              Built on Base <span className="text-border">/</span> Powered by X402
            </div>

            <h1 className={`max-w-4xl text-balance text-6xl font-bold leading-[0.92] tracking-[-0.06em] transition-all duration-700 delay-100 sm:text-8xl lg:text-[8.5rem] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              Music that <span className="text-accent">pays artists.</span>
            </h1>

            <p className={`mt-8 max-w-xl text-pretty text-lg leading-7 text-muted-foreground transition-all duration-700 delay-200 sm:text-xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              Micropayments that move at the speed of sound. No subscriptions, no platform fees—artists get 100% of what you pay.
            </p>

            <div className={`mt-10 flex flex-col gap-3 transition-all duration-700 delay-300 sm:flex-row ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
              <Button size="lg" asChild className="h-12 rounded-md bg-accent px-6 text-accent-foreground hover:bg-accent/90">
                <Link href="/explore"><Play className="mr-2 h-4 w-4" />Listen now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="h-12 rounded-md border-border bg-transparent px-6 hover:border-accent/70 hover:bg-accent/5">
                <Link href="/dashboard"><Music className="mr-2 h-4 w-4" />Upload your music</Link>
              </Button>
            </div>
          </div>

          <div className={`border-l border-border/70 pl-6 transition-all duration-700 delay-300 sm:pl-8 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
            <div className="mb-8 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <span className="flex items-center gap-2"><Activity className="h-3.5 w-3.5 text-accent" /> Open network</span>
              <span className="text-accent">Live</span>
            </div>
            <p className="max-w-sm text-2xl font-medium leading-tight tracking-tight text-foreground sm:text-3xl">
              Every stream is a payment. Every payment is instant.
            </p>
            <div className="mt-10 grid grid-cols-3 border-y border-border/70">
              {statsList.map((stat) => (
                <div key={stat.label} className="border-r border-border/70 py-5 pr-3 last:border-r-0 last:pl-3 sm:pr-5 sm:last:pl-5">
                  <stat.icon className="mb-4 h-4 w-4 text-accent" />
                  <div className={`text-xl font-semibold tracking-tight sm:text-2xl ${isLoading ? "animate-pulse" : ""}`}>{stat.value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center justify-between border-t border-border/70 pt-4 text-xs uppercase tracking-[0.16em] text-muted-foreground sm:mt-28">
          <span>Streaming for the open internet</span>
          <ArrowDown className="h-4 w-4 text-accent" />
        </div>
      </div>
    </section>
  )
}
