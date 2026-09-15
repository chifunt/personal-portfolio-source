"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Download, Maximize, Minus, Plus } from "lucide-react"

let renderer: Promise<typeof import("mermaid")["default"]> | undefined

function loadRenderer() {
  renderer ??= import("mermaid").then(({ default: mermaid }) => {
    const fontFamily = getComputedStyle(document.body).fontFamily
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      suppressErrorRendering: true,
      theme: "base",
      layout: "dagre",
      fontFamily,
      htmlLabels: false,
      themeVariables: {
        fontFamily,
        darkMode: true,
        background: "#191724",
        primaryColor: "#26233a",
        primaryTextColor: "#e0def4",
        primaryBorderColor: "#c4a7e7",
        secondaryColor: "#21313d",
        secondaryTextColor: "#e0def4",
        secondaryBorderColor: "#9ccfd8",
        tertiaryColor: "#352935",
        tertiaryTextColor: "#e0def4",
        tertiaryBorderColor: "#ebbcba",
        lineColor: "#9ccfd8",
        textColor: "#e0def4",
        edgeLabelBackground: "#191724",
        clusterBkg: "#1f1d2e",
        clusterBorder: "#524f67",
        noteBkgColor: "#352935",
        noteTextColor: "#e0def4",
        noteBorderColor: "#ebbcba",
        fontSize: "16px",
      },
      flowchart: { curve: "basis", padding: 12, nodeSpacing: 24, rankSpacing: 28 },
    })
    return mermaid
  })
  return renderer
}

export function MermaidDiagram({ chart, title = "Diagram", caption }: { chart: string; title?: string; caption?: string }) {
  const container = useRef<HTMLElement>(null)
  const id = `diagram-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const [visible, setVisible] = useState(false)
  const [result, setResult] = useState<{ chart: string; svg?: string; width?: number; failed?: boolean } | null>(null)
  const [zoom, setZoom] = useState(1)
  const current = result?.chart === chart ? result : null

  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: "240px" })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    async function draw() {
      try {
        const mermaid = await loadRenderer()
        await document.fonts.ready
        if (cancelled) return
        await mermaid.parse(chart)
        const { svg } = await mermaid.render(id, chart)
        const svgDocument = new DOMParser().parseFromString(svg, "image/svg+xml")
        const width = Number(svgDocument.documentElement.getAttribute("viewBox")?.split(/\s+/)[2])
        if (!cancelled) setResult({ chart, svg, width: width > 0 ? width : undefined })
      } catch (error) {
        console.error("Unable to render Mermaid diagram:", error)
        if (!cancelled) setResult({ chart, failed: true })
      }
    }
    void draw()
    return () => { cancelled = true }
  }, [chart, id, visible])

  const download = () => {
    if (!current?.svg) return
    const url = URL.createObjectURL(new Blob([current.svg], { type: "image/svg+xml" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const controlClass = "flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-overlay hover:text-foam disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold"

  return (
    <figure ref={container} className="mermaid-diagram my-10 overflow-hidden rounded-xl border border-highlight-high bg-base" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-highlight-med px-4 py-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <div className="flex items-center gap-1" aria-label="Diagram controls">
          <button type="button" className={controlClass} disabled={!current?.svg || zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - 0.25))} aria-label="Zoom out" title="Zoom out"><Minus className="h-4 w-4" /></button>
          <button type="button" className={controlClass} disabled={!current?.svg || zoom >= 2.5} onClick={() => setZoom(value => Math.min(2.5, value + 0.25))} aria-label="Zoom in" title="Zoom in"><Plus className="h-4 w-4" /></button>
          <button type="button" className={controlClass} disabled={!current?.svg || zoom === 1} onClick={() => setZoom(1)} aria-label="Fit diagram" title="Fit diagram"><Maximize className="h-4 w-4" /></button>
          <button type="button" className={controlClass} disabled={!current?.svg} onClick={download} aria-label="Download diagram as SVG" title="Download SVG"><Download className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="overflow-x-auto p-4 sm:p-6" tabIndex={0} role="region" aria-label={`${title}, scroll to explore when zoomed`}>
        {current?.svg ? (
          <div className="mermaid-render mx-auto" style={{ width: `${zoom * 100}%`, maxWidth: current.width ? current.width * zoom : undefined }} dangerouslySetInnerHTML={{ __html: current.svg }} />
        ) : current?.failed ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>The diagram could not be displayed. Its source is below.</p>
            <pre className="overflow-x-auto whitespace-pre font-mono text-sm">{chart}</pre>
          </div>
        ) : (
          <p className="flex min-h-40 items-center justify-center text-sm text-muted-foreground" role="status">Loading diagram...</p>
        )}
        <noscript><pre>{chart}</pre></noscript>
      </div>
      {caption && <figcaption className="border-t border-highlight-med px-4 py-3 text-sm leading-relaxed text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}
