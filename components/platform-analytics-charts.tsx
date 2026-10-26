"use client"

import { Card } from "@/components/ui/card"
import { AnalyticsChart } from "@/components/analytics-chart"
import { TrendingUp, DollarSign } from "lucide-react"

interface PlatformAnalyticsChartsProps {
  data: Array<{
    started_at: string
    chunks_played: number
    total_paid: number
  }>
}

export function PlatformAnalyticsCharts({ data }: PlatformAnalyticsChartsProps) {
  return (
    <div className="grid max-w-full gap-4 overflow-hidden md:grid-cols-[1.65fr_1fr]">
      <Card className="border border-[#1f1f1f] bg-[#090909] p-5 transition-colors hover:bg-[#141414] group max-w-full overflow-hidden">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-primary transition-colors">Platform Streams Over Time</span>
        </h3>
        <AnalyticsChart data={data} type="plays" />
      </Card>

      <Card className="border border-[#1f1f1f] bg-[#090909] p-5 transition-colors hover:bg-[#141414] group max-w-full overflow-hidden">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          <span className="group-hover:text-primary transition-colors">Platform Revenue Over Time</span>
        </h3>
        <AnalyticsChart data={data} type="earnings" />
      </Card>
    </div>
  )
}
