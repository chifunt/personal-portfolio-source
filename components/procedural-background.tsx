"use client"

import { useEffect, useRef } from "react"
import { useSiteMotion } from "@/components/site-motion"

interface PatternFrame {
  type: "frame"
  size: number
  steps: number
  elapsed: number
  buffer: ArrayBuffer
}

export function ProceduralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const { motionPaused } = useSiteMotion()
  const pausedRef = useRef(motionPaused)
  const syncMotionRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    pausedRef.current = motionPaused
    syncMotionRef.current?.()
  }, [motionPaused])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    const container = canvas?.parentElement
    const fieldCanvas = document.createElement("canvas")
    const fieldContext = fieldCanvas.getContext("2d")
    if (!canvas || !context || !container || !fieldContext || typeof Worker === "undefined") return

    let renderScale = 0.5
    let tileSize = 320
    let tint: CanvasGradient
    let hasFrame = false
    let elapsed = 0
    const seed = crypto.getRandomValues(new Uint32Array(1))[0]
    const heading = seed / 0x100000000 * Math.PI * 2
    const speed = 3 + ((seed >>> 8) & 255) / 255 * 2
    canvas.dataset.seed = String(seed)

    const draw = () => {
      if (!hasFrame) return
      const pattern = context.createPattern(fieldCanvas, "repeat")
      if (!pattern) return
      const travel = elapsed * speed
      const meander = Math.sin(elapsed / 18) * 12
      const x = Math.cos(heading) * travel - Math.sin(heading) * meander
      const y = Math.sin(heading) * travel + Math.cos(heading) * meander
      pattern.setTransform(new DOMMatrix()
        .translate((x % tileSize) * renderScale, (y % tileSize) * renderScale)
        .scale((tileSize * renderScale) / fieldCanvas.width))
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = tint
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.globalCompositeOperation = "destination-in"
      context.fillStyle = pattern
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.globalCompositeOperation = "source-over"
    }

    const resizeDisplay = () => {
      const bounds = container.getBoundingClientRect()
      const styles = getComputedStyle(container)
      renderScale = Math.min(0.5, 1024 / Math.max(bounds.width, bounds.height))
      tileSize = Number.parseFloat(styles.getPropertyValue("--pattern-tile-size")) || 320
      canvas.width = Math.max(1, Math.round(bounds.width * renderScale))
      canvas.height = Math.max(1, Math.round(bounds.height * renderScale))
      tint = context.createLinearGradient(0, 0, canvas.width, 0)
      const colours = ["love", "gold", "rose", "foam", "iris"]
      colours.forEach((colour, index) => {
        tint.addColorStop(index / (colours.length - 1), styles.getPropertyValue(`--color-${colour}`).trim())
      })
      draw()
    }

    resizeDisplay()
    const displayObserver = new ResizeObserver(resizeDisplay)
    displayObserver.observe(container)

    const compact = window.matchMedia("(max-width: 767px), (pointer: coarse)")
    let failed = false

    const startWorker = () => {
      if (workerRef.current || failed || pausedRef.current) return

      try {
        const worker = new Worker(new URL("../lib/reaction-diffusion.worker.ts", import.meta.url))
        workerRef.current = worker
        worker.onmessage = ({ data }: MessageEvent<PatternFrame>) => {
          if (data.type !== "frame") return
          elapsed = data.elapsed
          if (fieldCanvas.width !== data.size) {
            fieldCanvas.width = data.size
            fieldCanvas.height = data.size
            canvas.dataset.gridSize = String(data.size)
          }
          fieldContext.putImageData(new ImageData(new Uint8ClampedArray(data.buffer), data.size, data.size), 0, 0)
          hasFrame = true
          draw()
          canvas.dataset.ready = "true"
          canvas.dataset.step = String(data.steps)
          worker.postMessage({ type: "recycle", buffer: data.buffer }, [data.buffer])
        }
        worker.onerror = (event) => {
          event.preventDefault()
          failed = true
          worker.terminate()
          workerRef.current = null
          delete canvas.dataset.ready
        }
        worker.postMessage({ type: "start", size: compact.matches ? 112 : 160, fps: compact.matches ? 8 : 12, paused: false, seed })
      } catch {
        failed = true
      }
    }

    const syncMotion = () => {
      startWorker()
      workerRef.current?.postMessage({ type: "pause", paused: pausedRef.current })
    }

    const resize = () => {
      workerRef.current?.postMessage({ type: "start", size: compact.matches ? 112 : 160, fps: compact.matches ? 8 : 12, paused: pausedRef.current, seed })
    }

    syncMotionRef.current = syncMotion
    syncMotion()
    compact.addEventListener("change", resize)

    return () => {
      displayObserver.disconnect()
      compact.removeEventListener("change", resize)
      syncMotionRef.current = null
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  return (
    <div className="procedural-background" aria-hidden="true">
      <canvas ref={canvasRef} className="procedural-background-canvas" />
    </div>
  )
}
