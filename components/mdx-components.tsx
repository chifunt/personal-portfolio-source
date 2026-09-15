import { isValidElement, type ComponentProps, type ReactNode } from "react"
import Link from "next/link"
import clsx from "clsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageWithFallback, type ImageWithFallbackProps } from "@/components/ui/image-with-fallback"
import { RelatedContent } from "@/components/related-content"
import { MermaidDiagram } from "@/components/mermaid-diagram"

type HeadingTag = "h1" | "h2" | "h3"

const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

function createHeading(tag: HeadingTag) {
  const Heading = ({ className, children, ...props }: ComponentProps<HeadingTag>) => {
    const baseStyles: Record<HeadingTag, string> = {
      h1: "font-display text-4xl font-bold mt-12 mb-6 bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent",
      h2: "font-display text-3xl font-semibold mt-10 mb-4 text-love",
      h3: "font-display text-2xl font-semibold mt-8 mb-4 text-gold",
    }

    const Tag = tag

    return (
      <Tag id={typeof children === "string" ? children.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") : undefined} className={clsx(baseStyles[tag], className)} {...props}>
        {children}
      </Tag>
    )
  }

  return Heading
}

function Paragraph({ className, ...props }: ComponentProps<"p">) {
  return <p className={clsx("leading-relaxed text-lg text-muted-foreground my-6", className)} {...props} />
}

function UnorderedList({ className, ...props }: ComponentProps<"ul">) {
  return <ul className={clsx("list-disc pl-6 space-y-2 my-6", className)} {...props} />
}

function OrderedList({ className, ...props }: ComponentProps<"ol">) {
  return <ol className={clsx("list-decimal pl-6 space-y-2 my-6", className)} {...props} />
}

function ListItem({ className, ...props }: ComponentProps<"li">) {
  return <li className={clsx("leading-relaxed text-base text-muted-foreground", className)} {...props} />
}

type AnchorProps = ComponentProps<"a"> & { href?: string }

function Anchor({ className, href = "#", ...props }: AnchorProps) {
  const classes = clsx(
    "text-love underline-offset-4 underline decoration-dashed hover:text-gold transition-colors",
    className
  )

  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a className={classes} href={href} {...props}>
        {props.children}
      </a>
    )
  }

  return (
    <Link className={classes} href={href} {...props}>
      {props.children}
    </Link>
  )
}

function InlineCode({ className, ...props }: ComponentProps<"code">) {
  return (
    <code
      className={clsx(
        "rounded bg-highlight-low px-2 py-1 font-mono text-sm text-love border border-love/30",
        className
      )}
      {...props}
    />
  )
}

function Pre({ className, children, ...props }: ComponentProps<"pre">) {
  if (isValidElement<{ className?: string; children?: ReactNode }>(children) && children.props.className?.split(" ").includes("language-mermaid")) {
    const chart = String(children.props.children ?? "").trim()
    const title = chart.match(/^\s*accTitle:\s*(.+)$/m)?.[1] ?? "Diagram"
    return <MermaidDiagram chart={chart} title={title} />
  }
  return (
    <pre
      className={clsx(
        "rounded-lg bg-[#191724] border border-highlight-high/20 p-4 overflow-x-auto text-sm leading-relaxed",
        className
      )}
      {...props}
    >{children}</pre>
  )
}

interface InlineImgProps extends Omit<ImageWithFallbackProps, "src" | "alt" | "width" | "height"> {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
}

function Img({ className, src = "", alt = "", width, height, ...props }: InlineImgProps) {
  if (!src) return null

  const numericWidth =
    typeof width === "number" ? width : typeof width === "string" ? parseInt(width, 10) || undefined : undefined
  const numericHeight =
    typeof height === "number" ? height : typeof height === "string" ? parseInt(height, 10) || undefined : undefined

  const fallbackWidth = numericWidth ?? 1200
  const fallbackHeight = numericHeight ?? 800

  return (
    <div className={clsx("relative my-8 overflow-hidden rounded-lg border border-highlight-high/20 shadow-lg", className)}>
      <ImageWithFallback
        src={src}
        alt={alt}
        width={fallbackWidth}
        height={fallbackHeight}
        className="h-auto w-full object-cover"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        loading="lazy"
        fallbackVariant="gallery"
        {...props}
      />
    </div>
  )
}

interface MDXImageProps extends Omit<ImageWithFallbackProps, "src" | "alt" | "width" | "height"> {
  src: string
  alt: string
  caption?: string
  width?: number | string
  height?: number | string
}

function MDXImage({ src, alt, caption, className, ...props }: MDXImageProps) {
  const { width, height, blurDataURL, fallbackVariant, ...imageProps } = props
  const numericWidth =
    typeof width === "number" ? width : typeof width === "string" ? parseInt(width, 10) || undefined : undefined
  const numericHeight =
    typeof height === "number" ? height : typeof height === "string" ? parseInt(height, 10) || undefined : undefined

  return (
    <figure className="my-10">
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-xl border border-highlight-high/20 shadow-lg">
        <ImageWithFallback
          src={src}
          alt={alt}
          width={numericWidth ?? 1200}
          height={numericHeight ?? 800}
          className={clsx("h-auto w-full object-cover", className)}
          placeholder="blur"
          blurDataURL={blurDataURL ?? BLUR_DATA_URL}
          loading="lazy"
          sizes="(min-width: 1024px) 768px, 100vw"
          fallbackVariant={fallbackVariant ?? "gallery"}
          {...imageProps}
        />
      </div>
      {caption && <figcaption className="text-sm text-muted-foreground text-center mt-3">{caption}</figcaption>}
    </figure>
  )
}

interface VideoProps extends ComponentProps<"video"> {
  caption?: string
}

function Video({ caption, className, children, ...props }: VideoProps) {
  return (
    <figure className="my-10">
      <video
        className={clsx(
          "w-full max-w-3xl mx-auto rounded-xl border border-highlight-high/20 shadow-lg",
          className
        )}
        controls
        {...props}
      >
        {children}
      </video>
      {caption && <figcaption className="text-sm text-muted-foreground text-center mt-3">{caption}</figcaption>}
    </figure>
  )
}

interface EmbedProps {
  src?: string
  title?: string
  provider?: "youtube"
  id?: string
  height?: number
}

function getEmbedSrc({ provider, id, src }: EmbedProps): string | null {
  if (provider === "youtube" && id) {
    return `https://www.youtube.com/embed/${id}`
  }
  if (src) {
    return src
  }
  return null
}

function Embed({ src, title, provider, id, height = 400 }: EmbedProps) {
  const resolvedSrc = getEmbedSrc({ provider, id, src })

  if (!resolvedSrc) {
    return null
  }

  return (
    <div className="my-10">
      <iframe
        src={resolvedSrc}
        title={title ?? "Embedded content"}
        height={height}
        className="w-full max-w-3xl mx-auto rounded-xl border border-highlight-high/20 shadow-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

interface LinkButtonProps {
  href: string
  children: ReactNode
}

function LinkButton({ href, children }: LinkButtonProps) {
  return (
    <div className="my-8 flex justify-center">
      <Button asChild variant="gradient" className="group px-10 py-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center gap-2"
        >
          <span className="relative z-10">{children}</span>
          <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </a>
      </Button>
    </div>
  )
}

interface AudioPlayerProps {
  src: string
  title?: string
  poster?: string
}

function AudioPlayer({ src, title }: AudioPlayerProps) {
  return (
    <figure className="my-10">
      <div className="relative mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-highlight-high/20 bg-surface/60 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between bg-gradient-to-r from-love/10 via-gold/10 to-pine/10 px-4 py-3 text-sm font-medium text-foreground/80">
          <span>{title ?? "Audio player"}</span>
          <Badge className="bg-gradient-to-r from-love to-gold text-[#191724]">Listen</Badge>
        </div>
        <audio controls preload="metadata" className="w-full bg-transparent px-4 py-4 text-sm text-foreground/80">
          <source src={src} />
          Your browser does not support the audio element.
        </audio>
      </div>
    </figure>
  )
}

interface GalleryItem {
  src: string
  alt: string
  caption?: string
}

interface GalleryProps {
  items: GalleryItem[]
}

function Gallery({ items }: GalleryProps) {
  if (!items?.length) {
    return null
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 my-10">
      {items.map((item, index) => (
        <figure
          key={`${item.src}-${item.alt ?? index}`}
          className="overflow-hidden rounded-xl border border-highlight-high/20 bg-surface/40 shadow-lg"
        >
          <ImageWithFallback
            src={item.src}
            alt={item.alt}
            width={800}
            height={600}
            className="aspect-video h-auto w-full object-contain bg-base"
            sizes="(min-width: 768px) 400px, 100vw"
            loading="lazy"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            fallbackVariant="gallery"
          />
          {item.caption && (
            <figcaption className="text-sm text-muted-foreground px-4 py-3 border-t border-highlight-high/10">
              {item.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}

function Callout({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <Card className={clsx("border-love/30 bg-love/10 text-love my-8", className)}>
      <CardContent className="py-6">{children}</CardContent>
    </Card>
  )
}

function Quote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="border-l-4 border-love pl-6 italic text-xl text-love/80 my-10">{children}</blockquote>
  )
}

function Markdown({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("space-y-6", className)}>{children}</div>
}

function Code({ children }: { children: ReactNode }) {
  return <pre className="rounded-lg bg-[#191724] border border-highlight-high/20 p-4 overflow-x-auto">{children}</pre>
}

function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="my-8 overflow-x-auto rounded-lg border border-highlight-high/20">
      <table className={clsx("w-full text-sm", className)} {...props} />
    </div>
  )
}

function TableHead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={clsx("border-b border-highlight-high/20 bg-surface/60", className)} {...props} />
}

function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={clsx("divide-y divide-highlight-high/10", className)} {...props} />
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={clsx("transition-colors hover:bg-surface/40", className)} {...props} />
}

function TableHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={clsx("px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-gold/70", className)}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={clsx("px-4 py-3 text-sm text-muted-foreground", className)} {...props} />
}

export const mdxComponents = {
  h1: ({ children, className, ...props }: ComponentProps<"h1">) => (
    <p className={clsx("text-sm uppercase tracking-[0.3em] text-gold/70", className)} {...props}>
      {children}
    </p>
  ),
  h2: createHeading("h2"),
  h3: createHeading("h3"),
  p: Paragraph,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  a: Anchor,
  code: InlineCode,
  pre: Pre,
  img: Img,
  Image: MDXImage,
  Video,
  Embed,
  LinkButton,
  Gallery,
  AudioPlayer,
  Callout,
  Quote,
  Markdown,
  Code,
  Badge,
  RelatedContent,
  Mermaid: MermaidDiagram,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell,
}

export type MDXComponentMap = typeof mdxComponents
