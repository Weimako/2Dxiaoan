/**
 * 麦克风授权与音频采集服务 (Microphone Service)
 *
 * 核心功能：
 * 1. 环境与安全上下文诊断（HTTPS / localhost / iframe feature policy 校验）；
 * 2. 真实触发浏览器原生麦克风权限请求 (navigator.mediaDevices.getUserMedia)；
 * 3. 细分并友好转化各种硬件与权限错误（NotAllowedError, NotFoundError, NotReadableError, SecurityError 等）；
 * 4. 实时音频输入音量检测（Web Audio AnalyserNode）；
 * 5. 真实音频录制（MediaRecorder）与 Web Speech 识别协同工作；
 * 6. 严谨的媒体流生命周期管理，录音结束/失败时确保所有轨道 track.stop()，释放硬件占用。
 */

export type MicrophoneErrorCode =
  | 'NOT_ALLOWED' // 权限被拒绝或禁止
  | 'NOT_FOUND' // 未检测到录音硬件
  | 'NOT_READABLE' // 麦克风被其他软件独占
  | 'SECURITY_ERROR' // iframe/安全策略限制
  | 'INSECURE_CONTEXT' // 非 HTTPS/localhost 安全上下文
  | 'OVERCONSTRAINED' // 采样参数不支持
  | 'UNSUPPORTED' // 浏览器不支持麦克风 API
  | 'UNKNOWN'

export interface MicrophoneErrorInfo {
  code: MicrophoneErrorCode
  title: string
  message: string
  instructions: string[]
  canRetry: boolean
  rawError?: any
}

export interface ActiveMicrophoneSession {
  stream: MediaStream
  stop: () => Promise<{ audioBlob?: Blob; durationMs: number }>
  cancel: () => void
  getLiveVolume: () => number // 0 ~ 100
  getAudioBlob: () => Blob | null
}

/**
 * 诊断运行环境与浏览器对麦克风的支持情况
 */
export function checkMicrophonePrerequisites(): {
  supported: boolean
  isSecure: boolean
  isInIframe: boolean
  hasMediaDevices: boolean
  error?: MicrophoneErrorInfo
} {
  const isBrowser = typeof window !== 'undefined'
  if (!isBrowser) {
    return {
      supported: false,
      isSecure: false,
      isInIframe: false,
      hasMediaDevices: false,
      error: {
        code: 'UNSUPPORTED',
        title: '非浏览器运行环境',
        message: '当前运行在非浏览器环境中，无法调用麦克风。',
        instructions: ['请在现代浏览器中打开本应用。'],
        canRetry: false,
      },
    }
  }

  const isSecure = Boolean(window.isSecureContext)
  const isInIframe = window.self !== window.top
  const hasMediaDevices = Boolean(
    navigator &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
  )

  // 1. 检查安全上下文
  if (!isSecure) {
    return {
      supported: false,
      isSecure: false,
      isInIframe,
      hasMediaDevices,
      error: {
        code: 'INSECURE_CONTEXT',
        title: '网页运行环境不安全',
        message:
          '现代浏览器出于隐私保护，仅允许在安全上下文（HTTPS 或 localhost）中调用麦克风。',
        instructions: [
          '请通过以 https:// 开头的安全链接访问本网站',
          '若在本地开发测试，请使用 localhost 或 127.0.0.1 访问',
          '在不安全环境下，你可以直接在下方输入文字与小安交流 🍃',
        ],
        canRetry: true,
      },
    }
  }

  // 2. 检查 navigator.mediaDevices API 是否存在
  if (!hasMediaDevices) {
    return {
      supported: false,
      isSecure,
      isInIframe,
      hasMediaDevices: false,
      error: {
        code: 'UNSUPPORTED',
        title: '浏览器缺少录音接口',
        message:
          '当前浏览器不支持 navigator.mediaDevices.getUserMedia 音频采集接口。',
        instructions: [
          '建议使用最新版 Google Chrome、Microsoft Edge、Safari 或 Firefox 浏览器',
          '请确保浏览器未开启强制禁用媒体设备的极简模式',
          '你可以直接在下方输入框中写字，小安同样能用心陪伴你 🍃',
        ],
        canRetry: false,
      },
    }
  }

  return {
    supported: true,
    isSecure: true,
    isInIframe,
    hasMediaDevices: true,
  }
}

/**
 * 查询浏览器麦克风权限状态（若 Permissions API 支持）
 */
export async function queryMicrophonePermission(): Promise<
  'granted' | 'prompt' | 'denied' | 'unsupported'
> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.permissions ||
    typeof navigator.permissions.query !== 'function'
  ) {
    return 'unsupported'
  }

  try {
    const status = await navigator.permissions.query({ name: 'microphone' as any })
    return status.state
  } catch {
    return 'unsupported'
  }
}

/**
 * 检查当前是否有可用的麦克风硬件输入设备
 */
export async function checkAvailableAudioInputs(): Promise<{
  hasAudioInput: boolean
  devices: MediaDeviceInfo[]
}> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    typeof navigator.mediaDevices.enumerateDevices !== 'function'
  ) {
    return { hasAudioInput: true, devices: [] }
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const audioInputs = devices.filter((d) => d.kind === 'audioinput')
    return {
      hasAudioInput: audioInputs.length > 0,
      devices: audioInputs,
    }
  } catch {
    return { hasAudioInput: true, devices: [] }
  }
}

/**
 * 解析并转化捕获到的麦克风错误
 */
export function parseMicrophoneError(err: any): MicrophoneErrorInfo {
  const errName = err?.name || ''
  const errMsg = String(err?.message || '')
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top

  // 1. 用户或系统拒绝权限
  if (
    errName === 'NotAllowedError' ||
    errName === 'PermissionDeniedError' ||
    errMsg.includes('Permission denied') ||
    errMsg.includes('Permission dismissed') ||
    errMsg.includes('not-allowed')
  ) {
    const instructions = [
      '点击浏览器地址栏左侧的 🔒 或 ⚙️ 网站权限图标',
      '在弹出的权限列表中找到“麦克风”，将其从“禁止”或“询问”改为“允许”',
    ]
    if (isInIframe) {
      instructions.push('若页面嵌入在其他平台中，请确保上层平台与浏览器已允许该网站访问麦克风')
    }
    instructions.push('修改完成后，点击下方“重新检测并开启”按钮即可开始录音')

    return {
      code: 'NOT_ALLOWED',
      title: '麦克风访问权限未开启',
      message:
        '浏览器或用户未允许本页面访问麦克风。由于权限限制，无法收听你的声音。',
      instructions,
      canRetry: true,
      rawError: err,
    }
  }

  // 2. 未找到麦克风硬件设备
  if (
    errName === 'NotFoundError' ||
    errName === 'DevicesNotFoundError' ||
    errMsg.includes('Requested device not found') ||
    errMsg.includes('audio-capture')
  ) {
    return {
      code: 'NOT_FOUND',
      title: '未检测到麦克风录音设备',
      message: '你的设备上未找到可用的麦克风或音频输入硬件。',
      instructions: [
        '请检查电脑或手机的外接麦克风、耳麦或蓝牙耳机是否已插好并保持连接',
        '在操作系统的“声音设置”中确认已启用至少一个“输入设备”',
        '确认设备连接正常后，点击下方“重新检测并开启”',
      ],
      canRetry: true,
      rawError: err,
    }
  }

  // 3. 麦克风被其他应用独占或硬件故障
  if (
    errName === 'NotReadableError' ||
    errName === 'TrackStartError' ||
    errMsg.includes('Device in use')
  ) {
    return {
      code: 'NOT_READABLE',
      title: '麦克风已被其他应用占用',
      message:
        '系统麦克风正被其他程序独占（如腾讯会议、微信语音、钉钉、录音机等），无法同时读取。',
      instructions: [
        '请暂时退出或静音其他正在使用麦克风的会议、通话或录屏软件',
        '检查浏览器其他标签页是否也在使用麦克风并将其关闭',
        '释放麦克风后，点击下方“重新尝试”',
      ],
      canRetry: true,
      rawError: err,
    }
  }

  // 4. 安全策略或 Feature Policy 限制
  if (errName === 'SecurityError' || errMsg.includes('Permissions-Policy') || errMsg.includes('Feature-Policy')) {
    return {
      code: 'SECURITY_ERROR',
      title: '安全策略限制麦克风访问',
      message:
        '浏览器安全策略或页面嵌入权限（Feature Policy）阻止了麦克风的直接调用。',
      instructions: [
        '确认当前页面使用 HTTPS 安全协议打开',
        '若在 iframe 嵌入环境中运行，宿主窗口必须在标签中添加 allow="microphone"',
        '可尝试在新标签页中独立打开本页面，或改用文字输入倾诉 🍃',
      ],
      canRetry: true,
      rawError: err,
    }
  }

  // 5. 约束无法满足
  if (errName === 'OverconstrainedError' || errName === 'ConstraintNotSatisfiedError') {
    return {
      code: 'OVERCONSTRAINED',
      title: '麦克风参数配置不受支持',
      message: '指定的音频参数与当前输入设备不兼容。',
      instructions: [
        '点击“重新尝试”，系统将自动降级为基础音频配置',
        '若依然出现此提示，请更换其他麦克风输入源',
      ],
      canRetry: true,
      rawError: err,
    }
  }

  // 6. 兜底未知错误
  return {
    code: 'UNKNOWN',
    title: '无法获取麦克风',
    message: errMsg || '启动麦克风录音时发生未知异常。',
    instructions: [
      '请确认浏览器与系统麦克风开关均已打开',
      '刷新页面或重启浏览器后再试',
      '你也可以随时使用下方输入框输入文字与小安交流 🍃',
    ],
    canRetry: true,
    rawError: err,
  }
}

/**
 * 释放 MediaStream 所有的音频轨道，确保硬件指示灯熄灭，不残留后台占用
 */
export function stopMediaStream(stream: MediaStream | null | undefined): void {
  if (!stream) return
  try {
    const tracks = stream.getTracks()
    tracks.forEach((track) => {
      try {
        track.stop()
      } catch (e) {
        console.warn('Error stopping media track:', e)
      }
    })
  } catch (err) {
    console.warn('Error releasing media stream:', err)
  }
}

/**
 * 真实向浏览器申请麦克风流 (getUserMedia)
 * 必须在用户主动点击操作中被调用，以顺利触发浏览器原生授权弹窗。
 */
export async function requestMicrophoneStream(): Promise<
  { success: true; stream: MediaStream } | { success: false; error: MicrophoneErrorInfo }
> {
  // 1. 检查运行环境
  const prereq = checkMicrophonePrerequisites()
  if (!prereq.supported && prereq.error) {
    return { success: false, error: prereq.error }
  }

  // 2. 检查是否有麦克风设备
  const inputCheck = await checkAvailableAudioInputs()
  if (!inputCheck.hasAudioInput) {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        title: '未检测到麦克风录音设备',
        message: '你的设备上未找到可用的麦克风硬件，请连接耳麦或麦克风后重试。',
        instructions: [
          '请插入外置耳麦或检查内置麦克风是否已开启',
          '在操作系统“声音设置”中检查输入设备状态',
          '完成后点击“重新检测”',
        ],
        canRetry: true,
      },
    }
  }

  // 3. 真实调用 getUserMedia 请求麦克风，触发浏览器原生权限弹窗
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    return { success: true, stream }
  } catch (primaryErr: any) {
    // 降级尝试：如果带参数的 constraints 失败（如 OverconstrainedError），尝试无约束请求
    if (primaryErr?.name === 'OverconstrainedError') {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        return { success: true, stream: fallbackStream }
      } catch (fallbackErr: any) {
        return { success: false, error: parseMicrophoneError(fallbackErr) }
      }
    }

    return { success: false, error: parseMicrophoneError(primaryErr) }
  }
}

/**
 * 开启一次完整的真实麦克风录音与音量监测会话
 */
export function startMicrophoneSession(
  stream: MediaStream,
  options?: {
    onVolumeChange?: (volume: number) => void
    onAudioChunk?: (chunk: Blob) => void
  }
): ActiveMicrophoneSession {
  const startTime = Date.now()
  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let sourceNode: MediaStreamAudioSourceNode | null = null
  let animFrameId: number | null = null
  let mediaRecorder: MediaRecorder | null = null
  let recordedChunks: Blob[] = []
  let finalBlob: Blob | null = null
  let isStopped = false

  // 1. 初始化 Web Audio 分析器以监测真实音量波动 (0 ~ 100)
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext
    if (AudioContextClass) {
      audioContext = new AudioContextClass()
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {})
      }
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.5
      sourceNode = audioContext.createMediaStreamSource(stream)
      sourceNode.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateVolume = () => {
        if (isStopped || !analyser) return
        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        // 映射归一化到 0 ~ 100 的灵敏度音量
        const normalized = Math.min(100, Math.round((avg / 128) * 100))
        options?.onVolumeChange?.(normalized)
        animFrameId = requestAnimationFrame(updateVolume)
      }

      animFrameId = requestAnimationFrame(updateVolume)
    }
  } catch (e) {
    console.warn('AudioContext volume meter init error:', e)
  }

  // 2. 初始化 MediaRecorder 真实录制用户声音
  if (typeof MediaRecorder !== 'undefined') {
    try {
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        '',
      ]
      let selectedMime = ''
      for (const mime of mimeTypes) {
        if (!mime || MediaRecorder.isTypeSupported(mime)) {
          selectedMime = mime
          break
        }
      }

      mediaRecorder = selectedMime
        ? new MediaRecorder(stream, { mimeType: selectedMime })
        : new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data)
          options?.onAudioChunk?.(event.data)
        }
      }

      // 每 250ms 产出一个数据块
      mediaRecorder.start(250)
    } catch (e) {
      console.warn('MediaRecorder init error:', e)
    }
  }

  const cleanupAudioNodes = () => {
    isStopped = true
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
    if (sourceNode) {
      try {
        sourceNode.disconnect()
      } catch {}
      sourceNode = null
    }
    if (analyser) {
      try {
        analyser.disconnect()
      } catch {}
      analyser = null
    }
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close().catch(() => {})
      } catch {}
      audioContext = null
    }
  }

  return {
    stream,
    getLiveVolume: () => 0,
    getAudioBlob: () => finalBlob,
    stop: async () => {
      cleanupAudioNodes()
      const durationMs = Date.now() - startTime

      // 停止 MediaRecorder 并打包 Blob
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        await new Promise<void>((resolve) => {
          if (!mediaRecorder) return resolve()
          mediaRecorder.onstop = () => {
            if (recordedChunks.length > 0) {
              const type = recordedChunks[0]?.type || 'audio/webm'
              finalBlob = new Blob(recordedChunks, { type })
            }
            resolve()
          }
          try {
            mediaRecorder.stop()
          } catch {
            resolve()
          }
        })
      } else if (recordedChunks.length > 0) {
        const type = recordedChunks[0]?.type || 'audio/webm'
        finalBlob = new Blob(recordedChunks, { type })
      }

      // 停止并释放所有轨道
      stopMediaStream(stream)

      return {
        audioBlob: finalBlob || undefined,
        durationMs,
      }
    },
    cancel: () => {
      cleanupAudioNodes()
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop()
        } catch {}
      }
      recordedChunks = []
      finalBlob = null
      stopMediaStream(stream)
    },
  }
}
