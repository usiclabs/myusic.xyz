"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Heart, Pause, Play, Sparkles, Users, Wallet } from "lucide-react"
import { useAudioPlayer } from "@/lib/audio-player-context"
import type { TrackWithArtist } from "@/types/database"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type LandingTrack = { id: string; title: string; artist_name?: string | null; cover_url?: string | null; audio_url?: string | null; artist_avatar_url?: string | null; unlock_price?: number | null }
type Artist = { wallet_address: string; artist_name: string | null; avatar_url: string | null; bio: string | null; trackCount: number; followerCount: number; playCount: number; totalEarnings: number }

const fallbackVoices: LandingTrack[] = []

export function HomepageSections() {
  const { data: artists = [], isLoading: artistsLoading } = useSWR<Artist[]>("/api/artists/featured", fetcher)
  const [period, setPeriod] = useState("7d")
  const { data: tracks = [], isLoading: tracksLoading } = useSWR<LandingTrack[]>(`/api/tracks/trending?time=${period}`, fetcher)
  const [artistIndex, setArtistIndex] = useState(0)
  const { currentTrack, isPlaying, playTrack, pause, resume } = useAudioPlayer()
  const artistRailRef = useRef<HTMLDivElement | null>(null)
  const artistCount = artists.length
  const visibleArtists = artists.slice(artistIndex, artistIndex + 3)
  const displayedArtists = visibleArtists.length === 3 ? visibleArtists : artists.slice(0, 3)

  useEffect(() => {
    const rail = artistRailRef.current
    if (!rail) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") { event.preventDefault(); setArtistIndex((index) => Math.min(Math.max(artistCount - 3, 0), index + 1)) }
      if (event.key === "ArrowLeft") { event.preventDefault(); setArtistIndex((index) => Math.max(0, index - 1)) }
    }
    rail.addEventListener("keydown", onKeyDown)
    return () => rail.removeEventListener("keydown", onKeyDown)
  }, [artistCount])

  const toPlayableTrack = (track: LandingTrack): TrackWithArtist => ({
    id: track.id,
    title: track.title,
    artist_id: "landing-artist",
    content_type: "audio",
    audio_url: track.audio_url ?? null,
    video_url: null,
    cover_url: track.cover_url ?? null,
    thumbnail_url: track.cover_url ?? null,
    duration: 0,
    price_per_chunk: Number(track.unlock_price ?? 0),
    unlock_type: "per_chunk",
    nft_contract_address: null,
    token_id: null,
    created_at: new Date().toISOString(),
    artist: {
      wallet_address: "",
      artist_name: track.artist_name ?? "Independent artist",
      bio: null,
      avatar_url: track.artist_avatar_url ?? null,
      created_at: new Date().toISOString(),
    },
  })

  const togglePlayback = (track: LandingTrack) => {
    if (!track.audio_url) return
    if (currentTrack?.id === track.id) {
      if (isPlaying) pause()
      else resume()
      return
    }
    playTrack(toPlayableTrack(track), tracks.map(toPlayableTrack))
  }

  return (
    <div className="bg-[#000000] text-[#f4f2ee]">
      <section id="discover" className="mx-auto max-w-[1512px] scroll-mt-16 px-5 py-16 sm:px-[4.5%] lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.08] pb-6"><div><p className="mb-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.22em] text-[#96969f]"><span className="size-1.5 rounded-full bg-[#FA003E]" />Independent voices. Worth discovering.</p><h2 className="font-sans text-[27px] font-medium tracking-[-0.05em] sm:text-[33px]">Featured artists.</h2><p className="mt-2 text-xs text-[#96969f]">A new name. A different sound. A closer connection.</p></div><div className="flex items-center gap-2"><Link href="/artists" className="mr-3 text-xs text-[#f4f2ee] hover:text-[#FA003E]">All artists <ArrowUpRight className="ml-1 inline size-3" /></Link><button type="button" aria-label="Previous artists" disabled={artistIndex === 0} onClick={() => setArtistIndex((index) => Math.max(0, index - 1))} className="hidden size-9 items-center justify-center rounded-full border border-white/10 text-[#96969f] hover:border-[#FA003E] hover:text-[#FA003E] disabled:opacity-30 sm:flex"><ArrowLeft className="size-4" /></button><button type="button" aria-label="Next artists" disabled={artistIndex >= Math.max(artistCount - 3, 0)} onClick={() => setArtistIndex((index) => Math.min(Math.max(artistCount - 3, 0), index + 1))} className="hidden size-9 items-center justify-center rounded-full border border-white/10 text-[#96969f] hover:border-[#FA003E] hover:text-[#FA003E] disabled:opacity-30 sm:flex"><ArrowRight className="size-4" /></button></div></div>
        <div ref={artistRailRef} tabIndex={0} role="region" aria-label="Featured artists carousel" className="mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 outline-none sm:grid sm:grid-cols-3 sm:gap-[19px] sm:overflow-visible">{(artistsLoading ? Array.from({ length: 3 }, (_, index) => ({ wallet_address: `loading-${index}`, artist_name: "", avatar_url: null, bio: "", trackCount: 0, followerCount: 0, playCount: 0, totalEarnings: 0 })) : displayedArtists).map((artist) => <Link key={artist.wallet_address} href={artist.wallet_address.startsWith("loading-") ? "/artists" : `/artist/${artist.wallet_address}`} className="group min-w-[88%] snap-start overflow-hidden rounded-[15px] border border-white/[0.08] bg-[#19191b] sm:min-w-0"><div className="relative h-[240px] overflow-hidden bg-[#111113]"><img src={artist.avatar_url || "/abstract-soundscape.png"} alt={`${artist.artist_name || "Artist"} artwork`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-[#000000]/90 via-transparent to-transparent" /><span className="absolute left-3 top-3 rounded-full bg-[#000000]/45 px-2 py-1 text-[9px] text-[#f4f2ee]">Artist</span><div className="absolute inset-x-4 bottom-4 flex items-end justify-between"><div><h3 className="text-[26px] tracking-[-0.04em]">{artist.artist_name || "Loading artist"}</h3><p className="mt-1 max-w-[230px] text-[10px] text-white/70">{artist.bio || "Independent voice worth discovering."}</p></div><span className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/10"><ArrowUpRight className="size-4" /></span></div></div><div className="grid grid-cols-3 border-b border-white/[0.08] px-4 py-4 text-[10px] text-[#96969f]"><span><strong className="block text-sm font-normal text-[#f4f2ee]">{artist.trackCount || "—"}</strong>Tracks</span><span><strong className="block text-sm font-normal text-[#f4f2ee]">{artist.followerCount || "—"}</strong>Followers</span><span><strong className="block text-sm font-normal text-[#f4f2ee]">{artist.playCount ? artist.playCount.toLocaleString() : "—"}</strong>Plays</span></div><div className="flex justify-between px-4 py-3 text-[10px] text-[#96969f]"><span>Artist earnings</span><span className="text-[#91aa91]">{artist.totalEarnings ? `${artist.totalEarnings.toFixed(2)} USDC` : "Unavailable"}</span></div></Link>)}</div><div className="mt-4 flex items-center gap-3 text-[9px] uppercase tracking-[0.14em] text-[#696970]"><span>{artistCount ? `${Math.min(artistIndex + 1, artistCount)} / ${artistCount}` : "0 / 0"}</span><span className="h-px w-24 bg-white/10"><span className="block h-px bg-[#FA003E]" style={{ width: `${artistCount ? ((Math.min(artistIndex + 3, artistCount) / artistCount) * 100) : 0}%` }} /></span><span className="ml-auto">More voices to discover →</span></div>
      </section>

      <section id="trending" className="border-y border-white/[0.08] bg-[#000000] px-5 py-12 sm:px-[4.5%] sm:py-16"><div className="mx-auto max-w-[1512px]"><div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.08] pb-6"><div><p className="mb-3 text-[9px] uppercase tracking-[0.22em] text-[#96969f]">On repeat</p><h2 className="font-sans text-[27px] font-medium tracking-[-0.05em] sm:text-[33px]">Trending now.</h2><p className="mt-2 text-xs text-[#96969f]">What&apos;s finding its way into people&apos;s days.</p></div><div className="flex items-center gap-4"><div className="flex rounded-full border border-white/10 bg-[#19191b] p-1 text-[9px] text-[#96969f]">{[["24h","24H"],["7d","7D"],["30d","30D"],["all","All time"]].map(([value,label]) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-full px-3 py-2 ${period === value ? "bg-[#f4f2ee] text-[#000000]" : "hover:text-[#f4f2ee]"}`}>{label}</button>)}</div><Link href="/explore" className="hidden text-xs text-[#f4f2ee] hover:text-[#FA003E] sm:inline">Full chart <ArrowUpRight className="ml-1 inline size-3" /></Link></div></div>{tracksLoading ? <div className="mt-6 h-56 animate-pulse rounded-[15px] border border-white/[0.08] bg-[#19191b]" /> : tracks.length === 0 ? <div className="mt-6 rounded-[15px] border border-white/[0.08] bg-[#19191b] p-10 text-center text-sm text-[#96969f]">No tracks found for this period.</div> : <div className="mt-6 space-y-3">{tracks.slice(0, 6).map((track, index) => <div key={`${track.id}-${period}`} className="flex overflow-hidden rounded-[15px] border border-white/[0.08] bg-[#19191b]"><img src={track.cover_url || "/abstract-soundscape.png"} alt={`${track.title} artwork`} className="h-32 w-32 object-cover sm:h-56 sm:w-56" /><div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-7"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[0.18em] text-[#96969f]">{String(index + 1).padStart(2, "0")} / {period.toUpperCase()} · Independent release</p><Link href={track.id ? `/track/${track.id}` : "/explore"} className="mt-4 block truncate text-[27px] tracking-[-0.04em] hover:text-[#FA003E]">{track.title}</Link><p className="mt-1 text-xs text-[#96969f]">{track.artist_name || "Independent artist"}</p></div><button type="button" aria-label={`Save ${track.title}`} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#96969f] hover:border-[#FA003E] hover:text-[#FA003E]"><Heart className="size-4" /></button></div><div className="flex flex-wrap items-end justify-between gap-4"><p className="text-xs text-[#96969f]">{track.unlock_price ? `${track.unlock_price} USDC to unlock` : "Available to listen"}</p><div className="flex items-center gap-3"><button type="button" aria-label={`${isPlaying && currentTrack?.id === track.id ? "Pause" : "Play"} ${track.title}`} disabled={!track.audio_url} onClick={() => togglePlayback(track)} className="flex size-11 items-center justify-center rounded-full border border-white/15 text-[#f4f2ee] disabled:opacity-40">{isPlaying && currentTrack?.id === track.id ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}</button><Link href={track.id ? `/track/${track.id}` : "/explore"} className="inline-flex h-11 items-center rounded-full bg-[#f4f2ee] px-5 text-xs text-[#000000] hover:bg-[#FA003E]">View track <ArrowUpRight className="ml-2 size-3" /></Link></div></div></div></div>)}</div>}</div></section>

      <section id="how-it-works" className="border-y border-white/[0.08] px-5 py-16 sm:px-[4.5%] lg:py-20"><div className="mx-auto grid max-w-[1512px] gap-12 lg:grid-cols-[0.8fr_1.2fr]"><h2 className="max-w-sm font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl">A better kind of listening.</h2><div className="grid gap-8 sm:grid-cols-3">{[["01","Find your sound.","Discover new voices and follow the music that finds you."],["02","Make it matter.","Support artists directly with a small payment when you listen."],["03","Stay for the story.","Keep up with the people, process, and work behind every track."]].map(([number,title,description]) => <div key={number} className="border-t border-white/[0.12] pt-4"><p className="text-xs text-[#FA003E]">{number}</p><h3 className="mt-8 text-lg">{title}</h3><p className="mt-3 text-sm leading-6 text-[#96969f]">{description}</p></div>)}</div></div></section>

      <section id="for-artists" className="mx-auto grid max-w-[1512px] scroll-mt-16 gap-12 px-5 py-20 sm:px-[4.5%] lg:grid-cols-2 lg:items-center lg:py-28"><div><p className="mb-5 text-[10px] uppercase tracking-[0.22em] text-[#96969f]">For the ones making the music</p><h2 className="max-w-xl font-sans text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-5xl">Your sound. Your people. <span className="text-[#FA003E]">Your next chapter.</span></h2><p className="mt-6 max-w-lg text-sm leading-7 text-[#96969f]">Build a direct relationship with listeners and keep the value your music creates.</p><div className="mt-8 grid gap-4 text-sm text-[#f4f2ee]">{["Earnings from paid streams","Collaborator royalties","One place to track music and earnings"].map((item) => <p key={item} className="flex items-center gap-3"><Check className="size-4 text-[#FA003E]" />{item}</p>)}</div><Link href="/dashboard" className="mt-9 inline-flex h-12 items-center rounded-full bg-[#f4f2ee] px-6 text-sm text-[#000000] hover:bg-white">Start your artist journey <ArrowUpRight className="ml-2 size-4" /></Link></div><div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-8 sm:p-12"><div className="flex items-center justify-between border-b border-white/[0.08] pb-6 text-[10px] uppercase tracking-[0.2em] text-[#96969f]"><span>A closer connection</span><Heart className="size-4 text-[#FA003E]" /></div><div className="flex items-center justify-center gap-3 py-16 text-center text-xs text-[#96969f]"><div className="flex flex-col items-center gap-3"><div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-[#000000]"><Users className="size-6 text-[#f4f2ee]" /></div>Listener</div><span className="text-[#FA003E]">→ USDC →</span><div className="flex flex-col items-center gap-3"><div className="flex size-16 items-center justify-center rounded-full border border-[#FA003E]/40 bg-[#000000]"><Wallet className="size-6 text-[#FA003E]" /></div>Artist</div></div><p className="text-center text-lg">Direct support</p><p className="mt-2 text-center text-sm text-[#96969f]">Every play has a person behind it.</p></div></section>

      <section className="mx-auto grid max-w-[1512px] gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-[4.5%]"><Link href="/ai-curator" className="group rounded-2xl border border-white/[0.08] bg-[#19191b] p-7 hover:border-[#FA003E]/50"><Sparkles className="size-5 text-[#FA003E]" /><h3 className="mt-8 text-xl">A little help finding your vibe.</h3><p className="mt-3 text-sm text-[#96969f]">Let the AI Playlist Curator help you find a new direction.</p><span className="mt-8 inline-block text-sm">Try the curator <ArrowUpRight className="ml-2 inline size-4" /></span></Link><Link href="/videos" className="group rounded-2xl border border-white/[0.08] bg-[#19191b] p-7 hover:border-[#FA003E]/50"><MusicIcon /><h3 className="mt-8 text-xl">More than the track.</h3><p className="mt-3 text-sm text-[#96969f]">See the people, process, and visuals behind the sound.</p><span className="mt-8 inline-block text-sm">Watch videos <ArrowUpRight className="ml-2 inline size-4" /></span></Link></section>

      <section className="border-t border-white/[0.08] px-5 py-24 text-center sm:px-[4.5%] lg:py-32"><h2 className="font-sans text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Your next favorite is waiting.</h2><p className="mx-auto mt-5 max-w-md text-sm text-[#96969f]">Take a chance on a new sound. It could mean everything.</p><Link href="/explore" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#FA003E] px-7 text-sm text-[#000000] hover:bg-[#ff4968]">Start exploring <ArrowUpRight className="ml-2 size-4" /></Link><br /><Link href="#for-artists" className="mt-5 inline-block text-sm text-[#96969f] hover:text-[#f4f2ee]">Or share your own sound</Link></section>
    </div>
  )
}

function MusicIcon() { return <div className="flex size-5 items-center justify-center text-[#FA003E]">♪</div> }
