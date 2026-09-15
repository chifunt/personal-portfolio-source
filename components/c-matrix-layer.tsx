"use client"

import { useEffect, useRef } from "react"
import { useSiteMotion } from "@/components/site-motion"

const baseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const symbolChars = "@#$%^&*(){}[]<>/\\|;:,.~`"
const katakanaChars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
const matrixCharacters = Array.from(new Set([...baseChars, ...symbolChars, ...katakanaChars])).join("")

export function CMatrixLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { motionPaused } = useSiteMotion()
  const pausedRef = useRef(motionPaused)
  const syncMotionRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    pausedRef.current = motionPaused
    syncMotionRef.current?.()
  }, [motionPaused])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const fontSize = 14
    const tickInterval = 1000 / 24
    const maxCatchUpTicks = 3
    let lastTimestamp = 0
    let accumulatedTime = tickInterval
    let columns = 0
    let drops: number[] = []
    let speeds: number[] = []
    let maxRows = 0
    let hasInitialized = false
    let previousHeight = window.innerHeight

    const resizeCanvas = () => {
      const oldDrops = drops
      const oldSpeeds = speeds
      const oldColumns = columns
      const oldMaxRows = maxRows || Math.max(1, Math.ceil(previousHeight / fontSize))

      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      previousHeight = canvas.height

      columns = Math.max(1, Math.floor(canvas.width / fontSize))
      maxRows = Math.max(1, Math.ceil(canvas.height / fontSize))

      if (!hasInitialized) {
        drops = Array(columns).fill(1)
        speeds = Array.from({ length: columns }, () => Math.random() * 0.5 + 0.5)
        hasInitialized = true
      } else {
        const nextDrops = new Array(columns)
        const nextSpeeds = new Array(columns)

        for (let i = 0; i < columns; i++) {
          if (oldColumns > 0) {
            const ratio = columns > 1 ? i / (columns - 1) : 0
            const mappedIndex = Math.min(oldColumns - 1, Math.round(ratio * (oldColumns - 1)))
            const preservedDrop = oldDrops[mappedIndex] ?? Math.random() * oldMaxRows
            const preservedSpeed = oldSpeeds[mappedIndex] ?? Math.random() * 0.5 + 0.5
            const boundedDrop = Math.min(oldMaxRows, Math.max(0, preservedDrop))
            const scaledDrop = (boundedDrop / oldMaxRows) * maxRows

            nextDrops[i] = Math.min(maxRows, Math.max(0, scaledDrop + (Math.random() - 0.5) * 2))
            const jitteredSpeed = preservedSpeed + (Math.random() - 0.5) * 0.05
            nextSpeeds[i] = Math.min(1.5, Math.max(0.2, jitteredSpeed))

            if (!Number.isFinite(nextDrops[i])) {
              nextDrops[i] = Math.random() * maxRows
            }
            if (!Number.isFinite(nextSpeeds[i])) {
              nextSpeeds[i] = Math.random() * 0.5 + 0.5
            }
          } else {
            nextDrops[i] = Math.random() * maxRows
            nextSpeeds[i] = Math.random() * 0.5 + 0.5
          }
        }

        drops = nextDrops
        speeds = nextSpeeds
      }

      accumulatedTime = tickInterval
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const chars = matrixCharacters
    let frameCount = 0

    const drawRainTick = () => {
      canvas.dataset.frame = String(++frameCount)
      ctx.fillStyle = "rgba(25, 23, 36, 0.12)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(156, 207, 216, 0.5)"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        drops[i] += speeds[i]
      }
    }

    let animationId: number | null = null
    const animate = (timestamp: number) => {
      animationId = null
      if (pausedRef.current) return
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp
      }

      accumulatedTime += Math.min(timestamp - lastTimestamp, tickInterval * maxCatchUpTicks)
      lastTimestamp = timestamp

      while (accumulatedTime >= tickInterval) {
        drawRainTick()
        accumulatedTime -= tickInterval
      }

      animationId = requestAnimationFrame(animate)
    }
    const syncMotion = () => {
      if (animationId !== null) cancelAnimationFrame(animationId)
      animationId = null
      lastTimestamp = 0
      if (!pausedRef.current) animationId = requestAnimationFrame(animate)
    }
    syncMotionRef.current = syncMotion
    syncMotion()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      syncMotionRef.current = null
      if (animationId !== null) cancelAnimationFrame(animationId)
    }
  }, [])

  return <canvas ref={canvasRef} className="c-matrix-layer fixed inset-0 pointer-events-none z-[1]" style={{ opacity: 0.3 }} aria-hidden="true" />
}
