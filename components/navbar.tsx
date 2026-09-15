"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef, useState } from "react"
import { Menu, Pause, Play, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSiteMotion } from "@/components/site-motion"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/extras", label: "Extras" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)
  const { paused, toggleMotion } = useSiteMotion()

  const isItemActive = (href: string) => {
    if (!pathname) return false
    if (href === "/") {
      return pathname === "/"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav aria-label="Main navigation" onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        setOpen(false)
        menuButton.current?.focus()
      }
    }} className="sticky top-0 z-50 border-b border-love/20 bg-gradient-to-r from-surface/90 via-overlay/90 to-surface/90 backdrop-blur-md shadow-lg shadow-love/5">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-love via-gold to-rose bg-clip-text text-transparent hover:scale-110 transition-transform duration-300 ease-in-out"
          >
            JT
          </Link>

          {/* Desktop nav */}
          <div className="flex items-center gap-4 md:gap-6">
            <ul className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isItemActive(item.href) ? "page" : undefined}
                    className={cn(
                      "relative text-sm font-medium transition-all duration-300 ease-in-out hover:text-love group",
                      isItemActive(item.href) ? "text-love" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-love to-gold transition-all duration-300 ease-in-out",
                        isItemActive(item.href) ? "w-full" : "w-0 group-hover:w-full",
                      )}
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="motion-toggle flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-love/10 hover:text-love focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold transition-colors"
              onClick={toggleMotion}
              aria-label={paused ? "Resume animations" : "Pause animations"}
              title={paused ? "Resume animations" : "Pause animations"}
            >
              {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
            </button>

            {/* Mobile hamburger */}
            <button
              ref={menuButton}
              type="button"
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-md text-muted-foreground hover:text-love transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
        <div id="mobile-navigation" hidden={!open} className="md:hidden border-t border-love/10 bg-gradient-to-b from-overlay/95 to-surface/95 backdrop-blur-md">
          <ul className="container mx-auto flex flex-col px-4 py-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isItemActive(item.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center py-3 text-sm font-medium transition-colors duration-200 border-b border-love/10 last:border-0",
                    isItemActive(item.href) ? "text-love" : "text-muted-foreground hover:text-love",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-love/30 to-transparent" />
    </nav>
  )
}
