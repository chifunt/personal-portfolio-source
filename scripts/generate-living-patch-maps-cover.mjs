import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import { createReactionDiffusion } from "../lib/reaction-diffusion.ts"

// A reproducible illustration from the portfolio simulation, not thesis results.
const size = 240
const simulation = createReactionDiffusion(size, size, 7)
simulation.step(3600)

const mask = new Uint8ClampedArray(size * size * 4)
const pixels = new Uint8ClampedArray(size * size * 3)
simulation.render(mask)
const background = [25, 23, 36]
const contour = [156, 207, 216]

for (let index = 0; index < size * size; index++) {
  const intensity = mask[index * 4 + 3] / 255
  for (let channel = 0; channel < 3; channel++) {
    pixels[index * 3 + channel] = Math.round(
      background[channel] + (contour[channel] - background[channel]) * intensity,
    )
  }
}

const directory = new URL("../content-assets/raw/living-patch-maps/", import.meta.url)
await mkdir(directory, { recursive: true })
const output = new URL("pattern-cover.png", directory)
await sharp(pixels, { raw: { width: size, height: size, channels: 3 } })
  .resize(1200, 1200)
  .png()
  .toFile(output.pathname)

console.log(`Saved ${output.pathname}. Run pnpm process-assets --slug living-patch-maps.`)
