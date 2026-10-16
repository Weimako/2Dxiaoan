/**
 * 统一语音采集服务 (Voice Capture Service)
 *
 * 核心职责：
 * 1. 跨平台语音录音生命周期与状态管理（idle -> requestingPermission -> recording -> processing）；
 * 2. 结合 voicePlatformAdapter 动态使用当前设备最佳编码格式与硬件约束；
 * 3. 产出真实且独立的音频 Blob，绝不将二进制混淆进文字字段；
 * 4. 辅助融合 Web Speech API 实时本地转写能力；
 * 5. 录音完成、取消或组件卸载时彻底关闭所有音轨，确保麦克风资源即时释放，硬件红点立即熄灭。
 */

import {
  type MicrophoneErrorInfo,
  requestMicrophoneStream,
  stopMediaStream,
  startMicrophoneSession,
  type ActiveMicrophoneSession,
} from './microphoneService.ts'
import { getPlatformCapabilities } from './voicePlatformAdapter.ts'

export type VoiceCaptureStatus =
  | 'idle'
  | 'requestingPermission'
  | 'recording'
  | 'processing'
  | 'error'

export interface VoiceRecordingResult {
  success: boolean
  audioBlob?: Blob
  transcript?: string
  durationMs: number
  error?: string
}

export interface VoiceCaptureCallbacks {
  onStatusChange?: (status: VoiceCaptureStatus) => void
  onVolumeChange?: (volume: number) => void
  onInterimTranscript?: (interim: string, accumulated: string) => void
  onError?: (error: MicrophoneErrorInfo) => void
}

class VoiceCaptureService {
  private status: VoiceCaptureStatus = 'idle'
  private activeStream: MediaStream | null = null
  private activeSession: ActiveMicrophoneSession | null = null
  private speechRecognizer: any = null
  private liveVolume = 0
  private accumulatedText = ''
  private sessionFinalText = ''
  private interimText = ''
  private isUserStopping = false
  private startTime = 0
  private callbacks: VoiceCaptureCallbacks = {}

  /**
   * 当前采集状态
   */
  getStatus(): VoiceCaptureStatus {
    return this.status
  }

  /**
   * 当前实时音量 (0~100)
   */
  getLiveVolume(): number {
    return this.liveVolume
  }

  private setStatus(newStatus: VoiceCaptureStatus) {
    this.status = newStatus
    this.callbacks.onStatusChange?.(newStatus)
  }

  /**
   * 开始一轮新的语音录制
   * 注意：必须在用户明确点击的手势操作链路中调用
   */
  async start(callbacks?: VoiceCaptureCallbacks): Promise<{
    success: boolean
    error?: MicrophoneErrorInfo
  }> {
    this.callbacks = callbacks || {}
    this.accumulatedText = ''
    this.sessionFinalText = ''
    this.interimText = ''
    this.isUserStopping = false
    this.liveVolume = 0
    this.startTime = Date.now()

    // 1. 设置为正在申请权限状态
    this.setStatus('requestingPermission')

    // 2. 调用媒体层真实申请麦克风流
    const micRes = await requestMicrophoneStream()
    if (!micRes.success) {
      this.setStatus('error')
      this.callbacks.onError?.(micRes.error)
      return { success: false, error: micRes.error }
    }

    // 3. 授权成功，挂载媒体流并启动录音会话与音量分析
    this.activeStream = micRes.stream

    const session = startMicrophoneSession(this.activeStream, {
      onVolumeChange: (vol) => {
        this.liveVolume = vol
        this.callbacks.onVolumeChange?.(vol)
      },
    })
    this.activeSession = session

    this.setStatus('recording')

    // 4. 若当前环境支持 Web Speech API，开启实时转写协助
    const platform = getPlatformCapabilities()
    if (platform.canTranscribeLocally) {
      try {
        const SpeechRecognitionClass =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        const recognizer = new SpeechRecognitionClass()
        recognizer.lang = 'zh-CN'
        recognizer.continuous = true
        recognizer.interimResults = true
        recognizer.maxAlternatives = 1

        recognizer.onresult = (event: any) => {
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
          this.sessionFinalText = currentFinal
          this.interimText = interim
          const combined = (this.accumulatedText + currentFinal + interim).trim()
          this.callbacks.onInterimTranscript?.(interim, combined)
        }

        recognizer.onerror = (e: any) => {
          // 仅记录警告，不中断底层音频流录制
          console.warn('[VoiceCaptureService] Web Speech recognition warning:', e?.error)
        }

        recognizer.onend = () => {
          this.speechRecognizer = null
          // 若仍处于录音中且非主动停止，平滑续接
          if (this.status === 'recording' && !this.isUserStopping && this.activeStream) {
            if (this.sessionFinalText) {
              this.accumulatedText = (this.accumulatedText ? this.accumulatedText + ' ' : '') + this.sessionFinalText
            }
            this.sessionFinalText = ''
            this.interimText = ''
            setTimeout(() => {
              if (this.status === 'recording' && !this.isUserStopping && this.activeStream) {
                try {
                  const NextClass =
                    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                  if (NextClass) {
                    const nextRecognizer = new NextClass()
                    nextRecognizer.lang = 'zh-CN'
                    nextRecognizer.continuous = true
                    nextRecognizer.interimResults = true
                    nextRecognizer.maxAlternatives = 1
                    nextRecognizer.onresult = recognizer.onresult
                    nextRecognizer.onerror = recognizer.onerror
                    nextRecognizer.onend = recognizer.onend
                    nextRecognizer.start()
                    this.speechRecognizer = nextRecognizer
                  }
                } catch {}
              }
            }, 60)
          }
        }

        recognizer.start()
        this.speechRecognizer = recognizer
      } catch (err) {
        console.warn('[VoiceCaptureService] Speech recognition init failed:', err)
      }
    }

    return { success: true }
  }

  /**
   * 停止当前录音并产出音频 Blob 与文本结果
   */
  async stop(): Promise<VoiceRecordingResult> {
    if (this.status !== 'recording' && this.status !== 'requestingPermission') {
      return { success: false, durationMs: 0, error: '未处于录音状态' }
    }

    this.isUserStopping = true
    this.setStatus('processing')
    const durationMs = Date.now() - this.startTime

    // 1. 停止语音转写
    if (this.speechRecognizer) {
      try {
        this.speechRecognizer.stop()
      } catch {}
      this.speechRecognizer = null
    }

    // 2. 停止录音会话获取真实音频 Blob
    let audioBlob: Blob | undefined
    if (this.activeSession) {
      try {
        const sessionResult = await this.activeSession.stop()
        audioBlob = sessionResult.audioBlob
      } catch (e) {
        console.warn('[VoiceCaptureService] Session stop error:', e)
      }
      this.activeSession = null
    }

    // 3. 严格释放所有媒体轨道硬件资源
    if (this.activeStream) {
      stopMediaStream(this.activeStream)
      this.activeStream = null
    }

    this.liveVolume = 0
    this.callbacks.onVolumeChange?.(0)

    const finalTranscript = (
      this.accumulatedText +
      ' ' +
      this.sessionFinalText +
      ' ' +
      this.interimText
    ).trim()

    this.setStatus('idle')

    return {
      success: true,
      audioBlob,
      transcript: finalTranscript,
      durationMs,
    }
  }

  /**
   * 取消当前录音并彻底丢弃数据
   */
  cancel(): void {
    this.isUserStopping = true
    if (this.speechRecognizer) {
      try {
        this.speechRecognizer.abort()
      } catch {}
      this.speechRecognizer = null
    }

    if (this.activeSession) {
      try {
        this.activeSession.cancel()
      } catch {}
      this.activeSession = null
    }

    if (this.activeStream) {
      stopMediaStream(this.activeStream)
      this.activeStream = null
    }

    this.accumulatedText = ''
    this.sessionFinalText = ''
    this.interimText = ''
    this.liveVolume = 0
    this.callbacks.onVolumeChange?.(0)
    this.setStatus('idle')
  }

  /**
   * 页面卸载或退回到后台时释放一切资源
   */
  release(): void {
    this.cancel()
  }
}

export const voiceCaptureService = new VoiceCaptureService()
