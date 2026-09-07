import { Skeleton } from "@abacus/ui"
import { Suspense } from "react"

import { Dashboard } from "@/components/dashboard"

export const dynamic = "force-dynamic"

function DashboardFallback() {
  return (
    <div className="flex flex-col gap-600" aria-busy="true" aria-label="Loading dashboard">
      <Skeleton className="h-control-lg w-4000" />
      <div className="grid grid-cols-1 gap-300 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-2400" />
        ))}
      </div>
      <Skeleton className="h-4000" />
    </div>
  )
}

export default function Home() {
  return (
    <main id="content" className="mx-auto w-full max-w-7xl px-400 py-600 sm:px-600">
      <Suspense fallback={<DashboardFallback />}>
        <Dashboard />
      </Suspense>
    </main>
  )
}
