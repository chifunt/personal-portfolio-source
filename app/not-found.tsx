"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Page Not Found</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto text-pretty leading-relaxed">
            This page doesn't exist. Go back or return to the home page.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" onClick={() => window.history.back()}>
              <button type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go back
              </button>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <p className="text-sm text-muted-foreground mb-4">Browse the site:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/projects">Projects</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/extras">Extras</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
