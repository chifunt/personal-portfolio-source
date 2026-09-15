import type { Metadata } from "next"
import { ContentIndex } from "@/components/content-index"
import { getAllContent } from "@/lib/content"
import { absoluteUrl, siteConfig } from "@/lib/site"

const description = "Cooking, animation, and notes on my setup."

export const metadata: Metadata = {
  title: "Extras",
  description,
  alternates: {
    canonical: "/extras",
  },
  openGraph: {
    title: "Extras · " + siteConfig.name,
    description,
    url: absoluteUrl("/extras"),
  },
}

export default async function ExtrasPage() {
  const extras = await getAllContent("extras")
  return (
    <ContentIndex
      entries={extras}
      title="Extras"
      description={description}
      basePath="/extras"
      searchPlaceholder="Search extras..."
      emptyState="No extras match. Try another search or choose a different tag."
    />
  )
}
