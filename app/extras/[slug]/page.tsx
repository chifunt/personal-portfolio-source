import Link from "next/link"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ContentDetailPage } from "@/components/content-detail-page"
import { getAllContent, getContentBySlug } from "@/lib/content"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const dynamicParams = false

export async function generateStaticParams() {
  const extras = await getAllContent("extras")
  return extras.map((extra) => ({ slug: extra.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const entry = await getContentBySlug("extras", slug)

  if (!entry) {
    return {
      title: "Entry Not Found",
    }
  }

  const description = entry.summary ?? entry.subtitle ?? entry.excerpt ?? siteConfig.description
  const ogImage = absoluteUrl(`/api/og/extras/${entry.slug}`)
  const canonical = absoluteUrl(`/extras/${entry.slug}`)

  return {
    title: entry.title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: entry.title,
      description,
      url: canonical,
      type: "article",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: entry.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description,
      images: [ogImage],
    },
  }
}

export default async function ExtraPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = await getContentBySlug("extras", slug)

  if (!entry) {
    notFound()
  }

  return (
    <>
      <div className="container mx-auto max-w-4xl px-4 pt-20">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/extras">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Extras
          </Link>
        </Button>
      </div>
      <ContentDetailPage entry={entry} section="extras" />
    </>
  )
}
