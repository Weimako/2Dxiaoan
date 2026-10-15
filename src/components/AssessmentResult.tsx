import React, { useState } from 'react'
import { AssessmentTopic, AssessmentEvaluation, SavedAssessmentRecord } from '../types/assessment'
import { DynamicRadarChart } from './DynamicRadarChart'
import { DynamicScaleBar } from './DynamicScaleBar'
import { saveAssessmentRecord } from '../services/assessmentStorage'

interface AssessmentResultProps {
  topic: AssessmentTopic
  evaluation: AssessmentEvaluation
  answers: number[]
  onBack: () => void
  onRetake: () => void
  onChatWithXiaoan: (context: { topicTitle: string; summary: string }) => void
  userId?: string
}

export function AssessmentResult({
  topic,
  evaluation,
  answers,
  onBack,
  onRetake,
  onChatWithXiaoan,
  userId = 'guest',
}: AssessmentResultProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [showSaveToast, setShowSaveToast] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)

  function handleSave() {
    const now = new Date()
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const record: SavedAssessmentRecord = {
      id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      topicId: topic.id,
      topicTitle: topic.title,
      category: topic.category,
      date: dateStr,
      timestamp: Date.now(),
      answers,
      evaluation,
      userId,
    }

    const success = saveAssessmentRecord(record, userId)
    if (success) {
      setIsSaved(true)
      setShowSaveToast(true)
      setTimeout(() => setShowSaveToast(false), 3000)
    }
  }

  function handleConfirmChat() {
    setShowChatModal(false)
    onChatWithXiaoan({
      topicTitle: topic.title,
      summary: evaluation.summary,
    })
  }

  return (
    <main className="screen result-screen">
      {/* Back button */}
      <button className="back-button" onClick={onBack} aria-label="返回测评馆">
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

      {/* Header */}
      <header className="page-title">
        <h1>{topic.title} · 自评总结</h1>
        <p className="result-page-sub">
          {topic.category === 'exploration'
            ? '这一次的形状，只属于现在的感受。不是打分榜，更不代表长期的你。'
            : '标准化量表初步评估结果 · 供日常身心观察与参考'}
        </p>
      </header>

      <section className="result-layout">
        {/* Left Column: Visualization */}
        <div className="result-visualization-column">
          <div className="result-chart-card glass-card">
            <div className="chart-card-header">
              <span className="chart-kind-tag" style={{ color: topic.color }}>
                {topic.chartType === 'radar' ? '多维心境雷达图' : '标准化评估指标'}
              </span>
              <strong className="chart-level-title" style={{ color: evaluation.levelColor }}>
                {evaluation.levelName}
              </strong>
            </div>

            {topic.chartType === 'radar' && evaluation.radarDimensions && (
              <DynamicRadarChart
                dimensions={evaluation.radarDimensions}
                centerLabel={evaluation.weatherSummary}
                accentColor={topic.color}
              />
            )}

            {topic.chartType === 'bar' && (
              <DynamicScaleBar
                score={evaluation.score}
                maxScore={evaluation.maxScore}
                levelName={evaluation.levelName}
                levelColor={evaluation.levelColor}
                barDimensions={evaluation.barDimensions}
              />
            )}
          </div>

          {/* Quick Summary Under Chart */}
          <div className="result-status-summary-box glass-card">
            <h4>当下的状态感知</h4>
            <p>{evaluation.summary}</p>
          </div>
        </div>

        {/* Right Column: Detailed Points & Actions */}
        <div className="result-list">
          {/* Detailed Points */}
          {evaluation.detailedPoints.map((point, idx) => (
            <div key={idx} className="result-point-card glass-card">
              <strong>{point.title}</strong>
              <p>{point.text}</p>
            </div>
          ))}

          {/* Gentle Care Advice */}
          <div className="result-care-box glass-card">
            <strong>🌱 小安给你的温和关怀建议</strong>
            <ul>
              {evaluation.careAdvice.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Disclaimer Banner */}
          <div className="result-disclaimer-box">
            <small>
              <strong>💡 科学说明：</strong>
              {evaluation.disclaimer}
            </small>
          </div>

          {/* Action Buttons */}
          <div className="result-action-buttons">
            <button
              type="button"
              className={`primary-button save-assessment-btn ${isSaved ? 'already-saved' : ''}`}
              onClick={handleSave}
              disabled={isSaved}
            >
              {isSaved ? '✓ 已收好本次自评记录' : '收好这次测评'}
            </button>

            <button
              type="button"
              className="secondary-button chat-connect-btn"
              onClick={() => setShowChatModal(true)}
            >
              <span>🌿 和小安聊聊这次感受</span>
            </button>

            <button
              type="button"
              className="secondary-button retake-btn"
              onClick={onRetake}
            >
              <span>重新测评</span>
            </button>
          </div>
        </div>
      </section>

      {/* Save Success Toast */}
      {showSaveToast && (
        <div className="save-toast-pill">
          <span>✨ 已成功将本次自评记录收好到「我的测评记录」</span>
        </div>
      )}

      {/* Chat Confirmation Modal */}
      {showChatModal && (
        <div className="modal-backdrop">
          <div className="glass-card confirm-modal-box chat-modal-content">
            <div className="chat-modal-icon">🌿</div>
            <h3>与小安开启深度疗愈对话</h3>
            <p>
              是否将本次「<strong>{topic.title}</strong>」的自评小结带入与小安的对话？
            </p>
            <div className="chat-summary-preview">
              <span className="summary-quote-label">带入的小结摘要：</span>
              <p>“{evaluation.summary}”</p>
            </div>
            <small className="chat-privacy-note">
              * 保护隐私：仅共享上述整体小结，不会将每道题的具体选择传输给对话服务。
            </small>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowChatModal(false)}
              >
                先不带入
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={handleConfirmChat}
              >
                确认并开始对话
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
