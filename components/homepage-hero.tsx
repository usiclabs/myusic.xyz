"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowUpRight, Music2, Pause, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type LandingTrack = { id: string; title: string; artist_name?: string | null; cover_url?: string | null; audio_url?: string | null }

const fallbackArtwork = ["/diverse-group-making-music.png", "/abstract-soundscape.png", "/music-coin.jpg"]

export function HomepageHero() {
  const { data: stats } = useSWR("/api/stats/homepage", fetcher, { refreshInterval: 30000 })
  const { data: trendingTracks } = useSWR<LandingTrack[]>("/api/tracks/trending?time=all", fetcher, { revalidateOnFocus: false })
  const featuredTrack = trendingTracks?.find((track) => track.audio_url) ?? null
  const heroTracks = trendingTracks?.filter((track) => track.cover_url).slice(0, 3) ?? []
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggleFeaturedTrack = () => {
    if (!featuredTrack?.audio_url) return
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }
    const audio = new Audio(featuredTrack.audio_url)
    audio.onended = () => setIsPlaying(false)
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    audioRef.current = audio
  }

  return (
    <>
      <div className="border-y border-white/[0.08] bg-[#171719] px-5 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-[#96969f] sm:text-xs">
        <span className="mr-5 text-[#FA003E]">✦</span>Independent music. A new era.
        <a href="#discover" className="ml-5 text-[#f4f2ee] transition-colors hover:text-[#FA003E]">Find your sound ↗</a>
      </div>
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#000000] px-5 py-12 sm:px-[4.5%] sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1512px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <p className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#96969f]"><span className="size-2 rounded-full bg-[#FA003E]" />Made for music. Built around artists.</p>
            <h1 className="max-w-[680px] text-balance font-sans text-[clamp(3.2rem,7vw,6.1rem)] font-medium leading-[1.02] tracking-[-0.065em] text-[#f4f2ee]">Good music.<br /><span className="text-[#FA003E]">Real connection.</span></h1>
            <p className="mt-7 max-w-[390px] text-pretty text-sm leading-7 text-[#96969f] sm:text-base">Discover independent voices. Support the people behind your next favorite song, one stream at a time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full bg-[#FA003E] px-6 text-sm text-[#000000] hover:bg-[#ff4968]"><Link href="/explore">Find your sound <ArrowUpRight data-icon="inline-end" /></Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-transparent px-6 text-sm text-[#f4f2ee] hover:border-[#FA003E] hover:bg-transparent"><Link href="#for-artists">I&apos;m an artist <ArrowUpRight data-icon="inline-end" /></Link></Button>
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.12em] text-[#696970]">No subscription. &nbsp;·&nbsp; Direct artist support. &nbsp;·&nbsp; Built on Base.</p>
            <div className="mt-10 flex items-center gap-4 text-xs text-[#96969f]"><div className="flex -space-x-2">{(heroTracks.length ? heroTracks : fallbackArtwork.map((image, index) => ({ id: `fallback-${index}`, cover_url: image }))).map((track) => <img key={track.id} src={track.cover_url ?? undefined} alt="" className="size-8 rounded-full border-2 border-[#000000] object-cover" />)}</div><span>A world of independent voices.<br /><span className="text-[#696970]">Your next favorite is already here.</span></span></div>
          </div>
          <div className="relative mx-auto h-[390px] w-full max-w-[650px] lg:-mr-8 sm:h-[500px]">
            {(heroTracks.length ? heroTracks : fallbackArtwork.map((image, index) => ({ id: `fallback-${index}`, title: ["Pulse Malone", "Nova Lane", "SYLO"][index], artist_name: ["Independent hip-hop", "A new world of pop", "Raw hunger. Real energy."][index], cover_url: image }))).map((track, index) => <Link key={track.id} href={track.id.startsWith("fallback-") ? "/explore" : `/track/${track.id}`} className={`absolute overflow-hidden rounded-2xl border border-white/10 bg-[#19191b] shadow-2xl transition-transform hover:-translate-y-2 ${index === 0 ? "left-0 top-14 h-[75%] w-[42%] -rotate-[7deg]" : index === 1 ? "left-[25%] top-0 z-10 h-[83%] w-[48%] rotate-[4deg]" : "right-0 top-20 h-[70%] w-[39%] rotate-[10deg]"}`}><img src={track.cover_url ?? fallbackArtwork[index]} alt={`${track.title} artwork`} className="h-full w-full object-cover opacity-80" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent px-4 pb-4 pt-16"><p className="text-sm font-medium text-[#f4f2ee]">{track.title}</p><p className="mt-1 text-[10px] text-[#96969f]">{track.artist_name || "Independent artist"}</p></div></Link>)}
            <Link href={featuredTrack?.id ? `/track/${featuredTrack.id}` : "/explore"} className="absolute bottom-0 left-[10%] right-[4%] z-20 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#19191b] p-3 shadow-2xl sm:p-4"><img src={featuredTrack?.cover_url || "/music-coin.jpg"} alt={`${featuredTrack?.title || "Featured song"} cover artwork`} className="size-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-[9px] uppercase tracking-[0.2em] text-[#96969f]">Take a closer listen</p><p className="mt-1 truncate text-sm text-[#f4f2ee]">{featuredTrack?.title || "Explore the latest tracks"}</p><p className="text-[10px] text-[#96969f]">{featuredTrack?.artist_name || "Independent artists"}</p></div><div className="hidden gap-1 sm:flex">{[2,4,7,3,6,4,8,3].map((height, index) => <span key={index} className="w-1 rounded-full bg-[#FA003E]" style={{ height: `${height * 3}px` }} />)}</div><button type="button" aria-label={`${isPlaying ? "Pause" : "Play"} featured song`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFeaturedTrack() }} disabled={!featuredTrack?.audio_url} className="flex size-10 items-center justify-center rounded-full bg-[#f4f2ee] text-[#000000] disabled:cursor-not-allowed disabled:opacity-50">{isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}</button></Link>
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1512px] grid-cols-2 border-b border-white/[0.08] px-5 sm:grid-cols-4 sm:px-[4.5%]">{[
        { icon: Music2, label: "Independent by nature" },
        { icon: Sparkles, label: "Support goes direct" },
        { icon: Play, label: "Pay as you listen" },
        { icon: Sparkles, label: "Built on Base · Powered by x402" },
      ].map(({ icon: Icon, label }) => <div key={label} className="flex items-center gap-3 border-r border-white/[0.08] px-3 py-6 text-[10px] text-[#96969f] first:pl-0 last:border-r-0 sm:px-6"><Icon className="size-4 text-[#f4f2ee]" />{label}</div>)}</div>
    </>
  )
}
