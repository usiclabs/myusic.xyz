"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, User, TrendingUp, Users, Activity } from 'lucide-react'

const destinations = [
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/artists', icon: Users, label: 'Artists' },
  { href: '/trending', icon: TrendingUp, label: 'Trending' },
  { href: '/activity-feed', icon: Activity, label: 'Activity' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function MobileBottomNav() {
  const path = usePathname()
  return <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 pb-safe text-card-foreground backdrop-blur-lg md:hidden">
    <div className="mx-auto flex h-16 max-w-md items-stretch px-1">{destinations.map(({ href, icon: Icon, label }) => {
      const active = path === href || path?.startsWith(href + '/')
      return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium transition-colors ${active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><Icon size={20} aria-hidden className={active ? 'text-accent' : ''}/>{label}</Link>
    })}</div>
  </nav>
}
