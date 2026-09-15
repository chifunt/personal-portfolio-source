import type { Metadata } from "next"
import { ContentIndex } from "@/components/content-index"
import { getAllContent } from "@/lib/content"
import { absoluteUrl, siteConfig } from "@/lib/site"
import { orderProjects } from "@/lib/project-order"

const description = "Games and tools I've built, with notes on the systems behind them."

export const metadata: Metadata = {
  title: "Projects",
  description,
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: `Projects · ${siteConfig.name}`,
    description,
    url: absoluteUrl("/projects"),
  },
}

export default async function ProjectsPage() {
  const projects = await getAllContent("projects")
  return (
    <ContentIndex
      entries={orderProjects(projects)}
      title="Projects"
      description={description}
      basePath="/projects"
      searchPlaceholder="Search projects..."
      emptyState="No projects match. Try another search or clear the filter."
    />
  )
}
