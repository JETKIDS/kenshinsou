import { describe, expect, it } from 'vitest'
import type { Exercise } from '../data/exercises'
import { selectWorkout } from './selectWorkout'

const exercises: Exercise[] = Array.from({ length: 8 }, (_, index) => ({
  id: `move-${index + 1}`,
  title: `動作 ${index + 1}`,
  description: `説明 ${index + 1}`,
  durationSeconds: 60,
  videoSrc: `/videos/move-${String(index + 1).padStart(2, '0')}.mp4`,
}))

describe('selectWorkout', () => {
  it('selects five unique exercises when enough exercises exist', () => {
    const selected = selectWorkout(exercises, 5)

    expect(selected).toHaveLength(5)
    expect(new Set(selected.map((exercise) => exercise.id)).size).toBe(5)
  })

  it('returns all exercises when requested count is larger than the library', () => {
    const smallLibrary = exercises.slice(0, 3)

    const selected = selectWorkout(smallLibrary, 5)

    expect(selected).toHaveLength(3)
    expect(new Set(selected.map((exercise) => exercise.id)).size).toBe(3)
  })

  it('does not mutate the original exercise order', () => {
    const originalOrder = exercises.map((exercise) => exercise.id)

    selectWorkout(exercises, 5)

    expect(exercises.map((exercise) => exercise.id)).toEqual(originalOrder)
  })
})
