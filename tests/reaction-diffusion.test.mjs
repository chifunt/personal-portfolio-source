import assert from "node:assert/strict"
import { test } from "node:test"
import { createReactionDiffusion, PATTERN_STEPS_PER_SECOND, PATTERN_WARMUP_STEPS } from "../lib/reaction-diffusion.ts"

test("an unseeded field remains at its resting state", () => {
  const simulation = createReactionDiffusion(16, 16)
  simulation.fields.u.fill(1)
  simulation.fields.v.fill(0)
  simulation.step(100)
  assert.ok(simulation.fields.u.every(value => value === 1))
  assert.ok(simulation.fields.v.every(value => value === 0))
})

test("diffusion wraps across the border and updates neighbours simultaneously", () => {
  const simulation = createReactionDiffusion(16, 16)
  simulation.fields.u.fill(1)
  simulation.fields.v.fill(0)
  simulation.fields.v[8 * 16] = 0.1
  simulation.step()
  const field = simulation.fields.v
  assert.ok(field[8 * 16 + 1] > 0)
  assert.equal(field[8 * 16 + 1], field[8 * 16 + 15])
  assert.equal(field[8 * 16 + 1], field[7 * 16])
  assert.equal(field[8 * 16 + 2], 0)
})

test("the same seed is repeatable regardless of update batch size", () => {
  const first = createReactionDiffusion(64, 64, 7)
  const second = createReactionDiffusion(64, 64, 7)
  first.step(6000)
  for (let frame = 0; frame < 200; frame++) second.step(30)
  assert.deepEqual(first.fields, second.fields)
})

test("different seeds change the evolution as well as the initial layout", () => {
  const first = createReactionDiffusion(64, 64, 7)
  const second = createReactionDiffusion(64, 64, 1229)
  first.step(PATTERN_WARMUP_STEPS)
  second.step(PATTERN_WARMUP_STEPS)
  assert.notDeepEqual(first.fields, second.fields)
  // Even an identical starting field follows a different path on another visit.
  second.fields.u.set(first.fields.u)
  second.fields.v.set(first.fields.v)
  first.step(PATTERN_STEPS_PER_SECOND * 5)
  second.step(PATTERN_STEPS_PER_SECOND * 5)
  const meanDifference = first.fields.v.reduce((sum, value, index) => sum + Math.abs(value - second.fields.v[index]), 0) / first.fields.v.length
  assert.ok(meanDifference > 0.01)
})

test("different visits stay bounded, varied, and active for ten minutes", () => {
  for (const seed of [7, 1229, 987654321]) {
    const simulation = createReactionDiffusion(80, 80, seed)
    simulation.step(PATTERN_WARMUP_STEPS)
    for (let interval = 0; interval < 6; interval++) {
      const previous = Float32Array.from(simulation.fields.v)
      simulation.step(PATTERN_STEPS_PER_SECOND * 100)
      const { u, v } = simulation.fields
      assert.ok(u.every(value => Number.isFinite(value) && value >= 0 && value <= 1))
      assert.ok(v.every(value => Number.isFinite(value) && value >= 0 && value <= 1))
      const meanChange = v.reduce((sum, value, index) => sum + Math.abs(value - previous[index]), 0) / v.length
      const mean = v.reduce((sum, value) => sum + value, 0) / v.length
      const deviation = Math.sqrt(v.reduce((sum, value) => sum + (value - mean) ** 2, 0) / v.length)
      assert.ok(meanChange > 0.01, `Seed ${seed} stopped evolving at step ${simulation.steps}`)
      assert.ok(deviation > 0.035, `Seed ${seed} became uniform at step ${simulation.steps}`)
    }
  }
})

test("the rendered pattern changes over five seconds on both device grids", () => {
  for (const size of [112, 160]) {
    const simulation = createReactionDiffusion(size, size)
    simulation.step(PATTERN_WARMUP_STEPS)
    const before = new Uint8ClampedArray(size * size * 4)
    const after = new Uint8ClampedArray(before.length)
    simulation.render(before)
    simulation.step(PATTERN_STEPS_PER_SECOND * 5)
    simulation.render(after)
    let alphaChange = 0
    for (let i = 3; i < before.length; i += 4) alphaChange += Math.abs(before[i] - after[i])
    assert.ok(alphaChange / (size * size) > 5, `The ${size}px pattern barely changed`)
  }
})
