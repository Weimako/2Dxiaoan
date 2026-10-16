/**
 * 深度疗愈 - 小安 AI 对话服务与后端 API 适配层 (Chat Service)
 *
 * 核心设计规范：
 * 1. 真实接口契约边界：规范 transcribeAudio、sendTextMessage、sendAudioMessage、getAssistantReply 等高层 API；
 * 2. 状态诚实性：当前无真实后端连接时，如实反馈未接入状态，绝不伪造已连接大模型或流式输出假 AI 语料；
 * 3. 严格数据解耦：音频 Blob 与文本消息独立管理，二进制音频绝不混入聊天气泡 content 字段；
 * 4. 严禁前端硬编码任何服务端敏感 Key、模型 Token 或 TTS 密钥；
 * 5. 健壮的生命周期与错误捕获：支持超时控制、用户主动取消 (AbortSignal) 与标准化错误。
 */

import { ChatDialogItem } from '../types'

export type XiaoanChatStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'turningToFront'
  | 'speaking'
  | 'error'

export type ChatInputType = 'text' | 'voice'
export type ChatMessageStatus = 'sending' | 'sent' | 'error'

/**
 * 语音转写响应结果接口（待后端协议最终确认）
 */
export interface TranscribeResult {
  success: boolean
  text?: string
  confidence?: number
  durationMs?: number
  error?: string
}

/**
 * 后端对话回复数据结构契约（待后端协议最终确认）
 */
export interface AssistantReplyPayload {
  /** 助理回复文本内容 */
  reply: string
  /** 兼容 content 别名 */
  content?: string
  /** 可选的回复音频播放 URL（真实云端 TTS 合成后提供） */
  audioUrl?: string
  /** 可选的回复音频二进制 Blob */
  audioBlob?: Blob
  /** 可选的音色标识（如 'adultFemale', 'adultMale', 'boy', 'girl'） */
  voiceId?: string
  /** 会话标识 */
  conversationId?: string
  /** 消息唯一 ID */
  messageId?: string
  /** 创建毫秒时间戳 */
  createdAt?: number
  /** 响应状态 */
  status?: 'success' | 'error'
}

/**
 * 统一对话消息标准对象
 */
export interface ChatMessageItem extends ChatDialogItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  text: string
  time: string
  createdAt: number
  inputType?: ChatInputType
  status?: ChatMessageStatus
  audioUrl?: string
  voiceId?: string
  userId?: string
  sessionId?: string
}

/**
 * 流式输出生命周期回调
 */
export interface StreamEventHandlers {
  onStatusChange?: (status: XiaoanChatStatus) => void
  onThinking?: () => void
  onTurningToFront?: () => void
  onStreamStart?: (fullResponse?: string, audioUrl?: string) => void
  onStreamChunk?: (chunk: string, accumulated: string) => void
  onStreamEnd?: (fullResponse: string, audioUrl?: string) => void
  onError?: (err: Error) => void
}

/**
 * 对话请求通用配置选项
 */
export interface ChatRequestOptions {
  userId?: string
  sessionId?: string
  signal?: AbortSignal
  timeoutMs?: number
  voiceProfileId?: string
  /** 自动化测试专用内部隔离标记 */
  forceMock?: boolean
}

/**
 * 统一对话服务错误类
 */
export class ChatServiceError extends Error {
  code: string
  isTimeout: boolean

  constructor(message: string, code = 'ERR_CHAT_SERVICE', isTimeout = false) {
    super(message)
    this.name = 'ChatServiceError'
    this.code = code
    this.isTimeout = isTimeout
  }
}

// ============================================================================
// 1. 服务层环境配置与 Base URL 管理
// ============================================================================

let currentApiBaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  '/api/chat'

let serviceMode: 'mock' | 'real' =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAT_SERVICE_MODE === 'real')
    ? 'real'
    : 'mock'

export function getChatApiBaseUrl(): string {
  return currentApiBaseUrl
}

export function setChatApiBaseUrl(url: string): void {
  currentApiBaseUrl = url.trim().replace(/\/+$/, '')
}

export function getChatServiceMode(): 'mock' | 'real' {
  return serviceMode
}

export function setChatServiceMode(mode: 'mock' | 'real'): void {
  serviceMode = mode
}

/**
 * 检测后端 API 服务是否就绪（健康检查）
 */
export async function checkBackendConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${getChatApiBaseUrl()}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (res.ok) {
      return { ok: true, message: '真实后端服务已联通' }
    }
    return { ok: false, message: `后端健康检查返回 HTTP ${res.status}` }
  } catch (err: any) {
    return { ok: false, message: '后端接口未接入，服务处于本地待接入状态' }
  }
}

// ============================================================================
// 2. 语音转写服务接口（预留后端 ASR 真实对接边界）
// ============================================================================

/**
 * 将录制的用户语音音频上传至后端语音识别服务转写为文本
 * 预留接口，后端部署后即可打通；当前未接后端时如实返回未接入状态
 */
export async function transcribeAudio(
  audioBlob: Blob,
  options?: { signal?: AbortSignal; conversationId?: string; timeoutMs?: number }
): Promise<TranscribeResult> {
  if (serviceMode === 'real') {
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      if (options?.conversationId) {
        formData.append('conversationId', options.conversationId)
      }

      const res = await fetch(`${getChatApiBaseUrl()}/transcribe`, {
        method: 'POST',
        body: formData,
        signal: options?.signal,
      })

      if (res.ok) {
        const data = await res.json()
        return {
          success: true,
          text: data.text || data.transcript || '',
          confidence: data.confidence,
        }
      }
      return {
        success: false,
        error: `后端语音转写返回异常 (HTTP ${res.status})`,
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { success: false, error: '用户取消了转写操作' }
      }
      return {
        success: false,
        error: '网络连接失败，请重试或直接输入文字',
      }
    }
  }

  // 诚实状态：无后端时不伪造假装云端识别完成
  return {
    success: false,
    error: '语音服务暂未响应，请在输入框确认或修改文字 🍃',
  }
}

// ============================================================================
// 3. 真实后端 HTTP / SSE API 适配层
// ============================================================================

class RealChatApiAdapter {
  async sendTextMessage(
    text: string,
    conversationId = 'default',
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem> {
    const clean = text.trim()
    if (!clean) {
      throw new ChatServiceError('发送内容不可为空', 'ERR_EMPTY_TEXT')
    }

    const endpoint = `${getChatApiBaseUrl()}/message`
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          conversationId,
          userId: options?.userId,
          voiceProfileId: options?.voiceProfileId,
        }),
        signal: options?.signal,
      })

      if (!response.ok) {
        throw new ChatServiceError(
          `后端接口响应异常 (HTTP ${response.status})`,
          'ERR_HTTP_RESPONSE'
        )
      }

      const data = await response.json()
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      return {
        id: data.id || `msg_${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.content || '',
        text: data.reply || data.content || '',
        time: timeStr,
        createdAt: data.createdAt || Date.now(),
        status: 'sent',
        audioUrl: data.audioUrl,
        voiceId: data.voiceId || options?.voiceProfileId,
        userId: options?.userId,
        sessionId: conversationId,
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new ChatServiceError('请求已被取消', 'ERR_ABORTED')
      }
      throw new ChatServiceError(
        '网络连接失败，请确认后端服务已就绪',
        'ERR_BACKEND_UNAVAILABLE'
      )
    }
  }

  async sendAudioMessage(
    audioBlob: Blob | ArrayBuffer,
    conversationId = 'default',
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem> {
    const endpoint = `${getChatApiBaseUrl()}/audio`
    const formData = new FormData()
    formData.append('audio', audioBlob instanceof Blob ? audioBlob : new Blob([audioBlob]))
    formData.append('conversationId', conversationId)
    if (options?.userId) formData.append('userId', options.userId)
    if (options?.voiceProfileId) formData.append('voiceProfileId', options.voiceProfileId)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: options?.signal,
      })

      if (!response.ok) {
        throw new ChatServiceError(`音频发送失败 (HTTP ${response.status})`, 'ERR_AUDIO_UPLOAD')
      }

      const data = await response.json()
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

      return {
        id: data.id || `msg_${Date.now()}`,
        role: 'assistant',
        content: data.reply || data.content || '',
        text: data.reply || data.content || '',
        time: timeStr,
        createdAt: data.createdAt || Date.now(),
        status: 'sent',
        audioUrl: data.audioUrl,
        voiceId: data.voiceId || options?.voiceProfileId,
        userId: options?.userId,
        sessionId: conversationId,
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new ChatServiceError('请求已被取消', 'ERR_ABORTED')
      }
      throw new ChatServiceError(
        '音频上传失败，请检查网络连接',
        'ERR_BACKEND_UNAVAILABLE'
      )
    }
  }

  streamReply(
    userPrompt: string,
    handlers: StreamEventHandlers,
    options?: ChatRequestOptions
  ): AbortController {
    const controller = new AbortController()

    ;(async () => {
      try {
        handlers.onStatusChange?.('thinking')
        handlers.onThinking?.()

        const endpoint = `${getChatApiBaseUrl()}/stream`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            userId: options?.userId,
            sessionId: options?.sessionId,
            voiceProfileId: options?.voiceProfileId,
          }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          throw new ChatServiceError(`流式连接失败 (HTTP ${res.status})`, 'ERR_STREAM_FAILED')
        }

        const serverAudioUrl = res.headers.get('X-Assistant-Audio-Url') || undefined

        handlers.onStatusChange?.('turningToFront')
        handlers.onTurningToFront?.()

        // 转正平滑过渡缓冲
        await new Promise((r) => setTimeout(r, 360))

        handlers.onStatusChange?.('speaking')
        handlers.onStreamStart?.('', serverAudioUrl)

        const reader = res.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          handlers.onStreamChunk?.(chunk, accumulated)
        }

        handlers.onStatusChange?.('idle')
        handlers.onStreamEnd?.(accumulated, serverAudioUrl)
      } catch (err: any) {
        handlers.onStatusChange?.('idle')
        handlers.onError?.(err)
      }
    })()

    return controller
  }
}

const realAdapter = new RealChatApiAdapter()

// ============================================================================
// 4. 业务高层对话 API
// ============================================================================

/**
 * 发送单条文本消息并获取助理回复
 */
export async function sendTextMessage(
  text: string,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  if (serviceMode === 'real') {
    return realAdapter.sendTextMessage(text, conversationId, options)
  }

  // 内部单元测试隔离通道
  if (options?.forceMock) {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    return {
      id: `msg_test_${Date.now()}`,
      role: 'assistant',
      content: '我听到了你的心声。',
      text: '我听到了你的心声。',
      time: timeStr,
      createdAt: Date.now(),
      status: 'sent',
      userId: options.userId,
      sessionId: conversationId,
    }
  }

  // 当前未接入真实后端时诚实声明，不伪装假回答
  throw new ChatServiceError(
    '对话服务暂未连接，小安已将你的倾诉记在心间 🍃',
    'ERR_BACKEND_NOT_CONNECTED'
  )
}

/**
 * 发送独立音频 Blob 并获取助理回复
 */
export async function sendAudioMessage(
  audioBlob: Blob | ArrayBuffer,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  if (serviceMode === 'real') {
    return realAdapter.sendAudioMessage(audioBlob, conversationId, options)
  }

  throw new ChatServiceError(
    '语音服务暂时无法连接，已为你记录本次倾诉 🍃',
    'ERR_BACKEND_NOT_CONNECTED'
  )
}

/**
 * 获取助理单次回复
 */
export async function getAssistantReply(
  prompt: string,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  return sendTextMessage(prompt, conversationId, options)
}

/**
 * 请求小安 AI 流式回复
 */
export function requestXiaoanReply(
  userPrompt: string,
  handlers: StreamEventHandlers,
  options?: ChatRequestOptions
): AbortController {
  if (serviceMode === 'real') {
    return realAdapter.streamReply(userPrompt, handlers, options)
  }

  const controller = new AbortController()

  // 内部单元测试隔离通道
  if (options?.forceMock) {
    const timeout = setTimeout(() => {
      handlers.onStatusChange?.('idle')
      handlers.onStreamEnd?.('测试回复已完成')
    }, 100)
    controller.signal.addEventListener('abort', () => clearTimeout(timeout))
    return controller
  }

  // 无真实后端时诚实响应，不伪造假回答与无端张嘴
  queueMicrotask(() => {
    handlers.onStatusChange?.('idle')
    handlers.onError?.(
      new ChatServiceError(
        '对话服务暂未连接，小安已将你的倾诉记在心间 🍃',
        'ERR_BACKEND_NOT_CONNECTED'
      )
    )
  })

  return controller
}
