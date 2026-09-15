"use client"

import { useEffect, useRef } from "react"

const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "TailwindCSS",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
  "WebGL",
  "Three.js",
  "Framer Motion",
  "Git",
  "CI/CD",
]

export function SkillsMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const marquee = marqueeRef.current
    if (!marquee) return

    let animationId: number
    let position = 0
    const speed = 0.5

    const animate = () => {
      position -= speed
      if (position <= -marquee.scrollWidth / 2) {
        position = 0
      }
      marquee.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <section className="py-16 overflow-hidden bg-overlay/50 border-y border-border">
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent">
          Skills & Technologies
        </h2>
      </div>
      <div className="relative">
        <div ref={marqueeRef} className="flex gap-8 whitespace-nowrap">
          {/* Duplicate skills for seamless loop */}
          {[...skills, ...skills, ...skills].map((skill, index) => (
            <div
              key={index}
              className="inline-flex items-center px-6 py-3 bg-surface/50 border border-love/20 rounded-lg text-lg font-medium text-foreground transition-colors duration-300 hover:border-love/50 hover:text-love hover:shadow-sm hover:shadow-love/10"
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
