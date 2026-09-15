import type { Metadata } from "next"
import Link from "next/link"
import { PrintCVButton } from "@/components/print-cv-button"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "CV",
  description: "Joshua Tjhie's education and selected software projects.",
  alternates: { canonical: "/cv" },
}

const projects = [
  { slug: "dotdeck", title: "Dotdeck", stack: "Next.js, TypeScript, Express, MySQL",
    detail: "Built the frontend and backend of a configuration-sharing application with search, snippets, image uploads, and account permissions." },
  { slug: "copperfall", title: "Copperfall", stack: "JavaScript, Canvas, HTML, CSS",
    detail: "Built a browser game and its engine, including scene and component lifecycles, collisions, controller input, and a world assembled from small PNG blueprints." },
  { slug: "the-circussy-one", title: "The Circussy One", stack: "Unity, C#, UI Toolkit, Wwise",
    detail: "A roguelite prototype with generated terrain and custom authoring tools. The project writeup covers enemy traversal diagnostics and a fix for blocking texture work during loading." },
  { slug: "brickphone", title: "Brickphone", stack: "ESP32-S3, Arduino C++, TypeScript",
    detail: "Built a handheld project with Josephina Steinböck and Maxim Pollak. The prototype combines physical controls, small games, recording, and a voice assistant." },
  { slug: "cropped-reality", title: "Cropped Reality", stack: "Unity, C# · 48-hour game jam",
    detail: "Worked on audio, design, and game polish with Georg Becker, Christof Kuba, and Laura Cesar. Our team won the Reality Deconstructed challenge at Truth, Lies & Democracy 2025." },
]

export default function CVPage() {
  return <article className="cv-page mx-auto max-w-4xl px-5 py-16 md:px-8">
    <header className="mb-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-bold text-rose">Joshua Tjhie</h1>
        <PrintCVButton />
      </div>
      <p className="text-lg">Software Developer · {siteConfig.location}</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-foam">
        <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        <a href={siteConfig.links.github}>github.com/chifunt</a>
        <a href={siteConfig.links.linkedin}>linkedin.com/in/joshuatjhie</a>
        <a href={siteConfig.url}>joshuatjhie.com</a>
      </div>
    </header>
    <section aria-labelledby="cv-education" className="mb-10">
      <h2 id="cv-education" className="mb-5 text-xl font-semibold text-gold">Education</h2>
      <div className="mb-5">
        <h3 className="font-semibold">{siteConfig.education.degree}</h3>
        <p>{siteConfig.education.institution}</p>
        <p className="text-sm text-muted-foreground">September 2024 to {siteConfig.education.expectedGraduation}, expected</p>
      </div>
      <div>
        <h3 className="font-semibold">Certificate of Higher Education in Computer Science</h3>
        <p>University of Bristol</p>
        <p className="text-sm text-muted-foreground">September 2022 to August 2023</p>
      </div>
    </section>
    <section aria-labelledby="cv-projects">
      <h2 id="cv-projects" className="mb-5 text-xl font-semibold text-gold">Selected Projects</h2>
      <div className="space-y-6">
        {projects.map((project) => <section key={project.slug} className="cv-project">
          <h3 className="font-semibold"><Link className="underline decoration-love/50 underline-offset-4" href={`/projects/${project.slug}`}>{project.title}</Link></h3>
          <p className="mt-1 text-sm text-foam">{project.stack}</p>
          <p className="mt-2 max-w-[72ch] leading-relaxed text-muted-foreground">{project.detail}</p>
        </section>)}
      </div>
    </section>
  </article>
}
