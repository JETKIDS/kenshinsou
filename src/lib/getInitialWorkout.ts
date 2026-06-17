import type { Exercise } from '../data/exercises'

export function getInitialWorkout(exercises: Exercise[], count: number): Exercise[] {
  return exercises.slice(0, count)
}
