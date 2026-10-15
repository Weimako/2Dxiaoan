/**
 * 深度疗愈 - 小安 AI 对话服务与后端 API 适配层 (Chat Service)
 *
 * 架构设计规范：
 * 1. 统一消息结构：统一文字与语音输入的消息表达，支持 content、text、createdAt、inputType、status、isMock 等字段。
 * 2. 前端服务层解耦：组件只调用服务层提供的高层 API，业务逻辑与数据请求隔离，不再散落假定时器与硬编码数据。
 * 3. Mock 与真实 API 分离：
 *    - MockChatApiAdapter：开发阶段模拟适配器，明确标注 isMock: true，供无后端阶段高保真交互验证；
 *    - RealChatApiAdapter：真实后端 HTTP / SSE 流式接口适配器，预留端点与 Base URL 配置；
 *    - 严禁在前端代码中硬编码任何 API Key、模型密钥或 TTS 密钥。
 * 4. 健壮的生命周期与错误管理：统一支持超时处理（默认 30s）、用户主动取消（AbortSignal）、网络错误捕获与状态重置。
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
 * 语音输入的后端接入模式契约：
 * - 'browser_stt': 方案 A（默认优先）：浏览器本地利用 Web Speech API 完成语音转文字，再将文本送入后端；
 * - 'backend_audio': 方案 B（预留支持）：前端通过麦克风录制音频 Blob，经 multipart/form-data 传至后端语音/多模态模型处理。
 */
export type AudioInputMode = 'browser_stt' | 'backend_audio'

/**
 * 统一后端返回数据结构契约（由服务适配层统一解析，消除字段假设）
 */
export interface AssistantReplyPayload {
  /** 助理回复文本内容 */
  reply: string
  /** 兼容 content 别名 */
  content?: string
  /** 可选的回复音频播放 URL（如后端已接入真实 TTS 合成） */
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
  /** 是否为开发模拟数据 */
  isMock?: boolean
}

/**
 * 统一对话消息标准对象
 */
export interface ChatMessageItem extends ChatDialogItem {
  id: string
  role: 'user' | 'assistant'
  /** 消息正文（content 为现代标准属性，text 为历史兼容属性，二者同步） */
  content: string
  text: string
  /** 格式化显示时间，如 '14:20' */
  time: string
  /** 毫秒级时间戳 */
  createdAt: number
  /** 输入渠道：文字或语音 */
  inputType?: ChatInputType
  /** 消息发送状态 */
  status?: ChatMessageStatus
  /** 是否为开发环境 Mock 数据（严格标明，绝不伪装为真实后端回答） */
  isMock?: boolean
  /** 可选的后端真实 TTS 生成音频播放地址（若未接入真实 TTS 则为 undefined） */
  audioUrl?: string
  /** 音色标识 */
  voiceId?: string
  /** 归属用户 ID */
  userId?: string
  /** 归属会话 ID */
  sessionId?: string
}

/**
 * 流式输出生命周期回调
 */
export interface StreamEventHandlers {
  /** 状态机变更回调 */
  onStatusChange?: (status: XiaoanChatStatus) => void
  /** 大模型开始思考（闭嘴倾听） */
  onThinking?: () => void
  /** 准备开始回答：平滑转正面（闭嘴、锁定互动） */
  onTurningToFront?: () => void
  /** 转向正面就绪，收到首段有效回复，启动张嘴讲话动画 */
  onStreamStart?: (fullResponse?: string, isMock?: boolean, audioUrl?: string) => void
  /** 流式输出内容增量 */
  onStreamChunk?: (chunk: string, accumulated: string) => void
  /** 大模型回复完整结束，停止张嘴动画，释放锁定并恢复待机 */
  onStreamEnd?: (fullResponse: string, isMock?: boolean, audioUrl?: string) => void
  /** 请求失败或被取消，安全恢复待机 */
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
  /** 是否强制使用 Mock（测试用途） */
  forceMock?: boolean
  /** 选定音色标识（透传至后端以便生成对应 TTS 声音） */
  voiceProfileId?: string
  /** 语音输入接入模式（默认 browser_stt） */
  audioInputMode?: AudioInputMode
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

let currentAudioInputMode: AudioInputMode = 'browser_stt'

/**
 * 获取当前配置的后端 API Base URL
 */
export function getChatApiBaseUrl(): string {
  return currentApiBaseUrl
}

/**
 * 动态配置后端 API Base URL（供未来部署或环境切换使用）
 */
export function setChatApiBaseUrl(url: string): void {
  currentApiBaseUrl = url.trim().replace(/\/+$/, '')
}

/**
 * 获取当前对话服务模式（'mock' | 'real'）
 */
export function getChatServiceMode(): 'mock' | 'real' {
  return serviceMode
}

/**
 * 切换对话服务运行模式
 */
export function setChatServiceMode(mode: 'mock' | 'real'): void {
  serviceMode = mode
}

/**
 * 获取当前配置的语音输入处理方案：
 * - 'browser_stt': 方案 A（浏览器语音识别为文本后请求）
 * - 'backend_audio': 方案 B（录制音频 Blob 传至后端模型）
 */
export function getAudioInputMode(): AudioInputMode {
  return currentAudioInputMode
}

/**
 * 设置语音输入处理方案
 */
export function setAudioInputMode(mode: AudioInputMode): void {
  currentAudioInputMode = mode
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
    return { ok: false, message: '后端未就绪，使用前端适配模式' }
  }
}

// ============================================================================
// 2. 开发阶段专用 Mock 语料库与适配器
// ============================================================================

/**
 * ⚠️ [开发模拟语料库]
 * 仅用于无后端开发测试阶段的高保真原型联调与流式验证。
 * 严格标明为开发模拟响应（isMock: true），杜绝伪装真实模型。
 */
const DEV_MOCK_HEALING_RESPONSES = [
  '我一直在这里听着呢。今天遇到的这些事情，确实会让人心里感到有些沉沉的。你可以先在这里靠一靠，不需要急着去解决什么。',
  '谢谢你愿意把这些轻声告诉我。心里的天气也是会转阴的，就像林间也会起雾一样。无论现在是累了还是难过了，它们都是可以被允许存在的。',
  '我感受到了你心里的那份紧绷。要不要试着跟我一起轻轻叹一口气，把双肩慢慢沉下来？我们可以把步子放得很慢很慢。',
  '很多时候，对自己太严格反而会让人透不过气。今天你已经做得很好了，接下来的时间，就交给我来陪你静静待会儿吧。',
  '有时候说出来的过程，本身就是给心里腾出一片透光的空隙。你的感受很重要，不用强迫自己立刻开心起来，慢慢来就好。',
]

/**
 * 对话 API 适配器接口契约
 */
export interface ChatApiAdapter {
  sendTextMessage(
    text: string,
    conversationId?: string,
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem>

  sendAudioMessage(
    audioBlob: Blob | ArrayBuffer,
    conversationId?: string,
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem>

  streamReply(
    userPrompt: string,
    handlers: StreamEventHandlers,
    options?: ChatRequestOptions
  ): AbortController
}

/**
 * 开发阶段 Mock 适配器实现
 */
class MockChatApiAdapter implements ChatApiAdapter {
  async sendTextMessage(
    text: string,
    conversationId = 'default',
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem> {
    const clean = text.trim()
    if (!clean) {
      throw new ChatServiceError('发送内容不可为空', 'ERR_EMPTY_TEXT')
    }

    // 模拟微小的网络延迟 (400ms)
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, 400)
      options?.signal?.addEventListener('abort', () => {
        clearTimeout(timer)
        reject(new ChatServiceError('用户取消了操作', 'ERR_ABORTED'))
      })
    })

    const template =
      DEV_MOCK_HEALING_RESPONSES[
        Math.floor(Math.random() * DEV_MOCK_HEALING_RESPONSES.length)
      ]
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    return {
      id: `mock_reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'assistant',
      content: template,
      text: template,
      time: timeStr,
      createdAt: Date.now(),
      isMock: true,
      status: 'sent',
      userId: options?.userId,
      sessionId: conversationId,
    }
  }

  async sendAudioMessage(
    _audioBlob: Blob | ArrayBuffer,
    conversationId = 'default',
    options?: ChatRequestOptions
  ): Promise<ChatMessageItem> {
    // 模拟语音转文字及回复
    return this.sendTextMessage('（模拟语音已解析输入）', conversationId, options)
  }

  streamReply(
    _userPrompt: string,
    handlers: StreamEventHandlers,
    options?: ChatRequestOptions
  ): AbortController {
    const controller = new AbortController()
    let isAborted = false

    const handleAbort = () => {
      isAborted = true
    }
    controller.signal.addEventListener('abort', handleAbort)
    if (options?.signal) {
      options.signal.addEventListener('abort', () => {
        controller.abort()
      })
    }

    // 设置请求超时定时器（默认 30 秒）
    const timeoutDuration = options?.timeoutMs || 30000
    const timeoutTimer = window.setTimeout(() => {
      if (!isAborted) {
        controller.abort()
        handlers.onError?.(
          new ChatServiceError(
            `响应超时（>${timeoutDuration / 1000}秒），请稍后重试 🍃`,
            'ERR_TIMEOUT',
            true
          )
        )
      }
    }, timeoutDuration)

    // 1. 进入思考中状态：小安保持闭嘴倾听/思索
    handlers.onStatusChange?.('thinking')
    handlers.onThinking?.()

    // 随机选取开发模拟语料
    const responseTemplate =
      DEV_MOCK_HEALING_RESPONSES[
        Math.floor(Math.random() * DEV_MOCK_HEALING_RESPONSES.length)
      ]

    // 模拟大模型思考延迟 (750ms)
    const thinkingTimeout = window.setTimeout(() => {
      if (isAborted) {
        window.clearTimeout(timeoutTimer)
        return
      }

      // 2. AI 准备开始输出：先进入平滑转正面阶段，嘴巴保持闭合，严格锁定交互
      handlers.onStatusChange?.('turningToFront')
      handlers.onTurningToFront?.()

      // 给予 360ms 确保模型平滑旋转至正面对齐完毕
      const turnTimeout = window.setTimeout(() => {
        if (isAborted) {
          window.clearTimeout(timeoutTimer)
          return
        }

        // 3. 正面就绪：启动讲话状态，启动说话循环动画，开始流式输出
        handlers.onStatusChange?.('speaking')
        handlers.onStreamStart?.(responseTemplate, true)

        let currentIndex = 0
        let accumulatedText = ''

        // 逐字流式打字输出，期间小安严格保持正面锁定与说话动画
        const streamInterval = window.setInterval(() => {
          if (isAborted) {
            window.clearInterval(streamInterval)
            window.clearTimeout(timeoutTimer)
            handlers.onStatusChange?.('idle')
            return
          }

          if (currentIndex < responseTemplate.length) {
            const step = Math.min(2, responseTemplate.length - currentIndex)
            const chunk = responseTemplate.slice(currentIndex, currentIndex + step)
            currentIndex += step
            accumulatedText += chunk
            handlers.onStreamChunk?.(chunk, accumulatedText)
          } else {
            // 4. 全部回复完整输出：停止说话动画，嘴巴恢复闭合，解除锁定恢复待机
            window.clearInterval(streamInterval)
            window.clearTimeout(timeoutTimer)
            handlers.onStatusChange?.('idle')
            handlers.onStreamEnd?.(accumulatedText, true)
          }
        }, 70) // 每 70ms 输出一段，节奏轻柔自然

        controller.signal.addEventListener('abort', () => {
          window.clearInterval(streamInterval)
          window.clearTimeout(timeoutTimer)
          handlers.onStatusChange?.('idle')
        })
      }, 360)

      controller.signal.addEventListener('abort', () => {
        window.clearTimeout(turnTimeout)
        window.clearTimeout(timeoutTimer)
        handlers.onStatusChange?.('idle')
      })
    }, 750)

    controller.signal.addEventListener('abort', () => {
      window.clearTimeout(thinkingTimeout)
      window.clearTimeout(timeoutTimer)
      handlers.onStatusChange?.('idle')
    })

    return controller
  }
}

/**
 * 真实后端 API 适配器实现（预留生产接入架构）
 *
 * 【未来接入真实后端指南】：
 * 1. 后端只需提供标准的 SSE (Server-Sent Events) 或 fetch 流式接口，如 `POST /api/chat`。
 * 2. 请求头携带用户 Token（如需鉴权），严禁将密钥放进前端包中。
 * 3. 当后端返回流式 chunk 时，解析 SSE data 并调用 handlers.onStreamChunk。
 */
class RealChatApiAdapter implements ChatApiAdapter {
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
        isMock: false,
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
        err.message || '后端连接失败，请确认服务已就绪',
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
      isMock: false,
      status: 'sent',
      audioUrl: data.audioUrl,
      voiceId: data.voiceId || options?.voiceProfileId,
      userId: options?.userId,
      sessionId: conversationId,
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

        // 转正延迟平滑缓冲
        await new Promise((r) => setTimeout(r, 360))

        handlers.onStatusChange?.('speaking')
        handlers.onStreamStart?.('', false, serverAudioUrl)

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
        handlers.onStreamEnd?.(accumulated, false, serverAudioUrl)
      } catch (err: any) {
        handlers.onStatusChange?.('idle')
        handlers.onError?.(err)
      }
    })()

    return controller
  }
}

// 实例化适配器
const mockAdapter = new MockChatApiAdapter()
const realAdapter = new RealChatApiAdapter()

function getActiveAdapter(forceMock?: boolean): ChatApiAdapter {
  if (forceMock || serviceMode === 'mock') {
    return mockAdapter
  }
  return realAdapter
}

// ============================================================================
// 3. 高层对话服务接口（业务组件直接调用的干净 API）
// ============================================================================

/**
 * 发送单条文本消息并获取助理回复（统一返回标准 ChatMessageItem）
 */
export async function sendTextMessage(
  text: string,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  const adapter = getActiveAdapter(options?.forceMock)
  return adapter.sendTextMessage(text, conversationId, options)
}

/**
 * 发送音频数据消息并获取助理回复（支持 Blob 或 ArrayBuffer）
 */
export async function sendAudioMessage(
  audioBlob: Blob | ArrayBuffer,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  const adapter = getActiveAdapter(options?.forceMock)
  return adapter.sendAudioMessage(audioBlob, conversationId, options)
}

/**
 * 获取助理单次回复（通用快捷包装）
 */
export async function getAssistantReply(
  prompt: string,
  conversationId = 'default',
  options?: ChatRequestOptions
): Promise<ChatMessageItem> {
  return sendTextMessage(prompt, conversationId, options)
}

/**
 * 请求小安 AI 流式回复（向下兼容既有函数签名，内部严格基于适配器与生命周期状态）
 *
 * @param userPrompt 用户输入文本
 * @param handlers 流式事件回调
 * @param options 可选超时与信号配置
 * @returns AbortController 允许业务端或页面卸载时安全取消
 */
export function requestXiaoanReply(
  userPrompt: string,
  handlers: StreamEventHandlers,
  options?: ChatRequestOptions
): AbortController {
  const adapter = getActiveAdapter(options?.forceMock)
  return adapter.streamReply(userPrompt, handlers, options)
}
