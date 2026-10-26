"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Grid2X2, List, Music2, Search, SlidersHorizontal, X } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import type { TrackWithArtist } from "@/types/database"
import { TrackCard } from "@/components/track-card"
import { SkeletonCard } from "@/components/skeleton-loader"

type SortOption = "newest" | "most_played" | "most_sales" | "most_liked"
type FilterOption = "all" | "video" | "under" | "free"
type TrackWithStats = TrackWithArtist & { total_earned?: number; play_count?: number; like_count?: number }

const PAGE_SIZE = 24
const fetcherClient = () => createBrowserClient()

function priceLabel(track: TrackWithStats) {
  const price = Number(track.price_per_chunk || 0)
  if (!price) return "Free"
  return `${price < 0.01 ? price.toFixed(3) : price.toFixed(2)} USDC ${track.unlock_type === "full_song" ? "to unlock" : "/play"}`
}

export default function ExplorePage() {
  const [tracks, setTracks] = useState<TrackWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<FilterOption>("all")
  const [page, setPage] = useState(1)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [reloadKey, setReloadKey] = useState(0)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    async function loadTracks() {
      setLoading(true)
      setError(false)
      try {
        const supabase = fetcherClient()
        let query = supabase.from("tracks").select("*, artist:profiles!tracks_artist_id_fkey(*)").eq("is_active", true).or("is_hidden.is.null,is_hidden.eq.false")
        if (sortBy === "newest") query = query.order("created_at", { ascending: false })
        const { data, error: queryError } = await query.limit(500)
        if (queryError) throw queryError
        const source = data || []
        const ids = source.map((track) => track.id)
        const [{ data: streams }, { data: likes }] = await Promise.all([
          ids.length ? supabase.from("streams").select("track_id, chunks_played, total_paid").in("track_id", ids) : Promise.resolve({ data: [] }),
          ids.length ? supabase.from("likes").select("track_id").in("track_id", ids) : Promise.resolve({ data: [] }),
        ])
        const stats = new Map<string, { total_earned: number; play_count: number; like_count: number }>()
        ids.forEach((id) => stats.set(id, { total_earned: 0, play_count: 0, like_count: 0 }))
        streams?.forEach((stream) => { const item = stats.get(stream.track_id); if (item) { item.total_earned += Number(stream.total_paid || 0); item.play_count += Number(stream.chunks_played || 0) } })
        likes?.forEach((like) => { const item = stats.get(like.track_id); if (item) item.like_count += 1 })
        const result = source.map((track) => ({ ...track, ...stats.get(track.id) })) as TrackWithStats[]
        if (sortBy === "most_played") result.sort((a, b) => (b.play_count || 0) - (a.play_count || 0))
        if (sortBy === "most_sales") result.sort((a, b) => (b.total_earned || 0) - (a.total_earned || 0))
        if (sortBy === "most_liked") result.sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
        if (!cancelled) setTracks(result)
      } catch { if (!cancelled) { setTracks([]); setError(true) } } finally { if (!cancelled) setLoading(false) }
    }
    loadTracks()
    return () => { cancelled = true }
  }, [sortBy, reloadKey])

  useEffect(() => { setPage(1) }, [searchQuery, filter, sortBy])

  const filteredTracks = useMemo(() => tracks.filter((track) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch = !query || track.title.toLowerCase().includes(query) || (track.artist?.artist_name || "").toLowerCase().includes(query)
    const matchesFilter = filter === "all" || (filter === "video" && track.content_type === "video") || (filter === "under" && Number(track.price_per_chunk || 0) < 0.05) || (filter === "free" && Number(track.price_per_chunk || 0) === 0)
    return matchesSearch && matchesFilter
  }), [tracks, searchQuery, filter])

  const pageTracks = filteredTracks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const spotlightTracks = [
    tracks.find((track) => /love story/i.test(track.title)),
    tracks.find((track) => /midnight glow/i.test(track.title)),
    tracks.find((track) => /rewind/i.test(track.title)),
  ].filter(Boolean) as TrackWithStats[]
  const editorialTracks = spotlightTracks.length ? spotlightTracks : tracks.slice(0, 3)
  const totalPages = Math.max(1, Math.ceil(filteredTracks.length / PAGE_SIZE))

  return <main className="min-h-screen overflow-x-hidden bg-[#101011] pb-28 text-[#f5f4f2]">
    <div className="mx-auto w-full max-w-[1512px] px-5 sm:px-[4.5%]">
      <section className="flex items-end justify-between gap-8 pb-8 pt-10 sm:pb-10 sm:pt-14 lg:pt-16">
        <div><p className="mb-4 text-[9px] uppercase tracking-[0.23em] text-[#96969f]">Independent sounds. Endless discovery.</p><h1 className="font-sans text-[34px] font-medium leading-[1.15] tracking-[-1.5px] sm:text-[48px] sm:tracking-[-2.4px]">Find your frequency.</h1><p className="mt-3 text-xs text-[#96969f] sm:text-sm">New voices. Different worlds. Your next repeat.</p></div>
        <div className="hidden max-w-[220px] items-center gap-3 pb-1 text-[10px] leading-relaxed text-[#96969f] lg:flex"><Music2 className="size-5 shrink-0 text-[#f5f4f2]" /><span>A direct connection to the creators. Discover something that feels like you.</span></div>
      </section>

      <div ref={spotlightRef} className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-[1.85fr_1fr_1fr] sm:gap-4 sm:overflow-visible sm:px-0">
        {loading ? [1, 2, 3].map((item) => <div key={item} className="h-[300px] min-w-[81%] animate-pulse rounded-[18px] bg-[#19191b] sm:h-[338px] sm:min-w-0" />) : editorialTracks.map((track, index) => <EditorialCard key={track.id} track={track} lead={index === 0} />)}
      </div>

      <section className="pb-7 pt-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="flex items-center gap-2"><h2 className="font-sans text-[27px] font-medium tracking-[-1.2px]">Browse tracks</h2><span className="rounded-full border border-white/[0.08] px-2 py-1 text-[9px] text-[#96969f]">{filteredTracks.length} of {tracks.length}</span></div></div><button type="button" className="text-xs text-[#96969f] hover:text-[#f5f4f2]">Saved <span className="ml-1 rounded-full border border-white/[0.08] px-2 py-1">0</span></button></div>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#696970]" /><input aria-label="Search tracks and artists" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search tracks, artists, your next favorite…" className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#19191b] pl-11 pr-10 text-xs text-[#f5f4f2] outline-none placeholder:text-[#696970] focus:border-[#fb3154]/70" />{searchQuery && <button type="button" aria-label="Clear search" onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#96969f]"><X className="size-4" /></button>}</div><div className="flex gap-2 overflow-x-auto pb-1 lg:order-first lg:flex-1"><FilterChip active={filter === "all"} onClick={() => setFilter("all")}>All tracks</FilterChip><FilterChip active={filter === "video"} onClick={() => setFilter("video")}>Music videos</FilterChip><FilterChip active={filter === "under"} onClick={() => setFilter("under")}>Under 0.05 USDC</FilterChip><FilterChip active={filter === "free"} onClick={() => setFilter("free")}>Free</FilterChip></div><div className="flex items-center gap-2"><label className="sr-only" htmlFor="sort-tracks">Sort tracks</label><div className="relative"><select id="sort-tracks" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="h-11 appearance-none rounded-xl border border-white/[0.08] bg-[#19191b] py-2 pl-3 pr-9 text-xs text-[#f5f4f2] outline-none"><option value="newest">Newest</option><option value="most_played">Most played</option><option value="most_sales">Most sales</option><option value="most_liked">Most liked</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-[#96969f]" /></div><div className="hidden rounded-xl border border-white/[0.08] bg-[#19191b] p-1 sm:flex"><button type="button" aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-[#f5f4f2] text-[#101011]" : "text-[#96969f]"}`}><Grid2X2 className="size-4" /></button><button type="button" aria-label="List view" onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-[#f5f4f2] text-[#101011]" : "text-[#96969f]"}`}><List className="size-4" /></button></div></div></div>
      </section>

      {error ? <div className="rounded-[14px] border border-white/[0.08] bg-[#19191b] p-10 text-center"><p className="text-sm">We couldn&apos;t load the catalog.</p><button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 rounded-full bg-[#f5f4f2] px-5 py-3 text-xs text-[#101011]">Retry</button></div> : loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:gap-5">{Array.from({ length: 12 }, (_, index) => <SkeletonCard key={index} />)}</div> : pageTracks.length ? <div className={view === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:gap-5" : "space-y-3"}>{pageTracks.map((track) => <TrackCard key={track.id} track={track as any} queue={filteredTracks as TrackWithArtist[]} listView={view === "list"} />)}</div> : <div className="rounded-[14px] border border-white/[0.08] bg-[#19191b] p-12 text-center"><Search className="mx-auto mb-4 size-7 text-[#96969f]" /><p className="text-sm">No tracks match your filters.</p><button type="button" onClick={() => { setSearchQuery(""); setFilter("all") }} className="mt-4 rounded-full border border-white/[0.12] px-5 py-3 text-xs">Clear filters</button></div>}
      {totalPages > 1 && <div className="flex items-center justify-center gap-4 py-10"><button type="button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-full border border-white/[0.08] p-3 disabled:opacity-30"><ChevronLeft className="size-4" /></button><span className="text-xs text-[#96969f]">Page {page} of {totalPages}</span><button type="button" aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-white/[0.08] p-3 disabled:opacity-30"><ChevronRight className="size-4" /></button></div>}
    </div>
  </main>
}

function FilterChip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) { return <button type="button" onClick={onClick} className={`shrink-0 rounded-full border px-4 py-2.5 text-[10px] transition-colors ${active ? "border-[#f5f4f2] bg-[#f5f4f2] text-[#101011]" : "border-white/[0.08] text-[#96969f] hover:border-white/20 hover:text-[#f5f4f2]"}`}>{children}</button> }

function EditorialCard({ track, lead }: { track: TrackWithStats; lead: boolean }) { const title = track.title; return <article className={`group relative min-w-[81%] snap-start overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#19191b] ${lead ? "sm:min-w-0" : "sm:min-w-0"}`}><div className={`${lead ? "h-[300px] sm:h-[338px]" : "h-[300px] sm:h-[338px]"} relative`}><Image src={track.content_type === "video" ? track.thumbnail_url || "/abstract-soundscape.png" : track.cover_url || "/abstract-soundscape.png"} alt={`${title} artwork`} fill className="object-cover transition duration-500 group-hover:scale-[1.035]" sizes="(max-width: 700px) 81vw, 50vw" /><div className="absolute inset-0 bg-gradient-to-t from-[#101011] via-[#101011]/25 to-transparent" /><span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#101011]/40 px-3 py-1.5 text-[8px] uppercase tracking-[0.14em] text-white/80">{lead ? "In the spotlight" : title.toLowerCase().includes("midnight") ? "After dark" : "Worth a repeat"}</span><div className="absolute inset-x-5 bottom-5"><p className="mb-2 text-[8px] uppercase tracking-[0.18em] text-white/65">{lead ? "A story worth getting lost in." : "Independent release."}</p><h3 className={`font-sans font-medium tracking-[-1px] ${lead ? "text-[34px] sm:text-[40px]" : "text-[26px]"}`}>{title}</h3><p className="mt-1 text-xs text-white/70">{track.artist?.artist_name || "Independent artist"}</p><Link href={`/track/${track.id}`} className={`mt-4 inline-flex items-center gap-2 rounded-full ${lead ? "bg-[#fb3154] px-4 py-2.5 text-[#fff]" : "text-white/75"} text-[10px]`}>{lead ? "Discover the track" : "View track"}<ArrowRight className="size-3" /></Link><p className="mt-2 text-[9px] text-white/60">{priceLabel(track)}</p></div></div></article> }
