import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { exercises } from './data/exercises'
import { getInitialWorkout } from './lib/getInitialWorkout'
import { selectWorkout } from './lib/selectWorkout'

const workoutSize = 5
const previewSeconds = 5

type PlaybackPhase = 'ready' | 'preview' | 'playing' | 'finished'
type PracticeBgm = {
  stop: () => void
}

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext
}

function createPracticeBgm(): PracticeBgm | null {
  const audioWindow = window as AudioContextWindow
  const AudioContextConstructor = window.AudioContext ?? audioWindow.webkitAudioContext

  if (!AudioContextConstructor) {
    return null
  }

  const context = new AudioContextConstructor()
  const masterGain = context.createGain()
  const phraseTimer = window.setInterval(playPhrase, 3200)
  const scale = [261.63, 293.66, 329.63, 392, 440, 392, 329.63, 293.66]
  let step = 0

  masterGain.gain.value = 0.045
  masterGain.connect(context.destination)
  playPhrase()

  function playTone(frequency: number, startsAt: number, duration: number) {
    const oscillator = context.createOscillator()
    const toneGain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, startsAt)
    toneGain.gain.setValueAtTime(0.001, startsAt)
    toneGain.gain.linearRampToValueAtTime(0.75, startsAt + 0.08)
    toneGain.gain.exponentialRampToValueAtTime(0.001, startsAt + duration)

    oscillator.connect(toneGain)
    toneGain.connect(masterGain)
    oscillator.start(startsAt)
    oscillator.stop(startsAt + duration + 0.05)
  }

  function playPhrase() {
    const startsAt = context.currentTime + 0.04
    const root = scale[step % scale.length]
    const third = scale[(step + 2) % scale.length]
    const fifth = scale[(step + 4) % scale.length]

    playTone(root, startsAt, 2.8)
    playTone(third, startsAt + 0.08, 2.5)
    playTone(fifth / 2, startsAt + 0.16, 2.6)
    step += 1
  }

  return {
    stop: () => {
      window.clearInterval(phraseTimer)
      masterGain.gain.setTargetAtTime(0.001, context.currentTime, 0.08)
      window.setTimeout(() => void context.close(), 220)
    },
  }
}

function App() {
  const initialWorkout = useMemo(() => getInitialWorkout(exercises, workoutSize), [])
  const [workout, setWorkout] = useState(initialWorkout)
  const [activeId, setActiveId] = useState(initialWorkout[0]?.id ?? '')
  const [phase, setPhase] = useState<PlaybackPhase>('ready')
  const [previewCountdown, setPreviewCountdown] = useState(previewSeconds)
  const bgmRef = useRef<PracticeBgm | null>(null)

  const activeExercise = workout.find((exercise) => exercise.id === activeId) ?? workout[0]
  const activeIndex = activeExercise
    ? workout.findIndex((exercise) => exercise.id === activeExercise.id)
    : -1
  const totalMinutes = Math.round(
    workout.reduce((total, exercise) => total + exercise.durationSeconds, 0) / 60,
  )
  const statusLabel =
    phase === 'ready'
      ? 'スタート前'
      : phase === 'preview'
        ? '次の動作'
        : phase === 'playing'
          ? '実践中'
          : '完了'
  const videoKey = activeExercise ? `${activeExercise.id}-${phase}` : phase
  const isWorkoutRunning = phase === 'preview' || phase === 'playing'

  function stopBgm() {
    bgmRef.current?.stop()
    bgmRef.current = null
  }

  function startBgm() {
    stopBgm()
    bgmRef.current = createPracticeBgm()
  }

  useEffect(() => {
    if (phase !== 'preview' || !activeExercise) {
      return
    }

    const countdownTimer = window.setInterval(() => {
      setPreviewCountdown((seconds) => Math.max(1, seconds - 1))
    }, 1000)

    const previewTimer = window.setTimeout(() => {
      setPhase('playing')
    }, previewSeconds * 1000)

    return () => {
      window.clearInterval(countdownTimer)
      window.clearTimeout(previewTimer)
    }
  }, [activeExercise, phase])

  useEffect(() => {
    if (phase !== 'finished') {
      return
    }

    stopBgm()
  }, [phase])

  useEffect(() => {
    return () => stopBgm()
  }, [])

  function generateWorkout() {
    stopBgm()
    const nextWorkout = selectWorkout(exercises, workoutSize)
    setWorkout(nextWorkout)
    setActiveId(nextWorkout[0]?.id ?? '')
    setPreviewCountdown(previewSeconds)
    setPhase(nextWorkout.length > 0 ? 'ready' : 'finished')
  }

  function selectExercise(id: string) {
    stopBgm()
    setActiveId(id)
    setPreviewCountdown(previewSeconds)
    setPhase('ready')
  }

  function startWorkout() {
    startBgm()
    setPreviewCountdown(previewSeconds)
    setPhase(activeExercise ? 'preview' : 'finished')
  }

  function stopWorkout() {
    stopBgm()
    setPreviewCountdown(previewSeconds)
    setPhase('ready')
  }

  function advanceExercise() {
    if (activeIndex < 0) {
      setPhase('finished')
      return
    }

    const nextExercise = workout[activeIndex + 1]

    if (!nextExercise) {
      setPhase('finished')
      return
    }

    setActiveId(nextExercise.id)
    setPreviewCountdown(previewSeconds)
    setPhase('preview')
  }

  return (
    <main className="app-shell">
      <section className="hero-panel" aria-label="現在の運動">
        <div className="app-kicker">Short daily practice</div>
        <h1>古式健身操アプリ</h1>
        <p className="hero-copy">
          編集済みの短尺動画から5動作を選び、流れに沿って身体を整えます。
        </p>

        {activeExercise ? (
          <div className="video-card">
            {phase === 'finished' ? (
              <div className="finished-panel">
                <span>本日の流れが終わりました</span>
                <strong>おつかれさまでした</strong>
              </div>
            ) : (
              <div className="video-stage">
                <video
                  key={videoKey}
                  className="exercise-video"
                  src={activeExercise.videoSrc}
                  autoPlay={phase !== 'ready'}
                  controls={phase === 'playing'}
                  muted
                  onEnded={phase === 'playing' ? advanceExercise : undefined}
                  playsInline
                  preload="metadata"
                >
                  このブラウザでは動画を再生できません。
                </video>
                {phase === 'preview' ? (
                  <div className="preview-overlay" aria-live="polite">
                    <span>NEXT</span>
                    <strong>{previewCountdown}</strong>
                  </div>
                ) : null}
              </div>
            )}
            <div className="active-meta">
              <span>{statusLabel}</span>
              <strong>{activeExercise.title}</strong>
              <p>
                {phase === 'ready'
                  ? 'スタートを押すと、BGM付きでこの5動作をプレビューから最後まで自動再生します。'
                  : phase === 'preview'
                    ? `冒頭${previewSeconds}秒で次の動作を確認します。`
                    : phase === 'playing'
                      ? `${activeExercise.description} 自動再生中です。必要に応じて動画コントロールで一時停止できます。`
                      : '新しい5動作を選ぶと、また最初のプレビューから始まります。'}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      <section className="workout-panel" aria-label="今日の5動作">
        <div className="panel-header">
          <div>
            <p className="section-label">Today's flow</p>
            <h2>今日の5動作</h2>
          </div>
          <span className="duration-pill">約{totalMinutes}分</span>
        </div>

        <div className="workout-actions">
          <button className="start-button" type="button" onClick={startWorkout}>
            スタート
          </button>
          <button
            className="stop-button"
            type="button"
            onClick={stopWorkout}
            disabled={!isWorkoutRunning}
          >
            ストップ
          </button>
          <button className="generate-button" type="button" onClick={generateWorkout}>
            今日の5動作を選ぶ
          </button>
        </div>

        <ol className="exercise-list">
          {workout.map((exercise, index) => (
            <li key={exercise.id}>
              <button
                className={exercise.id === activeExercise?.id ? 'exercise-item active' : 'exercise-item'}
                type="button"
                onClick={() => selectExercise(exercise.id)}
              >
                <span className="exercise-number">{index + 1}</span>
                <span className="exercise-text">
                  <strong>{exercise.title}</strong>
                  <small>{exercise.durationSeconds}秒 / {exercise.id}</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}

export default App
