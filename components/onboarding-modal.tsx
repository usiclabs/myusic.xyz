"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Music, Coins, TrendingUp, Wallet, Sparkles, ArrowRight, X, Check } from "lucide-react"
import { useWallet } from "@/lib/web3/wallet-context"

const ONBOARDING_STORAGE_KEY = "usic-onboarding-completed"

const steps = [
  {
    title: "Your music. Your upside.",
    eyebrow: "THE MYUSIC STARTING POINT",
    description: "A new way to experience music ownership.",
    content: "Discover independent artists, stream their work, and participate in an economy where value moves directly between fans and creators.",
    icon: Music,
    tag: "Explore first",
  },
  {
    title: "Stream & earn.",
    eyebrow: "EVERY SECOND MATTERS",
    description: "Every stream pays artists instantly.",
    content: "Artists receive micropayments in real-time for every second of music streamed. No middlemen, no delays—just direct payments onchain.",
    icon: Coins,
    tag: "Artist-first",
  },
  {
    title: "Collect what moves you.",
    eyebrow: "MUSIC WITH A STAKE",
    description: "Own a piece of your favorite tracks.",
    content: "Each song can have its own tradable token. Collect the artists you love and follow their story as more listeners discover them.",
    icon: TrendingUp,
    tag: "Own the moment",
  },
  {
    title: "Make your stake count.",
    eyebrow: "THE LONGER PLAY",
    description: "Earn rewards by staking $USI.",
    content: "Stake your $USI tokens to share in platform revenue. The more you stake, the more you participate in every stream across MyUSIC.",
    icon: Sparkles,
    tag: "Powered by $USI",
  },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const { connect, isConnected } = useWallet()

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY)
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    setOpen(false)
  }

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
    setOpen(false)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
    else handleComplete()
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const handleConnectWallet = async () => {
    await connect()
    handleComplete()
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon
  const isLastStep = currentStep === steps.length - 1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-xl" />
        <DialogContent className="max-w-5xl border-0 bg-transparent p-0 shadow-none" showCloseButton={false}>
          <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-black shadow-2xl shadow-black/60">
            <div className="absolute inset-x-0 top-0 h-px bg-[#fa003e]" />
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-7">
              <div className="flex items-center gap-3"><div className="flex size-7 items-center justify-center rounded-full border border-[#fa003e]/60 text-[#fa003e]"><Music className="size-3.5" /></div><span className="text-sm font-semibold tracking-tight">MYUSIC</span><span className="hidden text-xs text-white/30 sm:inline">/</span><span className="hidden text-xs text-white/45 sm:inline">Your starting point</span></div>
              <button onClick={handleSkip} className="rounded-full p-2 text-white/45 transition-colors hover:bg-white/10 hover:text-white" aria-label="Skip onboarding"><X className="size-4" /></button>
            </div>

            <div className="grid md:grid-cols-[190px_1fr]">
              <aside className="border-b border-white/10 p-4 md:border-b-0 md:border-r md:p-5">
                <nav aria-label="Onboarding steps" className="flex gap-2 overflow-x-auto md:flex-col md:gap-1">
                  {steps.map((step, index) => <button key={step.title} onClick={() => setCurrentStep(index)} className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs transition-colors ${index === currentStep ? "bg-[#fa003e]/15 text-[#fa6688]" : "text-white/40 hover:bg-white/5 hover:text-white"}`}><span className={`flex size-7 items-center justify-center rounded-lg border text-[10px] ${index === currentStep ? "border-[#fa003e]/50 bg-[#fa003e]/15" : "border-white/10"}`}>{String(index + 1).padStart(2, "0")}</span><span className="hidden md:inline">{step.title.split(".")[0]}</span></button>)}
                </nav>
                <p className="mt-8 hidden text-xs leading-5 text-white/35 md:block">Your music.<br />Your upside.</p>
              </aside>

              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-8 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#090909] [background-image:radial-gradient(rgba(250,0,62,0.16)_1px,transparent_1px)] [background-size:18px_18px] sm:h-52">
                  <div className="relative flex size-28 items-center justify-center rounded-full border border-[#fa003e]/50 bg-black shadow-[0_0_70px_rgba(250,0,62,0.22)] transition-transform duration-700 animate-in zoom-in"><div className="absolute inset-[-14px] rounded-full border border-[#fa003e]/20" /><div className="absolute inset-[-30px] rounded-full border border-white/10" /><Icon className="relative size-10 text-[#fa003e]" /></div>
                </div>

                <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500" key={currentStep}>
                  <p className="mb-3 text-[10px] font-medium tracking-[0.22em] text-[#fa003e]">{currentStepData.eyebrow}</p>
                  <h2 className="text-balance text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">{currentStepData.title}</h2>
                  <p className="mt-3 text-base text-white/75">{currentStepData.description}</p>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">{currentStepData.content}</p>
                  <div className="mt-5 flex flex-wrap gap-2"><span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-white/55"><Check className="size-3 text-[#fa003e]" />{currentStepData.tag}</span>{currentStep === 0 && <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-white/55">No wallet needed</span>}</div>
                </div>

                <div className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between"><button onClick={handleSkip} className="text-left text-xs text-white/45 transition-colors hover:text-white">Skip tour</button><div className="flex items-center justify-between gap-5"><span className="text-[10px] text-white/35">{String(currentStep + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}</span>{currentStep > 0 && <Button variant="ghost" onClick={handleBack} className="text-white/60 hover:bg-white/10 hover:text-white">Back</Button>}{isLastStep ? <div className="flex gap-2"><Button variant="outline" onClick={handleComplete} className="border-white/15 bg-transparent text-white hover:bg-white/10">Explore</Button>{!isConnected && <Button onClick={handleConnectWallet} className="gap-2 bg-[#fa003e] text-white shadow-lg shadow-[#fa003e]/20 hover:bg-[#d90036]"><Wallet className="size-4" />Connect</Button>}</div> : <Button onClick={handleNext} className="gap-2 bg-[#fa003e] text-white shadow-lg shadow-[#fa003e]/20 hover:bg-[#d90036]">{currentStep === 0 ? "Show me around" : "Continue"}<ArrowRight className="size-4" /></Button>}</div></div>
                <p className="mt-4 text-center text-[10px] text-white/25">No rush. You can replay this tour anytime.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
