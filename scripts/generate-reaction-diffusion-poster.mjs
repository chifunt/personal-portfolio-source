import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import { createReactionDiffusion, PATTERN_WARMUP_STEPS } from "../lib/reaction-diffusion.ts"

const size = 160
const simulation = createReactionDiffusion(size, size)
simulation.step(PATTERN_WARMUP_STEPS)
const pixels = new Uint8ClampedArray(size * size * 4)
simulation.render(pixels)

await mkdir(new URL("../public/textures/", import.meta.url), { recursive: true })
const output = new URL("../public/textures/reaction-diffusion.webp", import.meta.url)
const result = await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
  .webp({ quality: 85, alphaQuality: 90 })
  .toFile(output.pathname)

console.log(`Saved ${output.pathname}, ${result.size} bytes`)
