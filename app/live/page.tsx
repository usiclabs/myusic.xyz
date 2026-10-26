"use client"

import { useEffect, useState } from "react"
import { LiveStreamCard } from "@/components/live-stream-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Radio, Plus, Sparkles, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/lib/web3/wallet-context"
import { SkeletonCard } from "@/components/skeleton-loader"

interface LiveStream {
  id: string
  title: string
  description?: string
  is_live: boolean
  viewer_count: number
  playback_id: string
  artist: {
    artist_name: string
    avatar_url?: string
    wallet_address: string
  }
}

export default function LivePage() {
  const { address, isConnected } = useWallet()
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])
  const [allStreams, setAllStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(true)
  const [isEligible, setIsEligible] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(false)

  useEffect(() => {
    async function loadStreams() {
      try {
        console.log("[v0] Loading streams...")

        // Fetch live streams
        const liveRes = await fetch("/api/live/streams?live=true")
        if (!liveRes.ok) {
          console.error("[v0] Live streams fetch failed:", liveRes.status)
          setLiveStreams([])
        } else {
          const liveData = await liveRes.json()
          // Ensure we have an array
          const liveArray = Array.isArray(liveData) ? liveData : []
          console.log("[v0] Live streams loaded:", liveArray.length)
          setLiveStreams(liveArray)
        }

        // Fetch all recent streams
        const allRes = await fetch("/api/live/streams")
        if (!allRes.ok) {
          console.error("[v0] All streams fetch failed:", allRes.status)
          setAllStreams([])
        } else {
          const allData = await allRes.json()
          // Ensure we have an array
          const allArray = Array.isArray(allData) ? allData : []
          console.log("[v0] All streams loaded:", allArray.length)
          const recentStreams = allArray.filter((stream: LiveStream) => !stream.is_live)
          setAllStreams(recentStreams)
        }
      } catch (error) {
        console.error("[v0] Error loading streams:", error)
        setLiveStreams([])
        setAllStreams([])
      } finally {
        setLoading(false)
      }
    }

    loadStreams()

    // Refresh every 30 seconds
    const interval = setInterval(loadStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    async function checkEligibility() {
      if (!address) {
        setIsEligible(false)
        return
      }

      setCheckingEligibility(true)
      try {
        const res = await fetch(`/api/live/check-eligibility?address=${address}`)
        const data = await res.json()
        setIsEligible(data.eligible)
      } catch (error) {
        console.error("[v0] Error checking eligibility:", error)
      } finally {
        setCheckingEligibility(false)
      }
    }

    checkEligibility()
  }, [address])

  return (
    <div className="min-h-screen overflow-hidden bg-black pb-32 text-white">
      {/* Hero Section */}
      <main className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14"><div className="pointer-events-none absolute -top-32 right-0 size-[34rem] rounded-full bg-[#fa003e]/10 blur-3xl" /><div className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-30" />
        <div className="relative z-10 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1">
              <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/45"><span className="flex items-center gap-2 rounded-full border border-[#fa003e]/30 bg-[#fa003e]/10 px-3 py-1.5 text-[#fa6688]"><span className="size-1.5 animate-pulse rounded-full bg-[#fa003e]" />Broadcasting now</span><span>MyUSIC / Live</span></div>
              <h1 className="max-w-2xl text-balance text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">Music, while<br /><span className="text-[#fa003e]">it&apos;s happening.</span></h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/55">Step into the room. Watch independent artists perform live, discover new sounds, and connect with the people making them.</p>
            </div>

            {isConnected && (
              <Button
                size="lg"
                asChild
                className="relative group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-0 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all hover:scale-105"
              >
                <Link href="/live/start">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Plus className="h-5 w-5 mr-2" />
                  Go Live
                  {isEligible && <Sparkles className="h-4 w-4 ml-2 text-yellow-300 animate-pulse" />}
                </Link>
              </Button>
            )}
          </div>

          {/* Stats Bar */}
          {(liveStreams.length > 0 || allStreams.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
              {liveStreams.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-medium">{liveStreams.length} Live Now</span>
                </div>
              )}
              {allStreams.length > 0 && (
                <>
                  <div className="h-4 w-px bg-border/50" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">{allStreams.length} Recent</span>
                  </div>
                </>
              )}
              {liveStreams.length > 0 && (
                <>
                  <div className="h-4 w-px bg-border/50" />
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{liveStreams.reduce((acc, s) => acc + s.viewer_count, 0)} Watching</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Live Now Section */}
        {liveStreams.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="border border-[#fa003e]/30 bg-[#fa003e]/10 px-3 py-1.5 text-[#fa6688] shadow-lg shadow-[#fa003e]/10">
                <Radio className="h-3.5 w-3.5 mr-1.5 animate-pulse" />
                LIVE NOW
              </Badge>
              <div className="h-px flex-1 bg-gradient-to-r from-red-500/50 via-red-500/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.map((stream, i) => (
                <div key={stream.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <LiveStreamCard stream={stream} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Streams */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold">Recent Streams</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : allStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allStreams.map((stream, i) => (
                <div key={stream.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <LiveStreamCard stream={stream} />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#090909] py-20 text-center sm:py-28">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(250,0,62,0.14),transparent_42%)]" />
              <div className="relative mx-auto mb-7 flex size-24 items-center justify-center rounded-full border border-[#fa003e]/30 bg-[#fa003e]/10"><div className="absolute size-24 animate-ping rounded-full border border-[#fa003e]/20" /><Radio className="relative h-10 w-10 text-[#fa003e]" /></div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#fa6688]">The room is quiet</p>
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">No one is live yet.</h3>
              <p className="mx-auto mb-8 mt-3 max-w-md leading-7 text-white/50">Be the first signal in the room. Start a broadcast and let the next listener find you.</p>
              {isConnected && isEligible && (
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/25"
                >
                  <Link href="/live/start">
                    <Plus className="h-5 w-5 mr-2" />
                    Start Streaming
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
