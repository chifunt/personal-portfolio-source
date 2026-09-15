"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { MotionConfig } from "framer-motion"

const SiteMotionContext = createContext({
  ready: false,
  paused: true,
  motionPaused: true,
  toggleMotion: () => {},
})

export function SiteMotionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(true)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let saved: string | null = null
    try {
      saved = localStorage.getItem("portfolio-motion")
    } catch { /* Motion still works when browser storage is unavailable. */ }
    setPaused(saved ? saved === "paused" : preference.matches)
    setReady(true)

    const syncVisibility = () => setHidden(document.hidden)
    const syncPreference = () => setPaused(preference.matches)
    syncVisibility()
    document.addEventListener("visibilitychange", syncVisibility)
    preference.addEventListener("change", syncPreference)
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility)
      preference.removeEventListener("change", syncPreference)
    }
  }, [])

  const motionPaused = paused || hidden
  const toggleMotion = () => {
    const next = !paused
    setPaused(next)
    try {
      localStorage.setItem("portfolio-motion", next ? "paused" : "running")
    } catch { /* Keep the current visit's setting without persistence. */ }
  }

  return (
    <SiteMotionContext.Provider value={{ ready, paused, motionPaused, toggleMotion }}>
      <MotionConfig reducedMotion={motionPaused ? "always" : "never"}>
        <div className="site-layers" data-motion={motionPaused ? "paused" : "running"}>
          {children}
        </div>
      </MotionConfig>
    </SiteMotionContext.Provider>
  )
}

export function useSiteMotion() {
  return useContext(SiteMotionContext)
}
