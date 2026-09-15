import { createReactionDiffusion, PATTERN_STEPS_PER_SECOND, PATTERN_WARMUP_STEPS } from "./reaction-diffusion"

type Command =
  | { type: "start"; size: number; fps: number; paused: boolean; seed: number }
  | { type: "pause"; paused: boolean }
  | { type: "recycle"; buffer: ArrayBuffer }

let simulation: ReturnType<typeof createReactionDiffusion> | null = null
let pixels: Uint8ClampedArray<ArrayBuffer> | null = null
let size = 0
let fps = 12
let paused = true
let elapsed = 0
let timer: ReturnType<typeof setTimeout> | undefined

function schedule(delay: number) {
  if (!paused && timer === undefined) timer = setTimeout(tick, delay)
}

function tick() {
  timer = undefined
  if (paused || !simulation) return

  if (simulation.steps < PATTERN_WARMUP_STEPS) {
    // Short batches allow pause messages to interrupt initialization too.
    const started = performance.now()
    do {
      simulation.step()
    } while (simulation.steps < PATTERN_WARMUP_STEPS && performance.now() - started < 6)

    if (simulation.steps < PATTERN_WARMUP_STEPS) {
      schedule(0)
      return
    }
  }

  // At most one frame is in flight. A busy page never accumulates a frame queue.
  if (pixels) {
    const started = performance.now()
    for (let step = 0; step < PATTERN_STEPS_PER_SECOND / fps; step++) {
      simulation.step()
      // Keep faster evolution from monopolizing a core on slower devices.
      if (performance.now() - started >= 6) break
    }
    simulation.render(pixels)
    elapsed += 1 / fps
    const buffer = pixels.buffer
    pixels = null
    self.postMessage({ type: "frame", size, steps: simulation.steps, elapsed, buffer }, { transfer: [buffer] })
  }
  schedule(1000 / fps)
}

self.onmessage = (event: MessageEvent<Command>) => {
  const command = event.data
  if (command.type === "start") {
    clearTimeout(timer)
    timer = undefined
    size = command.size
    fps = command.fps
    paused = command.paused
    simulation = createReactionDiffusion(size, size, command.seed)
    elapsed = 0
    pixels = new Uint8ClampedArray(size * size * 4)
    schedule(0)
  } else if (command.type === "pause") {
    paused = command.paused
    clearTimeout(timer)
    timer = undefined
    schedule(0)
  } else if (command.type === "recycle" && command.buffer.byteLength === size * size * 4) {
    pixels = new Uint8ClampedArray(command.buffer)
  }
}
