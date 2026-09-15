import type { CSSProperties } from "react"
import clsx from "clsx"
import { Cog } from "lucide-react"

interface GearPlaceholderProps {
  className?: string
  iconClassName?: string
  style?: CSSProperties
}

export function GearPlaceholder({ className, iconClassName, style }: GearPlaceholderProps) {
  return (
    <div
      className={clsx(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#1f1b2c] via-[#2b2640] to-[#15121f]",
        className
      )}
      style={style}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(236,196,140,0.18),_transparent_55%)]" />
      <Cog className={clsx("ambient-motion text-gold/70 opacity-90 animate-[spin_14s_linear_infinite]", iconClassName ?? "h-16 w-16")} />
    </div>
  )
}
