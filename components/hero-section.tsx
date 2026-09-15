"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Linkedin } from "@/components/brand-icons";
import { AsciiPortrait } from "@/components/ascii-portrait";
import { siteConfig } from "@/lib/site";

export function HeroSection() {

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
      >
        <svg
          className="hero-kanji select-none"
          width="128"
          height="384"
          viewBox="0 0 128 384"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="hero-kanji-love-gold" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-love) 8%, var(--color-base))" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-gold) 8%, var(--color-base))" />
            </linearGradient>
            <linearGradient id="hero-kanji-gold-pine" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-gold) 8%, var(--color-base))" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-pine) 8%, var(--color-base))" />
            </linearGradient>
            <linearGradient id="hero-kanji-pine-love" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-pine) 8%, var(--color-base))" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-love) 8%, var(--color-base))" />
            </linearGradient>
          </defs>
          <text x="64" y="64" fill="url(#hero-kanji-love-gold)" textAnchor="middle" dominantBaseline="central">
            徐
          </text>
          <text x="64" y="192" fill="url(#hero-kanji-gold-pine)" textAnchor="middle" dominantBaseline="central">
            鴻
          </text>
          <text x="64" y="320" fill="url(#hero-kanji-pine-love)" textAnchor="middle" dominantBaseline="central">
            達
          </text>
        </svg>
      </motion.div>

      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-1 flex justify-center scale-[1.2] pointer-events-none"
          >
            <AsciiPortrait />
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{ x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-2 space-y-6 text-center lg:text-left"
          >
            <div>
              <motion.h1
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance"
              >
                <span
                  className="ambient-motion hero-name-shift bg-gradient-to-r from-love via-gold to-pine bg-clip-text text-transparent bg-[length:200%_auto]"
                >
                  Joshua Tjhie
                </span>
              </motion.h1>
              <motion.p
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl md:text-2xl text-muted-foreground mb-5 text-pretty"
              >
                full-stack developer
                <br />
                indie game developer
              </motion.p>
              <p className="max-w-xl text-lg leading-relaxed text-foreground/90">
                I build web tools and game systems. My projects include a JavaScript engine,
                an ESP32 handheld, and tools for debugging generated worlds.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {siteConfig.education.degree}, expected {siteConfig.education.expectedGraduation}.
                <br />Based in {siteConfig.location}.
              </p>
            </div>

            <motion.div
              initial={{ y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <Button
                asChild
                size="lg"
                variant="gradient"
                className="font-semibold hover:scale-105 hover:shadow-gold/30 pulse-glow"
              >
                <Link href="/projects">View projects</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-gold hover:bg-gradient-to-r hover:from-love/10 hover:to-gold/10 hover:scale-105 hover:shadow-lg hover:shadow-gold/30 font-semibold bg-transparent"
              >
                <Link href="/cv">View CV</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-4 pt-4 justify-center lg:justify-start"
            >
              <Link
                href="https://github.com/chifunt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors hover:scale-105"
              >
                <Github className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://www.linkedin.com/in/joshuatjhie/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors hover:scale-105"
              >
                <Linkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </motion.div>
              <motion.p
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-sm text-muted-foreground leading-relaxed text-pretty"
              >
                Forging elegant systems that feel alive,
                <br />
                where syntax dreams in electric sleep.
                <br />
                The language feigns its rest,
                <br />
                as memory folds into motion.
              </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
