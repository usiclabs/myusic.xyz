"use client"

import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
export type SortOption =
  | "newest"
  | "oldest"
  | "earnings-high"
  | "earnings-low"
  | "tracks-high"
  | "tracks-low"
  | "name-asc"
  | "name-desc"
  | "streams-high"
  | "streams-low"
  | "marketcap-high"
  | "marketcap-low"

interface Props { searchQuery: string; onSearchChange: (value: string) => void; sortBy: SortOption; onSortChange: (value: SortOption) => void; minEarnings: number; onMinEarningsChange: (value: number) => void; minTracks: number; onMinTracksChange: (value: number) => void; totalResults: number }

export function ArtistsFilter({ searchQuery, onSearchChange, sortBy, onSortChange, minEarnings, onMinEarningsChange, minTracks, onMinTracksChange }: Props) {
  return <div className="mb-8 flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-center">
    <div className="relative min-w-0 flex-1 sm:max-w-[280px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search artists" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search artists, sounds, stories..." className="h-10 rounded-[9px] border-border bg-card pl-9 text-xs" />{searchQuery && <button aria-label="Clear search" onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="size-4" /></button>}</div>
    <div className="flex gap-2 overflow-x-auto pb-1 text-xs"><Button type="button" variant="secondary" className="shrink-0 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90">All artists</Button><Button type="button" variant="ghost" className="shrink-0 rounded-full text-muted-foreground">Hip-hop</Button><Button type="button" variant="ghost" className="shrink-0 rounded-full text-muted-foreground">R&amp;B</Button><Button type="button" variant="ghost" className="shrink-0 rounded-full text-muted-foreground">Pop</Button><Button type="button" variant="ghost" className="shrink-0 rounded-full text-muted-foreground">Alternative</Button></div>
    <select aria-label="Sort artists" value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)} className="h-10 rounded-[9px] border border-border bg-card px-3 text-xs text-foreground sm:ml-auto"><option value="marketcap-high">Featured first</option><option value="followers-high">Most followed</option><option value="tracks-high">Most tracks</option><option value="earnings-high">Top earnings</option><option value="name-asc">Name: A–Z</option><option value="newest">Newest</option></select>
    {(minEarnings > 0 || minTracks > 0) && <Button variant="ghost" size="sm" onClick={() => { onMinEarningsChange(0); onMinTracksChange(0) }} aria-label="Clear advanced filters"><SlidersHorizontal className="mr-2 size-3" />Clear filters</Button>}
  </div>
}
