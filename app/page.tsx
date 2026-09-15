import type { Metadata } from "next"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProjects } from "@/components/featured-projects"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    images: [
      {
        url: absoluteUrl("/api/og"),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [absoluteUrl("/api/og")],
  },
  alternates: {
    canonical: absoluteUrl("/"),
  },
}

export default function HomePage() {
  return (
    <div className="relative">
      <HeroSection />
      <FeaturedProjects />
    </div>
  )
}
