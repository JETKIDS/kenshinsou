import { describe, expect, it } from 'vitest'
import { exercises } from './exercises'

describe('exercises', () => {
  it('uses the taisou public clips as visible exercises', () => {
    expect(exercises[0]).toMatchObject({
      id: 'taisou-01',
      title: '古式健身操 動作 01',
      videoSrc: '/taisou/1.mp4',
    })

    expect(exercises[11]).toMatchObject({
      id: 'taisou-12',
      title: '古式健身操 動作 12',
      videoSrc: '/taisou/12.mp4',
    })
  })

  it('keeps a twelve-exercise library for random workout selection', () => {
    expect(exercises).toHaveLength(12)
  })
})
