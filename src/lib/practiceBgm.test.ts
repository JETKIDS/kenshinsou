import { describe, expect, test } from 'vitest'
import { exerciseBgmPattern } from './practiceBgm'

describe('exerciseBgmPattern', () => {
  test('uses a short workout loop with percussion and lead parts', () => {
    expect(exerciseBgmPattern.loopSeconds).toBeLessThanOrEqual(2)
    expect(exerciseBgmPattern.parts.map((part) => part.role)).toEqual(
      expect.arrayContaining(['kick', 'hat', 'bass', 'lead']),
    )
  })

  test('keeps generated exercise music loud enough for workout playback', () => {
    expect(exerciseBgmPattern.masterVolume).toBeGreaterThanOrEqual(0.1)
    expect(exerciseBgmPattern.masterVolume).toBeLessThanOrEqual(0.13)
  })
})
