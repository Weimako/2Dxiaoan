import React, { useState, useEffect } from 'react'
import {
  EXPLORATION_TOPICS,
  SCALE_TOPICS,
  getTopicById,
} from '../data/assessmentData'
import { AssessmentTopic, SavedAssessmentRecord } from '../types/assessment'
import { getAssessmentHistory, deleteAssessmentRecord } from '../services/assessmentStorage'

interface AssessmentHubProps {
  onBack: () => void
  onSelectTopic: (topicId: string) => void
  onViewRecord: (record: SavedAssessmentRecord) => void
  initialTab?: 'exploration' | 'scale' | 'history'
  mascotComponent: React.ReactNode
  userId?: string
}

export function AssessmentHub({
  onBack,
  onSelectTopic,
  onViewRecord,
  initialTab = 'exploration',
  mascotComponent,
  userId = 'guest',
}: AssessmentHubProps) {
  const [activeTab, setActiveTab] = useState<'exploration' | 'scale' | 'history'>(initialTab)
  const [historyRecords, setHistoryRecords] = useState<SavedAssessmentRecord[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  useEffect(() => {
    setHistoryRecords(getAssessmentHistory(userId))
  }, [activeTab, userId])

  function handleDelete(id: string) {
    deleteAssessmentRecord(id, userId)
    setHistoryRecords(getAssessmentHistory(userId))
    setConfirmDeleteId(null)
  }

  return (
    <main className="screen assessment-screen">
      <button className="back-button" onClick={onBack} aria-label="返回首页">
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

      <header className="page-title">
        <h1>心理测评馆</h1>
        <p>自我探索与身心觉察 · 每一个回答都是送给自己的一刻停顿</p>
      </header>

      {/* Tabs */}
      <div className="assessment-nav-tabs">
        <button
          type="button"
          className={`assessment-tab-btn ${activeTab === 'exploration' ? 'active' : ''}`}
          onClick={() => setActiveTab('exploration')}
        >
          <span>🌱 轻量自我探索</span>
          <span className="tab-count-badge">5个主题</span>
        </button>
        <button
          type="button"
          className={`assessment-tab-btn ${activeTab === 'scale' ? 'active' : ''}`}
          onClick={() => setActiveTab('scale')}
        >
          <span>📋 专业量表筛查</span>
          <span className="tab-count-badge">PHQ-9 / GAD-7</span>
        </button>
        <button
          type="button"
          className={`assessment-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>📜 我的测评记录</span>
          {historyRecords.length > 0 && (
            <span className="tab-count-badge count-highlight">{historyRecords.length}</span>
          )}
        </button>
      </div>

      <section className="assessment-layout">
        {/* Left Side: Copy + Mascot */}
        <div className="assessment-copy">
          {activeTab === 'exploration' && (
            <>
              <h2>今天想轻轻了解哪一面？</h2>
              <p>这里没有对错，也没有打分榜。</p>
              <p>选一套你此刻想靠近的主题，听听心里的声音。</p>
              <p>答完只留在这一次，随时收好属于你的心境地图。</p>
            </>
          )}

          {activeTab === 'scale' && (
            <>
              <h2>标准化心理评估初筛</h2>
              <p>采用国际公开发布的经典临床初筛量表常模。</p>
              <p>帮助你系统观察近两周的心境、精力与神经紧绷程度。</p>
              <p className="clinical-notice-tip">
                * 本筛查仅作日常健康自测与参考，不替代医师诊断。
              </p>
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h2>你的自评足迹</h2>
              <p>每一次诚实的觉察，都是对自己的一次深情关照。</p>
              <p>已为你完整保存在本地设备，可随时回顾或带入和小安的对话。</p>
            </>
          )}

          <div className="assessment-mascot-box">{mascotComponent}</div>
        </div>

        {/* Right Side: Topic Cards or History */}
        <div className="assessment-right-column">
          {/* TAB 1: EXPLORATION */}
          {activeTab === 'exploration' && (
            <div className="category-list">
              {EXPLORATION_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  className="assessment-topic-card"
                  onClick={() => onSelectTopic(topic.id)}
                  type="button"
                >
                  <i style={{ background: topic.color }} />
                  <div className="topic-card-body">
                    <div className="topic-card-title-row">
                      <strong>{topic.title}</strong>
                      <span className="topic-badge">{topic.badge}</span>
                      <span className="topic-qcount-tag">
                        {topic.questions.length} 题 · 约2分钟
                      </span>
                    </div>
                    <small>{topic.subtitle}</small>
                  </div>
                  <div className="topic-card-enter">
                    <span>开始测评</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TAB 2: STANDARDIZED SCALES */}
          {activeTab === 'scale' && (
            <div className="category-list scale-list">
              <div className="scale-intro-banner">
                <div className="scale-intro-icon">🔬</div>
                <div>
                  <h4>权威标准化心理量表规范</h4>
                  <p>
                    采用经过大样本信效度检验的标准中文常模。请根据过去两周的真实体验如实勾选。
                  </p>
                </div>
              </div>

              {SCALE_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  className="assessment-topic-card scale-topic-card"
                  onClick={() => onSelectTopic(topic.id)}
                  type="button"
                >
                  <i style={{ background: topic.color }} />
                  <div className="topic-card-body">
                    <div className="topic-card-title-row">
                      <strong>{topic.title}</strong>
                      <span className="topic-badge scale-badge">{topic.badge}</span>
                      <span className="topic-qcount-tag">
                        {topic.questions.length} 题 · 标准计分
                      </span>
                    </div>
                    <small>{topic.subtitle}</small>
                    <p className="topic-purpose-hint">{topic.purpose}</p>
                  </div>
                  <div className="topic-card-enter">
                    <span>开启筛查</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="history-records-list">
              {historyRecords.length === 0 ? (
                <div className="history-empty-state">
                  <span className="empty-icon">🍃</span>
                  <p>目前还没有保存的自评记录</p>
                  <small>完成任意主题后点击「收好这次测评」，即可在这里随时查阅。</small>
                  <button
                    type="button"
                    className="primary-button history-start-btn"
                    onClick={() => setActiveTab('exploration')}
                  >
                    前往自评探索
                  </button>
                </div>
              ) : (
                <div className="history-items-scroll">
                  {historyRecords.map((record) => (
                    <div key={record.id} className="history-card-item">
                      <div className="history-card-header">
                        <div>
                          <span
                            className={`history-type-tag ${
                              record.category === 'scale' ? 'scale' : 'exploration'
                            }`}
                          >
                            {record.category === 'scale' ? '标准化筛查' : '轻量探索'}
                          </span>
                          <strong className="history-topic-title">{record.topicTitle}</strong>
                        </div>
                        <span className="history-date-tag">{record.date}</span>
                      </div>

                      <div className="history-summary-box">
                        <span
                          className="history-level-badge"
                          style={{
                            color: record.evaluation.levelColor || '#5e9d68',
                            backgroundColor: `${record.evaluation.levelColor || '#5e9d68'}18`,
                          }}
                        >
                          {record.evaluation.levelName}
                        </span>
                        <p className="history-summary-text">{record.evaluation.summary}</p>
                      </div>

                      <div className="history-actions">
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() => onViewRecord(record)}
                        >
                          查看详细报告与图表
                        </button>
                        <button
                          type="button"
                          className="history-del-btn"
                          onClick={() => setConfirmDeleteId(record.id)}
                          title="删除此条记录"
                        >
                          删除
                        </button>
                      </div>

                      {confirmDeleteId === record.id && (
                        <div className="history-delete-confirm-box">
                          <span>确定要删除这条记录吗？此操作无法撤销。</span>
                          <div className="confirm-btns">
                            <button
                              type="button"
                              className="confirm-del-yes"
                              onClick={() => handleDelete(record.id)}
                            >
                              确认删除
                            </button>
                            <button
                              type="button"
                              className="confirm-del-no"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
