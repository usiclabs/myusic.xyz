"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Plus, Music, Users, DollarSign } from "lucide-react"

type Artist = {
  wallet_address: string
  artist_name: string | null
  bio: string | null
  avatar_url: string | null
  totalEarned: number
  trackCount: number
  followerCount: number
  profile_token_address?: string | null
}

export function ArtistsFeed({ artists }: { artists: Artist[] }) {
  const featured = artists.slice(0, 3)
  const lead = featured[0]
  const secondary = featured.slice(1)

  if (!artists.length) {
    return <div className="px-5 py-24 text-center text-muted-foreground">No artists match these filters.</div>
  }

  return (
    <main className="mx-auto w-full max-w-[1512px] px-5 pb-28 pt-8 sm:px-[4.5%] md:pt-12">
      <section className="mb-10 flex items-end justify-between gap-8">
        <div>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Independent voices. Infinite possibilities.</p>
          <h1 className="text-balance text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">Find your next favorite.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Discover the artists moving music forward. Be part of their story.</p>
        </div>
        <div className="hidden items-center gap-3 pb-1 lg:flex">
          <div className="flex -space-x-2">{artists.slice(0, 4).map((artist) => <Avatar key={artist.wallet_address} artist={artist} />)}</div>
          <div className="text-xs text-muted-foreground"><strong className="block text-foreground">{artists.length} independent artists</strong>One world of sounds.</div>
        </div>
      </section>

      <section className="mb-12 grid snap-x snap-mandatory grid-flow-col auto-cols-[81%] gap-3 overflow-x-auto pb-2 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-3 sm:gap-4 sm:overflow-visible">
        {lead && <Spotlight artist={lead} lead label="In the spotlight" />}
        {secondary.map((artist, index) => <Spotlight key={artist.wallet_address} artist={artist} label={index === 0 ? "Sound to discover" : "On our radar"} />)}
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-[-0.04em]">Explore artists <span className="ml-2 rounded-full border border-border px-2 py-0.5 align-middle font-mono text-[10px] text-muted-foreground">{artists.length}</span></h2>
          <button className="rounded-full border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground">Following 0</button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {artists.map((artist) => <ArtistCard key={artist.wallet_address} artist={artist} />)}
        </div>
      </section>
    </main>
  )
}

function Avatar({ artist }: { artist: Artist }) { return artist.avatar_url ? <Image src={artist.avatar_url} alt="" width={28} height={28} className="size-7 rounded-full border-2 border-background object-cover" /> : <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-card text-[10px]">{artist.artist_name?.[0] ?? "A"}</div> }

function Spotlight({ artist, lead = false, label }: { artist: Artist; lead?: boolean; label: string }) {
  return <Link href={`/artist/${artist.wallet_address}`} className={`group relative block min-h-[310px] snap-start overflow-hidden rounded-2xl border border-border bg-card sm:min-h-[338px] ${lead ? "sm:col-span-1" : ""}`}>
    {artist.avatar_url && <Image src={artist.avatar_url} alt={artist.artist_name || "Artist"} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
    <div className="absolute inset-x-5 top-5"><span className="rounded-full border border-white/20 bg-background/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-foreground/80">✦ {label}</span></div>
    <div className="absolute inset-x-5 bottom-5"><p className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-accent">{lead ? "Meet your next repeat." : "Artist to discover."}</p><h3 className={`${lead ? "text-4xl" : "text-2xl"} font-semibold tracking-[-0.06em]`}>{artist.artist_name || "Unknown artist"}</h3><p className="mt-2 line-clamp-2 max-w-sm text-xs leading-5 text-foreground/70">{artist.bio || "Independent sound, moving forward."}</p>{lead && <span className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground">Meet {artist.artist_name} <ArrowUpRight className="ml-2" /></span>}</div>
  </Link>
}

function ArtistCard({ artist }: { artist: Artist }) {
  return <Link href={`/artist/${artist.wallet_address}`} className="group overflow-hidden rounded-[14px] border border-border bg-card transition-transform duration-200 hover:-translate-y-1">
    <div className="relative aspect-[1.05] overflow-hidden bg-muted">{artist.avatar_url ? <Image src={artist.avatar_url} alt={artist.artist_name || "Artist"} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center text-4xl text-muted-foreground">{artist.artist_name?.[0] ?? "A"}</div>}<span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-background/70 px-2 py-1 font-mono text-[9px] text-foreground/80">Artist</span><span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-white/20 bg-background/60"><Plus /></span></div>
    <div className="p-3 sm:p-4"><div className="flex items-center justify-between gap-2"><h3 className="truncate text-sm font-semibold">{artist.artist_name || "Unknown artist"}</h3><ArrowUpRight className="shrink-0 text-muted-foreground" /></div><p className="mt-1 truncate text-[11px] text-muted-foreground">{artist.bio || "Independent artist"}</p><div className="mt-4 flex items-center justify-between border-t border-border pt-3 font-mono text-[9px] text-muted-foreground"><span><Music className="mr-1 inline size-3" />{artist.trackCount}</span><span><Users className="mr-1 inline size-3" />{artist.followerCount}</span><span className="hidden sm:inline"><DollarSign className="mr-1 inline size-3" />{artist.totalEarned.toFixed(2)}</span></div></div>
  </Link>
}
