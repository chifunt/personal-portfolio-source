"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Code2, Palette } from "lucide-react"

const extrasPreview = [
  {
    icon: Sparkles,
    title: "Experiments",
    description: "Creative coding experiments and interactive demos",
  },
  {
    icon: Code2,
    title: "Code Snippets",
    description: "Useful code snippets and mini-utilities",
  },
  {
    icon: Palette,
    title: "Design Studies",
    description: "UI/UX explorations and design prototypes",
  },
]

export function ExtrasTeaser() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent">
            Extras & Experiments
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Side projects, experiments, and creative explorations that didn't fit anywhere else
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {extrasPreview.map((extra, index) => {
            const Icon = extra.icon
            return (
              <motion.div
                key={extra.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group/card relative h-full overflow-hidden bg-gradient-to-br from-surface/50 to-overlay/30 p-0 transition-all duration-300 hover:border-love hover:shadow-lg hover:shadow-love/20 hover:from-love/5 hover:to-gold/5">
                  {/* Diagonal shine */}
                  <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-0 transition-opacity duration-300 group-hover/card:opacity-100">
                    <div className="absolute inset-0 -translate-x-full -translate-y-full bg-gradient-to-br from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover/card:translate-x-full group-hover/card:translate-y-full" />
                  </div>
                  <CardHeader className="p-6">
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-love/20 to-gold/20 transition-transform duration-300 group-hover/card:scale-110">
                      <Icon className="h-5 w-5 text-love" />
                    </div>
                    <CardTitle className="transition-colors duration-300 group-hover/card:text-love">{extra.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{extra.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <Button asChild size="lg" variant="gradient" className="pulse-glow">
            <Link href="/extras">Explore Extras</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
