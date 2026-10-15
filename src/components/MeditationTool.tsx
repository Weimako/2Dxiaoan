import { useState, useEffect, useRef } from 'react'

interface MeditationToolProps {
  onBack: () => void
}

const guides = [
  '找一个最舒服的坐姿，让双肩自然下沉，下颚微收。',
  '闭上双眼，把注意力轻轻放回每一次气息的起伏上。',
  '如果脑海里冒出各种念头，不要责怪，让它们像溪水里的落叶一样飘走。',
  '感受空气流经鼻翼的清凉，再感受呼出时的微温。',
  '这里的空气很柔软，时间在这里慢了下来。',
  '你做得很好，给自己的心灵留出这一小块绿荫。',
  '小安一直在旁边安静地陪着你。',
  '慢慢把知觉带回手指与脚趾，轻轻呼吸。',
]

export function MeditationTool({ onBack }: MeditationToolProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(3)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [secondsLeft, setSecondsLeft] = useState<number>(3 * 60)
  const [guideIndex, setGuideIndex] = useState<number>(0)
  const [isFinished, setIsFinished] = useState<boolean>(false)

  const timerRef = useRef<number | null>(null)
  const guideTimerRef = useRef<number | null>(null)

  const totalSeconds = selectedMinutes * 60
  const progressPercent = Math.min(100, Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100))

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            setIsFinished(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      guideTimerRef.current = window.setInterval(() => {
        setGuideIndex((prev) => (prev + 1) % guides.length)
      }, 14000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      if (guideTimerRef.current) clearInterval(guideTimerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (guideTimerRef.current) clearInterval(guideTimerRef.current)
    }
  }, [isRunning])

  function handleSelectTime(mins: number) {
    if (isRunning) return
    setSelectedMinutes(mins)
    setSecondsLeft(mins * 60)
    setIsFinished(false)
  }

  function handleStart() {
    setIsFinished(false)
    setIsRunning(true)
  }

  function handlePause() {
    setIsRunning(false)
  }

  function handleReset() {
    setIsRunning(false)
    setSecondsLeft(selectedMinutes * 60)
    setIsFinished(false)
    setGuideIndex(0)
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="meditation-layout">
      {/* Time duration selector */}
      <div className="meditation-time-selector">
        <span>冥想时长：</span>
        {[3, 5, 10].map((minsOption) => (
          <button
            key={minsOption}
            type="button"
            className={`meditation-time-btn ${selectedMinutes === minsOption ? 'active' : ''}`}
            onClick={() => handleSelectTime(minsOption)}
            disabled={isRunning}
          >
            {minsOption} 分钟
          </button>
        ))}
      </div>

      {/* Main visual sphere with rotating guide */}
      <div className="meditation-stage">
        <div className={`meditation-halo ${isRunning ? 'active' : ''}`}>
          {/* Circular progress SVG */}
          <svg className="meditation-progress-svg" viewBox="0 0 260 260">
            <circle
              cx="130"
              cy="130"
              r="115"
              className="meditation-circle-bg"
            />
            <circle
              cx="130"
              cy="130"
              r="115"
              className="meditation-circle-bar"
              style={{
                strokeDasharray: 722,
                strokeDashoffset: 722 - (722 * progressPercent) / 100,
              }}
            />
          </svg>

          {/* Core countdown timer */}
          <div className="meditation-core-content">
            <div className="meditation-countdown">
              <span className="meditation-countdown-digits">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
              <span className="meditation-countdown-status">
                {isFinished ? '静心完成 🌿' : isRunning ? '深度冥想中' : '准备开始'}
              </span>
            </div>
          </div>
        </div>

        {/* Soothing guide prompt */}
        <div className="meditation-guide-box">
          <p className="meditation-guide-text">
            {isFinished ? '🌿 冥想已结束，带着安然与平静回到此刻的生活中吧。' : guides[guideIndex]}
          </p>
        </div>
      </div>

      {/* Action controls */}
      <div className="meditation-controls-row">
        {isFinished ? (
          <div className="meditation-finished-actions">
            <button className="primary-button" onClick={handleReset}>再来一次</button>
            <button className="secondary-button" onClick={onBack}>返回工具箱</button>
          </div>
        ) : isRunning ? (
          <>
            <button className="secondary-button" onClick={handlePause}>
              暂停
            </button>
            <button className="secondary-button" onClick={() => { setIsRunning(false); setIsFinished(true); }}>
              提前结束
            </button>
          </>
        ) : (
          <>
            <button className="primary-button meditation-start-btn" onClick={handleStart}>
              {secondsLeft < selectedMinutes * 60 ? '继续冥想' : '开始静心冥想'}
            </button>
            {secondsLeft < selectedMinutes * 60 && (
              <button className="secondary-button" onClick={handleReset}>
                重置
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
