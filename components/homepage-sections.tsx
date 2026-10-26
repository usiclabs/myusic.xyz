"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowUpRight, Check, Heart, Pause, Play, Sparkles, Users, Wallet } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

type LandingTrack = {
  id: string
  title: string
  artist_name?: string | null
  cover_url?: string | null
  audio_url?: string | null
}

const fallbackVoices: LandingTrack[] = [
  { id: "", title: "Nova Lane", artist_name: "A new world of pop", cover_url: "/abstract-soundscape.png" },
  { id: "", title: "SYLO", artist_name: "Raw hunger. Real energy.", cover_url: "/music-coin.jpg" },
  { id: "", title: "Pulse Malone", artist_name: "Independent hip-hop", cover_url: "/diverse-group-making-music.png" },
  { id: "", title: "P.S. Kaguya", artist_name: "Electronic / alt", cover_url: "/video-thumbnail.png" },
]

export function HomepageSections() {
  const { data } = useSWR<LandingTrack[]>("/api/tracks/trending?time=all", fetcher, { revalidateOnFocus: false })
  const tracks = data?.filter((track) => track.cover_url || track.audio_url).slice(0, 4) ?? fallbackVoices
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const togglePlayback = (track: LandingTrack) => {
    if (!track.audio_url) return
    if (playingId === track.id) {
      audioRef.current?.pause()
      setPlayingId(null)
      return
    }
    if (audioRef.current) audioRef.current.pause()
    const audio = new Audio(track.audio_url)
    audio.onended = () => setPlayingId(null)
    audio.play().then(() => setPlayingId(track.id)).catch(() => setPlayingId(null))
    audioRef.current = audio
  }

  return (
    <div className="bg-[#000000] text-[#f4f2ee]">
      <section id="discover" className="mx-auto max-w-[1512px] scroll-mt-16 px-5 py-20 sm:px-[4.5%] lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.12] pb-8"><div><p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#96969f]">Featured artists</p><h2 className="font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl">Worth your first listen.</h2><p className="mt-4 text-sm text-[#96969f]">Independent voices, presented without the noise.</p></div><Link href="/artists" className="inline-flex items-center text-sm text-[#f4f2ee] transition-colors hover:text-[#FA003E]">Meet the artists <ArrowUpRight className="ml-2 size-4" /></Link></div>
        <div className="mt-8 grid grid-cols-2 gap-px border border-white/[0.12] bg-white/[0.12] sm:grid-cols-4">{tracks.map((track, index) => <div key={`${track.id}-${track.title}`} className="group bg-[#000000] p-3 sm:p-4"><Link href={track.id ? `/track/${track.id}` : "/artists"} className="block"><div className="relative aspect-[0.9] overflow-hidden bg-[#111113]"><img src={track.cover_url || "/abstract-soundscape.png"} alt={`${track.title} artwork`} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" /><span className="absolute left-3 top-3 font-mono text-[9px] text-white/60">0{index + 1}</span><span className="absolute bottom-3 right-3 flex size-9 items-center justify-center border border-white/20 bg-[#000000]/80 text-[#f4f2ee] transition-colors group-hover:border-[#FA003E] group-hover:text-[#FA003E]"><ArrowUpRight className="size-4" /></span></div><div className="flex items-start justify-between gap-3 pt-4"><div><h3 className="text-sm font-medium">{track.title}</h3><p className="mt-1 text-xs text-[#96969f]">{track.artist_name || "Independent artist"}</p></div><span className="pt-0.5 text-[9px] uppercase tracking-[0.14em] text-[#696970]">Artist</span></div></Link><button type="button" aria-label={`${playingId === track.id ? "Pause" : "Play"} ${track.title}`} disabled={!track.audio_url} onClick={() => togglePlayback(track)} className="mt-4 inline-flex items-center gap-2 border-t border-white/[0.1] pt-3 text-[10px] uppercase tracking-[0.16em] text-[#96969f] transition-colors hover:text-[#FA003E] disabled:cursor-not-allowed disabled:opacity-40"><span className="flex size-7 items-center justify-center border border-white/15">{playingId === track.id ? <Pause className="size-3 fill-current" /> : <Play className="size-3 fill-current" />}</span>{track.audio_url ? playingId === track.id ? "Pause" : "Play" : "Details"}</button></div>)}</div>
      </section>

      <section id="trending" className="border-y border-white/[0.12] bg-[#000000] px-5 py-20 sm:px-[4.5%] lg:py-24"><div className="mx-auto max-w-[1512px]"><div className="flex flex-wrap items-end justify-between gap-6 border-b border-white/[0.12] pb-8"><div><p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-[#FA003E]">Trending now</p><h2 className="font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl">What people are playing.</h2></div><Link href="/explore" className="inline-flex items-center text-sm text-[#f4f2ee] transition-colors hover:text-[#FA003E]">Explore all <ArrowUpRight className="ml-2 size-4" /></Link></div><div className="divide-y divide-white/[0.12]">{tracks.slice(0, 3).map((track, index) => <div key={`trending-${track.id}-${track.title}`} className="group flex items-center gap-4 py-5"><span className="w-6 font-mono text-xs text-[#696970]">0{index + 1}</span><img src={track.cover_url || "/abstract-soundscape.png"} alt={`${track.title} artwork`} className="size-14 object-cover grayscale transition duration-300 group-hover:grayscale-0 sm:size-16" /><div className="min-w-0 flex-1"><Link href={track.id ? `/track/${track.id}` : "/explore"} className="text-sm font-medium hover:text-[#FA003E]">{track.title}</Link><p className="mt-1 text-xs text-[#96969f]">{track.artist_name || "Independent artist"}</p></div><button type="button" aria-label={`${playingId === track.id ? "Pause" : "Play"} ${track.title}`} disabled={!track.audio_url} onClick={() => togglePlayback(track)} className="flex size-9 items-center justify-center border border-white/20 text-[#f4f2ee] transition-colors hover:border-[#FA003E] hover:text-[#FA003E] disabled:opacity-40">{playingId === track.id ? <Pause className="size-3 fill-current" /> : <Play className="size-3 fill-current" />}</button></div>)}</div></div></section>

      <section id="how-it-works" className="border-y border-white/[0.08] px-5 py-16 sm:px-[4.5%] lg:py-20"><div className="mx-auto grid max-w-[1512px] gap-12 lg:grid-cols-[0.8fr_1.2fr]"><h2 className="max-w-sm font-sans text-4xl font-medium tracking-[-0.05em] sm:text-5xl">A better kind of listening.</h2><div className="grid gap-8 sm:grid-cols-3">{[["01","Find your sound.","Discover new voices and follow the music that finds you."],["02","Make it matter.","Support artists directly with a small payment when you listen."],["03","Stay for the story.","Keep up with the people, process, and work behind every track."]].map(([number,title,description]) => <div key={number} className="border-t border-white/[0.12] pt-4"><p className="text-xs text-[#FA003E]">{number}</p><h3 className="mt-8 text-lg">{title}</h3><p className="mt-3 text-sm leading-6 text-[#96969f]">{description}</p></div>)}</div></div></section>

      <section id="for-artists" className="mx-auto grid max-w-[1512px] scroll-mt-16 gap-12 px-5 py-20 sm:px-[4.5%] lg:grid-cols-2 lg:items-center lg:py-28"><div><p className="mb-5 text-[10px] uppercase tracking-[0.22em] text-[#96969f]">For the ones making the music</p><h2 className="max-w-xl font-sans text-4xl font-medium leading-tight tracking-[-0.05em] sm:text-5xl">Your sound. Your people. <span className="text-[#FA003E]">Your next chapter.</span></h2><p className="mt-6 max-w-lg text-sm leading-7 text-[#96969f]">Build a direct relationship with listeners and keep the value your music creates.</p><div className="mt-8 grid gap-4 text-sm text-[#f4f2ee]">{["Earnings from paid streams","Collaborator royalties","One place to track music and earnings"].map((item) => <p key={item} className="flex items-center gap-3"><Check className="size-4 text-[#FA003E]" />{item}</p>)}</div><Link href="/dashboard" className="mt-9 inline-flex h-12 items-center rounded-full bg-[#f4f2ee] px-6 text-sm text-[#000000] hover:bg-white">Start your artist journey <ArrowUpRight className="ml-2 size-4" /></Link></div><div className="rounded-2xl border border-white/[0.08] bg-[#19191b] p-8 sm:p-12"><div className="flex items-center justify-between border-b border-white/[0.08] pb-6 text-[10px] uppercase tracking-[0.2em] text-[#96969f]"><span>A closer connection</span><Heart className="size-4 text-[#FA003E]" /></div><div className="flex items-center justify-center gap-3 py-16 text-center text-xs text-[#96969f]"><div className="flex flex-col items-center gap-3"><div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-[#000000]"><Users className="size-6 text-[#f4f2ee]" /></div>Listener</div><span className="text-[#FA003E]">→ USDC →</span><div className="flex flex-col items-center gap-3"><div className="flex size-16 items-center justify-center rounded-full border border-[#FA003E]/40 bg-[#000000]"><Wallet className="size-6 text-[#FA003E]" /></div>Artist</div></div><p className="text-center text-lg">Direct support</p><p className="mt-2 text-center text-sm text-[#96969f]">Every play has a person behind it.</p></div></section>

      <section className="mx-auto grid max-w-[1512px] gap-4 px-5 pb-20 sm:grid-cols-2 sm:px-[4.5%]"><Link href="/ai-curator" className="group rounded-2xl border border-white/[0.08] bg-[#19191b] p-7 hover:border-[#FA003E]/50"><Sparkles className="size-5 text-[#FA003E]" /><h3 className="mt-8 text-xl">A little help finding your vibe.</h3><p className="mt-3 text-sm text-[#96969f]">Let the AI Playlist Curator help you find a new direction.</p><span className="mt-8 inline-block text-sm">Try the curator <ArrowUpRight className="ml-2 inline size-4" /></span></Link><Link href="/videos" className="group rounded-2xl border border-white/[0.08] bg-[#19191b] p-7 hover:border-[#FA003E]/50"><MusicIcon /><h3 className="mt-8 text-xl">More than the track.</h3><p className="mt-3 text-sm text-[#96969f]">See the people, process, and visuals behind the sound.</p><span className="mt-8 inline-block text-sm">Watch videos <ArrowUpRight className="ml-2 inline size-4" /></span></Link></section>

      <section className="border-t border-white/[0.08] px-5 py-24 text-center sm:px-[4.5%] lg:py-32"><h2 className="font-sans text-4xl font-medium tracking-[-0.05em] sm:text-6xl">Your next favorite is waiting.</h2><p className="mx-auto mt-5 max-w-md text-sm text-[#96969f]">Take a chance on a new sound. It could mean everything.</p><Link href="/explore" className="mt-8 inline-flex h-12 items-center rounded-full bg-[#FA003E] px-7 text-sm text-[#000000] hover:bg-[#ff4968]">Start exploring <ArrowUpRight className="ml-2 size-4" /></Link><br /><Link href="#for-artists" className="mt-5 inline-block text-sm text-[#96969f] hover:text-[#f4f2ee]">Or share your own sound</Link></section>
    </div>
  )
}

function MusicIcon() { return <div className="flex size-5 items-center justify-center text-[#FA003E]">♪</div> }
