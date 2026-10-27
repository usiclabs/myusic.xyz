"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Music,
  Wallet,
  TrendingUp,
  DollarSign,
  Upload,
  Heart,
  Edit,
  EyeOff,
  BarChart3,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Coins,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { TrackCard } from "@/components/track-card"
import { useWallet } from "@/lib/web3/wallet-context"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ensureProfile } from "@/lib/supabase/helpers"
import type { Database } from "@/types/database"
import { SkeletonCard, SkeletonStats } from "@/components/skeleton-loader"
import { TokenizeProfileModal } from "@/components/tokenize-profile-modal"

type Track = Database["public"]["Tables"]["tracks"]["Row"] & {
  artist: Database["public"]["Tables"]["profiles"]["Row"]
  total_earned?: number
  play_count?: number
  like_count?: number
}

type Stream = Database["public"]["Tables"]["streams"]["Row"] & {
  tracks: Database["public"]["Tables"]["tracks"]["Row"]
}

export default function DashboardPage() {
  const { address, isConnected, connect } = useWallet()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [likedTracks, setLikedTracks] = useState<Track[]>([])
  const [stats, setStats] = useState({
    totalPlays: 0,
    totalEarnings: 0,
    trackCount: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [growthStats, setGrowthStats] = useState({
    playsGrowth: 0,
    earningsGrowth: 0,
    tracksGrowth: 0,
  })
  const [showTokenizeModal, setShowTokenizeModal] = useState(false)

  const loadDashboard = async () => {
    if (!address) {
      setLoading(false)
      return
    }

    try {
      const supabase = createBrowserClient()

      const { data: profileData } = await ensureProfile(address)
      setProfile(profileData)

      const { data: tracksData } = await supabase
        .from("tracks")
        .select(`
          *,
          artist:profiles!tracks_artist_id_fkey(*)
        `)
        .eq("artist_id", address.toLowerCase())
        .order("created_at", { ascending: false })

      if (tracksData) {
        const tracksWithMetrics = await Promise.all(
          tracksData.map(async (track) => {
            const { data: streams } = await supabase
              .from("streams")
              .select("chunks_played, total_paid")
              .eq("track_id", track.id)

            const total_earned = streams?.reduce((sum, s) => sum + Number(s.total_paid), 0) || 0
            const play_count = streams?.reduce((sum, s) => sum + s.chunks_played, 0) || 0

            return {
              ...track,
              total_earned,
              play_count,
            } as Track
          }),
        )

        setTracks(tracksWithMetrics)
      }

      const { data: streams } = await supabase
        .from("streams")
        .select("track_id, chunks_played, total_paid, tracks!inner(artist_id)")
        .eq("tracks.artist_id", address.toLowerCase())

      console.log("[v0] Dashboard streams query result:", {
        streamsCount: streams?.length || 0,
        streams: streams?.slice(0, 3), // Log first 3 for debugging
      })

      const totalPlays = (streams as Stream[])?.reduce((sum, s) => sum + s.chunks_played, 0) || 0
      const totalEarnings = (streams as Stream[])?.reduce((sum, s) => sum + Number(s.total_paid), 0) || 0
      const trackCount = tracksData?.length || 0

      console.log("[v0] Dashboard stats calculated:", { totalPlays, totalEarnings, trackCount })

      setStats({ totalPlays, totalEarnings, trackCount })

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: recentStreams } = await supabase
        .from("streams")
        .select("track_id, chunks_played, total_paid, started_at, tracks!inner(artist_id)")
        .eq("tracks.artist_id", address.toLowerCase())
        .gte("started_at", sevenDaysAgo.toISOString())

      const recentPlays = (recentStreams as Stream[])?.reduce((sum, s) => sum + s.chunks_played, 0) || 0
      const recentEarnings = (recentStreams as Stream[])?.reduce((sum, s) => sum + Number(s.total_paid), 0) || 0

      const playsGrowth = totalPlays > 0 ? (recentPlays / totalPlays) * 100 : 0
      const earningsGrowth = totalEarnings > 0 ? (recentEarnings / totalEarnings) * 100 : 0

      setGrowthStats({
        playsGrowth: Math.round(playsGrowth),
        earningsGrowth: Math.round(earningsGrowth),
        tracksGrowth: 0,
      })

      const { data: recentActivityData } = await supabase
        .from("streams")
        .select(`
          *,
          tracks!inner(
            title,
            artist_id,
            tracks.artist_id
          )
        `)
        .eq("tracks.artist_id", address.toLowerCase())
        .order("last_played_at", { ascending: false })
        .limit(5)

      setRecentActivity(recentActivityData || [])

      try {
        const { data: likes, error } = await supabase
          .from("likes")
          .select(
            `
            track_id,
            tracks:tracks!inner(
              *,
              artist:profiles!tracks_artist_id_fkey(*)
            )
          `,
          )
          .eq("user_address", address.toLowerCase())
          .order("created_at", { ascending: false })

        if (error && error.code === "PGRST205") {
          console.log("[v0] Likes table not found - skipping liked tracks")
          setLikedTracks([])
        } else if (likes) {
          const likedTracksData = likes.map((like: any) => like.tracks)
          setLikedTracks(likedTracksData)
        }
      } catch (error) {
        console.error("Failed to load liked tracks:", error)
        setLikedTracks([])
      }
    } catch (error) {
      console.error("Failed to load dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [address])

  const handleTokenizeSuccess = (tokenAddress: string) => {
    console.log("[v0] Profile tokenized:", tokenAddress)
    // Reload dashboard to show new token address
    loadDashboard()
  }

  if (!isConnected) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(250,0,62,0.15),transparent_32%),radial-gradient(circle_at_10%_80%,rgba(250,0,62,0.08),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <main className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl items-center px-5 py-14 sm:px-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/45"><span className="size-1.5 animate-pulse rounded-full bg-[#fa003e]" />MyUSIC / Artist workspace</div>
              <h1 className="max-w-xl text-balance text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">Your music.<br /><span className="text-[#fa003e]">Your command center.</span></h1>
              <p className="mt-6 max-w-md text-base leading-7 text-white/55">Upload releases, watch your streams grow, and follow every payment from one focused artist dashboard.</p>
              <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.16em] text-white/45"><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Release tools</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Live analytics</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2">Onchain earnings</span></div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              <div className="absolute -inset-8 rounded-[32px] bg-[#fa003e]/10 blur-3xl" />
              <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0a]/95 p-5 shadow-2xl shadow-black backdrop-blur-xl sm:p-7">
                <div className="mb-6 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Artist dashboard</p><h2 className="mt-1 text-xl tracking-[-0.04em]">Your next move</h2></div><div className="flex size-10 items-center justify-center rounded-full border border-[#fa003e]/30 bg-[#fa003e]/10 text-[#fa003e]"><Music className="size-4" /></div></div>
                <div className="mb-4 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Total streams</p><p className="mt-3 text-3xl text-white/25">—</p><div className="mt-2 h-1 rounded-full bg-[#fa003e]/30"><div className="h-1 w-2/3 rounded-full bg-[#fa003e]" /></div></div><div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><p className="text-[10px] uppercase tracking-[0.15em] text-white/35">Earnings</p><p className="mt-3 text-3xl text-white/25">$—</p><div className="mt-2 flex items-end gap-1"><span className="h-3 w-1 rounded-full bg-white/20" /><span className="h-5 w-1 rounded-full bg-white/25" /><span className="h-8 w-1 rounded-full bg-[#fa003e]/70" /><span className="h-6 w-1 rounded-full bg-white/25" /><span className="h-10 w-1 rounded-full bg-[#fa003e]" /></div></div></div>
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-4"><div className="flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl bg-[#fa003e]/10 text-[#fa003e]"><Wallet className="size-4" /></div><div><p className="text-sm">Connect to unlock your workspace</p><p className="mt-1 text-xs text-white/35">Your artist data stays tied to your wallet.</p></div></div></div>
                <Button onClick={connect} className="mt-5 h-12 w-full gap-2 rounded-xl bg-[#fa003e] text-sm font-semibold text-white shadow-lg shadow-[#fa003e]/20 transition-all hover:-translate-y-0.5 hover:bg-[#d90036] hover:shadow-[#fa003e]/35"><Wallet className="size-4" />Connect wallet to continue</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen pb-32 bg-black">
        <main className="container py-12 px-4 sm:px-6">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-10 skeleton rounded w-48" />
                <div className="h-5 skeleton rounded w-64" />
              </div>
              <div className="h-11 w-40 skeleton rounded" />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <SkeletonStats />
              <SkeletonStats />
              <SkeletonStats />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card/50 backdrop-blur-xl border border-border/50 p-6 rounded-xl">
                  <div className="h-6 skeleton rounded w-32 mb-2" />
                  <div className="h-4 skeleton rounded w-full" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black pb-32 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-10">
        <div className="relative mb-8 overflow-hidden rounded-[20px] border border-white/10 bg-[#090909] p-5 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 duration-700 sm:p-8 md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] opacity-[0.06]" />
          <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#fa003e]/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-white/45"><span className="size-1.5 animate-pulse rounded-full bg-[#fa003e]" />MyUSIC / Artist dashboard</div>
                <h1 className="text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.07em] sm:text-6xl">
                  {profile?.artist_name || "Welcome Back"}<span className="text-[#fa003e]">.</span>
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-white/50">Track your performance, manage releases, and follow every payment from one focused artist workspace.</p>
              </div>
              <div className="mt-6 flex w-full flex-col gap-3 sm:mt-0 sm:w-auto sm:flex-row">
                <Button size="lg" asChild className="bg-[#fa003e] text-white shadow-lg shadow-[#fa003e]/20 transition-all hover:-translate-y-0.5 hover:bg-[#d90036] hover:shadow-[#fa003e]/35">
                  <Link href="/dashboard/upload">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Track
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard/analytics">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card
            className="relative overflow-hidden border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 group"
            style={{ animationDelay: "0.1s" }}
          >
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                {growthStats.tracksGrowth !== 0 && (
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${growthStats.tracksGrowth > 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {growthStats.tracksGrowth > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {Math.abs(growthStats.tracksGrowth)}%
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Tracks</p>
              <p className="text-4xl font-bold">{stats.trackCount}</p>
            </div>
          </Card>

          <Card
            className="relative overflow-hidden border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 group"
            style={{ animationDelay: "0.2s" }}
          >
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 border border-accent/30">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                {growthStats.playsGrowth > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    {growthStats.playsGrowth}%
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Plays</p>
              <p className="text-4xl font-bold">{stats.totalPlays.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Last 7 days</p>
            </div>
          </Card>

          <Card
            className="relative overflow-hidden border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 group"
            style={{ animationDelay: "0.3s" }}
          >
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/20 border border-chart-3/30">
                  <DollarSign className="h-6 w-6 text-chart-3" />
                </div>
                {growthStats.earningsGrowth > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-green-500">
                    <ArrowUpRight className="h-4 w-4" />
                    {growthStats.earningsGrowth}%
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
              <p className="text-4xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-2">USDC</p>
            </div>
          </Card>

          {profile?.profile_token_address ? (
            <Card
              className="border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d] h-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 group"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/30 border border-chart-4/40 group-hover:scale-110 transition-transform">
                  <Coins className="h-5 w-5 text-chart-4" />
                </div>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="font-semibold mb-2">Profile Token</h3>
              <p className="text-sm text-muted-foreground mb-3">Your profile is tokenized</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-chart-4/20 hover:bg-chart-4/10 bg-transparent"
                onClick={() => {
                  navigator.clipboard.writeText(profile.profile_token_address)
                  // TODO: Add toast notification
                }}
              >
                Copy Address
              </Button>
            </Card>
          ) : (
            <button
              onClick={() => setShowTokenizeModal(true)}
              className="animate-slide-up group text-left"
              style={{ animationDelay: "0.5s" }}
            >
              <Card className="border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d] h-full motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/30 border border-chart-4/40 group-hover:scale-110 transition-transform">
                    <Coins className="h-5 w-5 text-chart-4" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-chart-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h3 className="font-semibold mb-2">Tokenize Profile</h3>
                <p className="text-sm text-muted-foreground">Create your own profile token on Base</p>
              </Card>
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/dashboard/analytics" className="animate-slide-up group" style={{ animationDelay: "0.1s" }}>
            <Card className="border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#0d0d0d] h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/30 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-sm text-muted-foreground">View detailed insights and performance metrics</p>
            </Card>
          </Link>

          <Link href="/dashboard/earnings" className="animate-slide-up group" style={{ animationDelay: "0.2s" }}>
            <Card className="border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#0d0d0d] h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20 border border-chart-3/30 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-5 w-5 text-chart-3" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-chart-3 transition-colors" />
              </div>
              <h3 className="font-semibold mb-2">Earnings</h3>
              <p className="text-sm text-muted-foreground">Track your revenue and payment history</p>
            </Card>
          </Link>

          <Link href="/profile" className="animate-slide-up group" style={{ animationDelay: "0.3s" }}>
            <Card className="border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#0d0d0d] h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 border border-accent/30 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5 text-accent" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-semibold mb-2">Profile</h3>
              <p className="text-sm text-muted-foreground">Update your artist profile and settings</p>
            </Card>
          </Link>

          <Link href="/dashboard/upload" className="animate-slide-up group" style={{ animationDelay: "0.4s" }}>
            <Card className="border border-[#fa003e]/30 bg-[#fa003e]/[0.06] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/55 hover:bg-[#fa003e]/10 h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/30 border border-primary/40 group-hover:scale-110 transition-transform">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
              <h3 className="font-semibold mb-2">Upload Track</h3>
              <p className="text-sm text-muted-foreground">Share your latest music with the world</p>
            </Card>
          </Link>
        </div>

        {recentActivity.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6 animate-slide-up">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Recent Activity</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/analytics">View All</Link>
              </Button>
            </div>
            <Card className="border border-white/10 bg-[#090909] p-4 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 sm:p-6">
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <Music className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.tracks?.title || "Unknown Track"}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.chunks_played} plays • ${Number(activity.total_paid).toFixed(2)} earned
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.last_played_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {likedTracks.length > 0 && (
          <>
            <div className="mb-6 animate-slide-up flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              <h2 className="text-2xl font-bold">Your Likes</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-12">
              {likedTracks.map((track, i) => (
                <div key={track.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <TrackCard track={track as any} />
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold">Your Tracks</h2>
        </div>

        {tracks && tracks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {tracks.map((track, i) => (
              <div
                key={track.id}
                className="animate-slide-up group relative"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <TrackCard track={track as any} />
                {!track.is_active && (
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Hidden</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="h-8 w-8 p-0 bg-black/80 backdrop-blur-sm hover:bg-black/90"
                  >
                    <Link href={`/dashboard/edit/${track.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-card/50 backdrop-blur-xl border border-border/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-12 text-center animate-scale-in">
            <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tracks yet</h3>
            <p className="text-muted-foreground mb-6">Upload your first track to get started</p>
            <Button asChild>
              <Link href="/dashboard/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Track
              </Link>
            </Button>
          </Card>
        )}
      </main>
      <TokenizeProfileModal
        open={showTokenizeModal}
        onOpenChange={setShowTokenizeModal}
        onSuccess={handleTokenizeSuccess}
        artistName={profile?.artist_name || undefined}
      />
    </div>
  )
}
