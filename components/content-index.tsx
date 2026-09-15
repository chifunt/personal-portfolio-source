"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ContentCard } from "@/components/content-card"
import type { ContentEntry } from "@/lib/content"

interface ContentIndexProps {
  entries: ContentEntry[]
  title: string
  description: string
  basePath: string
  searchPlaceholder?: string
  emptyState?: string
}

export function ContentIndex({
  entries,
  title,
  description,
  basePath,
  searchPlaceholder = "Search entries...",
  emptyState = "No results. Try another search or choose a different tag.",
}: ContentIndexProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    entries.forEach((entry) => {
      entry.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [entries])

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return entries.filter((entry) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        entry.title.toLowerCase().includes(normalizedQuery) ||
        entry.subtitle?.toLowerCase().includes(normalizedQuery) ||
        entry.summary?.toLowerCase().includes(normalizedQuery) ||
        entry.excerpt?.toLowerCase().includes(normalizedQuery) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
        entry.quickStats?.tech.some((tech) => tech.toLowerCase().includes(normalizedQuery))

      const matchesTag = selectedTag === null || entry.tags.includes(selectedTag)

      return matchesSearch && matchesTag
    })
  }, [entries, searchQuery, selectedTag])

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 pb-1 text-balance bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-4xl leading-relaxed">{description}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              aria-label={searchPlaceholder.replace(/\.+$/, "")}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <details className="group/filter min-w-0 flex-1">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm text-foreground transition-colors hover:border-love focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
                {selectedTag ? `Filter: ${selectedTag}` : "Filters"}
                <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/filter:rotate-180" />
              </summary>
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                <Button variant={selectedTag === null ? "default" : "outline"} className="min-h-11" size="sm" aria-pressed={selectedTag === null} onClick={() => setSelectedTag(null)}>
                  All
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    className="min-h-11"
                    size="sm"
                    aria-pressed={selectedTag === tag}
                    onClick={() => setSelectedTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </details>
            <p role="status" aria-live="polite" aria-atomic="true" className="py-3 text-sm text-muted-foreground">
              {filteredEntries.length} of {entries.length} {basePath === "/projects" ? "projects" : "entries"}
            </p>
          </div>
          {(selectedTag !== null || searchQuery.length > 0) && (
            <Button variant="ghost" size="sm" onClick={() => { setSelectedTag(null); setSearchQuery("") }}>
              <X aria-hidden="true" className="mr-2 h-4 w-4" /> Clear search and filters
            </Button>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredEntries.map((entry, index) => (
            <ContentCard key={entry.slug} content={entry} index={index} basePath={basePath} />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">{emptyState}</p>
          </div>
        )}
      </div>
    </div>
  )
}
