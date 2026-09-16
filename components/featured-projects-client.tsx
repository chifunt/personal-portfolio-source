"use client"

import { useLayoutEffect, useRef } from "react"
import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import type { ContentEntry } from "@/lib/content"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { GearPlaceholder } from "@/components/gear-placeholder"

interface FeaturedProjectsClientProps {
  entries: ContentEntry[]
}

function FeaturedProjectTitle({ title }: { title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const heading = headingRef.current
    const text = textRef.current
    if (!heading || !text) return

    let disposed = false
    const fitTitle = () => {
      if (disposed || heading.clientWidth <= 1) return

      // Start at the normal size so titles can grow again when the card widens.
      text.style.fontSize = ""
      if (text.offsetWidth > heading.clientWidth) {
        text.style.fontSize = `${(heading.clientWidth - 1) / text.offsetWidth}em`
      }
    }

    fitTitle()
    const observer = new ResizeObserver(fitTitle)
    observer.observe(heading)
    void document.fonts.ready.then(fitTitle)
    document.fonts.addEventListener("loadingdone", fitTitle)

    return () => {
      disposed = true
      observer.disconnect()
      document.fonts.removeEventListener("loadingdone", fitTitle)
    }
  }, [title])

  return (
    <h3 ref={headingRef} className="whitespace-nowrap text-xs sm:text-sm font-medium leading-snug text-foreground">
      <span ref={textRef} className="inline-block">{title}</span>
    </h3>
  )
}

export function FeaturedProjectsClient({ entries }: FeaturedProjectsClientProps) {
  const reduceMotion = useReducedMotion()
  const projects = Array.from({ length: 9 }, (_, index) => entries[index])

  return (
    <section
      className="flex scroll-mt-16 items-center justify-center bg-surface/30 px-4 py-6 md:min-h-[calc(100svh-4.0625rem)]"
      aria-labelledby="featured-projects-title"
    >
      <div className="w-full max-w-3xl">
        <motion.div
          initial={{ y: reduceMotion ? 0 : 20 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
          className="text-center mb-5"
        >
          <h2
            id="featured-projects-title"
            className="text-2xl md:text-3xl font-bold leading-9 text-balance text-foreground"
          >
            Featured Projects
          </h2>
        </motion.div>

        <ul className="mx-auto grid w-full grid-cols-3 gap-2 sm:gap-3 md:max-w-[max(24rem,calc(100svh-15rem))]">
          {projects.map((project, index) => {
            const contents = (
              <Card className="group/card relative aspect-square w-full overflow-hidden bg-gradient-to-br from-surface via-overlay to-highlight-low p-0 transition-all duration-300 ease-in-out group-hover:scale-[1.02] group-hover:border-love group-hover:shadow-lg group-hover:shadow-love/20 group-hover:[transform:perspective(1000px)_rotateX(2deg)] group-focus-visible:border-love motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:transform-none motion-reduce:[&_svg]:animate-none">
                <div aria-hidden="true" className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden z-10 motion-reduce:hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-out" />
                </div>

                {project?.thumbnail ? (
                  <ImageWithFallback
                    src={project.thumbnail}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(min-width: 768px) 248px, (min-width: 640px) calc((100vw - 56px) / 3), calc((100vw - 48px) / 3)"
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
                    loading="lazy"
                    fallbackVariant="card"
                  />
                ) : (
                  <div className="absolute inset-0" aria-hidden="true">
                    <GearPlaceholder iconClassName="h-10 w-10 -translate-y-4" />
                  </div>
                )}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-background/90 px-2 py-1.5 sm:px-3 sm:py-2.5">
                  <FeaturedProjectTitle title={project?.title ?? "Coming Soon"} />
                </div>
              </Card>
            )

            return (
              <motion.li
                key={project?.slug ?? `coming-soon-${index}`}
                className="min-w-0"
                initial={{ y: reduceMotion ? 0 : 20 }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : index * 0.05 }}
              >
                {project ? (
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-love"
                  >
                    {contents}
                  </Link>
                ) : (
                  <div className="group">{contents}</div>
                )}
              </motion.li>
            )
          })}
        </ul>

        <motion.div
          initial={{ y: reduceMotion ? 0 : 10 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.3 }}
          className="text-center mt-5"
        >
          <Button asChild size="lg" variant="gradient" className="pulse-glow">
            <Link href="/projects" className="group">
              View all projects
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
