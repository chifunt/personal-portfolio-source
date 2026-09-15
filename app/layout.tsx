import type { Metadata, Viewport } from "next"
import type React from "react"
import { Readex_Pro, Roboto_Mono, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import Script from "next/script"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GearLayer } from "@/components/gear-layer"
import { CMatrixLayer } from "@/components/c-matrix-layer"
import { ProceduralBackground } from "@/components/procedural-background"
import { SiteMotionProvider } from "@/components/site-motion"
import { siteConfig } from "@/lib/site"

const readexPro = Readex_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const twitterHandle = siteConfig.twitter ? siteConfig.twitter.replace(/^@/, "") : null

const twitterMetadata: Metadata["twitter"] = twitterHandle
  ? {
      card: "summary_large_image",
      site: `@${twitterHandle}`,
      creator: `@${twitterHandle}`,
    }
  : {
      card: "summary_large_image",
    }

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  creator: siteConfig.creator,
  authors: [{ name: siteConfig.creator }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: siteConfig.name,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: twitterMetadata,
  publisher: siteConfig.creator,
  other: {
    "darkreader-lock": "",
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      "application/rss+xml": "/api/feed",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  },
  category: "technology",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/x-icon" },
    ],
    apple: "/icon-192.png",
    shortcut: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d18" },
  ],
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  alternateName: ["JT"],
  url: siteConfig.url,
  jobTitle: siteConfig.role,
  worksFor: {
    "@type": "Organization",
    name: siteConfig.creator,
  },
  sameAs: [siteConfig.links.github, siteConfig.links.linkedin].concat(
    twitterHandle ? [`https://twitter.com/${twitterHandle}`] : []
  ),
  address: {
    "@type": "PostalAddress",
    addressCountry: siteConfig.location,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${readexPro.variable} ${robotoMono.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased">
        <SiteMotionProvider>
          {/* Decorative background layers */}
          <ProceduralBackground />
          <CMatrixLayer />
          <GearLayer />
          <div className="relative z-10">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="min-h-screen outline-none">{children}</main>
            <Footer />
            <Analytics />
            <Script
              id="structured-data"
              type="application/ld+json"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
          </div>
        </SiteMotionProvider>
      </body>
    </html>
  )
}
