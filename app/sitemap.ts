import type { MetadataRoute } from "next"
import { getAllContent } from "@/lib/content"
import { absoluteUrl } from "@/lib/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, extras] = await Promise.all([getAllContent("projects"), getAllContent("extras")])
  const now = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/projects"),
      lastModified: projects[0]?.date ?? now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/extras"),
      lastModified: extras[0]?.date ?? now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/cv"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  const projectRoutes: MetadataRoute.Sitemap = projects.map((entry) => ({
    url: absoluteUrl(`/projects/${entry.slug}`),
    lastModified: entry.date,
    changeFrequency: "monthly",
    priority: 0.8,
  }))

  const extraRoutes: MetadataRoute.Sitemap = extras.map((entry) => ({
    url: absoluteUrl(`/extras/${entry.slug}`),
    lastModified: entry.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...projectRoutes, ...extraRoutes]
}
export const runtime = "nodejs"
export const revalidate = 3600
