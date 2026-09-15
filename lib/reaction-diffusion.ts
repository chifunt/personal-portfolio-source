export const PATTERN_WARMUP_STEPS = 1600
export const PATTERN_STEPS_PER_SECOND = 192

// Gray-Scott with a normalized nine-point Laplacian and periodic boundaries.
// These are visual settings for the portfolio, not the thesis evaluation model.
const DIFFUSION_U = 1
const DIFFUSION_V = 0.5

// Correlated feed/kill pairs keep the tour within pattern-forming regions.
const REGIMES = [
  { feed: 0.024, kill: 0.054 },
  { feed: 0.029, kill: 0.057 },
  { feed: 0.030, kill: 0.062 },
  { feed: 0.042, kill: 0.063 },
  { feed: 0.054, kill: 0.062 },
]

export function createReactionDiffusion(width: number, height: number, seed = 7) {
  const size = width * height
  let u = new Float32Array(size).fill(1)
  let v = new Float32Array(size)
  let nextU = new Float32Array(size)
  let nextV = new Float32Array(size)
  let stepCount = 0
  let randomState = seed >>> 0

  const random = () => {
    randomState = (Math.imul(1664525, randomState) + 1013904223) >>> 0
    return randomState / 4294967296
  }

  let regimeIndex = Math.floor(random() * REGIMES.length)
  let from = REGIMES[regimeIndex]
  let to = from
  let transitionStart = PATTERN_WARMUP_STEPS
  let transitionLength = 0

  const nextRegime = () => {
    from = to
    regimeIndex = (regimeIndex + 1 + Math.floor(random() * (REGIMES.length - 1))) % REGIMES.length
    to = REGIMES[regimeIndex]
    transitionLength = 800 + Math.floor(random() * 1000)
  }
  nextRegime()

  const feedBias = new Float32Array(size)
  const killBias = new Float32Array(size)
  const flowX = new Float32Array(height)
  const flowY = new Float32Array(width)
  const phaseX = random() * Math.PI * 2
  const phaseY = random() * Math.PI * 2
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const waveX = Math.sin(x / width * Math.PI * 2 + phaseX)
      const waveY = Math.sin(y / height * Math.PI * 2 + phaseY)
      feedBias[y * width + x] = (waveX + waveY) * 0.0008
      killBias[y * width + x] = (waveX - waveY) * 0.0003
    }
  }

  const left = new Int32Array(width)
  const right = new Int32Array(width)
  for (let x = 0; x < width; x++) {
    left[x] = (x + width - 1) % width
    right[x] = (x + 1) % width
  }

  // Elliptical seeds start with a mixture of short strands and rounded patches.
  const seedCount = 12 + Math.floor(random() * 8)
  for (let spot = 0; spot < seedCount; spot++) {
    const centerX = random() * width
    const centerY = random() * height
    const radiusX = 3 + random() * 6
    const radiusY = 2 + random() * 3
    const angle = random() * Math.PI
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX - Math.round((x - centerX) / width) * width
        const dy = y - centerY - Math.round((y - centerY) / height) * height
        const along = (dx * cos + dy * sin) / radiusX
        const across = (-dx * sin + dy * cos) / radiusY
        if (along * along + across * across < 1) {
          const index = y * width + x
          u[index] = 0.5 + random() * 0.04
          v[index] = 0.25 + random() * 0.04
        }
      }
    }
  }

  let nextDisturbance = PATTERN_WARMUP_STEPS + 180
  let disturbance: { start: number; duration: number; u: number; v: number; cells: { index: number; weight: number }[] } | null = null

  const stir = () => {
    if (stepCount >= nextDisturbance) {
      const centerX = Math.floor(random() * width)
      const centerY = Math.floor(random() * height)
      const radiusX = 4 + random() * 7
      const radiusY = 2 + random() * 4
      const angle = random() * Math.PI
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const extent = Math.ceil(Math.max(radiusX, radiusY))
      const cells: { index: number; weight: number }[] = []
      for (let dy = -extent; dy <= extent; dy++) {
        for (let dx = -extent; dx <= extent; dx++) {
          const along = (dx * cos + dy * sin) / radiusX
          const across = (-dx * sin + dy * cos) / radiusY
          const distance = along * along + across * across
          if (distance < 1) {
            const x = ((centerX + dx) % width + width) % width
            const y = ((centerY + dy) % height + height) % height
            cells.push({ index: y * width + x, weight: (1 - distance) ** 2 })
          }
        }
      }
      const grow = random() > 0.25
      const duration = 240 + Math.floor(random() * 180)
      disturbance = { start: stepCount, duration, u: grow ? 0.45 : 1, v: grow ? 0.3 : 0, cells }
      nextDisturbance = stepCount + duration + 120 + Math.floor(random() * 240)
    }

    if (!disturbance) return
    const progress = (stepCount - disturbance.start) / disturbance.duration
    if (progress >= 1) {
      disturbance = null
      return
    }
    // A soft pulse makes or opens a small strand without resetting the field.
    const strength = Math.sin(progress * Math.PI) ** 2 * 0.025
    for (const { index, weight } of disturbance.cells) {
      u[index] += (disturbance.u - u[index]) * weight * strength
      v[index] += (disturbance.v - v[index]) * weight * strength
    }
  }

  function step(iterations = 1) {
    for (let iteration = 0; iteration < iterations; iteration++) {
      if (stepCount >= transitionStart + transitionLength) {
        transitionStart = stepCount
        nextRegime()
      }
      const progress = Math.max(0, (stepCount - transitionStart) / transitionLength)
      const blend = progress * progress * (3 - 2 * progress)
      const feed = from.feed + (to.feed - from.feed) * blend
      const kill = from.kill + (to.kill - from.kill) * blend
      const liveSteps = Math.max(0, stepCount - PATTERN_WARMUP_STEPS)
      const flowStrength = Math.min(1, liveSteps / 240) * 0.018
      // Cross-axis velocities form gentle, periodic eddies with zero divergence.
      for (let y = 0; y < height; y++) {
        flowX[y] = Math.sin(y / height * Math.PI * 2 + phaseY + liveSteps / 1700) * flowStrength
      }
      for (let x = 0; x < width; x++) {
        flowY[x] = Math.cos(x / width * Math.PI * 2 + phaseX - liveSteps / 2100) * flowStrength
      }

      for (let y = 0; y < height; y++) {
        const row = y * width
        const above = ((y + height - 1) % height) * width
        const below = ((y + 1) % height) * width
        for (let x = 0; x < width; x++) {
          const i = row + x
          const l = left[x]
          const r = right[x]
          const a = u[i]
          const b = v[i]
          const localFeed = feed + feedBias[i]
          const localKill = kill + killBias[i]
          const lapU = -a + 0.2 * (u[row + l] + u[row + r] + u[above + x] + u[below + x])
            + 0.05 * (u[above + l] + u[above + r] + u[below + l] + u[below + r])
          const lapV = -b + 0.2 * (v[row + l] + v[row + r] + v[above + x] + v[below + x])
            + 0.05 * (v[above + l] + v[above + r] + v[below + l] + v[below + r])
          const reaction = a * b * b
          const advectU = 0.5 * (flowX[y] * (u[row + r] - u[row + l]) + flowY[x] * (u[below + x] - u[above + x]))
          const advectV = 0.5 * (flowX[y] * (v[row + r] - v[row + l]) + flowY[x] * (v[below + x] - v[above + x]))
          nextU[i] = Math.max(0, Math.min(1, a + DIFFUSION_U * lapU - reaction + localFeed * (1 - a) - advectU))
          nextV[i] = Math.max(0, Math.min(1, b + DIFFUSION_V * lapV + reaction - (localFeed + localKill) * b - advectV))
        }
      }

      ;[u, nextU] = [nextU, u]
      ;[v, nextV] = [nextV, v]
      stepCount++
      if (stepCount > PATTERN_WARMUP_STEPS) stir()
    }
  }

  function render(pixels: Uint8ClampedArray) {
    for (let i = 0; i < size; i++) {
      const concentration = Math.min(1, v[i] / 0.42)
      const contour = Math.exp(-Math.pow((concentration - 0.45) * 12, 2))
      const offset = i * 4
      // An alpha mask lets the page tint the small repeated field with its palette.
      pixels[offset] = 255
      pixels[offset + 1] = 255
      pixels[offset + 2] = 255
      pixels[offset + 3] = Math.min(255, (contour * 0.85 + concentration * 0.03) * 255)
    }
  }

  return {
    step,
    render,
    get steps() { return stepCount },
    get fields() { return { u, v } },
  }
}
