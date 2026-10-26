"use client"

import Link from "next/link"
import useSWR from "swr"
import { ArrowUpRight, Music2, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((response) => response.json())

const portraits = [
  { name: "Pulse Malone", detail: "Independent hip-hop", image: "/diverse-group-making-music.png", href: "/artists" },
  { name: "Nova Lane", detail: "A new world of pop", image: "/abstract-soundscape.png", href: "/artists" },
  { name: "SYLO", detail: "Raw hunger. Real energy.", image: "/music-coin.jpg", href: "/artists" },
]

export function HomepageHero() {
  const { data: stats } = useSWR("/api/stats/homepage", fetcher, { refreshInterval: 30000 })

  return (
    <>
      <div className="border-y border-white/[0.08] bg-[#171719] px-5 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-[#96969f] sm:text-xs">
        <span className="mr-5 text-[#fb3154]">✦</span>Independent music. A new era.
        <a href="#discover" className="ml-5 text-[#f4f2ee] transition-colors hover:text-[#fb3154]">Find your sound ↗</a>
      </div>
      <section className="border-b border-white/[0.08] bg-[#101011] px-5 py-12 sm:px-[4.5%] sm:py-16 lg:py-20">
        <div className="mx-auto grid max-w-[1512px] items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <p className="mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#96969f]"><span className="size-2 rounded-full bg-[#fb3154]" />Made for music. Built around artists.</p>
            <h1 className="max-w-[680px] text-balance font-sans text-[clamp(3.2rem,7vw,6.1rem)] font-medium leading-[1.02] tracking-[-0.065em] text-[#f4f2ee]">Good music.<br /><span className="text-[#fb3154]">Real connection.</span></h1>
            <p className="mt-7 max-w-[390px] text-pretty text-sm leading-7 text-[#96969f] sm:text-base">Discover independent voices. Support the people behind your next favorite song, one stream at a time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-12 rounded-full bg-[#fb3154] px-6 text-sm text-[#101011] hover:bg-[#ff4968]"><Link href="/explore">Find your sound <ArrowUpRight data-icon="inline-end" /></Link></Button>
              <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-transparent px-6 text-sm text-[#f4f2ee] hover:border-[#fb3154] hover:bg-transparent"><Link href="#for-artists">I&apos;m an artist <ArrowUpRight data-icon="inline-end" /></Link></Button>
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.12em] text-[#696970]">No subscription. &nbsp;·&nbsp; Direct artist support. &nbsp;·&nbsp; Built on Base.</p>
            <div className="mt-10 flex items-center gap-4 text-xs text-[#96969f]"><div className="flex -space-x-2">{portraits.map((portrait) => <img key={portrait.name} src={portrait.image} alt="" className="size-8 rounded-full border-2 border-[#101011] object-cover" />)}</div><span>A world of independent voices.<br /><span className="text-[#696970]">Your next favorite is already here.</span></span></div>
          </div>
          <div className="relative mx-auto h-[390px] w-full max-w-[650px] sm:h-[500px]">
            {portraits.map((portrait, index) => <Link key={portrait.name} href={portrait.href} className={`absolute overflow-hidden rounded-2xl border border-white/10 bg-[#19191b] shadow-2xl transition-transform hover:-translate-y-2 ${index === 0 ? "left-0 top-14 h-[75%] w-[42%] -rotate-[7deg]" : index === 1 ? "left-[25%] top-0 z-10 h-[83%] w-[48%] rotate-[4deg]" : "right-0 top-20 h-[70%] w-[39%] rotate-[10deg]"}`}><img src={portrait.image} alt={`${portrait.name} artwork`} className="h-full w-full object-cover opacity-80" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#101011] via-[#101011]/70 to-transparent px-4 pb-4 pt-16"><p className="text-sm font-medium text-[#f4f2ee]">{portrait.name}</p><p className="mt-1 text-[10px] text-[#96969f]">{portrait.detail}</p></div></Link>)}
            <Link href="/explore" className="absolute bottom-0 left-[10%] right-[4%] z-20 flex items-center gap-4 rounded-2xl border border-white/10 bg-[#19191b] p-3 shadow-2xl sm:p-4"><img src="/music-coin.jpg" alt="WiFi cover artwork" className="size-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="text-[9px] uppercase tracking-[0.2em] text-[#96969f]">Take a closer listen</p><p className="mt-1 text-sm text-[#f4f2ee]">WiFi</p><p className="text-[10px] text-[#96969f]">P.S. Kaguya</p></div><div className="hidden gap-1 sm:flex">{[2,4,7,3,6,4,8,3].map((height, index) => <span key={index} className="w-1 rounded-full bg-[#fb3154]" style={{ height: `${height * 3}px` }} />)}</div><span className="flex size-10 items-center justify-center rounded-full bg-[#f4f2ee] text-[#101011]"><Play className="size-4 fill-current" /></span></Link>
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
