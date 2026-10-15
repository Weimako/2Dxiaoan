import React, { useState, useEffect } from 'react'
import { AssessmentTopic, AssessmentEvaluation } from '../types/assessment'

interface AssessmentQuizProps {
  topic: AssessmentTopic
  onBack: () => void
  onFinish: (topic: AssessmentTopic, answers: number[], evaluation: AssessmentEvaluation) => void
  mascotComponent: React.ReactNode
}

export function AssessmentQuiz({
  topic,
  onBack,
  onFinish,
  mascotComponent,
}: AssessmentQuizProps) {
  const [step, setStep] = useState(0)
  // Store answer score or index per question
  const [answers, setAnswers] = useState<number[]>([])
  const [showExitModal, setShowExitModal] = useState(false)

  // Reset state whenever topic id changes
  useEffect(() => {
    setStep(0)
    setAnswers([])
  }, [topic.id])

  const totalQuestions = topic.questions.length
  const currentQuestion = topic.questions[step]
  const currentSelectedScore = answers[step]

  function handleSelectOption(score: number) {
    const updated = [...answers]
    updated[step] = score
    setAnswers(updated)

    // Automatically advance to next step or finish after gentle pause (or user can press next)
    if (step < totalQuestions - 1) {
      setTimeout(() => {
        setStep((prev) => Math.min(totalQuestions - 1, prev + 1))
      }, 180)
    } else {
      // Completed last question
      setTimeout(() => {
        const evaluation = topic.evaluate(updated)
        onFinish(topic, updated, evaluation)
      }, 220)
    }
  }

  function handlePrev() {
    if (step > 0) {
      setStep(step - 1)
    } else {
      handleRequestExit()
    }
  }

  function handleNext() {
    if (currentSelectedScore === undefined) return
    if (step < totalQuestions - 1) {
      setStep(step + 1)
    } else {
      const evaluation = topic.evaluate(answers)
      onFinish(topic, answers, evaluation)
    }
  }

  function handleRequestExit() {
    if (answers.length > 0) {
      setShowExitModal(true)
    } else {
      onBack()
    }
  }

  const isCurrentAnswered = currentSelectedScore !== undefined
  const progressPercent = Math.round(((step + 1) / totalQuestions) * 100)

  return (
    <main className="screen quiz-screen">
      {/* Back button */}
      <button className="back-button" onClick={handlePrev} aria-label="上一题或返回">
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h11" />
        </svg>
      </button>

      {/* Top Header */}
      <header className="page-title">
        <h1>{topic.title}</h1>
        <p className="quiz-topic-subtitle">
          {topic.category === 'scale'
            ? '请结合过去两周的身心真实体验如实填写'
            : '跟随此刻的第一直觉，没有对错，只作自我觉察'}
        </p>
      </header>

      {/* Step Counter Badge */}
      <div className="counter">
        第 {step + 1} 题 / 共 {totalQuestions} 题
      </div>

      <section className="quiz-layout">
        {/* Left Column: Mascot & Listener chip */}
        <div className="quiz-mascot-column">
          <span className="listen-chip">小安在此温和倾听</span>
          <div className="quiz-mascot-wrap">{mascotComponent}</div>
          <div className="quiz-progress-summary">
            <div className="quiz-progress-track">
              <div
                className="quiz-progress-fill"
                style={{ width: `${progressPercent}%`, backgroundColor: topic.color }}
              />
            </div>
            <span>完成度 {progressPercent}%</span>
          </div>
        </div>

        {/* Right Column: Question Card */}
        <div className="question-card">
          <div className="question-card-header">
            <span className="question-index-tag" style={{ color: topic.color }}>
              Question {step + 1}
            </span>
            <p className="question-prompt-text">{currentQuestion.prompt}</p>
            {currentQuestion.subtitle && (
              <small className="question-sub-prompt">{currentQuestion.subtitle}</small>
            )}
          </div>

          {/* Options */}
          <div className="answer-row">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = currentSelectedScore === option.score
              return (
                <button
                  key={idx}
                  type="button"
                  className={`quiz-option-btn ${isSelected ? 'active-option' : ''}`}
                  onClick={() => handleSelectOption(option.score)}
                  style={
                    isSelected
                      ? {
                          borderColor: topic.accentColor,
                          boxShadow: `0 0 0 2px ${topic.accentColor}33`,
                        }
                      : undefined
                  }
                >
                  <span className="option-indicator-dot" />
                  <span className="option-text">{option.label}</span>
                  {isSelected && <span className="option-check-icon">✓</span>}
                </button>
              )
            })}
          </div>

          {/* Stepper Navigation and Dots */}
          <div className="quiz-bottom-controls">
            <button
              type="button"
              className="quiz-nav-btn prev-btn"
              onClick={handlePrev}
            >
              {step === 0 ? '退出自评' : '← 上一题'}
            </button>

            <div className="progress-dots">
              {topic.questions.map((_, index) => (
                <i
                  key={index}
                  className={index <= step ? 'active' : ''}
                  style={index <= step ? { backgroundColor: topic.color } : undefined}
                />
              ))}
            </div>

            <button
              type="button"
              className="quiz-nav-btn next-btn"
              onClick={handleNext}
              disabled={!isCurrentAnswered}
            >
              {step === totalQuestions - 1 ? '完成测评 →' : '下一题 →'}
            </button>
          </div>
        </div>
      </section>

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="modal-backdrop">
          <div className="glass-card confirm-modal-box">
            <h3>确定要暂时退出本次自评吗？</h3>
            <p>
              你已经完成了 {answers.filter((a) => a !== undefined).length} / {totalQuestions} 道题。
              现在退出将不会保存本次未完成的草稿。
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowExitModal(false)}
              >
                继续答题
              </button>
              <button
                type="button"
                className="primary-button"
                style={{ background: '#b3594b' }}
                onClick={() => {
                  setShowExitModal(false)
                  onBack()
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
