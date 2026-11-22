"use client"

import Image from "next/image"
import Link from "next/link"
import useSWR from "swr"
import { ArrowRight, ArrowUpRight, AudioLines, Disc3, Play } from "lucide-react"
import type { TrackWithArtist } from "@/types/database"
import { useAudioPlayer } from "@/lib/audio-player-context"
import { Pause } from "lucide-react"

async function loadTracks(url: string): Promise<TrackWithArtist[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error("Featured track unavailable")
  return response.json()
}

function ListeningRoom() {
  const { data } = useSWR('/api/tracks/trending?time=all', loadTracks, { revalidateOnFocus: false })
  const track = Array.isArray(data) ? data.find(item => item.audio_url && item.content_type === 'audio') : null
  const { currentTrack, isPlaying, playTrack, pause, resume } = useAudioPlayer()
  const selected = !!track && currentTrack?.id === track.id
  return <figure className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
    <div className="relative aspect-[1.92] overflow-hidden sm:aspect-[1.65] lg:aspect-[1.55]">
      <Image priority fill sizes="(min-width: 1024px) 52vw, 95vw" className="object-cover" src="/images/listening-room.webp" alt="A silver tonearm rests on a black record with a cherry-pink label." />
      <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-background/90 px-3 py-1.5 font-mono text-xs text-foreground"><Disc3 size={14} aria-hidden /> Listening room</span>
    </div>
    <figcaption className="flex min-h-20 items-center justify-between gap-4 px-5">
      <div className="min-w-0"><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{track ? 'Featured track' : 'Artist directory'}</p><Link href={track ? `/track/${track.id}` : '/artists'} className="block truncate text-lg font-medium text-foreground hover:underline">{track?.title || 'Meet the artists'}</Link></div>
      {track ? <button type="button" aria-label={`${selected && isPlaying ? 'Pause' : 'Play'} ${track.title}`} onClick={() => selected ? isPlaying ? pause() : resume() : playTrack(track, [track])} className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">{selected && isPlaying ? <Pause size={18}/> : <Play size={18}/>}</button> : <Link href="/artists" aria-label="Browse the artist directory" className="grid size-11 shrink-0 place-items-center rounded-full border border-border hover:border-foreground"><ArrowUpRight size={20}/></Link>}
    </figcaption>
  </figure>
}

export function HomepageHero() {
  return <section aria-labelledby="listening-title" className="border-b border-border bg-background text-foreground">
    <div className="mx-auto grid max-w-[1512px] items-center gap-7 px-5 py-7 sm:px-[4.5%] sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-16">
      <div><p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[.16em] text-muted-foreground"><AudioLines size={18} className="text-accent" aria-hidden/> Independent music platform</p>
        <h1 id="listening-title" className="mt-5 font-sans text-[clamp(3.6rem,8.2vw,7.6rem)] font-semibold leading-[.91] tracking-[-.075em]">Sound,<br/><span className="text-accent">unfiltered.</span></h1>
        <p className="mt-5 max-w-sm text-base leading-6 text-muted-foreground">Discover independent music and support the artists behind every track you play.</p>
        <div className="mt-6 flex flex-wrap items-center gap-2"><Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90" href="/explore"><Play size={14} fill="currentColor" aria-hidden/> Explore music</Link><Link className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-sm font-medium hover:bg-muted" href="#for-artists">For artists <ArrowRight size={16} aria-hidden/></Link></div>
      </div><ListeningRoom />
    </div>
  </section>
}
