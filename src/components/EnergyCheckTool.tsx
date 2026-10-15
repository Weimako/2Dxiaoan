import { useState } from 'react'
import { EnergyResult } from '../types'

export type EnergySourceOrigin = 'home' | 'tools' | 'energy-toolbox'

interface EnergyCheckToolProps {
  onBack: (fromSource?: EnergySourceOrigin | string | null) => void
  onComplete?: (result: EnergyResult) => void
  fromSource?: EnergySourceOrigin | string | null
}

interface Question {
  id: string
  title: string
  sub: string
  options: { label: string; score: number; tip: string }[]
}

const energyQuestions: Question[] = [
  {
    id: 'sleep',
    title: '昨夜到今早，你的睡眠感受如何？',
    sub: '睡眠是身体充电最基础也是最重要的源泉。',
    options: [
      { label: '深沉香甜', score: 25, tip: '一夜安眠，醒来身心轻盈。' },
      { label: '还算不错', score: 20, tip: '偶有做梦，基本恢复了精力。' },
      { label: '稍有轻浅', score: 14, tip: '半夜易醒，醒来稍有沉滞。' },
      { label: '辗转反侧', score: 8, tip: '多梦易醒，身体仍在呼唤休息。' },
    ],
  },
  {
    id: 'mood',
    title: '此刻心里的底色更接近什么？',
    sub: '没有所谓坏心情，每一种都是内在在诉说。',
    options: [
      { label: '轻松明朗', score: 25, tip: '像晴天林荫，步伐轻快。' },
      { label: '宁静从容', score: 22, tip: '平和自然，不急不躁。' },
      { label: '偶有杂念', score: 15, tip: '心绪稍有泛波，尚能应付。' },
      { label: '沉重焦虑', score: 7, tip: '胸口稍紧，需要深呼吸。' },
    ],
  },
  {
    id: 'pressure',
    title: '身体（尤其肩颈与胃部）是否在提醒你？',
    sub: '身体常常比理智更诚实地记录下压力。',
    options: [
      { label: '完全舒畅', score: 25, tip: '肌肉松弛，呼吸顺畅自如。' },
      { label: '偶有酸胀', score: 18, tip: '轻微紧绷，做做拉伸就好。' },
      { label: '明显僵硬', score: 12, tip: '习惯性耸肩紧缩，略感疲劳。' },
      { label: '沉重酸痛', score: 6, tip: '身体在敲警钟，急需松绑。' },
    ],
  },
  {
    id: 'energy',
    title: '对今天要做的事情，你的精力储备如何？',
    sub: '了解自己的电量，量力而行就是智慧。',
    options: [
      { label: '电量充沛', score: 25, tip: '有条不紊，可以稳步推进。' },
      { label: '适度够用', score: 20, tip: '专注于最核心的一两件事。' },
      { label: '半电慢行', score: 14, tip: '节奏要放慢，不能勉强。' },
      { label: '急需充电', score: 7, tip: '今天请允许自己做个旁观者。' },
    ],
  },
]

export function EnergyCheckTool({ onBack, onComplete, fromSource }: EnergyCheckToolProps) {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, { label: string; score: number }>>({})
  const [result, setResult] = useState<EnergyResult | null>(null)

  const currentQ = energyQuestions[currentStep]

  function handleSelect(option: { label: string; score: number }) {
    const nextAnswers = {
      ...answers,
      [currentQ.id]: option,
    }
    setAnswers(nextAnswers)

    if (currentStep < energyQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Calculate final score
      const totalScore = Object.values(nextAnswers).reduce((sum, item) => sum + item.score, 0)
      let level = '绿意充沛'
      let advice = '今天的你状态饱满而温和，很适合专注完成一件心仪已久的事，也可以分享这份明媚给他人。'

      if (totalScore < 45) {
        level = '急需歇脚'
        advice = '今天的身心电量稍低，请放下不必要的自责与苛求。建议先做一组呼吸练习，晚上早点调暗灯光。'
      } else if (totalScore < 65) {
        level = '温柔充电'
        advice = '你的状态处于低速巡航状态。允许自己把步调放慢，不必同时处理太多信息，多喝温水。'
      } else if (totalScore < 85) {
        level = '柔和静养'
        advice = '总体平稳安详，适度保持边界感。在日常忙碌之余，给午间留出 10 分钟冥想放松。'
      }

      const res: EnergyResult = {
        score: totalScore,
        level,
        date: new Date().toLocaleDateString('zh-CN'),
        advice,
        details: {
          sleep: nextAnswers.sleep?.label || '',
          mood: nextAnswers.mood?.label || '',
          pressure: nextAnswers.pressure?.label || '',
          energy: nextAnswers.energy?.label || '',
        },
      }

      setResult(res)
      try {
        localStorage.setItem('xiaoan_latest_energy', JSON.stringify(res))
      } catch {
        // ignore
      }
      if (onComplete) onComplete(res)
    }
  }

  function restart() {
    setAnswers({})
    setCurrentStep(0)
    setResult(null)
  }

  return (
    <div className="energy-check-container">
      {!result ? (
        <div className="energy-quiz-card glass-card">
          <div className="energy-quiz-progress-bar">
            <div
              className="energy-quiz-progress-fill"
              style={{ width: `${((currentStep + 1) / energyQuestions.length) * 100}%` }}
            />
          </div>

          <div className="energy-quiz-header">
            <span className="energy-step-badge">
              第 {currentStep + 1} / {energyQuestions.length} 题
            </span>
            <h3>{currentQ.title}</h3>
            <p className="energy-quiz-sub">{currentQ.sub}</p>
          </div>

          <div className="energy-options-list">
            {currentQ.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                className="energy-opt-btn"
                onClick={() => handleSelect(opt)}
              >
                <div className="energy-opt-content">
                  <strong>{opt.label}</strong>
                  <small>{opt.tip}</small>
                </div>
                <span className="energy-opt-arrow">›</span>
              </button>
            ))}
          </div>

          {currentStep > 0 && (
            <div className="energy-back-step">
              <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
                ‹ 上一题
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="energy-result-card glass-card">
          <div className="energy-result-score-circle">
            <div className="energy-score-val">{result.score}</div>
            <div className="energy-score-tag">{result.level}</div>
          </div>

          <div className="energy-result-header">
            <h2>今日综合能量指数：{result.score} 分</h2>
            <p className="energy-level-text">状态评定：<strong>{result.level}</strong></p>
          </div>

          <div className="energy-result-advice-box">
            <h4>🌿 小安的今日温馨寄语</h4>
            <p>{result.advice}</p>
          </div>

          <div className="energy-dimensions-grid">
            <div className="energy-dim-item">
              <span>睡眠维度</span>
              <strong>{result.details.sleep}</strong>
            </div>
            <div className="energy-dim-item">
              <span>心情基调</span>
              <strong>{result.details.mood}</strong>
            </div>
            <div className="energy-dim-item">
              <span>身体松弛</span>
              <strong>{result.details.pressure}</strong>
            </div>
            <div className="energy-dim-item">
              <span>精力储备</span>
              <strong>{result.details.energy}</strong>
            </div>
          </div>

          <div className="energy-result-actions">
            <button className="primary-button" onClick={() => onBack(fromSource)}>
              收好今日状态
            </button>
            <button className="secondary-button" onClick={restart}>
              重新检测
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
