import { useState, useEffect, useRef } from 'react'

type Phase = 'idle' | 'ready' | 'inhale' | 'hold' | 'exhale' | 'finished'

interface BreathingExerciseProps {
  onBack: () => void
}

export function BreathingExercise({ onBack }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [timeLeft, setTimeLeft] = useState(4)
  const [cycles, setCycles] = useState(0)
  const [totalSeconds, setTotalSeconds] = useState(0)
  const timerRef = useRef<number | null>(null)
  const totalTimerRef = useRef<number | null>(null)

  const phaseConfig: Record<Phase, { name: string; duration: number; tip: string; scale: number }> = {
    idle: { name: '深呼吸练习', duration: 0, tip: '找一个舒服的姿势坐好，让双肩自然下沉。', scale: 1 },
    ready: { name: '准备开始', duration: 3, tip: '闭上眼睛或微垂视线，让思绪回到身体里。', scale: 1.05 },
    inhale: { name: '缓缓吸气', duration: 4, tip: '用鼻子慢慢吸入空气，感受腹部轻轻鼓起。', scale: 1.45 },
    hold: { name: '屏息停留', duration: 4, tip: '保持温和平静，让新鲜氧气流转全身。', scale: 1.45 },
    exhale: { name: '慢慢呼气', duration: 6, tip: '张开嘴或轻合双唇，把疲惫与浊气全部吐出。', scale: 0.95 },
    finished: { name: '练习完成', duration: 0, tip: '感受身心的微小变化，做得很好。', scale: 1 },
  }

  // Handle phase transitions
  useEffect(() => {
    if (phase === 'idle' || phase === 'finished') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const duration = phaseConfig[phase].duration
    setTimeLeft(duration)

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Switch to next phase
          if (phase === 'ready') {
            setPhase('inhale')
          } else if (phase === 'inhale') {
            setPhase('hold')
          } else if (phase === 'hold') {
            setPhase('exhale')
          } else if (phase === 'exhale') {
            setCycles((c) => {
              const nextCycle = c + 1
              if (nextCycle >= 4) {
                // Done 4 cycles
                setPhase('finished')
                return nextCycle
              } else {
                setPhase('inhale')
                return nextCycle
              }
            })
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Track total elapsed time when active
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'finished') {
      totalTimerRef.current = window.setInterval(() => {
        setTotalSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current)
    }
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current)
    }
  }, [phase])

  function start() {
    setCycles(0)
    setTotalSeconds(0)
    setPhase('ready')
  }

  function pause() {
    setPhase('idle')
  }

  function finish() {
    setPhase('finished')
  }

  const currentScale = phaseConfig[phase].scale

  return (
    <div className="breathing-container">
      <div className="breathing-visual-area">
        {/* Outer ambient wave rings */}
        <div
          className="breathing-ring-outer"
          style={{
            transform: `scale(${currentScale * 1.15})`,
            transition: phase === 'idle' ? 'transform 0.4s' : `transform ${phaseConfig[phase].duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        />
        <div
          className="breathing-ring-inner"
          style={{
            transform: `scale(${currentScale})`,
            transition: phase === 'idle' ? 'transform 0.4s' : `transform ${phaseConfig[phase].duration}s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {/* Centered countdown timer */}
          <div className="breathing-circle-core">
            <div className="breathing-countdown-center">
              <span className="breathing-countdown-num">
                {phase === 'idle' ? 4 : timeLeft}
              </span>
              <span className="breathing-phase-label">
                {phaseConfig[phase].name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {phase === 'finished' ? (
        <div className="breathing-finish-card">
          <div className="breathing-finish-badge">🌿 呼吸练习完成</div>
          <p>本次共完成了 <strong>{cycles || 4}</strong> 组深层腹式呼吸，用时 {Math.floor(totalSeconds / 60)} 分 {totalSeconds % 60} 秒。</p>
          <p className="finish-subtext">你的副交感神经已被温柔激活，肩颈与胸腔已经松弛下来。</p>
          <div className="breathing-actions">
            <button className="primary-button" onClick={start}>再练一组</button>
            <button className="secondary-button" onClick={onBack}>返回工具箱</button>
          </div>
        </div>
      ) : (
        <div className="breathing-footer">
          <div className="breathing-meta">
            <span>当前周期：{cycles} / 4 组</span>
            <span>总用时：{String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:{String(totalSeconds % 60).padStart(2, '0')}</span>
          </div>
          <div className="breathing-controls">
            {phase === 'idle' ? (
              <button className="primary-button breathing-btn-lg" onClick={start}>
                开始深呼吸
              </button>
            ) : (
              <>
                <button className="secondary-button" onClick={pause}>
                  暂停
                </button>
                <button className="primary-button" onClick={finish}>
                  提前完成
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
