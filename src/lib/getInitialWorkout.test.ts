import { describe, expect, it } from 'vitest'
import type { Exercise } from '../data/exercises'
import { getInitialWorkout } from './getInitialWorkout'

const exercises: Exercise[] = Array.from({ length: 8 }, (_, index) => ({
  id: `move-${index + 1}`,
  title: `動作 ${index + 1}`,
  description: `説明 ${index + 1}`,
  durationSeconds: 60,
  videoSrc: `/videos/move-${String(index + 1).padStart(2, '0')}.mp4`,
}))

describe('getInitialWorkout', () => {
  it('returns the first exercises so sample videos are visible on first load', () => {
    const selected = getInitialWorkout(exercises, 5)

    expect(selected.map((exercise) => exercise.id)).toEqual([
      'move-1',
      'move-2',
      'move-3',
      'move-4',
      'move-5',
    ])
  })

  it('does not mutate the exercise library', () => {
    const originalOrder = exercises.map((exercise) => exercise.id)

    getInitialWorkout(exercises, 5)

    expect(exercises.map((exercise) => exercise.id)).toEqual(originalOrder)
  })
})
