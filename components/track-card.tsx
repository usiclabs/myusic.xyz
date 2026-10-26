"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, MoreHorizontal, Pause, Play, VideoIcon } from "lucide-react"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { useAudioPlayer } from "@/lib/audio-player-context"
import { useWallet } from "@/lib/web3/wallet-context"
import { AddToPlaylistModal } from "./add-to-playlist-modal"
import { ReportTrackDialog } from "./report-track-dialog"
import type { TrackWithArtist } from "@/types/database"

interface TrackCardProps { track: TrackWithArtist & { total_earned?: number; play_count?: number; like_count?: number; content_type?: string; thumbnail_url?: string; token_address?: string; coin_address?: string }; queue?: TrackWithArtist[]; listView?: boolean }
const fetcher = (url: string) => fetch(url).then((res) => res.json())

function formatAddress(address: string) { return `${address.slice(0, 6)}...${address.slice(-4)}` }
function formatPrice(track: TrackWithArtist) { const price = Number(track.price_per_chunk || 0); if (!price) return "Free"; return `${price < 0.01 ? price.toFixed(3) : price.toFixed(2)} USDC ${track.unlock_type === "full_song" ? "to unlock" : "/play"}` }

export function TrackCard({ track, queue, listView = false }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, pause, resume } = useAudioPlayer()
  const { address } = useWallet()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(track.like_count || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [likesAvailable, setLikesAvailable] = useState(true)
  const tokenAddress = track.coin_address || track.token_address
  const { data: tokenMetrics } = useSWR(tokenAddress ? `/api/token/metrics/${tokenAddress}` : null, fetcher, { refreshInterval: 30000 })
  const active = currentTrack?.id === track.id

  useEffect(() => { if (!address) return; fetch("/api/likes/check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userAddress: address, trackIds: [track.id] }) }).then(async (response) => { if (!response.ok) { setLikesAvailable(false); return }; const data = await response.json(); setIsLiked(Boolean(data[track.id])) }).catch(() => setLikesAvailable(false)) }, [address, track.id])

  async function toggleLike() {
    if (!address || isLiking || !likesAvailable) return
    const wasLiked = isLiked; setIsLiking(true); setIsLiked(!wasLiked); setLikeCount((count) => count + (wasLiked ? -1 : 1))
    try { const response = await fetch(wasLiked ? `/api/likes/${track.id}?userAddress=${address}` : `/api/likes/${track.id}`, { method: wasLiked ? "DELETE" : "POST", headers: wasLiked ? undefined : { "Content-Type": "application/json" }, body: wasLiked ? undefined : JSON.stringify({ userAddress: address }) }); if (!response.ok) throw new Error("Like request failed") } catch { setIsLiked(wasLiked); setLikeCount((count) => count + (wasLiked ? 1 : -1)) } finally { setIsLiking(false) }
  }

  function handlePlay() { if (track.content_type !== "video") { if (active && isPlaying) pause(); else if (active) resume(); else playTrack(track, queue) } }
  const artwork = track.content_type === "video" ? track.thumbnail_url || "/images/usic-logo.png" : track.cover_url || "/abstract-soundscape.png"
  const title = track.title || "Untitled track"
  const artist = track.artist?.artist_name || formatAddress(track.artist_id)

  if (listView) return <article className="group flex items-center gap-4 rounded-[14px] border border-white/[0.08] bg-[#19191b] p-3 transition duration-300 hover:-translate-y-[3px]"><div className="relative size-16 shrink-0 overflow-hidden rounded-lg"><Image src={artwork} alt={`${title} artwork`} fill className="object-cover" sizes="64px" /><button type="button" aria-label={`${active && isPlaying ? "Pause" : "Play"} ${title}`} onClick={handlePlay} className="absolute inset-0 m-auto flex size-10 items-center justify-center rounded-full bg-[#f5f4f2] text-[#101011] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">{active && isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button></div><div className="min-w-0 flex-1"><Link href={`/track/${track.id}`} className="block truncate text-sm hover:text-[#fb3154]">{title}</Link><Link href={`/artist/${track.artist_id}`} className="mt-1 block truncate text-xs text-[#96969f] hover:text-[#f5f4f2]">{artist}</Link></div><span className="hidden text-xs text-[#96969f] sm:block">{formatPrice(track)}</span><button type="button" aria-label={`${isLiked ? "Remove" : "Save"} ${title}`} onClick={toggleLike} disabled={!address || isLiking} className={`flex size-10 items-center justify-center rounded-full border border-white/[0.08] ${isLiked ? "text-[#fb3154]" : "text-[#96969f]"}`}><Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} /></button></article>

  return <article className="group overflow-hidden rounded-[14px] border border-white/[0.08] bg-[#19191b] transition duration-300 hover:-translate-y-[3px]"><div className="relative aspect-square overflow-hidden bg-[#111113]"><Image src={artwork} alt={`${title} artwork`} fill className="object-cover transition duration-500 group-hover:scale-[1.035]" sizes="(max-width: 640px) 45vw, (max-width: 1024px) 24vw, 20vw" /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#19191b] to-transparent" />{track.content_type === "video" && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#101011]/70 px-2 py-1 text-[8px] text-white"><VideoIcon className="size-3" /> VIDEO</span>}<button type="button" aria-label={`${isLiked ? "Remove" : "Save"} ${title}`} onClick={toggleLike} disabled={!address || isLiking} className={`absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-[#101011]/55 text-white backdrop-blur-sm ${isLiked ? "text-[#fb3154]" : ""}`}><Heart className={`size-4 ${isLiked ? "fill-current" : ""}`} /></button><button type="button" aria-label={`${active && isPlaying ? "Pause" : "Play"} ${title}`} onClick={handlePlay} className="absolute bottom-3 left-3 flex size-11 items-center justify-center rounded-full bg-[#f5f4f2] text-[#101011] opacity-100 transition duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#fb3154]">{active && isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}</button></div><div className="p-3 sm:p-4"><Link href={`/track/${track.id}`} title={title} className="block truncate text-[12px] font-medium sm:text-[15px] hover:text-[#fb3154]">{title}</Link><Link href={`/artist/${track.artist_id}`} className="mt-1 block truncate text-[10px] text-[#96969f] sm:text-[11px] hover:text-[#f5f4f2]">{artist}</Link><div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3"><span className="truncate text-[9px] text-[#96969f] sm:text-[10px]">{formatPrice(track)}</span><div className="flex items-center gap-1"><AddToPlaylistModal trackId={track.id} trackTitle={title} /><ReportTrackDialog trackId={track.id} trackTitle={title} /><MoreHorizontal className="size-4 text-[#696970]" aria-hidden="true" /></div></div>{tokenAddress && tokenMetrics?.marketCap && <p className="mt-2 text-[9px] text-[#96969f]">{tokenMetrics.marketCap >= 1000 ? `${(tokenMetrics.marketCap / 1000).toFixed(1)}K` : tokenMetrics.marketCap.toFixed(2)} MC</p>}</div></article>
}
