import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-love/20 bg-gradient-to-r from-surface/90 via-overlay/90 to-surface/90 py-8">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-love/30 to-transparent" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">© {currentYear} Joshua Tjhie. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/chifunt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-love transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://www.linkedin.com/in/joshuatjhie/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-love transition-colors"
            >
              LinkedIn
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
