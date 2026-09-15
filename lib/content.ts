import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"
import { cache } from "react"
import { z } from "zod"
import sharp from "sharp"

export type ContentType = "projects" | "extras"

export interface ContentEntry {
  slug: string
  title: string
  subtitle?: string
  summary?: string
  featured: boolean
  date?: string
  status?: "Concept" | "In development" | "Prototype"
  tags: string[]
  thumbnail?: string
  thumbnailDimensions?: { width: number; height: number }
  hero?: string
  heroDimensions?: { width: number; height: number }
  excerpt?: string
  quickStats?: {
    tech: string[]
    role?: string
    duration?: string
  }
  links?: Array<{ label: string; href: string; icon?: string }>
  assets?: ProcessedAssetMetadata
  mdx: string
}

interface ProcessedAsset {
  src: string
  width?: number | null
  height?: number | null
  format?: string
}

interface ProcessedAssetMetadata {
  generatedAt?: string
  images?: Record<string, ProcessedAsset>
  videos?: Record<string, { src: string; format?: string }>
  audio?: Record<string, { src: string; format?: string }>
  other?: Record<string, { src: string; format?: string }>
}

interface ErrnoLike extends Error {
  code?: string
}

// A fixed content root keeps Next's file tracing out of source media folders.
const CONTENT_ROOT = path.join(process.cwd(), "content")

const stringOrArraySchema = z.union([z.array(z.string()), z.string()])
const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
})
const quickStatsSchema = z
  .object({
    tech: stringOrArraySchema.optional(),
    role: z.string().optional(),
    duration: z.string().optional(),
  })
  .optional()
const frontMatterSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  slug: z.string().optional(),
  date: z.union([z.string(), z.date(), z.number()]).optional(),
  status: z.enum(["Concept", "In development", "Prototype"]).optional(),
  tags: stringOrArraySchema.optional(),
  thumbnail: z.string().optional(),
  featured: z.boolean().optional(),
  hero: z.string().optional(),
  excerpt: z.string().optional(),
  quickStats: quickStatsSchema,
  links: z.array(linkSchema).optional(),
})

const loadAllContent = cache(async (type: ContentType): Promise<ContentEntry[]> => {
  const directory = path.join(CONTENT_ROOT, type)

  let files: string[]
  try {
    files = await fs.readdir(directory)
  } catch (error) {
    console.warn(`[content] Unable to read directory for "${type}" entries.`, error)
    return []
  }

  const entries: ContentEntry[] = []

  await Promise.all(
    files
      .filter((file) => file.endsWith(".mdx"))
      .map(async (file) => {
        const filePath = path.join(directory, file)
        const rawContent = await fs.readFile(filePath, "utf8")
        const { data, content } = matter(rawContent)
        const parsed = frontMatterSchema.parse(data)
        const tags = normalizeStringArray(parsed.tags)
        const date = normalizeDate(parsed.date)

        const slug =
          typeof parsed.slug === "string" && parsed.slug.trim().length > 0
            ? parsed.slug.trim()
            : file.replace(/\.mdx$/, "")

        const assetMetadata = await readAssetMetadata(slug)
        const imageLookup = buildAssetImageLookup(assetMetadata)
        const thumbnail = parsed.thumbnail?.trim() || undefined
        const thumbnailDimensions = await getImageDimensions(thumbnail, imageLookup)
        const hero = parsed.hero?.trim() || undefined
        const heroDimensions = hero && hero === thumbnail ? thumbnailDimensions : await getImageDimensions(hero, imageLookup)

        const entry: ContentEntry = {
          slug,
          title: parsed.title,
          subtitle: parsed.subtitle?.trim() || undefined,
          summary: parsed.summary?.trim() || undefined,
          featured: parsed.featured ?? false,
          date,
          status: parsed.status,
          tags,
          thumbnail,
          thumbnailDimensions,
          hero,
          heroDimensions,
          excerpt: parsed.excerpt?.trim() || undefined,
          quickStats: normalizeQuickStats(parsed.quickStats),
          links: parsed.links?.map((link) => ({
            label: link.label.trim(),
            href: link.href.trim(),
            icon: link.icon?.trim(),
          })),
          assets: assetMetadata ?? undefined,
          mdx: content.trim(),
        }

        entries.push(entry)
      })
  )

  return entries.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title))
})

export async function getAllContent(type: ContentType): Promise<ContentEntry[]> {
  return loadAllContent(type)
}

export async function getContentBySlug(type: ContentType, slug: string): Promise<ContentEntry | null> {
  const entries = await getAllContent(type)
  return entries.find((entry) => entry.slug === slug) ?? null
}

async function getImageDimensions(
  src?: string | null,
  lookup?: Map<string, ProcessedAsset>
): Promise<{ width: number; height: number } | undefined> {
  if (!src || !src.startsWith("/")) {
    return undefined
  }

  const metadata = lookup?.get(src)
  if (metadata && typeof metadata.width === "number" && typeof metadata.height === "number") {
    return { width: metadata.width, height: metadata.height }
  }

  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""))

  try {
    const image = sharp(filePath)
    const metadata = await image.metadata()

    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height }
    }
  } catch (error) {
    console.warn(`[content] Unable to determine dimensions for ${src}`, error)
  }

  return undefined
}

async function readAssetMetadata(slug: string): Promise<ProcessedAssetMetadata | null> {
  const metadataPath = path.join(process.cwd(), "public", "projects", slug, "assets.json")

  try {
    const raw = await fs.readFile(metadataPath, "utf8")
    const parsed = JSON.parse(raw) as ProcessedAssetMetadata
    return parsed
  } catch (error) {
    const nodeError = error as ErrnoLike
    if (nodeError.code !== "ENOENT") {
      console.warn(`[content] Unable to read asset metadata for "${slug}"`, error)
    }
  }

  return null
}

function buildAssetImageLookup(metadata: ProcessedAssetMetadata | null): Map<string, ProcessedAsset> {
  const lookup = new Map<string, ProcessedAsset>()
  if (!metadata?.images) {
    return lookup
  }

  for (const value of Object.values(metadata.images)) {
    if (value?.src) {
      lookup.set(value.src, value)
    }
  }

  return lookup
}

function normalizeDate(value: string | Date | number | undefined): string | undefined {
  if (value === undefined) return undefined
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString().slice(0, 10)
  }
  return value.toString().slice(0, 10)
}

function normalizeStringArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return (Array.isArray(value) ? value : value.split(","))
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function normalizeQuickStats(value: z.infer<typeof quickStatsSchema>): ContentEntry["quickStats"] {
  if (!value) {
    return undefined
  }
  const tech = normalizeStringArray(value.tech)
  const role = value.role?.trim()
  const duration = value.duration?.trim()

  if (!tech.length && !role && !duration) {
    return undefined
  }

  return { tech, role, duration }
}
