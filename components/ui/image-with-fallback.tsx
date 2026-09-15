"use client"

import Image, { type ImageProps } from "next/image"
import { useEffect, useMemo, useState, type CSSProperties } from "react"
import clsx from "clsx"
import { GearPlaceholder } from "@/components/gear-placeholder"

type FallbackVariant = "card" | "hero" | "support" | "gallery" | "default"

const ICON_SIZE: Record<FallbackVariant, string> = {
  card: "h-16 w-16",
  hero: "h-24 w-24",
  support: "h-20 w-20",
  gallery: "h-16 w-16",
  default: "h-16 w-16",
}

export interface ImageWithFallbackProps extends ImageProps {
  fallbackVariant?: FallbackVariant
  fallbackClassName?: string
}

export function ImageWithFallback({
  fallbackVariant = "default",
  fallbackClassName,
  src,
  onError,
  fill,
  className,
  style,
  ...rest
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [src])

  const { width, height, ...imageProps } = rest as ImageWithFallbackProps & {
    width?: number | `${number}`
    height?: number | `${number}`
  }

  const widthValue = useMemo(() => {
    if (typeof width === "number") return width
    if (typeof width === "string") return parseInt(width, 10) || undefined
    return undefined
  }, [width])

  const heightValue = useMemo(() => {
    if (typeof height === "number") return height
    if (typeof height === "string") return parseInt(height, 10) || undefined
    return undefined
  }, [height])

  const sanitizedStyle = useMemo(() => {
    if (!style) return undefined
    const rest = { ...(style as CSSProperties) }
    delete rest.width
    delete rest.height
    return rest
  }, [style])

  if (hasError) {
    if (!fill && widthValue && heightValue) {
      return (
        <div
          className={clsx("relative block w-full overflow-hidden", fallbackClassName)}
          style={{
            aspectRatio: `${widthValue}/${heightValue}`,
            ...sanitizedStyle,
          }}
        >
          <GearPlaceholder
            className="absolute inset-0"
            iconClassName={ICON_SIZE[fallbackVariant] ?? ICON_SIZE.default}
          />
        </div>
      )
    }

    return (
      <GearPlaceholder
        className={clsx(fill ? "absolute inset-0" : "h-full w-full", fallbackClassName)}
        iconClassName={ICON_SIZE[fallbackVariant] ?? ICON_SIZE.default}
        style={sanitizedStyle}
      />
    )
  }

  return (
    <Image
      {...imageProps}
      className={className}
      style={style}
      fill={fill}
      width={widthValue}
      height={heightValue}
      src={src}
      onError={(event) => {
        if (!hasError) {
          setHasError(true)
        }
        onError?.(event)
      }}
    />
  )
}
