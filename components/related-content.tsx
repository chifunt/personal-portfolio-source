import clsx from "clsx"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import type { ContentEntry, ContentType } from "@/lib/content"
import { getContentBySlug } from "@/lib/content"
import { ImageWithFallback } from "@/components/ui/image-with-fallback"
import { GearPlaceholder } from "@/components/gear-placeholder"

interface RelatedContentItem {
  slug: string
  type?: ContentType
}

interface RelatedContentProps {
  slug?: string
  type?: ContentType
  items?: RelatedContentItem[]
  title?: string
  className?: string
}

interface ResolvedItem {
  entry: ContentEntry
  type: ContentType
}

const LABEL_BY_TYPE: Record<ContentType, string> = {
  projects: "Project",
  extras: "Extra",
}

export async function RelatedContent({ slug, type = "projects", items, title, className }: RelatedContentProps) {
  const configs: RelatedContentItem[] = []

  if (Array.isArray(items) && items.length > 0) {
    configs.push(...items)
  } else if (slug) {
    configs.push({ slug, type })
  }

  if (configs.length === 0) {
    return null
  }

  const resolved = await Promise.all(
    configs.map(async (config) => {
      const resolvedType = config.type ?? type ?? "projects"
      const entry = await getContentBySlug(resolvedType, config.slug)
      if (!entry) {
        console.warn(`[RelatedContent] Unable to find entry for ${resolvedType}/${config.slug}`)
        return null
      }
      return { entry, type: resolvedType } satisfies ResolvedItem
    })
  )

  const relatedItems = resolved.filter((item): item is ResolvedItem => item !== null)

  if (relatedItems.length === 0) {
    return null
  }

  return (
    <section className={clsx("my-10 space-y-4 mx-auto max-w-xl", className)}>
      {title && <h3 className="text-sm font-semibold tracking-[0.4em] text-gold/70">{title}</h3>}
      {relatedItems.map(({ entry, type: entryType }) => (
        <RelatedContentCard key={`${entryType}-${entry.slug}`} entry={entry} type={entryType} />
      ))}
    </section>
  )
}

function RelatedContentCard({ entry, type }: ResolvedItem) {
  const href = type === "projects" ? `/projects/${entry.slug}` : `/extras/${entry.slug}`
  const summary = entry.summary ?? entry.subtitle ?? entry.excerpt ?? null
  const thumbnail = entry.thumbnail ?? entry.hero ?? null
  const firstTag = entry.tags[0]

  return (
    <Link href={href} className="block">
      <Card className="group mx-auto flex w-full max-w-xl flex-row overflow-hidden border-highlight-high/20 bg-surface/60 p-0 transition-all hover:-translate-y-1 hover:border-love/40">
        <div className="relative w-32 flex-shrink-0 overflow-hidden self-stretch md:w-36">
          {thumbnail ? (
            <ImageWithFallback
              src={thumbnail}
              alt={entry.title}
              fill
              sizes="(min-width: 768px) 160px, 144px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              fallbackVariant="card"
            />
          ) : (
            <GearPlaceholder className="absolute inset-0" iconClassName="h-12 w-12" />
          )}
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 px-5 py-4">
          <CardTitle className="text-base font-semibold text-foreground transition-colors group-hover:text-love">
            {entry.title}
          </CardTitle>
          {summary && (
            <CardDescription className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {summary}
            </CardDescription>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{LABEL_BY_TYPE[type]}</span>
            {entry.date && <><span>•</span><time dateTime={entry.date}>{entry.date}</time></>}
            {firstTag && (
              <>
                <span>•</span>
                <span>{firstTag}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
