import React, { useState } from 'react'
import {
  scriptCategories,
  scriptCatalog,
  ScriptCategory,
  ScriptItem,
  ScriptOption,
  ScriptStep,
  ScriptOutcome,
} from '../data/toolsData'
import { ScriptArtThumbnail } from './ScriptArts'

interface InteractiveScriptsViewProps {
  onBack: () => void
}

interface StepHistoryItem {
  step: ScriptStep
  selectedOption: ScriptOption
}

export function InteractiveScriptsView({ onBack }: InteractiveScriptsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(null)

  // Interactive step state for active script
  const [currentStepId, setCurrentStepId] = useState<string>('')
  const [selectedOptionForCurrentStep, setSelectedOptionForCurrentStep] =
    useState<ScriptOption | null>(null)
  const [history, setHistory] = useState<StepHistoryItem[]>([])
  const [currentOutcome, setCurrentOutcome] = useState<ScriptOutcome | null>(null)

  const filteredScripts =
    selectedCategory === '全部'
      ? scriptCatalog
      : scriptCatalog.filter((s) => s.category === selectedCategory)

  // Start practicing a scenario
  const handleStartPractice = (script: ScriptItem) => {
    setActiveScript(script)
    setCurrentStepId(script.initialStepId)
    setSelectedOptionForCurrentStep(null)
    setHistory([])
    setCurrentOutcome(null)
  }

  // Restart current scenario
  const handleRestartPractice = () => {
    if (!activeScript) return
    setCurrentStepId(activeScript.initialStepId)
    setSelectedOptionForCurrentStep(null)
    setHistory([])
    setCurrentOutcome(null)
  }

  // Exit practice back to list
  const handleExitPractice = () => {
    setActiveScript(null)
    setCurrentStepId('')
    setSelectedOptionForCurrentStep(null)
    setHistory([])
    setCurrentOutcome(null)
  }

  // Handle selecting an option
  const handleSelectOption = (option: ScriptOption) => {
    setSelectedOptionForCurrentStep(option)
  }

  // Proceed to next step or outcome
  const handleProceed = () => {
    if (!activeScript || !selectedOptionForCurrentStep) return

    const currentStep = activeScript.steps[currentStepId]
    if (!currentStep) return

    // Record into history
    const nextHistory = [
      ...history,
      { step: currentStep, selectedOption: selectedOptionForCurrentStep },
    ]
    setHistory(nextHistory)

    if (selectedOptionForCurrentStep.outcomeId) {
      // Reached final outcome
      const outcome = activeScript.outcomes[selectedOptionForCurrentStep.outcomeId]
      if (outcome) {
        setCurrentOutcome(outcome)
      }
    } else if (selectedOptionForCurrentStep.nextStepId) {
      // Advance to next step
      setCurrentStepId(selectedOptionForCurrentStep.nextStepId)
      setSelectedOptionForCurrentStep(null)
    }
  }

  const activeStep: ScriptStep | undefined =
    activeScript && currentStepId ? activeScript.steps[currentStepId] : undefined

  return (
    <main className="screen scripts-screen">
      {/* Top back button */}
      <button
        className="back-button"
        onClick={activeScript ? handleExitPractice : onBack}
        aria-label="返回"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M9 12h11" />
        </svg>
      </button>

      {/* Page Title */}
      <header className="page-title">
        <h1>{activeScript ? activeScript.title : '互动剧本演练'}</h1>
        <p>
          {activeScript
            ? `情境演练 · 角色：${activeScript.character} · 不是考试，随心选择最真实的感受`
            : '在生活情境中练习温和表达、健康沟通与守护边界。'}
        </p>
      </header>

      {/* Script Interactive Practice Mode */}
      {activeScript ? (
        <section className="script-practice-container" aria-label="剧本互动演练舞台">
          {/* Scenario Context Card */}
          <div className="script-scene-card">
            <div className="script-scene-header">
              <div className="scene-badges-left">
                <span className="script-scene-tag">{activeScript.category}</span>
                <span className="script-scene-duration">⏱ {activeScript.duration}</span>
                <span className="script-scene-character-badge">
                  角色：{activeScript.character}（{activeScript.characterRole}）
                </span>
              </div>
              <button
                type="button"
                className="script-restart-text-btn"
                onClick={handleRestartPractice}
                title="重新开始此剧本"
              >
                ↺ 重新开始
              </button>
            </div>
            <h3 className="script-scene-title">情境背景</h3>
            <p className="script-scene-desc">{activeScript.scene}</p>
          </div>

          {/* Interactive Steps Flow (when not on outcome) */}
          {!currentOutcome && activeStep && (
            <div className="script-dialogue-stage">
              {/* History trail (showing already-completed steps) */}
              {history.map((hist, hIdx) => (
                <div key={hIdx} className="history-step-block">
                  <div className="step-count-badge">步骤 {hIdx + 1} 已完成</div>

                  {/* Character prompt in history */}
                  <div className="dialogue-bubble other-bubble history-bubble">
                    <div className="dialogue-avatar other-avatar">
                      <span>{hist.step.speakerAvatarText}</span>
                    </div>
                    <div className="dialogue-body">
                      <span className="dialogue-speaker">
                        {hist.step.speaker}（{hist.step.speakerRole}）
                      </span>
                      <p className="dialogue-text">{hist.step.prompt}</p>
                    </div>
                  </div>

                  {/* User choice made */}
                  <div className="dialogue-bubble user-bubble history-user-bubble">
                    <div className="dialogue-avatar user-avatar">
                      <span>你</span>
                    </div>
                    <div className="dialogue-body">
                      <span className="dialogue-speaker user-speaker-title">
                        你的表达 · {hist.selectedOption.badge}
                      </span>
                      <p className="dialogue-text">{hist.selectedOption.text}</p>
                    </div>
                  </div>

                  {/* Character immediate reaction in history */}
                  <div className="reaction-note-box history-reaction-box">
                    <span className="reaction-title">对方的反应与氛围：</span>
                    <p className="reaction-dialogue">
                      {hist.selectedOption.reaction.dialogue}
                    </p>
                    <p className="reaction-atmosphere">
                      {hist.selectedOption.reaction.atmosphere}
                    </p>
                  </div>
                </div>
              ))}

              {/* Current Active Step */}
              <div className="current-step-card">
                <div className="step-indicator-bar">
                  <span className="current-step-pill">
                    当前步骤 {history.length + 1}
                  </span>
                  <span className="step-hint-text">
                    请选择你内心最真实或想尝试的表达方式：
                  </span>
                </div>

                {/* Character speaking prompt */}
                <div className="dialogue-bubble other-bubble active-prompt-bubble">
                  <div className="dialogue-avatar other-avatar">
                    <span>{activeStep.speakerAvatarText}</span>
                  </div>
                  <div className="dialogue-body">
                    <span className="dialogue-speaker">
                      {activeStep.speaker}（{activeStep.speakerRole}）
                    </span>
                    <p className="dialogue-text">{activeStep.prompt}</p>
                  </div>
                </div>

                {/* Options Choices */}
                <div className="script-options-section">
                  <div className="options-list">
                    {activeStep.options.map((option) => {
                      const isSelected = selectedOptionForCurrentStep?.id === option.id
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`script-option-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(option)}
                        >
                          <div className="option-badge-row">
                            <span className="option-badge">{option.badge}</span>
                            {isSelected && <span className="option-check-icon">✓ 已选择</span>}
                          </div>
                          <p className="option-text">{option.text}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Feedback & Proceed Action (Shown after selecting an option) */}
                {selectedOptionForCurrentStep && (
                  <div className="step-feedback-container">
                    {/* Immediate reaction preview */}
                    <div className="reaction-note-box">
                      <span className="reaction-title">对方即时回应：</span>
                      <p className="reaction-dialogue">
                        {selectedOptionForCurrentStep.reaction.dialogue}
                      </p>
                      <p className="reaction-atmosphere">
                        {selectedOptionForCurrentStep.reaction.atmosphere}
                      </p>
                    </div>

                    <div className="step-action-row">
                      <button
                        type="button"
                        className="script-btn-primary proceed-btn"
                        onClick={handleProceed}
                      >
                        {selectedOptionForCurrentStep.outcomeId
                          ? '查看本次体验发现 ✨'
                          : '继续下一步情境 →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Experience Outcome & Reflection (when outcome reached) */}
          {currentOutcome && (
            <div className="script-outcome-container" aria-label="这次体验的小发现">
              {/* Outcome Header & Ending */}
              <div className={`outcome-story-card badge-${currentOutcome.badgeColor}`}>
                <div className="outcome-sparkle-decor" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z"
                      fill="#66b579"
                      opacity="0.8"
                    />
                    <circle cx="18" cy="18" r="2" fill="#ebdc95" />
                    <circle cx="6" cy="18" r="2" fill="#ebdc95" />
                  </svg>
                </div>

                <div className="outcome-top-bar">
                  <span className="outcome-badge-pill">{currentOutcome.badgeLabel}</span>
                  <span className="outcome-status-tag">体验达成</span>
                </div>

                <h2 className="outcome-title">{currentOutcome.title}</h2>
                <div className="story-ending-box">
                  <strong className="story-ending-label">故事最终走向：</strong>
                  <p className="story-ending-text">{currentOutcome.storyEnding}</p>
                </div>
              </div>

              {/* 「这次体验的小发现」 Discovery Card */}
              <div className="outcome-discovery-card">
                <div className="discovery-header">
                  <span className="discovery-icon" aria-hidden="true">🍃</span>
                  <h3 className="discovery-title">这次体验的小发现</h3>
                </div>
                <h4 className="discovery-subtitle">{currentOutcome.discoveryTitle}</h4>
                <p className="discovery-impact-analysis">
                  {currentOutcome.impactAnalysis}
                </p>
              </div>

              {/* 「更温和、清晰的表达示例」 Gentle Example Suggestion Card */}
              <div className="outcome-example-card">
                <div className="example-header">
                  <span className="example-bulb-icon" aria-hidden="true">💡</span>
                  <h3 className="example-title">更温和、清晰的表达示例</h3>
                </div>
                <div className="example-body">
                  <div className="example-scenario-tag">
                    适用于：{currentOutcome.gentleExample.scenario}
                  </div>
                  <div className="example-words-quote">
                    {currentOutcome.gentleExample.suggestedWords}
                  </div>
                  <div className="example-rationale-box">
                    <strong>心理学沟通要点：</strong>
                    <span>{currentOutcome.gentleExample.rationale}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: 重新体验 & 返回剧本列表 */}
              <div className="outcome-actions-bar">
                <button
                  type="button"
                  className="script-btn-secondary"
                  onClick={handleRestartPractice}
                >
                  ↺ 重新体验（尝试其他分支）
                </button>
                <button
                  type="button"
                  className="script-btn-primary"
                  onClick={handleExitPractice}
                >
                  返回剧本列表
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Horizontal Category Bar + 1-Card-Per-Row List Mode */
        <section className="scripts-list-container" aria-label="互动剧本分类与列表">
          {/* Horizontal Category Navigation Bar */}
          <nav className="scripts-category-nav" aria-label="剧本分类导航">
            {scriptCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{cat}</span>
              </button>
            ))}
          </nav>

          {/* Stories Header & Grid */}
          <div className="scripts-content-header">
            <p className="scripts-cat-summary">
              当前分类：<strong>{selectedCategory}</strong>
              <span>（共 {filteredScripts.length} 个情境剧本）</span>
            </p>
            <span className="scripts-healing-tip">
              用温和的选择，给心灵一次练习表达与边界的机会
            </span>
          </div>

          <div className="scripts-grid">
              {filteredScripts.map((script) => (
                <div key={script.id} className="script-card">
                  {/* Card Visual Illustration Banner */}
                  <div className="script-card-visual-col">
                    <ScriptArtThumbnail illustrationKey={script.illustrationKey} />
                  </div>

                  {/* Card Details */}
                  <div className="script-card-info-col">
                    <div className="script-card-top-row">
                      <div className="script-card-badges">
                        <span className="script-badge category">{script.category}</span>
                        <span className="script-badge duration">{script.duration}</span>
                      </div>
                      <span className="script-character-tag">{script.character}</span>
                    </div>

                    <h3 className="script-card-title">{script.title}</h3>
                    <p className="script-card-sub">{script.sub}</p>

                    <div className="script-scene-preview">
                      <span className="scene-label">情境：</span>
                      <span className="scene-content">{script.scene}</span>
                    </div>

                    <div className="script-card-footer">
                      <div className="script-tags">
                        {script.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="script-start-btn"
                        onClick={() => handleStartPractice(script)}
                      >
                        开始体验 →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </section>
      )}
    </main>
  )
}
