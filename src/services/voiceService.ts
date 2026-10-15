/**
 * 安心健康 - 小安语音与音色管理服务 (Voice & TTS Service)
 *
 * 核心功能：
 * 1. 集中管理四种核心音色配置（成年男声、成年女声、男孩、女孩）；
 * 2. 真实结合 Web Speech API 浏览器声音匹配策略与物理声学参数（Pitch、Rate、Volume）；
 * 3. 预留标准云端 TTS Voice ID（如 Azure Speech Neural、火山引擎、Gemini 语音接口）；
 * 4. 账户级别持久化用户音色偏好，支持多用户严格隔离；
 * 5. 音频播放生命周期控制：防止音频重叠、安全中断、平滑衔接；
 * 6. 真实诊断检测：如实汇报浏览器声音匹配结果，拒绝虚假切换。
 */

export type VoiceProfileId = 'adultMale' | 'adultFemale' | 'boy' | 'girl'

export interface VoiceProfile {
  id: VoiceProfileId
  label: string
  tag: string
  description: string
  gender: 'male' | 'female'
  ageGroup: 'adult' | 'child'
  /** 物理声学音高 (0.5 ~ 2.0, 1.0 为标准) */
  pitch: number
  /** 语速 (0.5 ~ 2.0, 1.0 为正常) */
  rate: number
  /** 音量 (0.0 ~ 1.0) */
  volume: number
  /** 中文语音匹配关键词优先级 */
  preferredKeywords: string[]
  /** 预留云端 TTS 真实 Voice ID (如 Azure Neural / 火山引擎等) */
  cloudVoiceId: string
  /** 专属试听示例短句 */
  samplePhrase: string
}

/**
 * 四种核心音色真实参数配置
 */
export const VOICE_PROFILES: Record<VoiceProfileId, VoiceProfile> = {
  adultMale: {
    id: 'adultMale',
    label: '成年男声',
    tag: '沉稳温和',
    description: '温厚宽广的成熟男声，如林间大树般踏实可靠，适合舒缓压力与安抚焦虑',
    gender: 'male',
    ageGroup: 'adult',
    pitch: 0.85,
    rate: 0.95,
    volume: 1.0,
    preferredKeywords: [
      'yunxi',
      'kangkang',
      'yunyang',
      'yu-shu',
      'kaho',
      'male',
      '男',
      'man',
      'chinese male',
    ],
    cloudVoiceId: 'zh-CN-YunxiNeural',
    samplePhrase: '我一直在这里听着呢。放轻松，深呼吸一口气，我们慢慢来。',
  },
  adultFemale: {
    id: 'adultFemale',
    label: '成年女声',
    tag: '轻柔暖心',
    description: '温润轻柔的知性女声，如晨光微风般包容治愈，陪伴倾听每一个心事',
    gender: 'female',
    ageGroup: 'adult',
    pitch: 1.02,
    rate: 0.98,
    volume: 1.0,
    preferredKeywords: [
      'xiaoxiao',
      'yaoyao',
      'huihui',
      'tingting',
      'sinji',
      'meijia',
      'female',
      '女',
      'woman',
      'chinese female',
    ],
    cloudVoiceId: 'zh-CN-XiaoxiaoNeural',
    samplePhrase: '谢谢你愿意轻声告诉我。心里的阴霾都会过去的，我会一直陪着你。',
  },
  boy: {
    id: 'boy',
    label: '男孩',
    tag: '清澈朝气',
    description: '清澈明朗的少年男童音色，充满生机与陪伴感，带来前行的力量与温暖',
    gender: 'male',
    ageGroup: 'child',
    pitch: 1.38,
    rate: 1.06,
    volume: 1.0,
    preferredKeywords: [
      'yunjian',
      'yunyang',
      'boy',
      'child',
      'kid',
      '童',
      '少男',
      '小男',
      '青年',
    ],
    cloudVoiceId: 'zh-CN-YunjianNeural',
    samplePhrase: '别难过呀！深呼吸一下，把不开心抖落掉，我们一起向前走！',
  },
  girl: {
    id: 'girl',
    label: '女孩',
    tag: '甜美活泼',
    description: '软萌甜美的治愈女童音色，灵动轻快，像春日抽芽的小草般软软治愈',
    gender: 'female',
    ageGroup: 'child',
    pitch: 1.48,
    rate: 1.04,
    volume: 1.0,
    preferredKeywords: [
      'xiaoyi',
      'shanshan',
      'girl',
      'child',
      'kid',
      '少女',
      '女孩',
      '小女',
      '萝莉',
      '童声',
    ],
    cloudVoiceId: 'zh-CN-XiaoyiNeural',
    samplePhrase: '抱抱你哦！今天的你已经很棒很棒啦，好好休息，做个甜甜的梦吧！',
  },
}

export const VOICE_PROFILE_LIST: VoiceProfile[] = [
  VOICE_PROFILES.adultMale,
  VOICE_PROFILES.adultFemale,
  VOICE_PROFILES.boy,
  VOICE_PROFILES.girl,
]

const STORAGE_PREFIX = 'xiaoan_voice_preference_v1_'

/**
 * 读取当前用户的音色配置（按用户 ID 隔离存储）
 */
export function getSavedVoiceProfileId(userId?: string): VoiceProfileId {
  const safeUserId = userId ? userId.trim() : 'user_guest'
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(`${STORAGE_PREFIX}${safeUserId}`)
      if (saved && (saved === 'adultMale' || saved === 'adultFemale' || saved === 'boy' || saved === 'girl')) {
        return saved
      }
    }
  } catch (err) {
    console.warn('Failed to read voice preference from storage:', err)
  }
  // 默认女声（小安标准温润治愈音色）
  return 'adultFemale'
}

/**
 * 保存当前用户的音色配置
 */
export function saveVoiceProfileId(userId: string | undefined, profileId: VoiceProfileId): void {
  const safeUserId = userId ? userId.trim() : 'user_guest'
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(`${STORAGE_PREFIX}${safeUserId}`, profileId)
    }
  } catch (err) {
    console.warn('Failed to save voice preference to storage:', err)
  }
}

/**
 * 获取浏览器原生可用的声音列表
 */
export function getAvailableBrowserVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return []
  }
  return window.speechSynthesis.getVoices() || []
}

/**
 * 为指定音色配置文件匹配最佳浏览器声音
 */
export function resolveBestBrowserVoice(profileId: VoiceProfileId): {
  voice: SpeechSynthesisVoice | null
  isSpecificMatch: boolean
  matchedVoiceName: string
  strategy: string
} {
  const profile = VOICE_PROFILES[profileId]
  const voices = getAvailableBrowserVoices()

  if (!voices.length) {
    return {
      voice: null,
      isSpecificMatch: false,
      matchedVoiceName: '系统默认声音（尚未加载）',
      strategy: 'unloaded',
    }
  }

  // 1. 过滤中文声音（zh-CN, zh-HK, zh-TW, cmn 等）
  const chineseVoices = voices.filter(
    (v) =>
      v.lang &&
      (v.lang.toLowerCase().startsWith('zh') ||
        v.lang.toLowerCase().startsWith('cmn'))
  )

  const candidatePool = chineseVoices.length > 0 ? chineseVoices : voices

  // 2. 尝试根据配置的关键词精确匹配
  for (const keyword of profile.preferredKeywords) {
    const keyLower = keyword.toLowerCase()
    const found = candidatePool.find(
      (v) =>
        v.name.toLowerCase().includes(keyLower) ||
        v.voiceURI.toLowerCase().includes(keyLower)
    )
    if (found) {
      return {
        voice: found,
        isSpecificMatch: true,
        matchedVoiceName: found.name,
        strategy: `keyword_${keyword}`,
      }
    }
  }

  // 3. 次优匹配：根据性别/年龄倾向匹配中文候选声线
  if (chineseVoices.length > 0) {
    if (profile.gender === 'male') {
      const maleVoice = chineseVoices.find((v) => {
        const n = v.name.toLowerCase()
        return (
          n.includes('male') ||
          n.includes('kangkang') ||
          n.includes('yun') ||
          n.includes('zhiwei') ||
          n.includes('男')
        )
      })
      if (maleVoice) {
        return {
          voice: maleVoice,
          isSpecificMatch: true,
          matchedVoiceName: maleVoice.name,
          strategy: 'chinese_male_fallback',
        }
      }
    } else {
      const femaleVoice = chineseVoices.find((v) => {
        const n = v.name.toLowerCase()
        return (
          n.includes('female') ||
          n.includes('xiao') ||
          n.includes('tingting') ||
          n.includes('huihui') ||
          n.includes('yaoyao') ||
          n.includes('女')
        )
      })
      if (femaleVoice) {
        return {
          voice: femaleVoice,
          isSpecificMatch: true,
          matchedVoiceName: femaleVoice.name,
          strategy: 'chinese_female_fallback',
        }
      }
    }

    // 若未区分性别，采用首选中文声音结合声学校准
    const defaultZh = chineseVoices.find((v) => v.default) || chineseVoices[0]
    return {
      voice: defaultZh,
      isSpecificMatch: false,
      matchedVoiceName: `${defaultZh.name} (结合声学特征校准)`,
      strategy: 'chinese_acoustic_pitch_shifted',
    }
  }

  // 4. 若无中文声音，使用系统默认声音结合声学校准
  const defaultVoice = voices.find((v) => v.default) || voices[0] || null
  return {
    voice: defaultVoice,
    isSpecificMatch: false,
    matchedVoiceName: defaultVoice ? `${defaultVoice.name} (通用声学模拟)` : '默认声音',
    strategy: 'system_default_acoustic_pitch_shifted',
  }
}

/**
 * 声音环境诊断信息
 */
export function getVoiceDiagnostics(): {
  hasSpeechSynthesis: boolean
  totalVoices: number
  chineseVoices: string[]
  profiles: Record<
    VoiceProfileId,
    {
      label: string
      matchedVoiceName: string
      pitch: number
      rate: number
      isSpecificMatch: boolean
      cloudVoiceId: string
    }
  >
} {
  const hasSpeechSynthesis =
    typeof window !== 'undefined' && 'speechSynthesis' in window
  const voices = getAvailableBrowserVoices()
  const chineseVoices = voices
    .filter((v) => v.lang && (v.lang.toLowerCase().startsWith('zh') || v.lang.toLowerCase().startsWith('cmn')))
    .map((v) => v.name)

  const profilesDiagnostic = {} as any
  for (const p of VOICE_PROFILE_LIST) {
    const match = resolveBestBrowserVoice(p.id)
    profilesDiagnostic[p.id] = {
      label: p.label,
      matchedVoiceName: match.matchedVoiceName,
      pitch: p.pitch,
      rate: p.rate,
      isSpecificMatch: match.isSpecificMatch,
      cloudVoiceId: p.cloudVoiceId,
    }
  }

  return {
    hasSpeechSynthesis,
    totalVoices: voices.length,
    chineseVoices,
    profiles: profilesDiagnostic,
  }
}

// 模块级单例播放控制器与状态
let currentUtterance: SpeechSynthesisUtterance | null = null
let currentPlayingVoiceId: VoiceProfileId | null = null
let isPlayingFlag = false
let pauseHeartbeatTimer: number | null = null

export interface SpeakOptions {
  onStart?: () => void
  onEnd?: () => void
  onError?: (err: any) => void
}

/**
 * 播放指定音色的文本语音
 */
export function speakText(
  text: string,
  profileId: VoiceProfileId,
  options?: SpeakOptions
): { stop: () => void } {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options?.onError?.(new Error('当前浏览器环境不支持 SpeechSynthesis 语音合成'))
    return { stop: () => {} }
  }

  // 停止先前的播放，防止音频重叠
  stopSpeaking()

  const cleanText = text ? text.trim() : ''
  if (!cleanText) {
    options?.onEnd?.()
    return { stop: () => {} }
  }

  const profile = VOICE_PROFILES[profileId] || VOICE_PROFILES.adultFemale
  const matchResult = resolveBestBrowserVoice(profileId)

  const utterance = new SpeechSynthesisUtterance(cleanText)
  currentUtterance = utterance
  currentPlayingVoiceId = profileId
  isPlayingFlag = true

  // 绑定真实声学与声音参数
  if (matchResult.voice) {
    utterance.voice = matchResult.voice
    utterance.lang = matchResult.voice.lang || 'zh-CN'
  } else {
    utterance.lang = 'zh-CN'
  }

  utterance.pitch = profile.pitch
  utterance.rate = profile.rate
  utterance.volume = profile.volume

  const cleanup = () => {
    if (pauseHeartbeatTimer !== null) {
      window.clearInterval(pauseHeartbeatTimer)
      pauseHeartbeatTimer = null
    }
    if (currentUtterance === utterance) {
      currentUtterance = null
      currentPlayingVoiceId = null
      isPlayingFlag = false
    }
  }

  utterance.onstart = () => {
    isPlayingFlag = true
    options?.onStart?.()

    // 解决 Chromium 超过 14 秒自动暂停的知名底层 Bug
    if (pauseHeartbeatTimer !== null) {
      window.clearInterval(pauseHeartbeatTimer)
    }
    pauseHeartbeatTimer = window.setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      }
    }, 10000)
  }

  utterance.onend = () => {
    cleanup()
    options?.onEnd?.()
  }

  utterance.onerror = (e) => {
    cleanup()
    // 'canceled' 或 'interrupted' 是正常用户切换/打断行为，不作为致命错误
    if (e.error !== 'canceled' && e.error !== 'interrupted') {
      options?.onError?.(e)
    } else {
      options?.onEnd?.()
    }
  }

  try {
    window.speechSynthesis.speak(utterance)
  } catch (err) {
    cleanup()
    options?.onError?.(err)
  }

  return {
    stop: () => {
      if (currentUtterance === utterance) {
        stopSpeaking()
      }
    },
  }
}

/**
 * 停止当前正在播放的声音
 */
export function stopSpeaking(): void {
  if (pauseHeartbeatTimer !== null) {
    window.clearInterval(pauseHeartbeatTimer)
    pauseHeartbeatTimer = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch (err) {
      console.warn('SpeechSynthesis cancel error:', err)
    }
  }
  currentUtterance = null
  currentPlayingVoiceId = null
  isPlayingFlag = false
}

/**
 * 查询当前是否正在播放语音
 */
export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return false
  }
  return isPlayingFlag || window.speechSynthesis.speaking
}

/**
 * 获取当前正在发声的音色 ID（若无播放则返回 null）
 */
export function getCurrentPlayingVoiceId(): VoiceProfileId | null {
  return currentPlayingVoiceId
}
