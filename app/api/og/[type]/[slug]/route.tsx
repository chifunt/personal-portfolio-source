import { ImageResponse } from "next/og"
import { NextResponse } from "next/server"
import { getContentBySlug } from "@/lib/content"
import { siteConfig } from "@/lib/site"

const OG_WIDTH = 1200
const OG_HEIGHT = 630

const gradient = "linear-gradient(135deg, rgba(235, 111, 146, 0.9), rgba(246, 193, 119, 0.85), rgba(49, 116, 143, 0.9))"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; slug: string }> }
) {
  const { type, slug } = await params
  if (type !== "projects" && type !== "extras") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const entry = await getContentBySlug(type, slug)

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const summary = entry.summary ?? entry.subtitle ?? entry.excerpt ?? siteConfig.description

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundImage: gradient,
          color: "#0f0d18",
          padding: "60px 70px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            textTransform: "uppercase",
            letterSpacing: "6px",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          <span>{siteConfig.name}</span>
          <span style={{ width: 8, height: 8, borderRadius: "9999px", background: "#0f0d18" }} />
          <span>{type === "projects" ? "Project" : "Extra"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h1
            style={{
              fontSize: entry.title.length > 100 ? 40 : entry.title.length > 60 ? 52 : 72,
              lineHeight: 1.05,
              fontWeight: 700,
              margin: 0,
              color: "#0f0d18",
            }}
          >
            {entry.title}
          </h1>
          <p
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              maxWidth: 820,
              color: "rgba(15, 13, 24, 0.85)",
            }}
          >
            {summary}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(15, 13, 24, 0.7)",
          }}
        >
          <span>{entry.status ?? entry.date ?? ""}</span>
          <div style={{ display: "flex", gap: 12 }}>
            {entry.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                style={{
                  borderRadius: 9999,
                  padding: "6px 18px",
                  background: "rgba(15, 13, 24, 0.1)",
                  fontSize: 20,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    }
  )
}
