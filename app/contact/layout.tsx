import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Joshua Tjhie about software development roles and projects.",
  alternates: { canonical: "/contact" },
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
