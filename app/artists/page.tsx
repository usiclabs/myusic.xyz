"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ArtistsFilter, type SortOption } from "@/components/artists-filter"
import { ArtistsFeed } from "@/components/artists-feed"
import { MyusicAtmosphere } from "@/components/myusic-page-primitives"

type Artist = { wallet_address: string; artist_name: string | null; bio: string | null; avatar_url: string | null; genre?: string | null; created_at: string; totalEarned: number; trackCount: number; followerCount: number; totalStreams: number; profile_token_address?: string | null; marketCap?: number }

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [genre, setGenre] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("followers-high")
  const [minEarnings, setMinEarnings] = useState(0)
  const [minTracks, setMinTracks] = useState(0)

  useEffect(() => {
    async function loadArtists() {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from("profiles").select("*").not("artist_name", "is", null)
      if (error || !data) { setLoading(false); return }
      const addresses = data.map((artist) => artist.wallet_address.toLowerCase())
      const [{ data: tracks }, { data: streams }, { data: follows }] = await Promise.all([
        supabase.from("tracks").select("artist_id").in("artist_id", addresses),
        supabase.from("streams").select("total_paid, tracks!inner(artist_id)").in("tracks.artist_id", addresses),
        supabase.from("follows").select("following_address").in("following_address", data.map((artist) => artist.wallet_address)),
      ])
      const count = (rows: any[] | null | undefined, key: string) => rows?.reduce((map, row) => { const address = (key === "stream" ? row.tracks?.artist_id : key === "follow" ? row.following_address : row.artist_id)?.toLowerCase(); if (address) map.set(address, (map.get(address) || 0) + 1); return map }, new Map<string, number>()) || new Map<string, number>()
      const trackCounts = count(tracks, "track"), streamCounts = count(streams, "stream"), followerCounts = count(follows, "follow")
      setArtists(data.map((artist) => { const address = artist.wallet_address.toLowerCase(); return { ...artist, totalEarned: streams?.filter((stream: any) => stream.tracks?.artist_id?.toLowerCase() === address).reduce((sum: number, stream: any) => sum + (stream.total_paid || 0), 0) || 0, trackCount: trackCounts.get(address) || 0, followerCount: followerCounts.get(address) || 0, totalStreams: streamCounts.get(address) || 0 } }))
      setLoading(false)
    }
    loadArtists()
  }, [])

  const filteredArtists = artists.filter((artist) => artist.trackCount > 0 && (!searchQuery || artist.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())) && (!genre || artist.genre?.trim().toLowerCase() === genre.toLowerCase()) && artist.totalEarned >= minEarnings && artist.trackCount >= minTracks).sort((a, b) => {
    if (sortBy === "name-asc") return (a.artist_name || "").localeCompare(b.artist_name || "")
    if (sortBy === "earnings-high") return b.totalEarned - a.totalEarned
    if (sortBy === "tracks-high") return b.trackCount - a.trackCount
    if (sortBy === "followers-high") return b.followerCount - a.followerCount
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return 0
  })

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-black text-sm text-white/45">Loading artists...</div>
  return <div className="relative min-h-screen overflow-hidden bg-black text-white"><MyusicAtmosphere /><div className="relative mx-auto w-full max-w-[1512px] px-5 pt-8 sm:px-[4.5%] sm:pt-12"><p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[#fa003e]">MyUSIC / Artists</p><h1 className="mb-8 text-5xl font-semibold tracking-[-0.07em] sm:text-6xl">Meet the<br /><span className="text-[#fa003e]">next wave.</span></h1><ArtistsFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} genre={genre} onGenreChange={setGenre} sortBy={sortBy} onSortChange={setSortBy} minEarnings={minEarnings} onMinEarningsChange={setMinEarnings} minTracks={minTracks} onMinTracksChange={setMinTracks} totalResults={filteredArtists.length} /></div><ArtistsFeed artists={filteredArtists} /></div>
}
