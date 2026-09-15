import type { ContentEntry } from "./content"

const projectOrder = [
  "the-circussy-one",
  "copperfall",
  "brickphone",
  "dotdeck",
  "cropped-reality",
  "personal-portfolio",
  "bursting-panopticon",
  "living-patch-maps",
  "the-second-student",
  "the-saga-of-the-broken-sword-and-the-torrent-of-malice",
  "steampunk-study",
  "declinant",
]

export function orderProjects(entries: ContentEntry[]): ContentEntry[] {
  const rank = new Map(projectOrder.map((slug, index) => [slug, index]))
  return [...entries].sort((a, b) =>
    (rank.get(a.slug) ?? projectOrder.length) - (rank.get(b.slug) ?? projectOrder.length)
    || a.title.localeCompare(b.title),
  )
}
