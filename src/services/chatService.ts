/**
 * 深度疗愈 - 小安 AI 对话与状态管理服务
 *
 * 状态机定义：
 * - 'idle': 待机状态，嘴巴闭合，循环 Idle 待机呼吸动作，允许全套鼠标跟随与眨眼
 * - 'listening': 倾听状态（用户正在语音输入或录音），嘴巴闭合
 * - 'thinking': 思考状态（用户已发送或完成说话，等待大模型生成首字），嘴巴闭合
 * - 'turningToFront': 平滑转向正面（模型停止所有互动并旋转正对用户，嘴巴闭合）
 * - 'speaking': 讲话状态（模型严格正面锁定，全身动画暂停，循环播放 GLB「张嘴」动画）
 * - 'error': 异常/取消状态，恢复闭嘴与待机
 */

export type XiaoanChatStatus =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'turningToFront'
  | 'speaking'
  | 'error'

export interface StreamEventHandlers {
  /** 状态变更回调 */
  onStatusChange?: (status: XiaoanChatStatus) => void
  /** 大模型开始思考（闭嘴） */
  onThinking?: () => void
  /** 准备开始回答：先平滑转正面（闭嘴、锁定互动） */
  onTurningToFront?: () => void
  /** 转向正面就绪，收到首段有效回复，启动张嘴讲话动画 */
  onStreamStart?: (fullResponse?: string) => void
  /** 流式输出内容增量 */
  onStreamChunk?: (chunk: string, accumulated: string) => void
  /** 大模型回复完整结束，停止张嘴动画，释放锁定并恢复待机 */
  onStreamEnd?: (fullResponse: string) => void
  /** 请求失败或被取消，安全恢复待机 */
  onError?: (err: Error) => void
}

// 模拟心理疗愈语料库（涵盖温和共情、呼吸引导、接纳情绪等维度）
const HEALING_RESPONSES = [
  '我一直在这里听着呢。今天遇到的这些事情，确实会让人心里感到有些沉沉的。你可以先在这里靠一靠，不需要急着去解决什么。',
  '谢谢你愿意把这些轻声告诉我。心里的天气也是会转阴的，就像林间也会起雾一样。无论现在是累了还是难过了，它们都是可以被允许存在的。',
  '我感受到了你心里的那份紧绷。要不要试着跟我一起轻轻叹一口气，把双肩慢慢沉下来？我们可以把步子放得很慢很慢。',
  '很多时候，对自己太严格反而会让人透不过气。今天你已经做得很好了，接下来的时间，就交给我来陪你静静待会儿吧。',
  '有时候说出来的过程，本身就是给心里腾出一片透光的空隙。你的感受很重要，不用强迫自己立刻开心起来，慢慢来就好。',
]

/**
 * 请求小安 AI 回复
 *
 * 【未来接入真实大模型 API 指南】：
 * 1. 在当前函数中，将底部的定时器流程替换为真实的 fetch('/api/chat', { signal: controller.signal })。
 * 2. 收到 Response 的第一个流式数据包前，触发 `handlers.onStatusChange?.('turningToFront')` 让小安平滑转向正面。
 * 3. 旋转到位后，触发 `handlers.onStatusChange?.('speaking')` 与 `handlers.onStreamStart?.()`。
 * 4. 持续消费 reader.read()，每次触发 `handlers.onStreamChunk?.(chunk, accumulated)`。
 * 5. 当 `done === true` 流完全结束时，触发 `handlers.onStreamEnd?.(accumulated)` 并切回 'idle'。
 * 6. 若发生网络异常或用户主动 abort()，触发 `handlers.onError?.(err)` 并安全切回 'idle'。
 */
export function requestXiaoanReply(
  userPrompt: string,
  handlers: StreamEventHandlers
): AbortController {
  const controller = new AbortController()
  let isAborted = false

  controller.signal.addEventListener('abort', () => {
    isAborted = true
  })

  // 1. 进入思考中状态：小安保持闭嘴倾听/思索
  handlers.onStatusChange?.('thinking')
  handlers.onThinking?.()

  // 选取消息模板（根据提示词或随机轮换）
  const responseTemplate =
    HEALING_RESPONSES[Math.floor(Math.random() * HEALING_RESPONSES.length)]

  // 思考延迟（850ms）
  const thinkingTimeout = window.setTimeout(() => {
    if (isAborted) return

    // 2. AI 准备开始输出：先进入平滑转正面阶段，嘴巴保持闭合，严格锁定交互
    handlers.onStatusChange?.('turningToFront')
    handlers.onTurningToFront?.()

    // 给予 380ms 确保模型平滑旋转至正面对齐完毕
    const turnTimeout = window.setTimeout(() => {
      if (isAborted) return

      // 3. 正面就绪：启动讲话状态，启动循环「张嘴」动画，开始流式输出
      handlers.onStatusChange?.('speaking')
      handlers.onStreamStart?.(responseTemplate)

      let currentIndex = 0
      let accumulatedText = ''

      // 逐字流式打字输出，期间小安严格保持正面锁定与张嘴动画
      const streamInterval = window.setInterval(() => {
        if (isAborted) {
          window.clearInterval(streamInterval)
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
          handlers.onStatusChange?.('idle')
          handlers.onStreamEnd?.(accumulatedText)
        }
      }, 75) // 每 75ms 输出一段，节奏轻柔自然

      controller.signal.addEventListener('abort', () => {
        window.clearInterval(streamInterval)
        handlers.onStatusChange?.('idle')
      })
    }, 380)

    controller.signal.addEventListener('abort', () => {
      window.clearTimeout(turnTimeout)
      handlers.onStatusChange?.('idle')
    })
  }, 850)

  controller.signal.addEventListener('abort', () => {
    window.clearTimeout(thinkingTimeout)
    handlers.onStatusChange?.('idle')
  })

  return controller
}
