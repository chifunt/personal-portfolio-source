#!/usr/bin/env node

import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"
import sharp from "sharp"

const ROOT = process.cwd()
const RAW_ROOT = path.join(ROOT, "content-assets", "raw")
const OUTPUT_ROOT = path.join(ROOT, "public", "projects")

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".tiff", ".avif"])
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".webm", ".mkv"])
const AUDIO_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac"])

async function ensureDirectory(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function parseArgs(argv) {
  const args = { slug: undefined, help: false, list: false, sync: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--help" || arg === "-h") {
      args.help = true
      continue
    }
    if (arg === "--list") {
      args.list = true
      continue
    }
    if (arg === "--sync") {
      args.sync = true
      continue
    }
    if (arg.startsWith("--slug=")) {
      args.slug = arg.split("=")[1].trim()
      continue
    }
    if (arg === "--slug" || arg === "-s") {
      const next = argv[i + 1]
      if (next && !next.startsWith("-")) {
        args.slug = next.trim()
        i += 1
      }
      continue
    }
  }
  return args
}

function printUsage() {
  console.log(`Usage: pnpm process-assets [options]

Options:
  --slug, -s <slug>   Process a single slug directory
  --list              List available slugs under content-assets/raw
  --sync              Ensure raw folders exist for all content slugs and warn about orphaned folders
  --help, -h          Show this help message
`)
}

async function listSlugs() {
  try {
    const dirents = await fs.readdir(RAW_ROOT, { withFileTypes: true })
    const slugs = dirents.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    if (!slugs.length) {
      console.log("No slug directories found under content-assets/raw.")
      return
    }
    console.log("Available slugs:")
    for (const slug of slugs) {
      console.log(`  - ${slug}`)
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Missing content-assets/raw directory. Create it and add project media before running.")
      return
    }
    throw error
  }
}

function sanitizeDescriptor(base, slug) {
  if (!base) return "asset"
  const normalized = base
    .replace(new RegExp(`^${slug}[-_]?`, "i"), "")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
  return normalized || "asset"
}

function ensureUniqueDescriptor(base, usedDescriptors) {
  let candidate = base || "asset"
  let suffix = 2
  while (usedDescriptors.has(candidate)) {
    candidate = `${base || "asset"}-${suffix}`
    suffix += 1
  }
  usedDescriptors.add(candidate)
  return candidate
}

async function processImage({ slug, inputPath, descriptor, outputDir }) {
  const outputName = `${slug}-${descriptor}.webp`
  const outputPath = path.join(outputDir, outputName)

  await sharp(inputPath).webp({ quality: 85 }).toFile(outputPath)
  const { width = null, height = null } = await sharp(outputPath).metadata()

  return {
    src: `/projects/${slug}/${outputName}`,
    width,
    height,
    format: "webp",
  }
}

async function processBinaryAsset({ slug, inputPath, descriptor, outputDir, extension }) {
  const outputName = `${slug}-${descriptor}${extension}`
  const outputPath = path.join(outputDir, outputName)
  await fs.copyFile(inputPath, outputPath)

  return {
    src: `/projects/${slug}/${outputName}`,
    format: extension.replace(/^\./, ""),
  }
}

async function processSlug(slug) {
  const slugRawDir = path.join(RAW_ROOT, slug)
  const slugOutputDir = path.join(OUTPUT_ROOT, slug)

  const dirStat = await fs.stat(slugRawDir).catch(() => null)
  if (!dirStat || !dirStat.isDirectory()) {
    console.warn(`⚠️  Skipping "${slug}" – no directory at ${slugRawDir}`)
    return
  }

  await fs.rm(slugOutputDir, { recursive: true, force: true })
  await ensureDirectory(slugOutputDir)

  const dirents = await fs.readdir(slugRawDir, { withFileTypes: true })
  const usedDescriptors = new Set()
  const metadata = {
    generatedAt: new Date().toISOString(),
    images: {},
    videos: {},
    audio: {},
    other: {},
  }

  for (const entry of dirents) {
    if (!entry.isFile()) continue

    const extension = path.extname(entry.name).toLowerCase()
    const baseName = path.basename(entry.name, extension)
    const descriptor = ensureUniqueDescriptor(sanitizeDescriptor(baseName, slug), usedDescriptors)
    const inputPath = path.join(slugRawDir, entry.name)

    try {
      if (IMAGE_EXTENSIONS.has(extension)) {
        metadata.images[descriptor] = await processImage({ slug, inputPath, descriptor, outputDir: slugOutputDir })
        console.log(`🖼️  ${slug}/${entry.name} → ${metadata.images[descriptor].src}`)
      } else if (VIDEO_EXTENSIONS.has(extension)) {
        metadata.videos[descriptor] = await processBinaryAsset({
          slug,
          inputPath,
          descriptor,
          outputDir: slugOutputDir,
          extension: ".webm" === extension ? extension : extension,
        })
        console.log(`🎞️  ${slug}/${entry.name} → ${metadata.videos[descriptor].src}`)
      } else if (AUDIO_EXTENSIONS.has(extension)) {
        metadata.audio[descriptor] = await processBinaryAsset({
          slug,
          inputPath,
          descriptor,
          outputDir: slugOutputDir,
          extension,
        })
        console.log(`🎧  ${slug}/${entry.name} → ${metadata.audio[descriptor].src}`)
      } else {
        metadata.other[descriptor] = await processBinaryAsset({
          slug,
          inputPath,
          descriptor,
          outputDir: slugOutputDir,
          extension,
        })
        console.log(`📄  ${slug}/${entry.name} → ${metadata.other[descriptor].src}`)
      }
    } catch (error) {
      console.error(`Failed to process ${entry.name}:`, error)
      throw error
    }
  }

  const metadataPath = path.join(slugOutputDir, "assets.json")
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
  console.log(`📝  Wrote metadata to ${path.relative(ROOT, metadataPath)}`)
}

async function deriveSlugsFromContent() {
  const slugs = new Set()
  const contentRoot = path.join(ROOT, "content")
  const types = ["projects", "extras"]

  await Promise.all(
    types.map(async (type) => {
      const dir = path.join(contentRoot, type)
      const dirents = await fs.readdir(dir, { withFileTypes: true }).catch((error) => {
        if (error.code === "ENOENT") {
          return []
        }
        throw error
      })

      for (const entry of dirents) {
        if (!entry.isFile() || !entry.name.endsWith(".mdx")) {
          continue
        }
        const filePath = path.join(dir, entry.name)
        const raw = await fs.readFile(filePath, "utf8")
        const parsed = matter(raw)
        const frontMatterSlug = typeof parsed.data?.slug === "string" ? parsed.data.slug.trim() : ""
        const slug = frontMatterSlug.length ? frontMatterSlug : entry.name.replace(/\.mdx$/, "")
        slugs.add(slug)
      }
    })
  )

  return slugs
}

async function syncRawDirectories() {
  const expectedSlugs = await deriveSlugsFromContent()

  if (!expectedSlugs.size) {
    console.log("No MDX entries found. Nothing to sync.")
    return { created: [], orphaned: [] }
  }

  await ensureDirectory(RAW_ROOT)
  const dirents = await fs.readdir(RAW_ROOT, { withFileTypes: true })
  const rawSlugs = new Set(dirents.filter((entry) => entry.isDirectory()).map((entry) => entry.name))

  const created = []
  for (const slug of expectedSlugs) {
    if (!rawSlugs.has(slug)) {
      const dir = path.join(RAW_ROOT, slug)
      await ensureDirectory(dir)
      created.push(slug)
      console.log(`📁  Created raw directory for "${slug}"`)
    }
  }

  const orphaned = []
  for (const slug of rawSlugs) {
    if (!expectedSlugs.has(slug)) {
      orphaned.push(slug)
    }
  }

  if (orphaned.length) {
    console.warn("⚠️  Raw directories without matching MDX entries:")
    orphaned.forEach((slug) => console.warn(`   - ${slug}`))
    console.warn("    (Remove them manually if no longer needed.)")
  }

  if (!created.length && !orphaned.length) {
    console.log("Raw media directories are already in sync with content.")
  }

  return { created, orphaned }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }

  if (args.list) {
    await listSlugs()
    return
  }

  if (args.sync) {
    await syncRawDirectories()
    if (!args.slug) {
      return
    }
  }

  let slugs = []

  if (args.slug) {
    slugs = [args.slug]
  } else {
    try {
      const dirents = await fs.readdir(RAW_ROOT, { withFileTypes: true })
      slugs = dirents.filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error("Missing content-assets/raw directory. Create it and add project media before running.")
        return
      }
      throw error
    }
  }

  if (!slugs.length) {
    console.log("No slugs to process.")
    return
  }

  for (const slug of slugs) {
    console.log(`\nProcessing "${slug}" assets…`)
    await processSlug(slug)
  }
}

main().catch((error) => {
  console.error("Asset processing failed:", error)
  process.exitCode = 1
})
