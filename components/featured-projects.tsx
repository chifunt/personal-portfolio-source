import { getAllContent } from "@/lib/content"
import { FeaturedProjectsClient } from "./featured-projects-client"
import { orderProjects } from "@/lib/project-order"

export async function FeaturedProjects() {
  const entries = await getAllContent("projects")
  const entriesToShow = orderProjects(entries).slice(0, 9)

  return <FeaturedProjectsClient entries={entriesToShow} />
}
