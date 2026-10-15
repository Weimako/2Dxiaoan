import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mascotScene from './assets/mascot-scene.png'
import xiaoanLogo from './assets/xiaoan-health-logo.png'
import { Page, IconName, VideoItem, ChatDialogItem } from './types'
import { videoCategories, videoCatalog } from './data/content'
import { BreathingExercise } from './components/BreathingExercise'
import { MoodJournal } from './components/MoodJournal'
import { MeditationTool } from './components/MeditationTool'
import { EnergyCheckTool, type EnergySourceOrigin } from './components/EnergyCheckTool'
import { VideoDetailView } from './components/VideoDetailView'
import {
  CardVisualVideo,
  CardVisualScript,
  CardVisualArticle,
  CardVisualMeditation,
  QuickIconBreathing,
  QuickIconMood,
  QuickIconEnergy,
} from './components/ToolsArt'
import { InteractiveScriptsView } from './components/InteractiveScriptsView'
import { PsychoArticlesView } from './components/PsychoArticlesView'
import { Xiaoan2D } from './components/Xiaoan2D'
import {
  XiaoanChatStatus,
  requestXiaoanReply,
  type AudioInputMode,
  getAudioInputMode,
  setAudioInputMode,
} from './services/chatService'
import { assistantAudioService } from './services/assistantAudioService'
import { useTheme } from './context/ThemeContext'
import { AssessmentHub } from './components/AssessmentHub'
import { AssessmentQuiz } from './components/AssessmentQuiz'
import { AssessmentResult } from './components/AssessmentResult'
import { FireflyOverlay } from './components/FireflyOverlay'
import { getTopicById } from './data/assessmentData'
import { AssessmentEvaluation } from './types/assessment'
import {
  EmotionEntry,
  getEmotionEntries,
  addEmotionEntry,
  clearEmotionEntries,
} from './services/emotionStorage'
import {
  HealingSessionSummary,
  generateHealingSummary,
  getSessionSummary,
  getUserActiveSessionId,
  setUserActiveSessionId,
  resetUserChatSession,
  getUserChatDialogs,
  saveUserChatDialogs,
  isSystemCategorizationTag,
} from './services/healingSummaryService'
import {
  type VoiceProfileId,
  VOICE_PROFILES,
  getSavedVoiceProfileId,
  saveVoiceProfileId,
  speakText,
  stopSpeaking,
} from './services/voiceService'
import { VoiceSelectorPanel } from './components/VoiceSelectorPanel'

function getUserIdFromName(userName: string): string {
  const clean = userName ? userName.trim() : ''
  return clean ? `user_${encodeURIComponent(clean)}` : 'user_guest'
}

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    apple: (
      <>
        <path d="M12 7c-2.9-2.1-6.3.1-6.3 4.5 0 4.2 2.8 8 6.3 8s6.3-3.8 6.3-8C18.3 7.1 14.9 4.9 12 7Z" />
        <path d="M12 7c-.5-2.8.8-4.7 3.7-5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="3" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    heart: (
      <path d="M20.8 5.8c-1.6-2.1-4.8-2.1-6.5-.2L12 8.2 9.7 5.6c-1.7-1.9-4.9-1.9-6.5.2-1.4 1.8-1.1 4.5.5 6.1L12 20l8.3-8.1c1.6-1.6 1.9-4.3.5-6.1Z" />
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.7l.9-1.9-2.1-2.1-1.9.9a7 7 0 0 0-1.7-.7l-.7-2h-3l-.7 2a7 7 0 0 0-1.7.7l-1.9-.9-2.1 2.1.9 1.9a7 7 0 0 0-.7 1.7l-2 .7v3l2 .7a7 7 0 0 0 .7 1.7l-.9 1.9 2.1 2.1 1.9-.9a7 7 0 0 0 1.7.7l.7 2h3l.7-2a7 7 0 0 0 1.7-.7l1.9.9 2.1-2.1-.9-1.9a7 7 0 0 0 .7-1.7l2-.7Z" />
      </>
    ),
    moon: <path d="M20 15.1A8 8 0 0 1 8.9 4a8.2 8.2 0 1 0 11.1 11.1Z" />,
    type: (
      <>
        <path d="M5 5h14M12 5v14M8 19h8" />
      </>
    ),
    arrow: (
      <>
        <path d="m15 18-6-6 6-6" />
        <path d="M9 12h11" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    home: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    video: (
      <>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
    bookmark: <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />,
    share: (
      <>
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </>
    ),
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </>
    ),
    rotate: (
      <>
        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    user: (
      <>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Brand() {
  const [timeStr, setTimeStr] = useState('09:30')
  useEffect(() => {
    const now = new Date()
    setTimeStr(`${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`)
  }, [])
  return (
    <div className="brand-row">
      <img src={xiaoanLogo} alt="安心健康" />
      <span>{timeStr}</span>
    </div>
  )
}

function Mascot({
  size = 'large',
  isSpeaking = false,
  isReplying = false,
  status = 'idle',
  enableTalkingAnimation = false,
  allowTalking = false,
  allowWaving = true,
  onClick,
}: {
  size?: 'small' | 'medium' | 'large'
  isSpeaking?: boolean
  isReplying?: boolean
  status?: XiaoanChatStatus
  enableTalkingAnimation?: boolean
  allowTalking?: boolean
  allowWaving?: boolean
  onClick?: () => void
}) {
  return (
    <div className={`mascot mascot-${size}`} aria-label="绿色毛绒陪伴角色小安">
      <Xiaoan2D
        size={size}
        isSpeaking={isSpeaking}
        isReplying={isReplying}
        status={status}
        enableTalkingAnimation={enableTalkingAnimation || allowTalking}
        allowWaving={allowWaving}
        onClick={onClick}
      />
    </div>
  )
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-button" onClick={onClick} aria-label="返回">
      <Icon name="arrow" />
    </button>
  )
}

function PageTitle({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <header className="page-title">
      <h1>{children}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  )
}

function PrimaryButton({
  children,
  onClick,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
}) {
  return (
    <button className="primary-button" onClick={onClick} type={type}>
      {children}
    </button>
  )
}

function Login({ onLogin }: { onLogin: (name: string) => void }) {
  const [mode, setMode] = useState<'adult' | 'minor'>('adult')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(true)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (agreed) onLogin(name.trim() || '小安')
  }

  function handleQuickFill() {
    setName('小安的旅人')
    setPassword('888888')
  }

  return (
    <main className="screen login-screen">
      <Brand />
      <section className="login-hero">
        <div className="welcome">
          <div className="welcome-bubble speech-bubble" role="status" aria-label="小安说：你来了">
            <span className="speech-text">你来了</span>
            <svg
              className="speech-tail"
              width="18"
              height="12"
              viewBox="0 0 18 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 0 C6 3 3 7 1 11 C5 9 10 6 17 0 Z"
                fill="rgba(255, 255, 255, 0.96)"
                stroke="rgba(255, 255, 255, 0.98)"
                strokeWidth="1"
              />
            </svg>
          </div>
          <Mascot />
          <div className="welcome-mascot-badge">
            <span>小安在这里静静陪伴你</span>
          </div>
        </div>
        <form className="glass-card login-card" onSubmit={submit}>
          <div className="login-card-header">
            <h2>欢迎回来</h2>
            <p className="login-subtitle">温和陪伴 · 守护每一个深呼吸</p>
          </div>

          <div className="segment">
            <button
              type="button"
              className={mode === 'adult' ? 'active' : ''}
              onClick={() => setMode('adult')}
            >
              🌱 成人模式
            </button>
            <button
              type="button"
              className={mode === 'minor' ? 'active' : ''}
              onClick={() => setMode('minor')}
            >
              🌸 未成年模式
            </button>
          </div>

          {mode === 'minor' && (
            <div className="minor-mode-banner">
              <span>🛡️ 已开启青少年绿色关怀与健康监护守护</span>
            </div>
          )}

          <div className="login-field-group">
            <label>
              <span className="field-label-text">
                {mode === 'adult' ? '用户名' : '监护人账号'}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={mode === 'adult' ? '请输入用户名（例如：小安）' : '请输入监护人手机或账号'}
                autoComplete="username"
              />
            </label>
          </div>

          <div className="login-field-group">
            <label>
              <span className="field-label-text">登录密码</span>
              <span className="password-field">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请输入登录密码"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  title={showPassword ? '隐藏密码' : '显示密码'}
                >
                  <Icon name="eye" size={19} />
                </button>
              </span>
            </label>
          </div>

          <div className="quick-fill-row">
            <button
              type="button"
              className="quick-fill-btn"
              onClick={handleQuickFill}
            >
              ✨ 快速填入体验账号
            </button>
          </div>

          <label className="agreement">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span className="agreement-text">
              我已阅读并同意《用户协议》与《隐私政策》
            </span>
          </label>

          <PrimaryButton type="submit">
            <span className="btn-text-with-arrow">进入安心空间 ➔</span>
          </PrimaryButton>
          {!agreed && <small className="form-tip">请先勾选同意用户协议与隐私政策</small>}
        </form>
      </section>
    </main>
  )
}

function Home({
  name,
  navigate,
  fontScale,
  energyScore,
  onLogout,
}: {
  name: string
  navigate: (page: Page, params?: Record<string, string>) => void
  fontScale: number
  energyScore: number
  onLogout?: () => void
}) {
  const { soothing, toggleSoothing } = useTheme()
  const navItems: { page: Page; icon: IconName; title: string; sub: string; className: string }[] = [
    { page: 'assessment', icon: 'apple', title: '心理测评', sub: '轻轻答几题', className: 'nav-top-left' },
    { page: 'settings', icon: 'settings', title: '系统设置', sub: '音量与偏好', className: 'nav-top-right' },
    { page: 'tools', icon: 'lock', title: '能量工具', sub: '歇一歇，看一看', className: 'nav-bottom-left' },
    { page: 'chat', icon: 'heart', title: '深度疗愈', sub: '慢慢说，我在听', className: 'nav-bottom-right' },
  ]

  return (
    <main className="screen home-screen">
      <Brand />
      <div className="home-actions">
        {/* Today's Energy quick card */}
        <button
          className="home-energy-chip"
          onClick={() => navigate('tool-energy', { from: 'home' })}
          title="点击查看或测试今日能量"
        >
          <span className="home-energy-dot" />
          今日能量: <strong>{energyScore || 82}</strong> 绿意充沛
        </button>

        <button
          type="button"
          onClick={toggleSoothing}
          className={`home-soothing-btn ${soothing ? 'active' : ''}`}
          title={soothing ? '点击切换回常规模式' : '点击开启舒缓模式'}
          aria-pressed={soothing}
        >
          <Icon name="moon" size={17} /> {soothing ? '舒缓已开启' : '舒缓模式'}
        </button>
        <button onClick={onLogout || (() => navigate('login'))}>结束当次会话</button>
      </div>

      {navItems.map((item) => (
        <div className={`home-nav ${item.className}`} key={item.page}>
          <button
            onClick={() => navigate(item.page)}
            style={
              {
                '--accent':
                  item.page === 'chat'
                    ? '#4f8461'
                    : item.page === 'settings'
                    ? '#b89b53'
                    : item.page === 'tools'
                    ? '#5b9868'
                    : '#70a47a',
              } as React.CSSProperties
            }
          >
            <Icon name={item.icon} size={25} />
            <strong>{item.title}</strong>
          </button>
          <span>{item.sub}</span>
        </div>
      ))}

      <div className="home-mascot">
        <Mascot />
      </div>

      <button className="speak-button" onClick={() => navigate('chat')}>
        <i />
        点我说话
      </button>
      <span className="scale-preview">
        当前字号 {fontScale === 1 ? '标准' : fontScale === 1.1 ? '较大' : '特大'}
      </span>
    </main>
  )
}


function Settings({
  navigate,
  volume,
  setVolume,
  fontScale,
  setFontScale,
  onLogout,
}: {
  navigate: (page: Page) => void
  volume: number
  setVolume: (value: number) => void
  fontScale: number
  setFontScale: (value: number) => void
  onLogout?: () => void
}) {
  const { soothing, toggleSoothing } = useTheme()
  return (
    <main className="screen">
      <BackButton onClick={() => navigate('home')} />
      <PageTitle>设置与偏好</PageTitle>
      <section className="settings-layout">
        <Mascot size="small" />
        <div className="settings-column">
          <div className="glass-card settings-card">
            <div className="setting-toggle-row">
              <div className="setting-toggle-info">
                <b>舒缓模式</b>
                <p>夜间森林疗愈色调，温和护眼</p>
              </div>
              <button
                type="button"
                className={`theme-toggle-switch ${soothing ? 'active' : ''}`}
                onClick={toggleSoothing}
                aria-pressed={soothing}
              >
                <Icon name="moon" size={16} />
                <span>{soothing ? '已开启' : '已关闭'}</span>
              </button>
            </div>

            <label className="range-label">
              <b>音量</b>
              <span>{volume}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{ '--range': `${volume}%` } as React.CSSProperties}
            />
            <b>字号大小</b>
            <div className="segment font-segment">
              {[
                ['标准', 1],
                ['较大', 1.1],
                ['特大', 1.2],
              ].map(([label, value]) => (
                <button
                  key={label}
                  className={fontScale === value ? 'active' : ''}
                  onClick={() => setFontScale(value as number)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="glass-card session-card">
            <p>结束后会回到登录。这次说的话不会留下来。</p>
            <button onClick={onLogout || (() => navigate('login'))}>结束当次会话</button>
          </div>
        </div>
      </section>
    </main>
  )
}

const ToolArt = ({ type }: { type: number }) => (
  <div className={`tool-art art-${type}`}>
    {type === 0 && (
      <>
        <div className="drop" />
        <i />
      </>
    )}
    {type === 1 && (
      <>
        <div className="letter">🍃</div>
      </>
    )}
    {type === 2 && (
      <>
        <div className="screen-shape">
          <span />
          <i>▶</i>
        </div>
        <b />
      </>
    )}
    {type === 3 && (
      <>
        <div className="book">
          <span />
          <span />
        </div>
      </>
    )}
  </div>
)

function Tools({ navigate }: { navigate: (page: Page, params?: Record<string, string>) => void }) {
  // 4 主要内容入口 (适合平板横屏的 2×2 大卡片布局)
  const mainCards: {
    target: Page
    title: string
    sub: string
    tag: string
    renderArt: () => ReactNode
  }[] = [
    {
      target: 'videos',
      title: '心理视频',
      sub: '用一段温柔的影像，认识情绪、理解自己。',
      tag: '温暖影像 · 理解自己',
      renderArt: () => <CardVisualVideo />,
    },
    {
      target: 'scripts',
      title: '互动剧本',
      sub: '在生活情境中练习表达、沟通与理解。',
      tag: '情境演练 · 温和表达',
      renderArt: () => <CardVisualScript />,
    },
    {
      target: 'articles',
      title: '科普文章',
      sub: '用轻松易懂的方式，了解情绪与心理知识。',
      tag: '心理通识 · 科学释怀',
      renderArt: () => <CardVisualArticle />,
    },
    {
      target: 'tool-meditation',
      title: '冥想放松',
      sub: '跟随自然声景与温柔引导，让身心慢慢安静下来。',
      tag: '声景引导 · 身心留白',
      renderArt: () => <CardVisualMeditation />,
    },
  ]

  // 「随手疗愈」快捷工具区域 (3 个横向排列小卡片，触控面积充足)
  const quickTools: {
    target: Page
    title: string
    sub: string
    renderIcon: () => ReactNode
  }[] = [
    {
      target: 'tool-breathing',
      title: '呼吸练习',
      sub: '4-4-6 深度腹式换气',
      renderIcon: () => <QuickIconBreathing />,
    },
    {
      target: 'tool-mood',
      title: '情绪记录',
      sub: '真实写下此刻心情',
      renderIcon: () => <QuickIconMood />,
    },
    {
      target: 'tool-energy',
      title: '今日能量',
      sub: '四维状态轻测电量',
      renderIcon: () => <QuickIconEnergy />,
    },
  ]

  return (
    <main className="screen tools-screen">
      <BackButton onClick={() => navigate('home')} />
      <PageTitle subtitle="找到此刻适合你的方式，给心情一点温柔的空间。">
        能量工具箱
      </PageTitle>

      <div className="tools-scroll-body">
        {/* 四大主要内容入口：2×2 大卡片 */}
        <section className="tools-main-grid" aria-label="主要内容入口">
          {mainCards.map((card) => (
            <button
              key={card.title}
              type="button"
              className="tool-main-card"
              onClick={() => navigate(card.target)}
            >
              <div className="card-art-col">{card.renderArt()}</div>
              <div className="card-meta-col">
                <div className="card-header-row">
                  <strong className="card-title">{card.title}</strong>
                  <span className="card-tag">{card.tag}</span>
                </div>
                <p className="card-sub">{card.sub}</p>
                <div className="card-action-hint">
                  <span>立即进入</span>
                  <span className="action-arrow">→</span>
                </div>
              </div>
            </button>
          ))}
        </section>

        {/* 下方「随手疗愈」快捷工具区域 */}
        <section className="tools-quick-section" aria-label="随手疗愈快捷工具">
          <div className="tools-quick-header">
            <div className="quick-title-wrap">
              <span className="quick-sparkle-dot" aria-hidden="true" />
              <h2 className="quick-section-title">随手疗愈</h2>
            </div>
            <span className="quick-section-desc">
              轻触即练，随时给身心一个自在呼吸的角落
            </span>
          </div>

          <div className="tools-quick-row">
            {quickTools.map((tool) => (
              <button
                key={tool.title}
                type="button"
                className="quick-tool-card"
                onClick={() => {
                  if (tool.target === 'tool-energy') {
                    navigate('tool-energy', { from: 'tools' })
                  } else {
                    navigate(tool.target)
                  }
                }}
              >
                {tool.renderIcon()}
                <div className="quick-tool-info">
                  <strong className="quick-title">{tool.title}</strong>
                  <span className="quick-sub">{tool.sub}</span>
                </div>
                <span className="quick-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function Videos({
  navigate,
  selectedCategory,
  onSelectCategory,
  onSelectVideo,
}: {
  navigate: (page: Page) => void
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  onSelectVideo: (id: string) => void
}) {
  const currentVideos = videoCatalog.filter((v) => v.category === selectedCategory)

  return (
    <main className="screen">
      <BackButton onClick={() => navigate('tools')} />
      <PageTitle subtitle="慢下来看一看，选一段温暖你的文字与画面。">心理视频库</PageTitle>
      <section className="video-layout">
        <nav>
          {videoCategories.map((item) => (
            <button
              className={selectedCategory === item ? 'active' : ''}
              key={item}
              onClick={() => onSelectCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <div className="video-content">
          <p>当前主题：<strong>{selectedCategory}</strong>（共 {currentVideos.length} 个疗愈短片）</p>
          <div className="video-grid">
            {currentVideos.map((video) => (
              <button key={video.id} onClick={() => onSelectVideo(video.id)}>
                <div
                  className="video-thumb"
                  style={{
                    background: `linear-gradient(135deg, ${video.accentColor}33, ${video.accentColor}88)`,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '1.4rem',
                    color: video.accentColor,
                  }}
                >
                  ▶
                </div>
                <span>
                  <strong>{video.title}</strong>
                  <small>{video.sub}</small>
                  <em>时长 {video.time} · {video.tags[0]}</em>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Chat({
  navigate,
  messages,
  setMessages,
  chatDialogs,
  setChatDialogs,
  chatContext,
  onDismissContext,
  userId = 'guest',
  sessionId = 'default',
  onEndConversation,
}: {
  navigate: (page: Page) => void
  messages: string[]
  setMessages: React.Dispatch<React.SetStateAction<string[]>>
  chatDialogs: ChatDialogItem[]
  setChatDialogs: React.Dispatch<React.SetStateAction<ChatDialogItem[]>>
  chatContext?: { topicTitle: string; summary: string } | null
  onDismissContext?: () => void
  userId?: string
  sessionId?: string
  onEndConversation?: () => void
}) {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<XiaoanChatStatus>('idle')
  const [replyText, setReplyText] = useState('')
  const [seconds, setSeconds] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [lastSubmittedText, setLastSubmittedText] = useState('')
  const chatReplyRef = useRef<HTMLDivElement>(null)
  const [chatReplyHeight, setChatReplyHeight] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Voice tone selection & playback state
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfileId>(() =>
    getSavedVoiceProfileId(userId)
  )
  const [currentPlayingVoice, setCurrentPlayingVoice] = useState<VoiceProfileId | null>(null)
  const [previewingVoice, setPreviewingVoice] = useState<VoiceProfileId | null>(null)
  const [voiceToast, setVoiceToast] = useState<{ message: string; visible: boolean } | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)
  const activeVoicePlaybackRef = useRef<{ stop: () => void } | null>(null)
  const isVoicePlayingRef = useRef<boolean>(false)

  // 真实 AI 回复音频与服务接入状态
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false)
  const [chatError, setChatError] = useState<{ message: string; prompt: string } | null>(null)
  const [audioInputMode, setAudioInputModeState] = useState<AudioInputMode>(() => getAudioInputMode())

  // 监听真实回复音频播放状态变更
  useEffect(() => {
    const unsub = assistantAudioService.subscribe((playing) => {
      setIsAudioPlaying(playing)
    })
    return () => {
      unsub()
      assistantAudioService.stopAssistantAudio()
    }
  }, [])

  // Sync saved voice when user account changes
  useEffect(() => {
    const saved = getSavedVoiceProfileId(userId)
    setSelectedVoice(saved)
  }, [userId])

  function showVoiceToast(msg: string) {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    setVoiceToast({ message: msg, visible: true })
    toastTimeoutRef.current = window.setTimeout(() => {
      setVoiceToast(null)
    }, 2800)
  }

  function handleSelectVoice(newVoice: VoiceProfileId) {
    const profile = VOICE_PROFILES[newVoice]
    setSelectedVoice(newVoice)
    saveVoiceProfileId(userId, newVoice)

    // 诚实反馈：未接入真实 TTS 时，提示用户当前音色选择将在接入语音合成服务后生效
    showVoiceToast(`已选择「${profile.label}」音色 · 接入真实语音合成 (TTS) 服务后生效 🍃`)
  }

  function handlePreviewVoice(voiceId: VoiceProfileId) {
    if (
      status === 'listening' ||
      status === 'thinking' ||
      status === 'turningToFront' ||
      status === 'speaking' ||
      isAudioPlaying
    ) {
      showVoiceToast('小安正在对话中，稍后再试听哦 🍃')
      return
    }

    activeVoicePlaybackRef.current?.stop()
    assistantAudioService.stopAssistantAudio()
    stopSpeaking()

    const profile = VOICE_PROFILES[voiceId]
    setPreviewingVoice(voiceId)
    setCurrentPlayingVoice(voiceId)
    setStatus('speaking')

    const playback = speakText(profile.samplePhrase, voiceId, {
      onStart: () => {
        isVoicePlayingRef.current = true
      },
      onEnd: () => {
        isVoicePlayingRef.current = false
        setPreviewingVoice(null)
        setCurrentPlayingVoice(null)
        setStatus('idle')
      },
      onError: () => {
        isVoicePlayingRef.current = false
        setPreviewingVoice(null)
        setCurrentPlayingVoice(null)
        setStatus('idle')
      },
    })
    activeVoicePlaybackRef.current = playback
  }

  // Voice recording timer: only counts while listening
  useEffect(() => {
    if (status !== 'listening') return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [status])

  // Cleanup on unmount: safely abort any pending AI stream, voice recognition, and stop speaking
  useEffect(() => {
    return () => {
      isListeningIntentRef.current = false
      isUserStoppingVoiceRef.current = false
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      if (chatRecognitionRef.current) {
        try {
          chatRecognitionRef.current.abort()
        } catch {}
        chatRecognitionRef.current = null
      }
      abortControllerRef.current?.abort()
      assistantAudioService.stopAssistantAudio()
      activeVoicePlaybackRef.current?.stop()
      stopSpeaking()
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // Dynamically track height of Xiao An reply so user message chip (span1) sits neatly below it without overlap
  useEffect(() => {
    if (!chatReplyRef.current) return
    const updateHeight = () => {
      if (chatReplyRef.current) {
        setChatReplyHeight(chatReplyRef.current.offsetHeight)
      } else {
        setChatReplyHeight(0)
      }
    }
    updateHeight()
    const ro = new ResizeObserver(() => {
      updateHeight()
    })
    ro.observe(chatReplyRef.current)
    return () => ro.disconnect()
  }, [replyText, status, messages.length, chatError])

  // 取消当前 AI 生成
  const handleCancelAiReply = useCallback(() => {
    abortControllerRef.current?.abort()
    assistantAudioService.stopAssistantAudio()
    activeVoicePlaybackRef.current?.stop()
    stopSpeaking()
    setStatus('idle')
    setIsAudioPlaying(false)
    showVoiceToast('已停止本次生成')
  }, [])

  // Common AI reply trigger with status lifecycle and streaming
  const triggerAiResponse = useCallback((promptText: string) => {
    // 1. 取消任何正在进行的请求与音频播放
    abortControllerRef.current?.abort()
    assistantAudioService.stopAssistantAudio()
    activeVoicePlaybackRef.current?.stop()
    stopSpeaking()
    isVoicePlayingRef.current = false
    setIsAudioPlaying(false)
    setPreviewingVoice(null)
    setCurrentPlayingVoice(null)
    setChatError(null)

    const voiceToUse = selectedVoice

    const controller = requestXiaoanReply(
      promptText,
      {
        onStatusChange: (newStatus) => {
          setStatus(newStatus)
        },
        onThinking: () => {
          setReplyText('')
          setChatError(null)
        },
        onStreamStart: (_full, _isMock, audioUrl) => {
          setReplyText('')
          if (audioUrl) {
            assistantAudioService.playAssistantAudio(audioUrl, {
              onStart: () => {
                setIsAudioPlaying(true)
                setStatus('speaking')
              },
              onEnd: () => {
                setIsAudioPlaying(false)
                setStatus('idle')
              },
              onError: (err) => {
                console.warn('Real audio playback error:', err)
                setIsAudioPlaying(false)
                setStatus('idle')
              },
            })
          }
        },
        onStreamChunk: (_chunk, accumulated) => {
          setReplyText(accumulated)
        },
        onStreamEnd: (fullResponse, isMock = true, audioUrl) => {
          setReplyText(fullResponse)
          const now = new Date()
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
          
          setChatDialogs((prev) => [
            ...prev,
            {
              id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              role: 'assistant',
              text: fullResponse,
              content: fullResponse,
              time: timeStr,
              createdAt: Date.now(),
              inputType: 'text',
              status: 'sent',
              isMock,
              audioUrl,
              voiceId: voiceToUse,
              userId,
              sessionId,
            },
          ])

          // 若后端返回了真实有效的音频，启动播放模块；
          // 若后端尚未返回音频（未接入真实 TTS），按规范严格只展示文本，绝不伪造发音或静音假装播放
          if (audioUrl) {
            assistantAudioService.playAssistantAudio(audioUrl, {
              onStart: () => {
                setIsAudioPlaying(true)
                setStatus('speaking')
              },
              onEnd: () => {
                setIsAudioPlaying(false)
                setStatus('idle')
              },
              onError: (err) => {
                console.warn('Audio playback error:', err)
                setIsAudioPlaying(false)
                setStatus('idle')
              },
            })
          } else {
            // 未接入真实 TTS 时，文本生成完毕即刻退出说话动画，安全恢复待机
            setStatus('idle')
          }
        },
        onError: (err: any) => {
          console.warn('AI reply aborted or failed:', err)
          assistantAudioService.stopAssistantAudio()
          activeVoicePlaybackRef.current?.stop()
          stopSpeaking()
          isVoicePlayingRef.current = false
          setIsAudioPlaying(false)
          setStatus('idle')
          setCurrentPlayingVoice(null)

          // 请求失败时显示明确错误和重试入口，严禁把失败伪装成 AI 回复加入聊天列表
          if (err?.name !== 'AbortError' && err?.code !== 'ERR_ABORTED') {
            setChatError({
              message: err?.message || '网络或接口连接异常，请点击重试 🍃',
              prompt: promptText,
            })
          }
        },
      },
      {
        userId,
        sessionId,
        voiceProfileId: voiceToUse,
        audioInputMode,
      }
    )

    abortControllerRef.current = controller
  }, [selectedVoice, userId, sessionId, audioInputMode])

  // 重试发送上一条失败请求
  const handleRetry = useCallback(() => {
    if (!chatError?.prompt) return
    const retryPrompt = chatError.prompt
    setChatError(null)
    triggerAiResponse(retryPrompt)
  }, [chatError, triggerAiResponse])

  // Voice recognition states & references for Chat
  const chatRecognitionRef = useRef<any>(null)
  const isListeningIntentRef = useRef<boolean>(false)
  const isUserStoppingVoiceRef = useRef<boolean>(false)
  const isSubmittingRef = useRef<boolean>(false)
  const restartTimerRef = useRef<number | null>(null)
  const accumulatedPreviousFinalRef = useRef<string>('')
  const sessionFinalRef = useRef<string>('')
  const interimTranscriptRef = useRef<string>('')
  const [liveVoiceText, setLiveVoiceText] = useState<string>('')
  const [voiceInputState, setVoiceInputState] = useState<'idle' | 'listening' | 'recognizing' | 'error'>('idle')

  // Stop active speech recognition safely
  const stopVoiceRecognition = useCallback(() => {
    isUserStoppingVoiceRef.current = true
    isListeningIntentRef.current = false
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (chatRecognitionRef.current) {
      try {
        chatRecognitionRef.current.stop()
      } catch (err) {
        console.warn('Speech recognition stop error:', err)
      }
    }
  }, [])

  // Cancel/abort speech recognition without submitting
  const cancelVoiceRecognition = useCallback(() => {
    isListeningIntentRef.current = false
    isUserStoppingVoiceRef.current = false
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (chatRecognitionRef.current) {
      try {
        chatRecognitionRef.current.abort()
      } catch (err) {
        console.warn('Speech recognition abort error:', err)
      }
      chatRecognitionRef.current = null
    }
    accumulatedPreviousFinalRef.current = ''
    sessionFinalRef.current = ''
    interimTranscriptRef.current = ''
    setLiveVoiceText('')
    setVoiceInputState('idle')
    setStatus('idle')
  }, [])

  // 【核心统一提交流程】：统一文字输入与语音输入的数据流转
  const submitUserMessage = useCallback(
    (rawText: string, inputSource: 'text' | 'voice' = 'text') => {
      const cleanText = rawText ? rawText.trim() : ''
      if (!cleanText) {
        if (inputSource === 'voice') {
          showVoiceToast('未听清你说的话，请重试或写字告诉我 🍃')
        }
        return
      }

      // 防止重复提交与繁忙状态并发
      if (
        isSubmittingRef.current ||
        status === 'thinking' ||
        status === 'turningToFront' ||
        status === 'speaking'
      ) {
        return
      }
      isSubmittingRef.current = true

      // 若处于语音识别状态，安全终止
      isListeningIntentRef.current = false
      isUserStoppingVoiceRef.current = false
      if (restartTimerRef.current !== null) {
        window.clearTimeout(restartTimerRef.current)
        restartTimerRef.current = null
      }
      if (chatRecognitionRef.current) {
        try {
          chatRecognitionRef.current.abort()
        } catch {}
        chatRecognitionRef.current = null
      }

      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      const messageId = `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

      const userMsgItem: ChatDialogItem = {
        id: messageId,
        role: 'user',
        text: cleanText,
        content: cleanText,
        time: timeStr,
        createdAt: Date.now(),
        inputType: inputSource,
        status: 'sent',
        userId,
        sessionId,
      }

      // 1. 右侧气泡立即展示真实用户输入，并同步历史消息列表
      setHasSubmitted(true)
      setLastSubmittedText(cleanText)
      setLiveVoiceText('')
      setVoiceInputState('idle')
      setMessages((prev) => [...prev, cleanText])
      setChatDialogs((prev) => [...prev, userMsgItem])

      // 2. 统一同步真实情绪分析记录（标明输入来源与隔离用户）
      addEmotionEntry(cleanText, inputSource, undefined, userId)

      // 3. 清空文字输入框
      setText('')

      // 4. 触发小安回复
      triggerAiResponse(cleanText)

      // 5. 释放提交锁
      window.setTimeout(() => {
        isSubmittingRef.current = false
      }, 100)
    },
    [status, userId, sessionId, triggerAiResponse]
  )

  // Start a recognition session (supports continuous listening across pauses)
  const startRecognitionSession = useCallback(() => {
    const SpeechRecognition =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null

    if (!SpeechRecognition) {
      showVoiceToast('当前浏览器暂不支持语音识别，请直接在下方输入文字交流 🍃')
      setStatus('idle')
      setVoiceInputState('idle')
      isListeningIntentRef.current = false
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.lang = 'zh-CN'
      rec.continuous = true
      rec.interimResults = true
      rec.maxAlternatives = 1

      rec.onstart = () => {
        setStatus('listening')
        setVoiceInputState('listening')
      }

      rec.onresult = (event: any) => {
        let interim = ''
        let currentFinal = ''
        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i]
          if (res.isFinal) {
            currentFinal += res[0].transcript
          } else {
            interim += res[0].transcript
          }
        }
        sessionFinalRef.current = currentFinal
        interimTranscriptRef.current = interim
        const combined = (accumulatedPreviousFinalRef.current + currentFinal + interim).trim()
        setLiveVoiceText(combined)
        if (combined) {
          setVoiceInputState('recognizing')
          // 语音识别的同时实时同步填入输入框，实现所说即所见与用户确认/修改能力
          setText(combined)
        }
      }

      rec.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error)
        if (event.error === 'no-speech') {
          // Normal pause in speech. Do not abort session if user is still in listening mode.
          return
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          isListeningIntentRef.current = false
          showVoiceToast('麦克风权限未开启，请在浏览器中允许麦克风访问或使用文字输入')
          setStatus('idle')
          setVoiceInputState('error')
          setLiveVoiceText('')
          return
        }

        if (event.error === 'audio-capture') {
          isListeningIntentRef.current = false
          showVoiceToast('未检测到可用的麦克风录音设备，请检查音频输入')
          setStatus('idle')
          setVoiceInputState('error')
          setLiveVoiceText('')
          return
        }

        if (event.error === 'network') {
          isListeningIntentRef.current = false
          showVoiceToast('语音识别网络连接受阻，建议直接使用文字输入')
          setStatus('idle')
          setVoiceInputState('error')
          setLiveVoiceText('')
          return
        }

        if (event.error !== 'aborted') {
          showVoiceToast(`语音识别遇到波折（${event.error}），请重试或写字`)
          isListeningIntentRef.current = false
          setStatus('idle')
          setVoiceInputState('idle')
          setLiveVoiceText('')
        }
      }

      rec.onend = () => {
        chatRecognitionRef.current = null
        if (isUserStoppingVoiceRef.current) {
          // 用户显式点击了「完成说话」按钮
          const fullSaid = (
            accumulatedPreviousFinalRef.current +
            sessionFinalRef.current +
            ' ' +
            interimTranscriptRef.current
          ).trim()
          submitUserMessage(fullSaid, 'voice')
        } else if (isListeningIntentRef.current) {
          // 浏览器因为静音自动触发 onend，但用户仍在意向聆听中，平滑续接
          accumulatedPreviousFinalRef.current += sessionFinalRef.current
          sessionFinalRef.current = ''
          interimTranscriptRef.current = ''
          if (restartTimerRef.current !== null) {
            window.clearTimeout(restartTimerRef.current)
          }
          restartTimerRef.current = window.setTimeout(() => {
            if (isListeningIntentRef.current && !isUserStoppingVoiceRef.current) {
              startRecognitionSession()
            }
          }, 50)
        } else {
          // 停止聆听：保留输入框中已识别的内容供用户确认修改与手动发送
          setStatus('idle')
          setVoiceInputState('idle')
          setLiveVoiceText('')
        }
      }

      rec.start()
      chatRecognitionRef.current = rec
    } catch (err: any) {
      console.warn('SpeechRecognition start failed:', err)
      showVoiceToast('启动语音识别失败，请检查浏览器权限或输入文字')
      setStatus('idle')
      setVoiceInputState('idle')
      setLiveVoiceText('')
      isListeningIntentRef.current = false
    }
  }, [submitUserMessage])

  // 文字消息点击发送或回车：统一进入 submitUserMessage
  function send() {
    submitUserMessage(text, 'text')
  }

  // Handle Voice button toggle
  function toggleVoice() {
    if (status === 'listening' || voiceInputState === 'listening' || voiceInputState === 'recognizing') {
      // 用户点击「点击完成」：完成语音输入并自动提交进入统一提交流程
      isUserStoppingVoiceRef.current = true
      isListeningIntentRef.current = false
      stopVoiceRecognition()

      // 容错兜底：若 onend 在 260ms 内未及时触发，直接以累计文本提交
      window.setTimeout(() => {
        if (!isSubmittingRef.current) {
          const fullText = (
            accumulatedPreviousFinalRef.current +
            sessionFinalRef.current +
            ' ' +
            interimTranscriptRef.current
          ).trim()
          if (fullText) {
            submitUserMessage(fullText, 'voice')
          }
        }
      }, 260)
      return
    }

    // 1. 检查浏览器支持
    const SpeechRecognition =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null

    if (!SpeechRecognition) {
      showVoiceToast('当前浏览器暂不支持语音识别，请直接在下方输入文字交流 🍃')
      return
    }

    // 2. 中断任何正在播放的 AI 回复或声音
    abortControllerRef.current?.abort()
    activeVoicePlaybackRef.current?.stop()
    stopSpeaking()
    isVoicePlayingRef.current = false
    setPreviewingVoice(null)
    setCurrentPlayingVoice(null)

    // 3. 重置语音会话追踪
    accumulatedPreviousFinalRef.current = ''
    sessionFinalRef.current = ''
    interimTranscriptRef.current = ''
    isUserStoppingVoiceRef.current = false
    isListeningIntentRef.current = true
    setLiveVoiceText('')
    setSeconds(0)

    startRecognitionSession()
  }

  // 严格动画联动：只有在生成中、流式输出中或真实语音播放中，且无错误时，才触发 talking
  const isAiReplying =
    (status === 'thinking' || status === 'turningToFront' || status === 'speaking' || isAudioPlaying) &&
    !chatError

  const displayList: ChatDialogItem[] =
    chatDialogs.length > 0
      ? chatDialogs
      : messages.map((m, i) => ({
          id: `legacy_${i}`,
          role: 'user' as const,
          text: m,
          content: m,
          time: '',
          inputType: 'text' as const,
        }))
  const userCount = displayList.filter((d) => d.role === 'user').length
  const assistantCount = displayList.filter((d) => d.role === 'assistant').length

  function handleEndConversation() {
    isListeningIntentRef.current = false
    isUserStoppingVoiceRef.current = false
    if (restartTimerRef.current !== null) {
      window.clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (chatRecognitionRef.current) {
      try {
        chatRecognitionRef.current.abort()
      } catch {}
      chatRecognitionRef.current = null
    }
    abortControllerRef.current?.abort()
    assistantAudioService.stopAssistantAudio()
    activeVoicePlaybackRef.current?.stop()
    stopSpeaking()
    isVoicePlayingRef.current = false
    setIsAudioPlaying(false)
    setStatus('idle')
    setChatError(null)
    setPreviewingVoice(null)
    setCurrentPlayingVoice(null)
    if (onEndConversation) {
      onEndConversation()
    } else {
      navigate('login')
    }
  }

  return (
    <main className="screen chat-screen">
      <BackButton
        onClick={() => {
          isListeningIntentRef.current = false
          isUserStoppingVoiceRef.current = false
          if (restartTimerRef.current !== null) {
            window.clearTimeout(restartTimerRef.current)
            restartTimerRef.current = null
          }
          if (chatRecognitionRef.current) {
            try {
              chatRecognitionRef.current.abort()
            } catch {}
            chatRecognitionRef.current = null
          }
          abortControllerRef.current?.abort()
          assistantAudioService.stopAssistantAudio()
          activeVoicePlaybackRef.current?.stop()
          stopSpeaking()
          setIsAudioPlaying(false)
          setStatus('idle')
          setChatError(null)
          navigate('home')
        }}
      />
      <VoiceSelectorPanel
        selectedVoice={selectedVoice}
        onSelectVoice={handleSelectVoice}
        isSpeaking={isAiReplying}
        currentPlayingVoice={currentPlayingVoice}
        onPreviewVoice={handlePreviewVoice}
        previewingVoice={previewingVoice}
        isTtsConnected={false}
      />
      {voiceToast && voiceToast.visible && (
        <div className="voice-switch-toast" role="status" aria-live="polite">
          <span>{voiceToast.message}</span>
        </div>
      )}
      <div className="chat-actions">
        <button
          type="button"
          onClick={() => {
            const nextMode = audioInputMode === 'browser_stt' ? 'backend_audio' : 'browser_stt'
            setAudioInputModeState(nextMode)
            setAudioInputMode(nextMode)
            showVoiceToast(
              nextMode === 'browser_stt'
                ? '已启用方案 A：浏览器端本地识别为文本后请求 🍃'
                : '已切换为方案 B：预留麦克风音频直传多模态后端 🎙️'
            )
          }}
          title={
            audioInputMode === 'browser_stt'
              ? '当前为方案 A（前端转写为文本），点击可切换为方案 B（音频直传接口预留）'
              : '当前为方案 B（音频直传接口预留），点击切回方案 A'
          }
        >
          {audioInputMode === 'browser_stt' ? '方案 A: 语音转写' : '方案 B: 音频直传(预留)'}
        </button>
        <button aria-label="字号">
          <Icon name="type" size={18} />
        </button>
        <button onClick={() => navigate('summary')}>▤ 总结</button>
        <span>
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </span>
        <button onClick={() => navigate('emotion')}>情绪</button>
        <button
          type="button"
          className="end-conversation-btn"
          onClick={handleEndConversation}
          title="结束当前对话"
        >
          结束当前对话
        </button>
      </div>
      {chatContext && (
        <div className="chat-context-banner">
          <span>
            🌿 <strong>已关联「{chatContext.topicTitle}」自评小结：</strong>
            {chatContext.summary}
          </span>
          <button
            type="button"
            className="chat-context-dismiss-btn"
            onClick={onDismissContext}
            title="关闭提示"
          >
            ✕
          </button>
        </div>
      )}

      {/* 请求失败明确错误与重试入口 */}
      {chatError && (
        <div className="chat-error-banner" role="alert">
          <div className="chat-error-info">
            <span className="chat-error-icon">🍃</span>
            <span className="chat-error-text">{chatError.message}</span>
          </div>
          <div className="chat-error-actions">
            <button
              type="button"
              className="chat-retry-btn"
              onClick={handleRetry}
              title="重新发送此条消息"
            >
              ↻ 重试
            </button>
            <button
              type="button"
              className="chat-error-close-btn"
              onClick={() => setChatError(null)}
              title="关闭错误提示"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div
        ref={chatReplyRef}
        className="chat-reply"
        style={{ display: chatError ? 'none' : 'block' }}
      >
        {status === 'thinking' || status === 'turningToFront' ? (
          <span className="reply-thinking">
            小安正在细细体会你的话... 🍃
          </span>
        ) : replyText ? (
          replyText
        ) : messages.length ? (
          '我听到了。我们慢慢来。'
        ) : chatContext ? (
          `你好，我看到了你刚完成的「${chatContext.topicTitle}」自评。感觉怎么样？想从哪一部分开始聊聊呢？`
        ) : (
          '你好，我在这里。想说的，可以从任何一句开始。'
        )}

        {/* 思考或生成中的停止生成按钮 */}
        {isAiReplying && (
          <div className="chat-reply-controls">
            <button
              type="button"
              className="chat-stop-btn"
              onClick={handleCancelAiReply}
              title="停止当前回复生成"
            >
              ⏹ 停止生成
            </button>
          </div>
        )}
      </div>
      <div className="chat-mascot">
        <Mascot
          isSpeaking={isAiReplying}
          isReplying={isAiReplying}
          status={isAiReplying ? 'speaking' : status}
          enableTalkingAnimation={true}
        />
      </div>

      {/* 第一个span组件 (span1): 用户发送的消息，位于右侧div下方，默认隐藏，发消息后显示 */}
      <span
        className={`mood-chip ${status === 'listening' ? 'mood-chip-listening' : ''}`}
        style={{
          display:
            status === 'listening' || (hasSubmitted && lastSubmittedText)
              ? 'block'
              : 'none',
          top:
            chatReplyHeight > 0
              ? `calc(4.8rem + ${chatReplyHeight}px + 0.75rem)`
              : '9.6rem',
        }}
      >
        {status === 'listening' ? (
          <div className="live-speech-content">
            <div className="live-speech-header">
              <span className="live-speech-tag">
                <span className="live-pulse-dot" /> 正在聆听中...
              </span>
              <button
                type="button"
                className="live-speech-cancel-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  cancelVoiceRecognition()
                }}
                title="取消本次语音输入"
              >
                ✕ 取消
              </button>
            </div>
            <div className="live-speech-text">
              {liveVoiceText ? (
                <span>{liveVoiceText}</span>
              ) : (
                <span className="live-speech-placeholder">轻声说出你的心事，小安在听...</span>
              )}
            </div>
          </div>
        ) : (
          lastSubmittedText
        )}
      </span>

      {/* 第二个span组件 (span2): 刚才说的·x句，保持在左侧原位不动，点击展示历史记录 */}
      <span
        className="said-count"
        style={{ display: displayList.length > 0 ? 'inline-flex' : 'none' }}
        onClick={() => setShowHistory(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setShowHistory(true)
          }
        }}
        title="点击查看历史聊天记录"
      >
        对话记录 · {displayList.length}条
      </span>

      <div className="chat-input-area">
        <button
          className={`speak-button ${status === 'listening' ? 'listening' : ''}`}
          onClick={toggleVoice}
          title={status === 'listening' ? '点击完成发言并倾诉' : '点击开启语音倾诉'}
        >
          <i />
          {status === 'listening' ? (
            <span>
              正在听你说 · <strong>点击完成</strong>
            </span>
          ) : status === 'thinking' ? (
            '小安思考中...'
          ) : status === 'turningToFront' ? (
            '小安正面向你...'
          ) : status === 'speaking' ? (
            '小安回答中...'
          ) : (
            '点我说话'
          )}
        </button>
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="写一句也可以"
            disabled={status !== 'idle' && status !== 'listening'}
          />
          <button
            onClick={send}
            disabled={!text.trim() || (status !== 'idle' && status !== 'listening')}
          >
            发送
          </button>
        </div>
      </div>

      {/* 历史记录弹窗 */}
      {showHistory && (
        <div
          className="chat-history-modal-overlay"
          onClick={() => setShowHistory(false)}
        >
          <div
            className="chat-history-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-history-header">
              <div>
                <h3>历史对话记录</h3>
                <small>
                  共记录 {displayList.length} 条对话（{userCount} 句倾诉 · {assistantCount} 次小安回应）
                </small>
              </div>
              <div className="chat-history-header-actions">
                {displayList.length > 0 && (
                  <button
                    type="button"
                    className="chat-history-clear-btn"
                    onClick={() => {
                      setChatDialogs([])
                      setMessages([])
                      if (userId && sessionId) {
                        saveUserChatDialogs(userId, sessionId, [])
                      }
                    }}
                    title="清空对话记录"
                  >
                    清空
                  </button>
                )}
                <button
                  className="chat-history-close"
                  onClick={() => setShowHistory(false)}
                  aria-label="关闭"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="chat-history-body">
              {displayList.length === 0 ? (
                <div className="chat-history-empty">
                  <span>🍃</span>
                  <p>暂无对话记录</p>
                  <small>在下方输入文字或语音，和小安说说心事吧</small>
                </div>
              ) : (
                <div className="chat-history-list">
                  {displayList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={`chat-history-item ${
                        item.role === 'assistant' ? 'assistant-item' : 'user-item'
                      }`}
                    >
                      <div className="chat-history-meta">
                        <span
                          className={`history-num ${
                            item.role === 'assistant' ? 'assistant-num' : ''
                          }`}
                        >
                          {item.role === 'assistant' ? '小安回应' : '你的倾诉'}
                        </span>
                        {item.inputType && (
                          <span className="history-input-type">
                            {item.inputType === 'voice' ? '🎙️ 语音' : '⌨️ 文字'}
                          </span>
                        )}
                        {item.isMock && (
                          <span className="history-mock-badge" title="开发阶段模拟生成，未连接真实模型">
                            开发模拟
                          </span>
                        )}
                        {item.time && <span className="history-time">{item.time}</span>}
                      </div>
                      <p className="chat-history-text">{item.content || item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="chat-history-footer">
              <button
                className="speak-button history-confirm-btn"
                onClick={() => setShowHistory(false)}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

const VOICE_SAMPLES = [
  { text: '哈哈哈，今天遇到特别好笑的事！', category: '开心' },
  { text: '太好了，终于成功了，好开心！', category: '开心' },
  { text: '嘿嘿，今天收到了一束花。', category: '开心' },
  { text: '我今天很难过，心情很沉重。', category: '难过' },
  { text: '我很焦虑，不知道怎么办才好。', category: '焦虑' },
  { text: '气死我了，真的很生气！', category: '生气' },
  { text: '虽然很难过，但大家都在帮我，我挺开心的。', category: '转折/开心' },
  { text: '虽然成功了，但我其实很难过。', category: '转折/难过' },
  { text: '哈哈哈，我真的快崩溃了。', category: '苦笑/崩溃' },
  { text: '我难过得都笑了。', category: '复合情绪' },
  { text: '我一点也不开心。', category: '否定反转' },
  { text: '你可真厉害，呵呵。', category: '反讽/无奈' },
  { text: '今天晚上我在写数学作业。', category: '中性客观' },
  { text: '嗯，好的，我知道了。', category: '日常中性' },
  { text: '呵呵。', category: '歧义/不明确' },
]

function MessageComposer({
  onSend,
  compact = false,
}: {
  onSend: (text: string, source: 'text' | 'voice') => void
  compact?: boolean
}) {
  const [text, setText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [customVoiceInput, setCustomVoiceInput] = useState('')
  const recognitionRef = useRef<any>(null)

  function sendText() {
    if (!text.trim()) return
    onSend(text.trim(), 'text')
    setText('')
  }

  function toggleVoice() {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {}
      }
      setIsListening(false)
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setShowVoiceModal(true)
      return
    }

    try {
      const rec = new SpeechRecognition()
      rec.lang = 'zh-CN'
      rec.continuous = false
      rec.interimResults = true

      rec.onstart = () => {
        setIsListening(true)
      }

      rec.onresult = (e: any) => {
        const transcript = Array.from(e.results)
          .map((r: any) => r[0].transcript)
          .join('')
        setText(transcript)
      }

      rec.onend = () => {
        setIsListening(false)
        setText((current) => {
          if (current.trim()) {
            onSend(current.trim(), 'voice')
          }
          return ''
        })
      }

      rec.onerror = (err: any) => {
        console.warn('Speech recognition error, opening voice sample modal:', err)
        setIsListening(false)
        setShowVoiceModal(true)
      }

      rec.start()
      recognitionRef.current = rec
    } catch (err) {
      console.warn('Speech recognition start failed:', err)
      setShowVoiceModal(true)
    }
  }

  return (
    <>
      <div className={`analysis-composer ${compact ? 'compact' : ''}`}>
        {!compact && (
          <button
            type="button"
            className={`speak-button ${isListening ? 'listening' : ''}`}
            onClick={toggleVoice}
            title={isListening ? '点击结束语音识别' : '点我说话（支持真实麦克风或语音模拟）'}
          >
            <i />
            {isListening ? '正在倾听...（点击完成）' : '点我说话'}
          </button>
        )}
        <div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendText()}
            placeholder={isListening ? '正在识别你的声音...' : '写一句也可以，小安为你细致分析情绪'}
          />
          <button type="button" onClick={sendText} disabled={!text.trim() && !isListening}>
            发送
          </button>
        </div>
      </div>

      {showVoiceModal && (
        <div className="voice-picker-overlay" onClick={() => setShowVoiceModal(false)}>
          <div className="voice-picker-card" onClick={(e) => e.stopPropagation()}>
            <div className="voice-picker-header">
              <h3>
                <span>🎙️</span> 语音输入与测试专区
              </h3>
              <button
                type="button"
                className="voice-picker-close"
                onClick={() => setShowVoiceModal(false)}
              >
                ✕
              </button>
            </div>
            <p className="voice-picker-desc">
              你可以直接选择以下常见的语音录音表达，也可以输入你的自定义语音文字，以语音通道传入情绪分析引擎：
            </p>
            <div className="voice-picker-grid">
              {VOICE_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="voice-sample-btn"
                  onClick={() => {
                    onSend(sample.text, 'voice')
                    setShowVoiceModal(false)
                  }}
                >
                  <span className="voice-sample-text">“{sample.text}”</span>
                  <span className="voice-sample-badge mood-平静">{sample.category}</span>
                </button>
              ))}
            </div>
            <div className="voice-picker-custom">
              <input
                value={customVoiceInput}
                onChange={(e) => setCustomVoiceInput(e.target.value)}
                placeholder="或输入自定义语音转换文本..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customVoiceInput.trim()) {
                    onSend(customVoiceInput.trim(), 'voice')
                    setCustomVoiceInput('')
                    setShowVoiceModal(false)
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customVoiceInput.trim()) {
                    onSend(customVoiceInput.trim(), 'voice')
                    setCustomVoiceInput('')
                    setShowVoiceModal(false)
                  }
                }}
              >
                以语音发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EmotionAnalysis({
  navigate,
  messages,
  setMessages,
  chatDialogs,
  setChatDialogs,
  userId = 'guest',
}: {
  navigate: (page: Page) => void
  messages: string[]
  setMessages: React.Dispatch<React.SetStateAction<string[]>>
  chatDialogs: ChatDialogItem[]
  setChatDialogs: React.Dispatch<React.SetStateAction<ChatDialogItem[]>>
  userId?: string
}) {
  const [entries, setEntries] = useState<EmotionEntry[]>(() => getEmotionEntries(userId))
  const listEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEntries(getEmotionEntries(userId))
  }, [userId])

  function handleSendMessage(text: string, source: 'text' | 'voice') {
    if (!text.trim()) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

    const newEntry = addEmotionEntry(text.trim(), source, timeStr, userId)
    setEntries((prev) => [...prev, newEntry])
    setMessages((prev) => [...prev, text.trim()])
    setChatDialogs((prev) => [
      ...prev,
      {
        id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        role: 'user',
        text: text.trim(),
        time: timeStr.slice(0, 5),
        userId,
      },
    ])

    setTimeout(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  function handleClear() {
    clearEmotionEntries(userId)
    setEntries([])
  }

  return (
    <main className="screen emotion-screen">
      <BackButton onClick={() => navigate('chat')} />
      <div className="chat-actions analysis-actions">
        <button aria-label="字号">
          <Icon name="type" size={18} />
        </button>
        <button onClick={() => navigate('summary')}>▤ 总结</button>
        <span>00:35</span>
        <button className="active">情绪</button>
      </div>

      <div className="emotion-mascot">
        <Mascot size="medium" />
      </div>

      <aside className="emotion-panel">
        <header>
          <h2>
            <span>🌱</span> 情绪分析
          </h2>
          <div className="emotion-panel-header-actions">
            {entries.length > 0 && (
              <button
                type="button"
                className="clear-btn"
                onClick={handleClear}
                title="清空情绪记录"
              >
                清空
              </button>
            )}
            <button onClick={() => navigate('chat')}>收起 ›</button>
          </div>
        </header>

        <div className="emotion-list">
          {entries.length === 0 ? (
            <div className="emotion-empty-state">
              <span>🍃</span>
              <p>暂无情绪记录</p>
              <small>在下方输入文字或语音，小安会即时解析你的心境。</small>
            </div>
          ) : (
            entries.map((entry, index) => {
              const valenceClass = `valence-${entry.analysis.valence}`
              const valenceLabel =
                entry.analysis.valence === 'positive'
                  ? '积极 ☀️'
                  : entry.analysis.valence === 'negative'
                  ? '消极 🌧️'
                  : entry.analysis.valence === 'mixed'
                  ? '复合 🌊'
                  : '中性 🍃'

              return (
                <article key={entry.id || `${entry.time}-${index}`}>
                  <b>{index + 1}</b>
                  <div>
                    <div className="emotion-entry-header">
                      <time>{entry.time}</time>
                      {entry.source === 'voice' && (
                        <span className="entry-source-badge">🎙️ 语音</span>
                      )}
                      <span className={`valence-badge ${valenceClass}`}>
                        {valenceLabel}
                      </span>
                    </div>

                    <p>{entry.text}</p>

                    <div className="emotion-status-row">
                      <span>情绪状态</span>
                      {entry.analysis.moods.map((mood) => (
                        <em key={mood} className={`mood-${mood}`}>
                          {mood}
                        </em>
                      ))}
                    </div>

                    <div className="emotion-reasoning-row">
                      <span className="confidence-tag">
                        置信度 {Math.round(entry.analysis.confidence * 100)}%
                      </span>
                      <span>{entry.analysis.reasoning}</span>
                    </div>
                  </div>
                </article>
              )
            })
          )}
          <div ref={listEndRef} />
        </div>
      </aside>

      <MessageComposer onSend={handleSendMessage} />
    </main>
  )
}

function Plant() {
  return (
    <div className="plant" aria-label="正在发芽的小植物">
      <i className="flower" />
      <i className="stem" />
      <span className="leaf leaf-1" />
      <span className="leaf leaf-2" />
      <span className="leaf leaf-3" />
      <span className="leaf leaf-4" />
      <span className="leaf leaf-5" />
      <span className="leaf leaf-6" />
      <div className="pot">
        <i />
      </div>
    </div>
  )
}

function Summary({
  navigate,
  chatDialogs,
  sessionId,
  userId = 'guest',
  onResetSession,
}: {
  navigate: (page: Page) => void
  chatDialogs: ChatDialogItem[]
  sessionId: string
  userId?: string
  onResetSession?: () => void
}) {
  const [summaryData, setSummaryData] = useState<HealingSessionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestSeqRef = useRef(0)

  async function loadOrGenerateSummary(forceRefresh = false) {
    const currentSeq = ++requestSeqRef.current
    setLoading(true)
    setError(null)

    try {
      // 1. 如果已有该用户和会话的历史小结且非强制刷新，则直接读取
      if (!forceRefresh) {
        const cached = getSessionSummary(sessionId, userId)
        if (cached && cached.sessionId === sessionId && (!cached.userId || cached.userId === userId)) {
          if (requestSeqRef.current === currentSeq) {
            setSummaryData(cached)
            setLoading(false)
          }
          return
        }
      }

      // 2. 真实异步调用本次深度疗愈对话小结生成引擎
      const result = await generateHealingSummary(chatDialogs, sessionId, userId)
      if (requestSeqRef.current === currentSeq) {
        // 验证用户与会话是否仍然匹配（防止异步返回时账户已切换）
        if (result.userId && result.userId !== userId) return
        if (result.sessionId !== sessionId) return
        setSummaryData(result)
        setLoading(false)
      }
    } catch (err) {
      console.error('Failed to generate healing summary:', err)
      if (requestSeqRef.current === currentSeq) {
        setError('生成疗愈小结遇到了一点小波折，请点击重试。')
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadOrGenerateSummary()
  }, [sessionId, userId, chatDialogs.length])

  function handleFinishAndLeave() {
    if (onResetSession) {
      onResetSession()
    } else {
      navigate('login')
    }
  }

  // 严谨过滤任何混入的系统分类标签（如「中性」「正向」「负向」等）
  const displayTopics = useMemo(
    () => (summaryData?.topics || []).filter((t) => !isSystemCategorizationTag(t)),
    [summaryData?.topics]
  )
  const displayEmotions = useMemo(
    () => (summaryData?.emotions || []).filter((e) => !isSystemCategorizationTag(e)),
    [summaryData?.emotions]
  )
  const displayWordCloud = useMemo(
    () => (summaryData?.wordCloud || []).filter((w) => !isSystemCategorizationTag(w.word)),
    [summaryData?.wordCloud]
  )

  if (loading) {
    return (
      <main className="screen summary-screen">
        <BackButton onClick={() => navigate('chat')} />
        <PageTitle>疗愈小结</PageTitle>
        <section className="summary-loading">
          <div className="summary-spinner" />
          <p>小安正在整理本次林间对话的心绪...</p>
        </section>
      </main>
    )
  }

  if (error || !summaryData) {
    return (
      <main className="screen summary-screen">
        <BackButton onClick={() => navigate('chat')} />
        <PageTitle>疗愈小结</PageTitle>
        <section className="summary-error">
          <p>{error || '未能获取到小结数据'}</p>
          <button
            type="button"
            className="summary-retry-btn"
            onClick={() => loadOrGenerateSummary(true)}
          >
            重新生成本次小结
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="screen summary-screen">
      <BackButton onClick={() => navigate('chat')} />
      <PageTitle>疗愈小结</PageTitle>

      <section className="summary-top">
        <div className="summary-copy">
          {(displayTopics.length > 0 || displayEmotions.length > 0) && (
            <div className="summary-meta-badges">
              {displayTopics.map((t) => (
                <span key={t} className="summary-badge">
                  #{t}
                </span>
              ))}
              {displayEmotions.map((e) => (
                <span key={e} className="summary-badge">
                  情绪 · {e}
                </span>
              ))}
            </div>
          )}

          {summaryData.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}

          {summaryData.selfCareSuggestion && (
            <div className="summary-suggestion">
              🌱 <strong>自我关怀建议：</strong>
              {summaryData.selfCareSuggestion}
            </div>
          )}
        </div>

        <div className="plant-wrap">
          <Plant />
          <span>{summaryData.growthMessage || '今天也发了一点芽'}</span>
        </div>
      </section>

      <section className="word-cloud">
        <b>情绪词云</b>
        <div className="word-cloud-tags">
          {displayWordCloud.map((item) => (
            <span
              className={`word-item word-${item.size}`}
              key={item.word}
              title={`对话权重: ${item.weight}`}
            >
              {item.word}
            </span>
          ))}
        </div>
      </section>

      <button className="finish-session" onClick={handleFinishAndLeave}>
        结束并离开
      </button>
    </main>
  )
}

export default function App() {
  const { soothing } = useTheme()
  const [page, setPage] = useState<Page>('login')
  const [name, setName] = useState('小安')
  const [currentUserId, setCurrentUserId] = useState<string>(() => getUserIdFromName('小安'))
  const [volume, setVolume] = useState(70)
  const [fontScale, setFontScale] = useState(1)

  // Current session & chat dialogs (strictly isolated by user)
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return getUserActiveSessionId(getUserIdFromName('小安'))
  })

  const [chatDialogs, setChatDialogs] = useState<ChatDialogItem[]>(() => {
    const initUid = getUserIdFromName('小安')
    const initSess = getUserActiveSessionId(initUid)
    return getUserChatDialogs(initUid, initSess)
  })

  const [messages, setMessages] = useState<string[]>(() => {
    return chatDialogs.filter((d) => d.role === 'user').map((d) => d.text)
  })

  const [selectedCategory, setSelectedCategory] = useState<string>(videoCategories[0])
  const [currentVideoId, setCurrentVideoId] = useState<string>(videoCatalog[0].id)

  // Energy score isolated by user
  const [energyScore, setEnergyScore] = useState<number>(() => {
    try {
      const initUid = getUserIdFromName('小安')
      const saved = localStorage.getItem(`xiaoan_energy_${initUid}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (typeof parsed.score === 'number') return parsed.score
      }
    } catch {}
    return 82
  })

  // Whenever chatDialogs changes for current user and session, save strictly under that user and session
  useEffect(() => {
    if (currentUserId && currentSessionId) {
      saveUserChatDialogs(currentUserId, currentSessionId, chatDialogs)
    }
  }, [chatDialogs, currentSessionId, currentUserId])

  // Assessment & Cross-page State
  const [currentTopicId, setCurrentTopicId] = useState<string>('inner-weather')
  const [currentAnswers, setCurrentAnswers] = useState<number[]>([])
  const [currentEvaluation, setCurrentEvaluation] = useState<AssessmentEvaluation | null>(null)
  const [chatContext, setChatContext] = useState<{ topicTitle: string; summary: string } | null>(null)
  const [energySourceOrigin, setEnergySourceOrigin] = useState<EnergySourceOrigin>('tools')

  function handleLogin(userName: string) {
    const cleanName = userName.trim() || '小安'
    const newUserId = getUserIdFromName(cleanName)

    // 1. 切换用户身份
    setName(cleanName)
    setCurrentUserId(newUserId)

    // 2. 严格按新用户身份加载该账户自己的当前会话与历史对话记录
    const userSessionId = getUserActiveSessionId(newUserId)
    const userDialogs = getUserChatDialogs(newUserId, userSessionId)
    setCurrentSessionId(userSessionId)
    setChatDialogs(userDialogs)
    setMessages(userDialogs.filter((d) => d.role === 'user').map((d) => d.text))

    // 3. 清空上一个用户的跨页面临时上下文状态
    setChatContext(null)
    setCurrentEvaluation(null)
    setCurrentAnswers([])

    // 4. 读取该用户的专属能量值
    try {
      const savedEnergy = localStorage.getItem(`xiaoan_energy_${newUserId}`)
      if (savedEnergy) {
        const parsed = JSON.parse(savedEnergy)
        if (typeof parsed.score === 'number') {
          setEnergyScore(parsed.score)
        } else {
          setEnergyScore(82)
        }
      } else {
        setEnergyScore(82)
      }
    } catch {
      setEnergyScore(82)
    }

    navigate('home')
  }

  function handleLogout(endChatSession = false) {
    // 1. 若指明结束当次对话会话，则将旧账户的当前会话封存并重置
    if (endChatSession && currentUserId) {
      resetUserChatSession(currentUserId)
    }

    // 2. 彻底清空 React 内存中属于旧账户的活动消息状态，防止内存泄露与跨账户串用
    setChatDialogs([])
    setMessages([])
    setChatContext(null)
    setCurrentEvaluation(null)
    setCurrentAnswers([])
    setName('')
    setCurrentUserId('')

    // 3. 安全回到登录页
    navigate('login')
  }

  function handleResetChatSession() {
    if (!currentUserId) return
    const newSessionId = resetUserChatSession(currentUserId)
    setCurrentSessionId(newSessionId)
    setChatDialogs([])
    setMessages([])
  }

  // Sync with browser URL Hash Router
  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (!hash) return

      const [routePath, queryString] = hash.split('?')
      const params = new URLSearchParams(queryString || '')

      if (routePath === 'video-detail') {
        const vid = params.get('id')
        if (vid) setCurrentVideoId(vid)
      }

      if (routePath === 'quiz' || routePath === 'result') {
        const topicParam = params.get('topic')
        if (topicParam) {
          setCurrentTopicId(topicParam)
        }
      }

      if (routePath === 'tool-energy') {
        const fromParam = params.get('from')
        if (fromParam === 'home') {
          setEnergySourceOrigin('home')
        } else if (fromParam === 'tools' || fromParam === 'energy-toolbox') {
          setEnergySourceOrigin('tools')
        }
      }

      const validPages: Page[] = [
        'login',
        'home',
        'assessment',
        'quiz',
        'result',
        'settings',
        'tools',
        'tool-breathing',
        'tool-mood',
        'tool-meditation',
        'tool-energy',
        'videos',
        'video-detail',
        'chat',
        'emotion',
        'summary',
        'profile',
        'scripts',
        'articles',
      ]

      if (validPages.includes(routePath as Page)) {
        setPage(routePath as Page)
      }
    }

    // Handle initial hash on load
    if (window.location.hash) {
      handleHashChange()
    } else {
      window.location.hash = '#/login'
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  function navigate(next: Page, params?: Record<string, string>) {
    if (next === 'tool-energy') {
      const fromParam = params?.from
      if (fromParam === 'home') {
        setEnergySourceOrigin('home')
      } else if (fromParam === 'tools' || fromParam === 'energy-toolbox') {
        setEnergySourceOrigin('tools')
      }
    }
    let hashStr = `#/${next}`
    if (params) {
      const sp = new URLSearchParams(params)
      hashStr += `?${sp.toString()}`
    }
    window.location.hash = hashStr
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleEnergyBack(source?: EnergySourceOrigin | string | null) {
    const origin = source || energySourceOrigin
    if (origin === 'home') {
      navigate('home')
    } else {
      navigate('tools')
    }
  }

  function handleSelectVideo(id: string) {
    setCurrentVideoId(id)
    navigate('video-detail', { id })
  }

  return (
    <div
      className="app"
      data-theme={soothing ? 'calm' : 'default'}
      style={{ '--font-scale': fontScale } as React.CSSProperties}
    >
      <div className="ambient a1" />
      <div className="ambient a2" />
      <div className="ambient a3" />
      <div className="nature-scene" aria-hidden="true">
        <div className="sun-wash" />
        <div className="forest forest-far" />
        <div className="forest forest-near" />
        <div className="botanical-branch branch-left">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="botanical-branch branch-right">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="floating-leaf leaf-a" />
        <span className="floating-leaf leaf-b" />
        <span className="floating-leaf leaf-c" />
      </div>

      {/* 舒缓模式专属柔和萤火虫光点背景动画 */}
      <FireflyOverlay />

      {page === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {page === 'home' && (
        <Home
          name={name}
          navigate={navigate}
          fontScale={fontScale}
          energyScore={energyScore}
          onLogout={() => handleLogout(false)}
        />
      )}

      {page === 'assessment' && (
        <AssessmentHub
          onBack={() => navigate('home')}
          onSelectTopic={(topicId) => {
            setCurrentTopicId(topicId)
            setCurrentAnswers([])
            setCurrentEvaluation(null)
            navigate('quiz', { topic: topicId })
          }}
          onViewRecord={(record) => {
            setCurrentTopicId(record.topicId)
            setCurrentAnswers(record.answers)
            setCurrentEvaluation(record.evaluation)
            navigate('result', { topic: record.topicId })
          }}
          mascotComponent={<Mascot size="medium" />}
          userId={currentUserId}
        />
      )}

      {page === 'quiz' && (
        <AssessmentQuiz
          topic={getTopicById(currentTopicId) || getTopicById('inner-weather')!}
          onBack={() => navigate('assessment')}
          onFinish={(topic, answers, evaluation) => {
            setCurrentAnswers(answers)
            setCurrentEvaluation(evaluation)
            navigate('result', { topic: topic.id })
          }}
          mascotComponent={<Mascot size="medium" />}
        />
      )}

      {page === 'result' && (
        <AssessmentResult
          topic={getTopicById(currentTopicId) || getTopicById('inner-weather')!}
          evaluation={
            currentEvaluation ||
            (getTopicById(currentTopicId) || getTopicById('inner-weather')!).evaluate(
              currentAnswers.length ? currentAnswers : [2, 2, 2, 2, 2]
            )
          }
          answers={currentAnswers}
          onBack={() => navigate('assessment')}
          onRetake={() => {
            setCurrentAnswers([])
            setCurrentEvaluation(null)
            navigate('quiz', { topic: currentTopicId })
          }}
          onChatWithXiaoan={(context) => {
            setChatContext(context)
            navigate('chat')
          }}
          userId={currentUserId}
        />
      )}

      {page === 'settings' && (
        <Settings
          navigate={navigate}
          volume={volume}
          setVolume={setVolume}
          fontScale={fontScale}
          setFontScale={setFontScale}
          onLogout={() => handleLogout(false)}
        />
      )}

      {page === 'tools' && <Tools navigate={navigate} />}

      {page === 'tool-breathing' && (
        <main className="screen">
          <BackButton onClick={() => navigate('tools')} />
          <PageTitle subtitle="跟随节律缓缓深吸、停驻与释放。">呼吸练习</PageTitle>
          <BreathingExercise onBack={() => navigate('tools')} />
        </main>
      )}

      {page === 'tool-mood' && (
        <main className="screen">
          <BackButton onClick={() => navigate('tools')} />
          <PageTitle subtitle="给心情留一张小纸条，小安会温柔替你收好。">情绪记录</PageTitle>
          <MoodJournal onBack={() => navigate('tools')} userId={currentUserId} />
        </main>
      )}

      {page === 'tool-meditation' && (
        <main className="screen">
          <BackButton onClick={() => navigate('tools')} />
          <PageTitle subtitle="闭上眼，把注意力轻轻放回气息上。">冥想放松</PageTitle>
          <MeditationTool onBack={() => navigate('tools')} />
        </main>
      )}

      {page === 'tool-energy' && (
        <main className="screen">
          <BackButton onClick={() => handleEnergyBack(energySourceOrigin)} />
          <PageTitle subtitle="四步感知当下的睡眠、身体与身心电量。">今日能量检测</PageTitle>
          <EnergyCheckTool
            fromSource={energySourceOrigin}
            onBack={(source) => handleEnergyBack(source)}
            onComplete={(res) => {
              setEnergyScore(res.score)
              if (currentUserId) {
                try {
                  localStorage.setItem(`xiaoan_energy_${currentUserId}`, JSON.stringify(res))
                } catch {}
              }
            }}
          />
        </main>
      )}

      {page === 'videos' && (
        <Videos
          navigate={navigate}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onSelectVideo={handleSelectVideo}
        />
      )}

      {page === 'video-detail' && (
        <main className="screen">
          <BackButton onClick={() => navigate('videos')} />
          <PageTitle subtitle="给自己一段安宁的时光。">心理视频播放</PageTitle>
          <VideoDetailView
            videoId={currentVideoId}
            onBack={() => navigate('videos')}
            onSelectVideo={handleSelectVideo}
          />
        </main>
      )}

      {page === 'scripts' && (
        <InteractiveScriptsView onBack={() => navigate('tools')} />
      )}

      {page === 'articles' && (
        <PsychoArticlesView onBack={() => navigate('tools')} />
      )}

      {page === 'chat' && (
        <Chat
          navigate={navigate}
          messages={messages}
          setMessages={setMessages}
          chatDialogs={chatDialogs}
          setChatDialogs={setChatDialogs}
          chatContext={chatContext}
          onDismissContext={() => setChatContext(null)}
          userId={currentUserId}
          sessionId={currentSessionId}
          onEndConversation={() => handleLogout(true)}
        />
      )}

      {page === 'emotion' && (
        <EmotionAnalysis
          navigate={navigate}
          messages={messages}
          setMessages={setMessages}
          chatDialogs={chatDialogs}
          setChatDialogs={setChatDialogs}
          userId={currentUserId}
        />
      )}

      {page === 'summary' && (
        <Summary
          navigate={navigate}
          chatDialogs={chatDialogs}
          sessionId={currentSessionId}
          userId={currentUserId}
          onResetSession={() => handleLogout(true)}
        />
      )}
    </div>
  )
}
