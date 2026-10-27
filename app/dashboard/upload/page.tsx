"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { UploadForm } from "@/components/upload-form"
import { ArrowLeft, FileAudio, Sparkles, Upload, Waves } from "lucide-react"

interface GeneratedTrackData {
  audioUrl?: string
  title?: string
  coverUrl?: string
  style?: string
  prompt?: string
  videoUrl?: string
  isAiGenerated?: boolean
}

export default function UploadPage() {
  const searchParams = useSearchParams()
  const [prefillData, setPrefillData] = useState<GeneratedTrackData | null>(null)
  const fromCreate = searchParams.get("from") === "create"

  useEffect(() => {
    if (fromCreate) {
      const stored = localStorage.getItem("generatedTrackForUpload")
      if (stored) {
        try {
          const data = JSON.parse(stored)
          setPrefillData(data)
          // Clear after loading to prevent stale data
          localStorage.removeItem("generatedTrackForUpload")
        } catch (e) {
          console.error("Failed to parse stored track data:", e)
        }
      }
    }
  }, [fromCreate])

  return (
    <div className="relative min-h-screen overflow-hidden bg-black pb-32 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.14),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <main className="relative mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-10">
        <div className="mb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/40"><button type="button" onClick={() => window.history.back()} className="flex items-center gap-2 transition-colors hover:text-white"><ArrowLeft className="size-3" />Dashboard</button><span>Creator workspace / Release</span></div>
        <div className="grid items-start gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 duration-700 lg:sticky lg:top-24">
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-[#fa003e]/30 bg-[#fa003e]/10 text-[#fa003e] shadow-lg shadow-[#fa003e]/10"><Upload className="size-6" /></div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[#fa003e]">THE RELEASE DESK</p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.07em] sm:text-6xl">Put your sound<br /><span className="text-[#fa003e]">in motion.</span></h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/50">Upload your music, shape the economics, and give listeners a new way to support your work.</p>
            <div className="mt-8 space-y-3 text-xs text-white/45"><div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#fa003e]">01</span>Upload your master</div><div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#fa003e]">02</span>Set your listening terms</div><div className="flex items-center gap-3"><span className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#fa003e]">03</span>Share the release</div></div>
            <div className="mt-10 hidden items-center gap-3 border-t border-white/10 pt-5 text-xs text-white/30 lg:flex"><Waves className="size-4 text-[#fa003e]" />Artist-owned distribution on MyUSIC</div>
          </div>
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-5 duration-700 delay-150"><div className="mb-4 flex items-center gap-3"><div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#fa003e]"><FileAudio className="size-4" /></div><div><p className="text-sm font-medium">Release details</p><p className="text-xs text-white/35">Everything needed to publish your track.</p></div></div>{prefillData && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#fa003e]/30 bg-[#fa003e]/10 p-4 motion-safe:animate-in motion-safe:slide-in-from-top-2 duration-500"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fa003e] text-white"><Sparkles className="size-4" /></div><div><p className="text-sm font-medium text-[#ff9db1]">AI-generated track ready</p><p className="mt-1 text-xs leading-5 text-white/55">“{prefillData.title}” is pre-filled. Complete the details to list it.</p></div></div>}<div className="rounded-[20px] border border-white/10 bg-[#090909] p-1 sm:p-2"><UploadForm prefillData={prefillData} /></div></div>
        </div>
      </main>
    </div>
  )
}
