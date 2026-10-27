"use client"

import { useState } from "react"
import { TrackCard } from "@/components/track-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, Music, Play, Users, Radio, Sparkles, TrendingUp } from "lucide-react"
import { FollowButton } from "@/components/follow-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListeningHistory } from "@/components/listening-history"
import { FollowersList } from "@/components/followers-list"
import { FollowingList } from "@/components/following-list"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CopyTokenAddressButton } from "@/components/copy-token-address-button"
import { ProfileTokenSwapModal } from "@/components/profile-token-swap-modal"
import { VerifiedBadge } from "@/components/verified-badge"
import { SiFarcaster, SiX, SiTiktok } from "react-icons/si"
import type { Address } from "viem"

interface ArtistPageClientProps {
  artist: any
  address: string
  followerCount: number
  followingCount: number
  tracks: any[]
  totalEarnings: number
  totalPlays: number
  profileTokenMarketCap: string | null
  streams: any[]
  liveStreams: any[]
  isCurrentlyLive: boolean
  followers: any[]
  following: any[]
  aiTracks: any[]
}

export function ArtistPageClient({
  artist,
  address,
  followerCount,
  followingCount,
  tracks,
  totalEarnings,
  totalPlays,
  profileTokenMarketCap,
  streams,
  liveStreams,
  isCurrentlyLive,
  followers,
  following,
  aiTracks,
}: ArtistPageClientProps) {
  const [showSwapModal, setShowSwapModal] = useState(false)

  function formatAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <>
      <div className="min-h-screen overflow-hidden bg-black text-white">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_8%,rgba(250,0,62,0.12),transparent_28%)]" />
        <main className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
          <div className="animate-in fade-in duration-500">
          <div className="mb-6 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/40"><Link href="/artists" className="transition-colors hover:text-white">← All artists</Link><span>Artist profile · Base</span></div>
          {/* Artist Header */}
          <div className="group relative mb-8 overflow-hidden rounded-[20px] border border-white/10 bg-[#090909] p-5 transition-all duration-700 hover:border-white/20 sm:p-8 lg:min-h-[430px] lg:p-10">
            {artist.avatar_url && <div className="absolute inset-y-0 right-0 hidden w-[48%] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105 lg:block" style={{ backgroundImage: `linear-gradient(90deg,#090909 0%,rgba(9,9,9,0.18) 50%,rgba(9,9,9,0.2)),linear-gradient(0deg,rgba(9,9,9,0.35),transparent 45%),url(${artist.avatar_url})` }} aria-hidden="true" />}
            <div className="relative z-10 lg:flex lg:min-h-[350px] lg:w-[58%] lg:flex-col lg:justify-center">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-[#fa003e]/50 sm:h-28 sm:w-28 lg:hidden">
                <AvatarImage src={artist.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/20 text-primary text-3xl">
                  {artist.artist_name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <p className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-white/45"><span className="size-1.5 rounded-full bg-[#fa003e]" />The artist</p><h1 className="animate-in slide-in-from-bottom-3 fade-in duration-700 text-5xl font-semibold tracking-[-0.07em] sm:text-6xl lg:text-7xl">{artist.artist_name || "Anonymous Artist"}<span className="text-[#fa003e]">.</span></h1>
                      {artist.verified && <VerifiedBadge size="lg" />}
                      {isCurrentlyLive && (
                        <div className="flex items-center gap-1.5 rounded-full border border-[#fa003e]/35 bg-[#fa003e]/10 px-3 py-1">
                          <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </div>
                          <span className="text-xs font-semibold text-red-500 uppercase">Live</span>
                        </div>
                      )}
                    </div>
                    <p className="mt-3 font-mono text-[10px] text-white/40">{formatAddress(artist.wallet_address)}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{followerCount}</span>
                        <span className="text-muted-foreground">followers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{followingCount}</span>
                        <span className="text-muted-foreground">following</span>
                      </div>
                    </div>
                  </div>
                  <FollowButton artistAddress={address} initialFollowerCount={followerCount} size="lg" />
                </div>
                {artist.bio && <p className="text-muted-foreground leading-relaxed max-w-2xl mb-4">{artist.bio}</p>}

                {((artist as any).farcaster_url ||
                  (artist as any).x_url ||
                  (artist as any).zora_url ||
                  (artist as any).tiktok_url) && (
                  <div className="flex items-center gap-3 mt-4">
                    {(artist as any).farcaster_url && (
                      <a
                        href={(artist as any).farcaster_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#fa003e] transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/45 hover:bg-[#fa003e]/10 hover:shadow-lg hover:shadow-[#fa003e]/10"
                        aria-label="Farcaster"
                      >
                        <SiFarcaster className="size-5 transition-transform duration-300 group-hover/social:scale-110" aria-hidden="true" />
                      </a>
                    )}
                    {(artist as any).x_url && (
                      <a
                        href={(artist as any).x_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#fa003e] transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/45 hover:bg-[#fa003e]/10 hover:shadow-lg hover:shadow-[#fa003e]/10"
                        aria-label="X (Twitter)"
                      >
                        <SiX className="size-5 transition-transform duration-300 group-hover/social:scale-110" aria-hidden="true" />
                      </a>
                    )}
                    {(artist as any).zora_url && (
                      <a
                        href={(artist as any).zora_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#fa003e] transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/45 hover:bg-[#fa003e]/10 hover:shadow-lg hover:shadow-[#fa003e]/10"
                        aria-label="Zora"
                      >
                        <span className="font-mono text-sm font-bold transition-transform duration-300 group-hover/social:scale-110" aria-hidden="true">Z</span>
                      </a>
                    )}
                    {(artist as any).tiktok_url && (
                      <a
                        href={(artist as any).tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/social flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#fa003e] transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/45 hover:bg-[#fa003e]/10 hover:shadow-lg hover:shadow-[#fa003e]/10"
                        aria-label="TikTok"
                      >
                        <SiTiktok className="size-5 transition-transform duration-300 group-hover/social:scale-110" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          </div>

          {/* Stats Grid */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-${(artist as any).profile_token_address ? "2 lg:grid-cols-4" : "3"} gap-4 mb-8`}
          >
            <div className="group border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="group border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Music className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tracks</p>
                  <p className="text-2xl font-bold">{tracks?.length || 0}</p>
                </div>
              </div>
            </div>

            <div className="group border border-white/10 bg-[#090909] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#fa003e]/35 hover:bg-[#0d0d0d]">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Play className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Plays</p>
                  <p className="text-2xl font-bold">{totalPlays}</p>
                </div>
              </div>
            </div>

            {(artist as any).profile_token_address && (
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Market Cap</p>
                    <p className="text-2xl font-bold text-green-500">{profileTokenMarketCap || "Loading..."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <CopyTokenAddressButton address={(artist as any).profile_token_address} />
                  <Button
                    size="sm"
                    className="flex-1 h-8 text-xs bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => setShowSwapModal(true)}
                  >
                    Swap
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="mb-8 flex w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-white/10 bg-transparent p-0 scroll-smooth [scrollbar-width:none]">
              <TabsTrigger
                value="tracks"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white"
                title="Tracks"
              >
                <Music className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Tracks</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai-creations"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white"
                title="AI Creations"
              >
                <Sparkles className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white relative"
                title="Live Streams"
              >
                <Radio className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Live</span>
                {isCurrentlyLive && (
                  <span className="absolute -top-1 -right-1 sm:relative sm:top-0 sm:right-0 sm:ml-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white"
                title="Listening History"
              >
                <Play className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger
                value="followers"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white"
                title="Followers"
              >
                <Users className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Followers</span>
              </TabsTrigger>
              <TabsTrigger
                value="following"
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-2 min-h-[44px] data-[state=active]:border-b-2 data-[state=active]:border-[#fa003e] data-[state=active]:text-white"
                title="Following"
              >
                <Users className="h-5 w-5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden sm:inline">Following</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracks">
              {tracks && tracks.length > 0 ? (
                <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible">
                  {tracks.map((track) => (
                    <div key={track.id} className="w-[245px] shrink-0 snap-start transition-transform duration-300 hover:-translate-y-1 md:w-auto"><TrackCard track={track as any} /></div>
                  ))}
                </div>
              ) : (
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-12 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tracks uploaded yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ai-creations">
              {aiTracks && aiTracks.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-6 w-6 text-accent" />
                      <h2 className="text-2xl font-bold">AI Creations</h2>
                    </div>
                    <p className="text-muted-foreground">
                      {aiTracks.length} AI-generated {aiTracks.length === 1 ? "track" : "tracks"}
                    </p>
                  </div>
                  <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible">
                    {aiTracks.map((track) => (
                      <TrackCard key={track.id} track={track as any} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-12 text-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No AI-generated tracks yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="live">
              {liveStreams && liveStreams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveStreams.map((stream) => (
                    <Link
                      key={stream.id}
                      href={`/live/${stream.id}`}
                      className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-6 hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Radio className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {stream.title || "Untitled Stream"}
                          </h3>
                        </div>
                        {stream.is_live && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 border border-red-500/50 rounded-full">
                            <div className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                            </div>
                            <span className="text-xs font-semibold text-red-500 uppercase">Live</span>
                          </div>
                        )}
                      </div>
                      {stream.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{stream.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {stream.viewer_count !== null && (
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{stream.viewer_count} watching</span>
                            </div>
                          )}
                        </div>
                        <span>
                          {stream.is_live
                            ? "Live now"
                            : stream.ended_at
                              ? new Date(stream.ended_at).toLocaleDateString()
                              : new Date(stream.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-12 text-center">
                  <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No live streams yet</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history">
              <ListeningHistory streams={streams || []} />
            </TabsContent>

            <TabsContent value="followers">
              <FollowersList followers={followers} />
            </TabsContent>

            <TabsContent value="following">
              <FollowingList following={following} />
            </TabsContent>
          </Tabs>
          </div>
        </main>
      </div>

      {/* Native Swap Modal */}
      {showSwapModal && (artist as any).profile_token_address && (
        <ProfileTokenSwapModal
          tokenAddress={(artist as any).profile_token_address as Address}
          tokenName={artist.artist_name || "Profile Token"}
          tokenSymbol={artist.artist_name?.toUpperCase().slice(0, 4)}
          onClose={() => setShowSwapModal(false)}
        />
      )}
    </>
  )
}
