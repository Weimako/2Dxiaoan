/**
 * 平台与设备语音能力适配器 (Voice Platform Adapter)
 *
 * 核心职责：
 * 1. 跨平台环境检测（桌面 Chrome/Edge/Safari/Firefox、Android 平板/手机浏览器、Android WebView、iOS Safari 等）；
 * 2. 动态探测平台最佳 MediaRecorder 音频编码 MIME 格式，避免写死导致在 Android/iOS 上录音失败；
 * 3. 诊断当前环境能力边界（Web Audio API、MediaDevices、SpeechRecognition、安全上下文等）；
 * 4. 为未来 Android 原生封装应用（WebView / Capacitor / Tauri）预留桥接扩展空间，明确未接入时的降级路径。
 */

export type PlatformType =
  | 'windows'
  | 'macos'
  | 'android'
  | 'ios'
  | 'linux'
  | 'unknown'

export type RuntimeContainer =
  | 'browser_desktop'
  | 'browser_mobile'
  | 'android_webview'
  | 'ios_webview'
  | 'standalone_pwa'

export interface PlatformCapabilities {
  platform: PlatformType
  container: RuntimeContainer
  isSecureContext: boolean
  hasMediaDevices: boolean
  hasMediaRecorder: boolean
  hasSpeechRecognition: boolean
  hasAudioContext: boolean
  bestAudioMimeType: string
  supportedMimeTypes: string[]
  canRecordAudio: boolean
  canTranscribeLocally: boolean
  isInIframe: boolean
  recommendation: string
}

/**
 * 探测当前设备的操作系统类型
 */
export function detectPlatform(): PlatformType {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent.toLowerCase()

  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/win/.test(ua)) return 'windows'
  if (/macintosh|mac os x/.test(ua)) return 'macos'
  if (/linux/.test(ua)) return 'linux'

  return 'unknown'
}

/**
 * 探测当前网页的运行容器环境（普通浏览器、移动端浏览器或 WebView）
 */
export function detectContainer(): RuntimeContainer {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'browser_desktop'
  }

  const ua = navigator.userAgent.toLowerCase()
  const isMobile = /mobile|android|iphone|ipad|ipod/.test(ua)

  // 检测是否为 Android WebView（通常含有 'wv' 或在 Android 下含有 'Version/X.X' 且非标准 Chrome）
  const isAndroidWebView =
    /android/.test(ua) &&
    (/wv/.test(ua) || (Boolean((window as any).AndroidBridge) || Boolean((window as any).Android)))

  // 检测是否为 iOS WebView
  const isIosWebView =
    /(iphone|ipod|ipad)/.test(ua) &&
    !/(safari)/.test(ua) &&
    /(applewebkit)/.test(ua)

  if (isAndroidWebView) return 'android_webview'
  if (isIosWebView) return 'ios_webview'
  if (isMobile) return 'browser_mobile'

  return 'browser_desktop'
}

/**
 * 探测当前浏览器支持的最佳 MediaRecorder 音频 MIME 类型
 * 避免固定写死 'audio/webm' 导致在 Safari 或特定 Android 浏览器上无法初始化
 */
export function detectBestAudioMimeType(): {
  bestMime: string
  allSupported: string[]
} {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return { bestMime: '', allSupported: [] }
  }

  // 候选格式按通用性与音质压缩比降序排列
  const candidateMimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    'audio/wav',
  ]

  const supported: string[] = []

  for (const mime of candidateMimeTypes) {
    try {
      if (typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(mime)) {
        supported.push(mime)
      }
    } catch {
      // 兼容老版本浏览器防护
    }
  }

  // 默认使用检测出的第一个支持类型；若均返回 false，则传空字符串让浏览器使用其内部默认配置
  const bestMime = supported.length > 0 ? supported[0] : ''

  return {
    bestMime,
    allSupported: supported,
  }
}

/**
 * 获取当前平台完整语音能力画像
 */
export function getPlatformCapabilities(): PlatformCapabilities {
  const platform = detectPlatform()
  const container = detectContainer()
  const isSecure = typeof window !== 'undefined' ? Boolean(window.isSecureContext) : false
  const isInIframe = typeof window !== 'undefined' ? window.self !== window.top : false

  const hasMediaDevices =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function')

  const hasMediaRecorder = typeof MediaRecorder !== 'undefined'

  const hasSpeechRecognition =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  const hasAudioContext =
    typeof window !== 'undefined' &&
    Boolean(window.AudioContext || (window as any).webkitAudioContext)

  const { bestMime, allSupported } = detectBestAudioMimeType()

  const canRecordAudio = isSecure && hasMediaDevices && hasMediaRecorder
  const canTranscribeLocally = hasSpeechRecognition

  let recommendation = '支持完整的网页麦克风录音与语音输入。'
  if (!isSecure) {
    recommendation = '当前页面未运行在 HTTPS 或 localhost 安全上下文中，浏览器禁止调用麦克风。'
  } else if (!hasMediaDevices) {
    recommendation = '当前设备或浏览器缺少音频采集接口，建议升级浏览器或直接使用文字输入。'
  } else if (container === 'android_webview') {
    recommendation =
      '检测到当前处于 Android WebView 嵌入环境。若麦克风无法开启，需由 Android 宿主开启 WebChromeClient.onPermissionRequest 权限代理。'
  }

  return {
    platform,
    container,
    isSecureContext: isSecure,
    hasMediaDevices,
    hasMediaRecorder,
    hasSpeechRecognition,
    hasAudioContext,
    bestAudioMimeType: bestMime,
    supportedMimeTypes: allSupported,
    canRecordAudio,
    canTranscribeLocally,
    isInIframe,
    recommendation,
  }
}
