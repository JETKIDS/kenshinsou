export type PracticeBgm = {
  stop: () => void
}

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

type BgmPart = {
  role: 'kick' | 'hat' | 'bass' | 'lead'
  offsets: number[]
}

export const exerciseBgmPattern: {
  loopSeconds: number
  masterVolume: number
  parts: BgmPart[]
} = {
  loopSeconds: 1.6,
  masterVolume: 0.055,
  parts: [
    { role: 'kick', offsets: [0, 0.8] },
    { role: 'hat', offsets: [0.2, 0.6, 1, 1.4] },
    { role: 'bass', offsets: [0, 0.4, 0.8, 1.2] },
    { role: 'lead', offsets: [0.2, 0.6, 1, 1.4] },
  ],
}

export function createPracticeBgm(): PracticeBgm | null {
  const audioWindow = window as AudioContextWindow
  const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext

  if (!AudioContextConstructor) {
    return null
  }

  const context = new AudioContextConstructor()
  const masterGain = context.createGain()
  const phraseTimer = window.setInterval(playLoop, exerciseBgmPattern.loopSeconds * 1000)
  let step = 0

  masterGain.gain.value = exerciseBgmPattern.masterVolume
  masterGain.connect(context.destination)
  playLoop()

  function playKick(startsAt: number) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(150, startsAt)
    oscillator.frequency.exponentialRampToValueAtTime(55, startsAt + 0.18)
    gain.gain.setValueAtTime(0.001, startsAt)
    gain.gain.linearRampToValueAtTime(1, startsAt + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, startsAt + 0.24)

    oscillator.connect(gain)
    gain.connect(masterGain)
    oscillator.start(startsAt)
    oscillator.stop(startsAt + 0.26)
  }

  function playHat(startsAt: number) {
    const bufferSize = Math.floor(context.sampleRate * 0.05)
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)
    const noise = context.createBufferSource()
    const gain = context.createGain()
    const filter = context.createBiquadFilter()

    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1
    }

    filter.type = 'highpass'
    filter.frequency.value = 6800
    gain.gain.setValueAtTime(0.001, startsAt)
    gain.gain.linearRampToValueAtTime(0.18, startsAt + 0.005)
    gain.gain.exponentialRampToValueAtTime(0.001, startsAt + 0.05)

    noise.buffer = buffer
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)
    noise.start(startsAt)
    noise.stop(startsAt + 0.06)
  }

  function playBass(frequency: number, startsAt: number) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, startsAt)
    gain.gain.setValueAtTime(0.001, startsAt)
    gain.gain.linearRampToValueAtTime(0.22, startsAt + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, startsAt + 0.22)

    oscillator.connect(gain)
    gain.connect(masterGain)
    oscillator.start(startsAt)
    oscillator.stop(startsAt + 0.24)
  }

  function playLead(frequency: number, startsAt: number) {
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(frequency, startsAt)
    gain.gain.setValueAtTime(0.001, startsAt)
    gain.gain.linearRampToValueAtTime(0.18, startsAt + 0.03)
    gain.gain.exponentialRampToValueAtTime(0.001, startsAt + 0.18)

    oscillator.connect(gain)
    gain.connect(masterGain)
    oscillator.start(startsAt)
    oscillator.stop(startsAt + 0.2)
  }

  function playLoop() {
    const startsAt = context.currentTime + 0.04
    const bassNotes = [130.81, 146.83, 164.81, 196]
    const leadNotes = [523.25, 587.33, 659.25, 783.99]

    for (const offset of exerciseBgmPattern.parts[0].offsets) {
      playKick(startsAt + offset)
    }

    for (const offset of exerciseBgmPattern.parts[1].offsets) {
      playHat(startsAt + offset)
    }

    exerciseBgmPattern.parts[2].offsets.forEach((offset, index) => {
      playBass(bassNotes[(step + index) % bassNotes.length], startsAt + offset)
    })

    exerciseBgmPattern.parts[3].offsets.forEach((offset, index) => {
      playLead(leadNotes[(step + index) % leadNotes.length], startsAt + offset)
    })

    step = (step + 1) % bassNotes.length
  }

  return {
    stop: () => {
      window.clearInterval(phraseTimer)
      masterGain.gain.setTargetAtTime(0.001, context.currentTime, 0.08)
      window.setTimeout(() => void context.close(), 220)
    },
  }
}
