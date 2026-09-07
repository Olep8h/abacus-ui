"use client"

import { Badge, Button } from "@abacus/ui"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowRight, ShieldCheck, Waypoints, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

gsap.registerPlugin(ScrollTrigger)

const STAGES = [
  {
    icon: Zap,
    title: "Settle in hours, not days",
    body: "Instant rails for EUR and GBP, with the ledger updated the moment the counterparty confirms.",
  },
  {
    icon: Waypoints,
    title: "Every counterparty in one view",
    body: "Payroll, vendors and revenue land in the same table, filterable and shareable by URL.",
  },
  {
    icon: ShieldCheck,
    title: "Failures surface before finance asks",
    body: "Reviews and failed payments are flagged the moment they happen, not at month end.",
  },
]

export function OverviewScroll() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia(root)
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to("[data-parallax]", {
        yPercent: -18,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true },
      })
      gsap.from("[data-hero-copy] > *", {
        y: 24,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
      })

      const stages = gsap.utils.toArray<HTMLElement>("[data-stage]")
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-pin]",
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.4,
        },
      })
      timeline.fromTo(
        "[data-progress]",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", duration: stages.length },
        0,
      )
      stages.forEach((stage, i) => {
        timeline.fromTo(
          stage,
          { yPercent: 40, opacity: 0 },
          { yPercent: 0, opacity: 1, ease: "power2.out", duration: 0.6 },
          i,
        )
        if (i < stages.length - 1)
          timeline.to(
            stage,
            { yPercent: -12, opacity: 0.35, ease: "power1.in", duration: 0.4 },
            i + 0.6,
          )
      })

      gsap.from("[data-cta] > *", {
        y: 32,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-cta]", start: "top 80%" },
      })
    })
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  }, [])

  return (
    <div ref={root}>
      <section
        data-hero
        className="relative isolate flex min-h-dvh items-center overflow-hidden bg-surface"
      >
        <div
          data-parallax
          aria-hidden="true"
          className="absolute inset-0 -z-10 will-change-transform"
        >
          <div className="absolute top-1200 -left-2400 size-4000 rounded-full bg-brand-tertiary" />
          <div className="absolute top-2400 right-1600 size-2400 rounded-full bg-positive-tertiary" />
          <div className="absolute bottom-1600 left-1600 size-1600 rounded-md bg-warning-tertiary" />
        </div>
        <div
          data-hero-copy
          className="mx-auto flex w-full max-w-7xl flex-col items-start gap-400 px-400 py-1200 sm:px-600"
        >
          <Badge intent="brand" variant="subtle">
            Overview
          </Badge>
          <h1 className="max-w-prose text-3xl font-bold sm:text-5xl">
            Every transaction, in one ledger.
          </h1>
          <p className="max-w-prose text-lg text-fg-secondary">
            Abacus Analytics is the treasury view built from the Abacus UI library. Scroll to see
            how a flow of payments becomes something a finance team can act on.
          </p>
          <Button asChild>
            <Link href="/">
              Open the dashboard
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <section data-pin className="flex min-h-dvh flex-col justify-center bg-surface-secondary">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-800 px-400 py-1200 sm:px-600">
          <div className="flex flex-col gap-200">
            <h2 className="text-2xl font-semibold">Three things the dashboard does for you</h2>
            <div className="h-100 w-full overflow-hidden rounded-full bg-line">
              <div
                data-progress
                className="h-full w-full origin-left bg-brand will-change-transform"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-400 md:grid-cols-3">
            {STAGES.map(({ icon: Icon, title, body }) => (
              <article
                key={title}
                data-stage
                className="flex flex-col gap-300 rounded-md border border-line bg-surface p-600 will-change-transform"
              >
                <span className="grid size-control-lg place-items-center rounded-md bg-brand-tertiary text-icon-brand">
                  <Icon aria-hidden="true" className="size-400" />
                </span>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-base text-fg-secondary">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-cta
        className="mx-auto flex w-full max-w-7xl flex-col items-start gap-400 px-400 py-2400 sm:px-600"
      >
        <h2 className="text-2xl font-semibold">Built from the library, nothing else</h2>
        <p className="max-w-prose text-base text-fg-secondary">
          Every control on the dashboard is a documented component with a Storybook page, a variant
          matrix and a keyboard contract. Motion here is scroll-driven GSAP on transform and opacity
          only, and it switches itself off when you ask your OS to reduce motion.
        </p>
        <div className="flex flex-wrap gap-300">
          <Button asChild>
            <Link href="/">
              Open the dashboard
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <a href="https://github.com/Olep8h/abacus-ui">View the source</a>
          </Button>
        </div>
      </section>
    </div>
  )
}
