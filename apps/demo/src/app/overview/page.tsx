import type { Metadata } from "next"

import { OverviewScroll } from "@/components/overview-scroll"

export const metadata: Metadata = { title: "Overview · Abacus Analytics" }

export default function OverviewPage() {
  return (
    <main id="content">
      <OverviewScroll />
    </main>
  )
}
