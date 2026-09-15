"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { GearPlaceholder } from "@/components/gear-placeholder"
import type { ContentEntry } from "@/lib/content"

const CARD_IMAGE_BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

interface ContentCardProps {
  content: ContentEntry
  index: number
  basePath: string
}

export function ContentCard({ content, index, basePath }: ContentCardProps) {
  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: Math.min(index, 3) * 0.05 }}
    >
      <Link href={`${basePath}/${content.slug}`} className="group block h-full">
        <Card className="group/card relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-surface via-overlay to-highlight-low p-0 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border-love hover:shadow-lg hover:shadow-love/20 group-hover:[transform:perspective(1000px)_rotateX(2deg)]">
          {/* Diagonal shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-out" />
          </div>

          <div className="relative w-full overflow-hidden">
            <div className="relative aspect-video">
              {content.thumbnail ? (
                <ImageWithFallback
                  src={content.thumbnail}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  sizes="(min-width: 1024px) 512px, 100vw"
                  placeholder="blur"
                  blurDataURL={CARD_IMAGE_BLUR}
                  priority={index < 2}
                  loading={index < 2 ? "eager" : "lazy"}
                  fallbackVariant="card"
                />
              ) : (
                <GearPlaceholder className="relative flex h-full w-full" iconClassName="h-16 w-16" />
              )}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/75 via-background/5 to-transparent" />
          </div>

          <CardHeader className="flex-1 px-6 pb-6 pt-0">
            <div className="mb-4 flex flex-col gap-3">
              <CardTitle className="font-display text-balance text-2xl font-semibold tracking-tight bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent transition-colors duration-300 group-hover/card:from-gold group-hover/card:via-pine group-hover/card:to-love">
                {content.title}
              </CardTitle>

              {(content.summary || content.subtitle || content.excerpt) && <p className="text-sm text-muted-foreground leading-relaxed">
                {content.summary || content.subtitle || content.excerpt}
              </p>}
              {content.status && <span className="text-xs font-medium text-foam">{content.status}</span>}
            </div>
          </CardHeader>

          <CardContent className="mt-auto px-6 pb-6 pt-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {content.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="border border-love/30 bg-gradient-to-r from-love to-gold font-semibold transition-all hover:from-gold hover:to-love"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {content.date && <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <time dateTime={content.date}>{content.date}</time>
              </div>}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
