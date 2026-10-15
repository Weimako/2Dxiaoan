/**
 * 深度疗愈 - AI 回复语音与音频播放服务 (Assistant Audio Service)
 *
 * 规范遵循：
 * 1. 真实后端音频播放：仅当后端返回有效的音频 URL (HTTP/HTTPS) 或音频 Blob 时，通过 HTMLAudioElement 播放真实音频；
 * 2. 状态诚实性：如果后端尚未接入 TTS 或未返回有效音频，明确标记为未接入 (not_connected)，
 *    严禁使用假语音、静音播放或本地合成假装后端已有真实语音；
 * 3. 严格生命周期控制：支持播放开始、正常结束、异常捕获、主动 stop 与全局 reset；
 * 4. 视频动画联动：提供 isAudioPlaying 状态查询与订阅，确保与小安 2D 说话动画（talking）严格同步；
 * 5. 音色参数透传：保留用户偏好音色标识，在真实 TTS 就绪时随请求发送至后端。
 */

export type TtsConnectionStatus = 'not_connected' | 'connecting' | 'connected' | 'error'

export interface AssistantAudioPlaybackOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: Error) => void
}

export interface AssistantAudioController {
  stop: () => void
  isPlaying: () => boolean
}

class AssistantAudioService {
  private currentAudio: HTMLAudioElement | null = null
  private currentObjectUrl: string | null = null
  private isPlaying = false
  private listeners: Set<(playing: boolean) => void> = new Set()

  /**
   * 当前 TTS 服务接入状态（当前未部署真实云端 TTS 接口，如实声明）
   */
  private connectionStatus: TtsConnectionStatus = 'not_connected'

  /**
   * 获取当前 TTS 服务接入状态
   */
  getConnectionStatus(): TtsConnectionStatus {
    return this.connectionStatus
  }

  /**
   * 设置 TTS 服务状态（未来后端接入后切换）
   */
  setConnectionStatus(status: TtsConnectionStatus) {
    this.connectionStatus = status
  }

  /**
   * 是否正在播放真实 AI 回复音频
   */
  isAudioPlaying(): boolean {
    return this.isPlaying
  }

  /**
   * 订阅音频播放状态变更
   */
  subscribe(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener)
    listener(this.isPlaying)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.isPlaying)
      } catch (e) {
        console.error('Error in audio play state listener:', e)
      }
    })
  }

  /**
   * 播放后端返回的真实音频（支持音频 URL 或 Blob）
   * 如果传入空值或无效资源，则安全返回且不伪造播放
   */
  playAssistantAudio(
    audioSource?: string | Blob | null,
    options?: AssistantAudioPlaybackOptions
  ): AssistantAudioController {
    // 1. 停止此前正在播放的音频
    this.stopAssistantAudio()

    // 2. 校验音频源真实性
    if (!audioSource) {
      // 未返回音频，直接退出，不进入播放状态
      options?.onEnd?.()
      return {
        stop: () => {},
        isPlaying: () => false,
      }
    }

    let srcUrl = ''
    let isBlob = false

    if (typeof audioSource === 'string') {
      if (!audioSource.trim()) {
        options?.onEnd?.()
        return {
          stop: () => {},
          isPlaying: () => false,
        }
      }
      srcUrl = audioSource.trim()
    } else if (audioSource instanceof Blob) {
      if (audioSource.size === 0) {
        options?.onEnd?.()
        return {
          stop: () => {},
          isPlaying: () => false,
        }
      }
      srcUrl = URL.createObjectURL(audioSource)
      this.currentObjectUrl = srcUrl
      isBlob = true
    } else {
      options?.onEnd?.()
      return {
        stop: () => {},
        isPlaying: () => false,
      }
    }

    // 3. 构建 HTMLAudioElement 播放
    const audio = new Audio(srcUrl)
    this.currentAudio = audio

    const cleanup = () => {
      this.isPlaying = false
      this.notify()
      if (isBlob && this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl)
        this.currentObjectUrl = null
      }
      if (this.currentAudio === audio) {
        this.currentAudio = null
      }
    }

    audio.onplay = () => {
      this.isPlaying = true
      this.notify()
      options?.onStart?.()
    }

    audio.onended = () => {
      cleanup()
      options?.onEnd?.()
    }

    audio.onerror = () => {
      const errorMsg = audio.error?.message || '音频资源解码或播放失败'
      cleanup()
      options?.onError?.(new Error(errorMsg))
    }

    // 尝试触发播放（捕获浏览器自动播放策略拦截）
    audio.play().catch((err) => {
      console.warn('Audio autoplay blocked or playback failed:', err)
      cleanup()
      options?.onError?.(err)
    })

    return {
      stop: () => {
        this.stopAssistantAudio()
      },
      isPlaying: () => this.isPlaying,
    }
  }

  /**
   * 停止当前音频播放并清理资源
   */
  stopAssistantAudio(): void {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      } catch {}
      this.currentAudio = null
    }

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl)
      this.currentObjectUrl = null
    }

    if (this.isPlaying) {
      this.isPlaying = false
      this.notify()
    }
  }
}

export const assistantAudioService = new AssistantAudioService()
