import { ImageResponse } from "next/og"
import { siteConfig } from "@/lib/site"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(246,193,119,0.35), transparent 55%), radial-gradient(circle at 80% 30%, rgba(235,111,146,0.35), transparent 55%), radial-gradient(circle at 50% 80%, rgba(49,116,143,0.35), transparent 60%), #1a1525",
          color: "#f8f5ff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span style={{ fontSize: 26, letterSpacing: "0.4em", textTransform: "uppercase", color: "#f6c177" }}>
            {siteConfig.name}
          </span>
          <h1
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 700,
              margin: 0,
              maxWidth: 840,
            }}
          >
            {siteConfig.role}
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: "rgba(248,245,255,0.78)",
          }}
        >
          <span>Projects and development notes</span>
          <span>{new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
