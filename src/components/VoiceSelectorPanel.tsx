import React from 'react'
import {
  type VoiceProfileId,
  VOICE_PROFILE_LIST,
  VOICE_PROFILES,
} from '../services/voiceService'

interface VoiceSelectorPanelProps {
  selectedVoice: VoiceProfileId
  onSelectVoice: (voiceId: VoiceProfileId) => void
  isSpeaking?: boolean
  currentPlayingVoice?: VoiceProfileId | null
  onPreviewVoice?: (voiceId: VoiceProfileId) => void
  previewingVoice?: VoiceProfileId | null
  className?: string
}

export const VoiceSelectorPanel: React.FC<VoiceSelectorPanelProps> = ({
  selectedVoice,
  onSelectVoice,
  isSpeaking = false,
  currentPlayingVoice = null,
  onPreviewVoice,
  previewingVoice = null,
  className = '',
}) => {
  return (
    <aside
      className={`voice-selector-panel ${className}`}
      aria-label="小安语音音色选择区域"
    >
      <div className="voice-selector-buttons" role="radiogroup" aria-label="音色列表">
        {VOICE_PROFILE_LIST.map((profile) => {
          const isSelected = selectedVoice === profile.id
          const isCurrentlyPlayingThisVoice =
            (isSpeaking && currentPlayingVoice === profile.id) ||
            previewingVoice === profile.id

          return (
            <div
              key={profile.id}
              className={`voice-button-wrapper ${isSelected ? 'selected' : ''}`}
            >
              <div
                role="radio"
                tabIndex={0}
                aria-checked={isSelected}
                className={`voice-option-btn ${isSelected ? 'active' : ''} ${
                  isCurrentlyPlayingThisVoice ? 'speaking-active' : ''
                }`}
                onClick={() => onSelectVoice(profile.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectVoice(profile.id)
                  }
                }}
                title={`${profile.label}：${profile.description}`}
              >
                <div className="voice-btn-main">
                  <span className="voice-btn-label">{profile.label}</span>
                  <span className="voice-btn-tag">{profile.tag}</span>
                </div>

                <div className="voice-btn-status">
                  {isCurrentlyPlayingThisVoice ? (
                    <span className="voice-soundwave-indicator" aria-label="正在播放">
                      <span className="wave-bar bar-1" />
                      <span className="wave-bar bar-2" />
                      <span className="wave-bar bar-3" />
                    </span>
                  ) : isSelected ? (
                    <span className="voice-active-dot" aria-label="当前已选择" />
                  ) : null}

                  {onPreviewVoice && (
                    <button
                      type="button"
                      className="voice-preview-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreviewVoice(profile.id)
                      }}
                      title={`试听${profile.label}`}
                      aria-label={`试听${profile.label}`}
                    >
                      试听
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
