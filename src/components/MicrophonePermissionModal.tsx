import React, { useState } from 'react'
import type { MicrophoneErrorInfo } from '../services/microphoneService'

interface MicrophonePermissionModalProps {
  error: MicrophoneErrorInfo
  onClose: () => void
  onRetry: () => Promise<void>
  onSwitchToText: () => void
}

export const MicrophonePermissionModal: React.FC<MicrophonePermissionModalProps> = ({
  error,
  onClose,
  onRetry,
  onSwitchToText,
}) => {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetryClick = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  // 根据错误码展示对应生动图标
  const getErrorIcon = () => {
    switch (error.code) {
      case 'NOT_ALLOWED':
        return '🔒'
      case 'NOT_FOUND':
        return '🔌'
      case 'NOT_READABLE':
        return '🎙️'
      case 'SECURITY_ERROR':
      case 'INSECURE_CONTEXT':
        return '🛡️'
      case 'UNSUPPORTED':
        return '💻'
      default:
        return '⚠️'
    }
  }

  return (
    <div
      className="mic-permission-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mic-modal-title"
    >
      <div className="mic-permission-card" onClick={(e) => e.stopPropagation()}>
        {/* 头部标题与关闭按钮 */}
        <div className="mic-modal-header">
          <div className="mic-modal-title-wrap">
            <span className="mic-modal-badge">{getErrorIcon()}</span>
            <div>
              <h3 id="mic-modal-title">{error.title}</h3>
              <p className="mic-modal-subtitle">请按下方指引开启麦克风或切换输入方式</p>
            </div>
          </div>
          <button
            type="button"
            className="mic-modal-close"
            onClick={onClose}
            aria-label="关闭提示"
          >
            ✕
          </button>
        </div>

        {/* 核心问题说明 */}
        <div className="mic-modal-body">
          <div className="mic-problem-desc">
            <p>{error.message}</p>
          </div>

          {/* 解决步骤引导卡片 */}
          <div className="mic-guide-box">
            <h4>💡 快速开启指引</h4>
            <ol className="mic-steps-list">
              {error.instructions.map((step, idx) => (
                <li key={idx}>
                  <span className="mic-step-num">{idx + 1}</span>
                  <span className="mic-step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 嵌入环境友好提醒 */}
          {error.code === 'NOT_ALLOWED' && (
            <div className="mic-tip-note">
              <span>💡</span>
              <small>
                提示：若浏览器未直接弹出授权窗口，通常是之前曾选择过“禁止”。只需在浏览器地址栏左侧将权限改为“允许”并刷新/重试即可。
              </small>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="mic-modal-actions">
          {error.canRetry && (
            <button
              type="button"
              className="mic-action-btn primary"
              onClick={handleRetryClick}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <span className="mic-spin-loader" />
                  正在检测麦克风...
                </>
              ) : (
                <>🔄 重新检测并开启</>
              )}
            </button>
          )}

          <button
            type="button"
            className="mic-action-btn secondary"
            onClick={onSwitchToText}
          >
            ✍️ 改用文字倾诉
          </button>
        </div>
      </div>
    </div>
  )
}
