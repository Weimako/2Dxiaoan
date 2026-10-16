import React, { useState, useEffect, useRef, useCallback } from 'react'
import xiaoanFrontImg from '../assets/xiaoan/images/xiaoan_front.png'
import xiaoanLeftImg from '../assets/xiaoan/images/xiaoan_left40.png'
import xiaoanRightImg from '../assets/xiaoan/images/xiaoan_right40.png'
import xiaoanIdleVideo from '../assets/xiaoan/videos/xiaoan_idle.webm'
import xiaoanTalkVideo from '../assets/xiaoan/videos/xiaoan_talk.webm'
import xiaoanWaveVideo from '../assets/xiaoan/videos/xiaoan_wave.webm'
import mascotFallbackImg from '../assets/mascot-scene.png'
import { XiaoanChatStatus } from '../services/chatService'

export type Xiaoan2DState = 'idle' | 'talking' | 'waving'

export interface Xiaoan2DProps {
  /** 尺寸规范：'small' | 'medium' | 'large' */
  size?: 'small' | 'medium' | 'large'
  /** 业务指示是否处于回复中（AI 正在生成或输出回复） */
  isReplying?: boolean
  /** 兼容既有 isSpeaking 属性 */
  isSpeaking?: boolean
  /** 深度疗愈等页面传入的聊天生命周期状态 */
  status?: XiaoanChatStatus
  /**
   * 页面隔离配置：是否允许说话动画。
   * 严格默认 false。只有深度疗愈页面或视频播放显式传入 true。
   */
  enableTalkingAnimation?: boolean
  /** 兼容 allowTalking 命名 */
  allowTalking?: boolean
  /** 是否允许播放待机视频动画，默认为 true */
  allowIdleVideo?: boolean
  /** 是否允许点击触发招手动画，默认为 true */
  allowWaving?: boolean
  /** 待机视频慢速呼吸播放速率，初始默认为 0.65 */
  idlePlaybackRate?: number
  /** 交互点击事件 */
  onClick?: () => void
  /** 自定义类名 */
  className?: string
  /** 自定义内联样式 */
  style?: React.CSSProperties
}

/**
 * 统一 2D 小安角色展示组件（透明 WebM 视频驱动与状态机）
 *
 * 核心规范与优先级：
 * 1. 严格动画优先级：talking > waving > idle。
 *    - 当 talking 为 true 时，严禁切换到 idle.webm、严禁播放 wave.webm、严禁被点击或鼠标互动打断、严禁一轮播完自动切回待机。
 *    - 用户在说话期间点击小安，保留业务点击回调，但严格忽略本次招手触发，不播放、不排队。
 * 2. 页面隔离机制：由 enableTalkingAnimation / allowTalking 显式控制（默认 false），其他页面绝对不会播放说话视频。
 * 3. 稳定挂载架构：视频元素常驻 DOM，通过受控的 play/pause/currentTime 与 CSS 交叉淡入淡出调度，避免频繁卸载与黑屏跳变。
 * 4. 优雅降级与预加载：在视频加载就绪前或播放失败时，以同一角色静态图片无缝兜底；当 AI 说话开始后持续循环，直至业务层确认整轮回复结束。
 * 5. 播放速率控制：idle 待机默认以 0.65 慢速播放呈现自然呼吸感，talking 与 waving 保持 1.0 标准速率。
 */
export function Xiaoan2D({
  size = 'large',
  isReplying = false,
  isSpeaking = false,
  status = 'idle',
  enableTalkingAnimation = false,
  allowTalking = false,
  allowIdleVideo = true,
  allowWaving = true,
  idlePlaybackRate = 0.65,
  onClick,
  className = '',
  style,
}: Xiaoan2DProps) {
  // 综合说话权限控制
  const effectiveEnableTalking = Boolean(enableTalkingAnimation || allowTalking)

  // 1. 严格判定是否真正处于说话状态：
  // 必须明确开启 enableTalkingAnimation，且处于真正的有效回复期（status === 'speaking' 或 isReplying/isSpeaking 为 true）
  const isActuallyTalking =
    effectiveEnableTalking &&
    (status === 'speaking' || isReplying || isSpeaking)

  // 招手临时动画状态
  const [isWaving, setIsWaving] = useState(false)

  // 视频加载及解码异常监控
  const [idleError, setIdleError] = useState(false)
  const [talkError, setTalkError] = useState(false)
  const [waveError, setWaveError] = useState(false)

  // 视频就绪标记（用于加载中平滑显示静态图过渡）
  const [idleReady, setIdleReady] = useState(false)
  const [talkReady, setTalkReady] = useState(false)
  const [waveReady, setWaveReady] = useState(false)

  // 静态母图加载异常监控
  const [frontImgError, setFrontImgError] = useState(false)

  // 独立常驻挂载的视频播放器引用
  const idleVideoRef = useRef<HTMLVideoElement>(null)
  const talkVideoRef = useRef<HTMLVideoElement>(null)
  const waveVideoRef = useRef<HTMLVideoElement>(null)

  // 2. 严格按优先级决定活动状态：talking > waving > idle
  let activeState: Xiaoan2DState = 'idle'
  if (isActuallyTalking) {
    activeState = 'talking'
  } else if (isWaving) {
    activeState = 'waving'
  } else {
    activeState = 'idle'
  }

  // 招手完成回调（以视频 ended 事件为准，杜绝任何硬编码的 1-2 秒 timeout 截断）
  const finishWaving = useCallback(() => {
    setIsWaving(false)
  }, [])

  // 3. 说话状态具有不可抢占特权：一旦进入说话，立刻取消并终结可能残留的招手状态
  useEffect(() => {
    if (isActuallyTalking && isWaving) {
      finishWaving()
    }
  }, [isActuallyTalking, isWaving, finishWaving])

  // 4. 用户交互处理（点击反馈）
  const handlePointerClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 保留现有业务层必要的点击处理
    if (onClick) {
      onClick()
    }

    // 核心约束 1：说话期间严禁被招手抢占或排队触发，直接忽略
    if (isActuallyTalking) {
      return
    }

    // 核心约束 2：waving 播放期间再次点击，默认忽略重复点击，避免重复排队或重新启动招手
    if (isWaving) {
      return
    }

    // 核心约束 3：非说话状态且允许招手时，触发单次完整招手动作
    if (allowWaving) {
      setIsWaving(true)
      setWaveError(false)
    }
  }

  // 保持待机慢速呼吸速率同步
  useEffect(() => {
    const idleEl = idleVideoRef.current
    if (idleEl) {
      idleEl.playbackRate = idlePlaybackRate
    }
  }, [idlePlaybackRate])

  // 5. 稳定挂载下的受控播放与暂停调度（单一事实来源：由 activeState 驱动）
  useEffect(() => {
    const idleEl = idleVideoRef.current
    const talkEl = talkVideoRef.current
    const waveEl = waveVideoRef.current

    if (activeState === 'talking') {
      // 停止待机与招手，确保当前只有说话视频播放
      if (idleEl && !idleEl.paused) {
        idleEl.pause()
      }
      if (waveEl && !waveEl.paused) {
        waveEl.pause()
      }
      if (talkEl && !talkError) {
        talkEl.playbackRate = 1.0
        talkEl.currentTime = 0
        talkEl.play().catch((err) => {
          console.warn('[Xiaoan2D] Talk video play prevented or pending:', err.message)
          if (err.name === 'NotSupportedError') {
            setTalkError(true)
          }
        })
      }
    } else if (activeState === 'waving') {
      // 停止待机与说话，招手视频从第 0 秒开始完整播放
      if (idleEl && !idleEl.paused) {
        idleEl.pause()
      }
      if (talkEl && !talkEl.paused) {
        talkEl.pause()
      }
      if (waveEl && !waveError) {
        waveEl.playbackRate = 1.0
        waveEl.currentTime = 0
        waveEl.play().catch((err) => {
          console.warn('[Xiaoan2D] Wave video play prevented:', err.message)
          // 播放被浏览器拦截或解码失败时，安全退回 idle，不留下卡死状态
          setIsWaving(false)
          if (err.name === 'NotSupportedError') {
            setWaveError(true)
          }
        })
      }
    } else {
      // 恢复待机：停止说话与招手，恢复待机视频从头循环播放
      if (talkEl && !talkEl.paused) {
        talkEl.pause()
      }
      if (waveEl && !waveEl.paused) {
        waveEl.pause()
      }
      if (idleEl && !idleError && allowIdleVideo) {
        idleEl.playbackRate = idlePlaybackRate
        // 恢复 idle 时从头开始播放
        idleEl.currentTime = 0
        idleEl.play().catch((err) => {
          console.warn('[Xiaoan2D] Idle video play prevented or pending:', err.message)
          if (err.name === 'NotSupportedError') {
            setIdleError(true)
          }
        })
      }
    }
  }, [activeState, talkError, idleError, waveError, allowIdleVideo, idlePlaybackRate])

  // 组件卸载清理：暂停所有可能在播放的视频，防止切页后后台播放
  useEffect(() => {
    return () => {
      const idleEl = idleVideoRef.current
      const talkEl = talkVideoRef.current
      const waveEl = waveVideoRef.current
      if (idleEl && !idleEl.paused) idleEl.pause()
      if (talkEl && !talkEl.paused) talkEl.pause()
      if (waveEl && !waveEl.paused) waveEl.pause()
    }
  }, [])

  // 6. 确定是否显示静态兜底图片
  // 规则：当当前活动状态的视频未就绪（加载中）或播放报错时，展示小安静态图片作为平滑兜底
  const isCurrentVideoReady =
    (activeState === 'talking' && talkReady && !talkError) ||
    (activeState === 'waving' && waveReady && !waveError) ||
    (activeState === 'idle' && idleReady && !idleError && allowIdleVideo)

  const showFallbackImage = !isCurrentVideoReady

  const logVideoState = useCallback((track: string, el: HTMLVideoElement | null) => {
    if (!el) return
    console.log(`[Xiaoan2D Runtime Log] ${track}:`, {
      currentSrc: el.currentSrc || el.src,
      videoWidth: el.videoWidth,
      videoHeight: el.videoHeight,
      readyState: el.readyState,
      paused: el.paused,
      playbackRate: el.playbackRate,
      error: el.error ? { code: el.error.code, message: el.error.message } : null,
    })
  }, [])

  return (
    <div
      className={`xiaoan-2d-wrapper size-${size} ${className}`}
      style={style}
      onClick={handlePointerClick}
      role="img"
      aria-label={`2D小安角色 (${activeState === 'talking' ? '说话中' : activeState === 'waving' ? '打招呼' : '待机'})`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handlePointerClick(e as unknown as React.MouseEvent)
        }
      }}
    >
      <div className={`xiaoan-2d-stage state-${activeState}`}>
        {/* 1. 待机视频：常驻挂载、预加载、静音循环、可配置 0.65 呼吸慢速 */}
        {allowIdleVideo && (
          <video
            ref={idleVideoRef}
            src={xiaoanIdleVideo}
            className={`xiaoan-2d-media xiaoan-2d-video xiaoan-2d-video-idle ${
              activeState === 'idle' && idleReady && !idleError ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            autoPlay
            muted
            playsInline
            loop
            preload="auto"
            onLoadedMetadata={(e) => logVideoState('idle', e.currentTarget)}
            onPlay={() => {
              if (idleVideoRef.current) {
                idleVideoRef.current.playbackRate = idlePlaybackRate
              }
            }}
            onCanPlay={(e) => {
              if (idleVideoRef.current) {
                idleVideoRef.current.playbackRate = idlePlaybackRate
              }
              setIdleReady(true)
              logVideoState('idle', e.currentTarget)
            }}
            onError={(e) => {
              setIdleError(true)
              setIdleReady(false)
              logVideoState('idle', e.currentTarget)
            }}
          />
        )}

        {/* 2. 说话视频：仅在显式开启说话动画页面挂载，静音循环，1.0 正常速度 */}
        {effectiveEnableTalking && (
          <video
            ref={talkVideoRef}
            src={xiaoanTalkVideo}
            className={`xiaoan-2d-media xiaoan-2d-video xiaoan-2d-video-talk ${
              activeState === 'talking' && talkReady && !talkError ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            muted
            playsInline
            loop
            preload="auto"
            onLoadedMetadata={(e) => logVideoState('talk', e.currentTarget)}
            onPlay={() => {
              if (talkVideoRef.current) {
                talkVideoRef.current.playbackRate = 1.0
              }
            }}
            onCanPlay={(e) => {
              if (talkVideoRef.current) {
                talkVideoRef.current.playbackRate = 1.0
              }
              setTalkReady(true)
              logVideoState('talk', e.currentTarget)
            }}
            onError={(e) => {
              setTalkError(true)
              setTalkReady(false)
              logVideoState('talk', e.currentTarget)
            }}
          />
        )}

        {/* 3. 招手视频：常驻挂载、单次播放、播放完毕切回待机，1.0 正常速度 */}
        {allowWaving && (
          <video
            ref={waveVideoRef}
            src={xiaoanWaveVideo}
            className={`xiaoan-2d-media xiaoan-2d-video xiaoan-2d-video-wave ${
              activeState === 'waving' && waveReady && !waveError ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => logVideoState('wave', e.currentTarget)}
            onPlay={() => {
              if (waveVideoRef.current) {
                waveVideoRef.current.playbackRate = 1.0
              }
            }}
            onCanPlay={(e) => {
              if (waveVideoRef.current) {
                waveVideoRef.current.playbackRate = 1.0
              }
              setWaveReady(true)
              logVideoState('wave', e.currentTarget)
            }}
            onEnded={() => {
              if (activeState === 'waving') {
                finishWaving()
              }
            }}
            onError={(e) => {
              setWaveError(true)
              setWaveReady(false)
              logVideoState('wave', e.currentTarget)
              if (activeState === 'waving') {
                finishWaving()
              }
            }}
          />
        )}

        {/* 4. 静态图兜底层：视频加载中、未配置或播放失败时无缝呈现 */}
        {showFallbackImage && (
          <div className="xiaoan-2d-image-fallback-container">
            {!frontImgError ? (
              <img
                src={xiaoanFrontImg}
                alt="小安"
                className={`xiaoan-2d-media xiaoan-2d-image ${
                  activeState === 'talking' ? 'xiaoan-2d-talking-anim' : 'xiaoan-2d-idle-anim'
                }`}
                onError={() => setFrontImgError(true)}
              />
            ) : (
              <img
                src={mascotFallbackImg}
                alt="小安"
                className="xiaoan-2d-fallback-crop"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Xiaoan2D
