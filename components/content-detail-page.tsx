import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, ExternalLink, ChevronRight } from "lucide-react"
import { MDXRemote } from "next-mdx-remote/rsc"
import { mdxOptions } from "@/lib/mdx-options"
import { mdxComponents } from "./mdx-components"
import type { ContentEntry, ContentType } from "@/lib/content"
import { Button } from "@/components/ui/button"
import { FeedbackCTA } from "@/components/feedback-cta"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"

export interface ContentDetailProps {
  entry: ContentEntry
  section: ContentType
}

export function ContentDetailPage({ entry, section }: ContentDetailProps) {
  const heroImage = entry.hero ?? entry.thumbnail
  const supportingImage = entry.thumbnail && entry.thumbnail !== heroImage ? entry.thumbnail : undefined
  const heroAspectRatio = entry.heroDimensions
    ? entry.heroDimensions.width / entry.heroDimensions.height
    : undefined
  const supportingAspectRatio =
    supportingImage && entry.thumbnailDimensions
      ? entry.thumbnailDimensions.width / entry.thumbnailDimensions.height
      : undefined
  const hasQuickStats = Boolean(entry.quickStats)
  const hasLinks = Boolean(entry.links && entry.links.length > 0)
  const metaGridColumns = hasQuickStats && hasLinks ? "md:grid-cols-2" : "md:grid-cols-1"
  const sectionLabel = section === "projects" ? "Projects" : "Extras"
  const sectionHref = section === "projects" ? "/projects" : "/extras"

  return (
    <article className="content-article container mx-auto max-w-4xl px-4 pb-20 space-y-10">
      <header className="fade-up">
        <nav className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className="transition-colors hover:text-gold">
                Home
              </Link>
            </li>
            <li className="text-highlight-high">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li>
              <Link href={sectionHref} className="transition-colors hover:text-gold">
                {sectionLabel}
              </Link>
            </li>
            <li className="text-highlight-high">
              <ChevronRight className="h-3 w-3" />
            </li>
            <li className="text-foreground/90">{entry.title}</li>
          </ol>
        </nav>

        {(entry.date || entry.status) && <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {entry.date && <>
          <Calendar className="h-4 w-4" />
          <time dateTime={entry.date}>{entry.date}</time>
          </>}
          {entry.status && <Badge variant="outline" className="border-foam/40 text-foam">{entry.status}</Badge>}
        </div>}

        <h1 className="font-display text-balance text-4xl font-bold pb-1 text-transparent md:text-5xl bg-gradient-to-r from-love via-gold to-pine bg-clip-text">
          {entry.title}
        </h1>

        {entry.subtitle && <p className="mt-4 text-lg font-medium text-gold/80">{entry.subtitle}</p>}

        {(entry.summary || entry.excerpt) && (
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            {entry.summary ?? entry.excerpt}
          </p>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-gradient-to-r from-love to-gold hover:from-gold hover:to-love border border-love/30 font-semibold transition-all"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {heroImage ? (
        <figure className="fade-up-delay overflow-hidden rounded-2xl border border-highlight-high/20 bg-surface/50 shadow-2xl">
          <div
            className="relative w-full overflow-hidden"
            style={heroAspectRatio ? { aspectRatio: heroAspectRatio } : { height: 420 }}
          >
            <ImageWithFallback
              src={heroImage}
              alt={entry.title}
              fill
              className="object-cover"
              loading="eager"
              sizes="(min-width: 768px) 768px, 100vw"
              priority
              fallbackVariant="hero"
            />
          </div>
        </figure>
      ) : null}

      {supportingImage && (
        <figure className="fade-up-delay overflow-hidden rounded-2xl border border-highlight-high/20 bg-surface/50 shadow-xl">
          <div
            className="relative w-full overflow-hidden"
            style={supportingAspectRatio ? { aspectRatio: supportingAspectRatio } : { height: 240 }}
          >
            <ImageWithFallback
              src={supportingImage}
              alt={`${entry.title} supporting visual`}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(min-width: 768px) 480px, 100vw"
              fallbackVariant="support"
            />
          </div>
        </figure>
      )}

      {(hasQuickStats || hasLinks) && (
        <section className={`fade-up-delay grid gap-6 ${metaGridColumns}`}>
          {hasQuickStats && entry.quickStats && (
            <div className="rounded-2xl border border-highlight-high/20 bg-surface/60 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gold tracking-wide">Details</h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                {entry.quickStats.role && <div>
                  <span className="font-semibold text-foreground">Role:</span> {entry.quickStats.role}
                </div>}
                {entry.quickStats.duration && <div>
                  <span className="font-semibold text-foreground">Duration:</span> {entry.quickStats.duration}
                </div>}
                {entry.quickStats.tech.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {entry.quickStats.tech.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="border-love/40 bg-love/10 text-love hover:bg-love/20"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {hasLinks && entry.links && (
            <div className="rounded-2xl border border-highlight-high/20 bg-surface/60 p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gold tracking-wide">Links</h2>
              <div className="flex flex-col gap-3">
                {entry.links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="outline"
                    className="justify-between bg-gradient-to-r from-love/10 to-gold/10 hover:from-love/20 hover:to-gold/20 border-love/30 text-love"
                  >
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      <span>{link.label}</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="fade-up-delay">
        <div className="content-prose prose prose-invert prose-rose max-w-none">
          {entry.mdx ? (
            <MDXRemote
              source={entry.mdx}
              components={mdxComponents}
              options={mdxOptions}
            />
          ) : <p className="text-lg text-muted-foreground">I haven't written this one up yet.</p>}
        </div>
      </section>

      <div className="fade-up">
        <FeedbackCTA context={section} title={entry.title} />
      </div>

      <Separator className="my-12 fade-up" />

    </article>
  )
}
