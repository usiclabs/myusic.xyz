import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Music, Users, DollarSign, TrendingUp, Play, Heart, Upload, Activity, Coins } from "lucide-react"
import { PlatformAnalyticsCharts } from "@/components/platform-analytics-charts"
import { TopTracksTable } from "@/components/top-tracks-table"
import { TopArtistsTable } from "@/components/top-artists-table"
import { RecentActivityFeed } from "@/components/recent-activity-feed"
import { TokenMetrics } from "@/components/token-metrics"

export const dynamic = "force-dynamic"

async function getPlatformMetrics() {
  const supabase = await createClient()

  // Get total tracks
  const { count: totalTracks } = await supabase.from("tracks").select("*", { count: "exact", head: true })

  // Get total artists (profiles with at least one track)
  const { data: artistsData } = await supabase.from("tracks").select("artist_id").eq("is_active", true)

  const uniqueArtists = new Set(artistsData?.map((t) => t.artist_id) || []).size

  // Get total streams
  const { data: streamsData } = await supabase.from("streams").select("chunks_played, total_paid")

  const totalStreams = streamsData?.reduce((sum, s) => sum + (s.chunks_played || 0), 0) || 0
  const totalRevenue = streamsData?.reduce((sum, s) => sum + Number(s.total_paid || 0), 0) || 0

  // Get total likes
  const { count: totalLikes } = await supabase.from("likes").select("*", { count: "exact", head: true })

  // Get total follows
  const { count: totalFollows } = await supabase.from("follows").select("*", { count: "exact", head: true })

  // Get unique listeners
  const { data: listenersData } = await supabase.from("streams").select("listener_address")
  const uniqueListeners = new Set(listenersData?.map((s) => s.listener_address) || []).size

  // Get streams over time for charts
  const { data: streamHistory } = await supabase
    .from("streams")
    .select("started_at, chunks_played, total_paid")
    .order("started_at", { ascending: false })
    .limit(1000)

  // Get top tracks by streams
  const { data: topTracks } = await supabase
    .from("tracks")
    .select(
      `
      id,
      title,
      cover_url,
      artist_id,
      created_at,
      profiles!tracks_artist_id_fkey (
        wallet_address,
        artist_name,
        avatar_url
      )
    `,
    )
    .eq("is_active", true)
    .limit(10)

  // Calculate stream counts for each track
  const tracksWithStreams = await Promise.all(
    (topTracks || []).map(async (track) => {
      const { data: trackStreams } = await supabase
        .from("streams")
        .select("chunks_played, total_paid")
        .eq("track_id", track.id)

      const streams = trackStreams?.reduce((sum, s) => sum + (s.chunks_played || 0), 0) || 0
      const revenue = trackStreams?.reduce((sum, s) => sum + Number(s.total_paid || 0), 0) || 0

      return { ...track, streams, revenue }
    }),
  )

  const sortedTopTracks = tracksWithStreams.sort((a, b) => b.streams - a.streams).slice(0, 10)

  // Get top artists by total streams
  const { data: allTracks } = await supabase
    .from("tracks")
    .select(
      `
      id,
      artist_id,
      profiles!tracks_artist_id_fkey (
        wallet_address,
        artist_name,
        avatar_url
      )
    `,
    )
    .eq("is_active", true)

  // Calculate streams per artist
  const artistStreamsMap = new Map<string, { artist: any; streams: number; revenue: number; trackCount: number }>()

  for (const track of allTracks || []) {
    const { data: trackStreams } = await supabase
      .from("streams")
      .select("chunks_played, total_paid")
      .eq("track_id", track.id)

    const streams = trackStreams?.reduce((sum, s) => sum + (s.chunks_played || 0), 0) || 0
    const revenue = trackStreams?.reduce((sum, s) => sum + Number(s.total_paid || 0), 0) || 0

    if (artistStreamsMap.has(track.artist_id)) {
      const existing = artistStreamsMap.get(track.artist_id)!
      existing.streams += streams
      existing.revenue += revenue
      existing.trackCount += 1
    } else {
      artistStreamsMap.set(track.artist_id, {
        artist: track.profiles,
        streams,
        revenue,
        trackCount: 1,
      })
    }
  }

  const topArtists = Array.from(artistStreamsMap.values())
    .sort((a, b) => b.streams - a.streams)
    .slice(0, 10)

  const { data: recentStreams } = await supabase
    .from("streams")
    .select(
      `
      id,
      started_at,
      last_played_at,
      listener_address,
      chunks_played,
      total_paid,
      track_id,
      tracks!streams_track_id_fkey (
        id,
        title,
        cover_url,
        artist_id,
        profiles!tracks_artist_id_fkey (
          artist_name
        )
      )
    `,
    )
    .order("last_played_at", { ascending: false })
    .limit(50)

  // Get auto-investment transactions
  const { data: autoInvestTxs } = await supabase
    .from("auto_investment_transactions")
    .select(
      `
      id,
      created_at,
      user_address,
      amount,
      chunk_index,
      status,
      track_id,
      tracks!auto_investment_transactions_track_id_fkey (
        id,
        title,
        cover_url,
        artist_id,
        profiles!tracks_artist_id_fkey (
          artist_name
        )
      )
    `,
    )
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(50)

  // Combine and sort all activity
  const allActivity = [
    ...(recentStreams || []).map((s) => ({
      id: s.id,
      timestamp: s.last_played_at || s.started_at,
      type: "stream" as const,
      listener_address: s.listener_address,
      chunks_played: s.chunks_played,
      total_paid: s.total_paid,
      track_id: s.track_id,
      tracks: s.tracks,
    })),
    ...(autoInvestTxs || []).map((tx) => ({
      id: tx.id,
      timestamp: tx.created_at,
      type: "auto_invest" as const,
      listener_address: tx.user_address,
      chunks_played: 1,
      total_paid: tx.amount,
      track_id: tx.track_id,
      tracks: tx.tracks,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30)

  return {
    totalTracks: totalTracks || 0,
    totalArtists: uniqueArtists,
    totalStreams,
    totalRevenue,
    totalLikes: totalLikes || 0,
    totalFollows: totalFollows || 0,
    uniqueListeners,
    streamHistory: streamHistory || [],
    topTracks: sortedTopTracks,
    topArtists,
    recentActivity: allActivity,
  }
}

export default async function AnalyticsPage() {
  const metrics = await getPlatformMetrics()

  return (
    <div className="min-h-screen overflow-x-hidden bg-black pb-24 text-white md:pb-8">
      <div className="mx-auto max-w-[1280px] overflow-x-hidden px-5 py-8 sm:px-8 lg:py-10">
        {/* Header */}
        <div className="mb-8 border-b border-[#1f1f1f] pb-8">
          <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c]"><span className="size-1.5 rounded-full bg-[#fa003e]" />MYUSIC / THE NUMBERS</p>
          <h1 className="text-balance text-4xl font-bold tracking-[-0.07em] text-white sm:text-[45px]">The music. <span className="text-[#fa003e]">In numbers.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#8c8c8c]">An open view of the streams, creators, and support behind MyUSIC.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-[10px] text-[#666]"><span className="rounded-full border border-[#1f1f1f] bg-[#090909] px-3 py-1.5">Captured MyUSIC data</span><span>Source: Supabase · refreshed on request</span></div>
        </div>

        {/* Platform Metrics Heading */}
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Platform Metrics
          </h2>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-8 grid max-w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#1f1f1f] lg:grid-cols-4">
          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.totalTracks.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Tracks</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.totalArtists.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Active Artists</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.totalStreams.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Streams</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">${metrics.totalRevenue.toFixed(2)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Revenue (USDC)</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.totalLikes.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Likes</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.uniqueListeners.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Unique Listeners</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">{metrics.totalFollows.toLocaleString()}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Follows</div>
          </Card>

          <Card className="bg-[#090909] p-4 sm:p-6 transition-colors hover:bg-[#141414]">
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              </div>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-1">
              {metrics.totalTracks > 0 ? (metrics.totalStreams / metrics.totalTracks).toFixed(1) : "0"}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">Avg Streams/Track</div>
          </Card>
        </div>

        {/* Charts */}
        <div className="mb-8 max-w-full overflow-hidden">
          <PlatformAnalyticsCharts data={metrics.streamHistory} />
        </div>

        {/* Top Tables */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8 max-w-full">
          <TopTracksTable tracks={metrics.topTracks} />
          <TopArtistsTable artists={metrics.topArtists} />
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed activity={metrics.recentActivity} />

        {/* Section Divider */}
        <div className="my-8 border-t border-border/50" />

        {/* $USI Token Metrics Section */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            $USI Token Metrics
          </h2>
          <TokenMetrics />
        </div>
      </div>
    </div>
  )
}
