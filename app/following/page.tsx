"use client"

import { TrackCard } from "@/components/track-card"
import { Button } from "@/components/ui/button"
import { UserPlus, Heart, AlertCircle } from "lucide-react"
import type { TrackWithArtist } from "@/types/database"
import { useEffect, useState } from "react"
import { SkeletonCard } from "@/components/skeleton-loader"
import Link from "next/link"
import { useAccount } from "wagmi"

type TrackWithStats = TrackWithArtist & {
  total_earned?: number
  play_count?: number
  like_count?: number
}

export default function FollowingPage() {
  const { address, isConnected } = useAccount()
  const [tracks, setTracks] = useState<TrackWithStats[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isConnected && address) {
      loadFollowingFeed()
    }
  }, [address, isConnected])

  async function loadFollowingFeed() {
    if (!address) return

    setLoading(true)
    setError(null)

    try {
      const url = `/api/following?address=${address}`
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to load following feed")
      }

      const data = await response.json()
      setTracks(data.tracks || [])
    } catch (error) {
      console.error("[v0] Failed to load following feed:", error)
      setError("Failed to load your following feed. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" /><div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <main className="container relative px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
            <p className="text-foreground/70 mb-6 max-w-md">
              Connect your wallet to see tracks from artists you follow
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" /><div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <main className="container relative px-4 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-2xl font-bold mb-2">Something went wrong</h3>
            <p className="text-foreground/70 mb-6">{error}</p>
            <Button size="lg" className="rounded-full" onClick={loadFollowingFeed}>
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Empty state - not following anyone
  if (!loading && tracks.length === 0) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" /><div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <main className="container relative px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-8">
            <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#fa003e]">Your circle</p><h1 className="mb-2 text-5xl font-semibold tracking-[-0.07em]">Following</h1>
            <p className="text-foreground/70">Tracks from artists you follow</p>
          </div>

          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">No tracks yet</h3>
            <p className="text-foreground/70 mb-6 max-w-md">Start following artists to see their latest tracks here</p>
            <Link href="/artists">
              <Button size="lg" className="min-h-11 rounded-full bg-[#fa003e] px-6 text-white shadow-lg shadow-[#fa003e]/20 hover:bg-[#d90036]">
                <UserPlus className="h-5 w-5 mr-2" />
                Discover Artists
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" /><div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <main className="container py-12 px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#fa003e]">Your circle</p><h1 className="mb-2 text-5xl font-semibold tracking-[-0.07em]">Following</h1>
            <p className="text-foreground/70">
              {loading
                ? "Loading..."
                : `${tracks.length} track${tracks.length === 1 ? "" : "s"} from artists you follow`}
            </p>
          </div>
          <Link href="/artists">
            <Button variant="outline" className="min-h-11 rounded-full border-white/15 bg-white/[0.03] text-white hover:border-[#fa003e]/50 hover:bg-[#fa003e]/10">
              <UserPlus className="h-4 w-4 mr-2" />
              Find Artists
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Tracks Grid */}
        {!loading && tracks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-fade-in">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} queue={tracks} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
