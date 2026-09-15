import { getAllContent } from "@/lib/content"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const runtime = "nodejs"
export const revalidate = 3600

function escapeXml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export async function GET() {
  const [projects, extras] = await Promise.all([getAllContent("projects"), getAllContent("extras")])
  const entries = [...projects, ...extras].filter(entry => entry.mdx).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title))

  const feedItems = entries
    .map((entry) => {
      const url = absoluteUrl(`/${projects.includes(entry) ? "projects" : "extras"}/${entry.slug}`)
      const description = escapeXml(entry.summary ?? entry.excerpt ?? entry.subtitle ?? siteConfig.description)
      return `
        <item>
          <title>${escapeXml(entry.title)}</title>
          <link>${url}</link>
          <guid isPermaLink="true">${url}</guid>
          <description><![CDATA[${description}]]></description>
          ${entry.date ? `<pubDate>${new Date(entry.date).toUTCString()}</pubDate>` : ""}
        </item>
      `
    })
    .join("")

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(siteConfig.name)}</title>
        <link>${siteConfig.url}</link>
        <description>${escapeXml(siteConfig.description)}</description>
        <language>en-us</language>
        ${feedItems}
      </channel>
    </rss>`

  return new Response(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  })
}
