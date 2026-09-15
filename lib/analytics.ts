export function trackEvent(name: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return
  const va = (window as any).va
  if (typeof va?.track === "function") {
    va.track(name, data)
  }
}
