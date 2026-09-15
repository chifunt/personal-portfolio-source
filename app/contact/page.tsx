"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import { Github, Linkedin } from "@/components/brand-icons"
import { siteConfig } from "@/lib/site"

const contactLinks = [
  { name: "Email", description: siteConfig.email, url: `mailto:${siteConfig.email}`, icon: Mail },
  {
    name: "GitHub",
    description: "Browse my repositories",
    url: siteConfig.links.github,
    icon: Github,
  },
  {
    name: "LinkedIn",
    description: "Send me a message",
    url: siteConfig.links.linkedin,
    icon: Linkedin,
  },
]

export default function ContactPage() {
  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-love to-gold bg-clip-text text-transparent text-balance">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            I'm a Creative Computing student based in Austria, with graduation expected in June 2027. Email me about a software development role or a project you'd like to discuss.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {contactLinks.map((link, index) => {
            const Icon = link.icon
            return (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <Card className="h-full p-0 hover:border-love transition-all duration-300 ease-in-out overflow-hidden bg-gradient-to-br from-surface via-overlay to-highlight-low hover:shadow-lg hover:shadow-love/20 relative cursor-pointer group-hover:scale-[1.02] group-hover:[transform:perspective(1000px)_rotateX(2deg)]">
                  {/* Diagonal shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent translate-x-[-100%] translate-y-[-100%] group-hover:translate-x-[100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-out" />
                  </div>

                  <CardHeader className="text-center px-6 py-6">
                    <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-love/20 to-gold/20 flex items-center justify-center group-hover:from-love/30 group-hover:to-gold/30 transition-all duration-300 group-hover:scale-110">
                      <Icon className="h-8 w-8 text-love group-hover:text-gold transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-love transition-colors duration-300">
                      {link.name}
                    </CardTitle>
                    <CardDescription className="leading-relaxed">{link.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.a>
            )
          })}
        </div>

        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="bg-surface/50">
            <CardHeader>
              <CardTitle className="text-2xl">Education and Selected Work</CardTitle>
              <CardDescription className="text-[1rem] leading-relaxed">
                My CV links to the projects, technical writeups, and source code.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                size="lg"
                variant="gradient"
                className="font-semibold hover:scale-105 hover:shadow-gold/30 pulse-glow"
              >
                <a href="/cv">
                  View CV
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
