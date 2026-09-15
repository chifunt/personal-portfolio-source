const FALLBACK_URL = "https://joshuatjhie.com"

function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envUrl) {
    try {
      const normalized =
        envUrl.startsWith("http://") || envUrl.startsWith("https://") ? envUrl : `https://${envUrl}`
      return new URL(normalized).toString()
    } catch {
      console.warn(`[site] Invalid NEXT_PUBLIC_SITE_URL provided: ${envUrl}`)
    }
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    try {
      return new URL(`https://${vercelUrl}`).toString()
    } catch {
      console.warn(`[site] Invalid VERCEL_URL provided: ${vercelUrl}`)
    }
  }

  return FALLBACK_URL
}

const SITE_URL = resolveSiteUrl()

export const siteConfig = {
  name: "Joshua Tjhie",
  titleTemplate: "%s · Joshua Tjhie",
  description: "Projects and notes by Joshua Tjhie, a full-stack and indie game developer based in Austria.",
  url: SITE_URL,
  creator: "Joshua Tjhie",
  role: "Full-stack and indie game developer",
  twitter: null as string | null,
  keywords: ["portfolio", "developer", "projects", "web development", "creative coding", "experiments"],
  location: "Austria",
  email: "joshuatjhie@pm.me",
  education: {
    degree: "BSc in Creative Computing",
    institution: "St. Pölten University of Applied Sciences",
    expectedGraduation: "June 2027",
  },
  links: {
    github: "https://github.com/chifunt",
    linkedin: "https://www.linkedin.com/in/joshuatjhie/",
  },
}

export function absoluteUrl(path = ""): string {
  return new URL(path, SITE_URL).toString()
}
