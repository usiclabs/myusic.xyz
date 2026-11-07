import type { ReactNode } from "react"

export function MyusicAtmosphere() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_78%_8%,rgba(250,0,62,0.12),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
    </>
  )
}

export function MyusicEyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-[#fa003e]">{children}</p>
}

export function MyusicPageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-balance text-5xl font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-6xl">{children}</h1>
}
