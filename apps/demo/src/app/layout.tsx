import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import type { ReactNode } from "react"

import { themeInitScript } from "@/lib/theme"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-roboto-mono", display: "swap" })

export const metadata: Metadata = {
  title: "Abacus Analytics",
  description: "A fintech analytics dashboard built entirely from the Abacus UI component library.",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-surface text-fg">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-200 focus:left-200 focus:z-50 focus:rounded-md focus:bg-brand focus:px-300 focus:py-200 focus:text-fg-on-brand"
        >
          Skip to content
        </a>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
