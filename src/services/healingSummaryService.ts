/**
 * 深度疗愈会话小结引擎 (Healing Summary Service)
 *
 * 核心功能：
 * 1. 严格基于用户与小安在「本次深度疗愈」中的真实对话，动态提炼总结、真实情绪、主题词与情绪词云；
 * 2. 杜绝固定词云和模版套用，词云真实反映用户谈论的内容；
 * 3. 彻底排除「中性」「正向」「负向」「未知」等系统技术分类标签，绝不把系统分类标签作为词云或用户情绪呈现；
 * 4. 不因为模型判定为中性而强行生成「平静」或其他非真实情绪；
 * 5. 健全的异步处理、加载态、错误处理与会话/账户级隔离持久化；
 * 6. 支持多账户严格隔离，避免账户切换后历史对话与小结串用。
 */

import { analyzeEmotion, type EmotionCategory } from './emotionService.ts'

export interface ChatDialogItem {
  id: string
  role: 'user' | 'assistant'
  text: string
  content?: string
  time: string
  createdAt?: number
  inputType?: 'text' | 'voice'
  status?: 'sending' | 'sent' | 'error'
  isMock?: boolean
  userId?: string
  sessionId?: string
  audioUrl?: string
  voiceId?: string
}

export interface WordCloudItem {
  word: string
  size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  weight: number
  category?: 'emotion' | 'topic' | 'action' | 'need'
}

export interface HealingSessionSummary {
  sessionId: string
  userId?: string
  generatedAt: number
  totalRounds: number
  userMessageCount: number
  assistantMessageCount: number
  // 核心总结段落（左侧总结卡片展示，每行一段）
  paragraphs: string[]
  // 核心提取标签/主题
  topics: string[]
  // 用户明确表达的情绪（仅包含用户真实表达的情绪，绝不包含系统分类标签）
  emotions: EmotionCategory[]
  // 内部系统情绪分类倾向（用于内部状态识别，与面向用户展示的关键词严格分离）
  systemValence?: 'positive' | 'negative' | 'neutral' | 'mixed'
  // 动态情绪词云（字号严格根据真实对话权重与频次，排除系统分类标签与人工强行捏造词）
  wordCloud: WordCloudItem[]
  // 右侧植物成长语录
  growthMessage: string
  // 温和自我关怀建议
  selfCareSuggestion: string
}

// 存储前缀定义（按用户 ID 与会话 ID 严格隔离）
export const SUMMARY_STORAGE_PREFIX = 'xiaoan_healing_summary_v3_'
export const LATEST_SUMMARY_SESSION_KEY = 'xiaoan_latest_summary_session_id_v3_'
export const CHAT_DIALOGS_STORAGE_PREFIX = 'xiaoan_chat_dialogs_v3_'
export const ACTIVE_SESSION_STORAGE_PREFIX = 'xiaoan_active_session_v3_'

// 系统情绪分类与技术标签黑名单（绝不允许作为情绪词展示在词云或情绪标签中）
export const SYSTEM_CATEGORIZATION_TAGS = new Set([
  '中性',
  '正向',
  '负向',
  '中立',
  '未知',
  '不明确',
  '未明确',
  '未识别',
  '复杂',
  '系统',
  '其他',
  'neutral',
  'positive',
  'negative',
  'mixed',
  'unknown',
  '中性客观',
  '日常中性',
  '系统分类',
  '客观',
])

// 保持向下兼容导出
export const SYSTEM_TAGS_TO_FILTER = SYSTEM_CATEGORIZATION_TAGS

/**
 * 校验词汇是否为系统分类标签
 */
export function isSystemCategorizationTag(word: string): boolean {
  if (!word || typeof word !== 'string') return true
  const trimmed = word.trim()
  if (SYSTEM_CATEGORIZATION_TAGS.has(trimmed)) return true
  const lower = trimmed.toLowerCase()
  if (SYSTEM_CATEGORIZATION_TAGS.has(lower)) return true
  if (/^(中性|系统|未知|未识别|未明确)/.test(trimmed)) return true
  return false
}

// 停用词与语气助词，避免词云提取无意义字
const STOP_WORDS = new Set([
  '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
  '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
  '自己', '这', '那', '呢', '吧', '啊', '呀', '哦', '嗯', '吗', '把', '被', '让',
  '跟', '从', '向', '对', '但', '但是', '然后', '因为', '所以', '如果', '而且',
  '就是', '觉得', '只是', '可能', '现在', '今天', '这里', '这个', '那个', '小安',
  '什么', '怎么', '怎样', '为什么', '其实', '已经', '还是', '一下', '一点', '点',
  '可以', '能够', '知道', '明白', '好像', '总是', '一直', '很多', '非常', '写了',
  '来了', '来看看', '来看'
])

// 主题与意图词典（用于更精准地从用户真实对话中提炼心理意向词）
const TOPIC_PATTERNS: Array<{
  keyword: string
  topic: string
  patterns: RegExp
  category: 'topic' | 'action' | 'need'
}> = [
  // 压力与工作/学业
  { keyword: '工作压力', topic: '工作负荷', patterns: /(工作|加班|职场|项目|同事|领导|开会|业绩|打卡)/, category: 'topic' },
  { keyword: '学业负担', topic: '学业进度', patterns: /(学业|作业|论文|考试|功课|复习|考研|升学|写作业)/, category: 'topic' },
  { keyword: '日程超载', topic: '生活步调', patterns: /(忙不完|太忙|赶进度|来不及|连轴转|喘不过气)/, category: 'topic' },
  // 人际与沟通
  { keyword: '人际沟通', topic: '人际沟通', patterns: /(朋友|闺蜜|室友|聊天|吵架|冷战|沟通|交流|误会|距离感)/, category: 'topic' },
  { keyword: '心理边界', topic: '人际边界', patterns: /(拒绝|不敢说|迎合|讨好|委屈|界限|边界|不好意思说)/, category: 'need' },
  { keyword: '被理解', topic: '倾诉陪伴', patterns: /(没人懂|孤单|孤独|想找人说|被理解|不被理解|被忽视)/, category: 'need' },
  // 身体与精力
  { keyword: '身体疲惫', topic: '躯体信号', patterns: /(累|疲惫|困|头疼|失眠|没精神|睡不着|全身酸|透支)/, category: 'topic' },
  { keyword: '好好休息', topic: '能量蓄积', patterns: /(想躺平|想睡觉|休息|歇歇|喘口气|放空|停下来)/, category: 'action' },
  // 内心自我与关怀
  { keyword: '自我苛责', topic: '内心评判', patterns: /(觉得自己差|很笨|做不好|自责|搞砸|愧疚|对不起别人)/, category: 'topic' },
  { keyword: '允许脆弱', topic: '自我接纳', patterns: /(允许|接纳|算了|没关系|不强求|慢慢来|原谅自己)/, category: 'action' },
  { keyword: '呼吸调节', topic: '身心觉察', patterns: /(深呼吸|叹气|胸闷|呼吸|心跳快|深吸一口气)/, category: 'action' },
  { keyword: '整理心绪', topic: '情绪理清', patterns: /(心乱|脑子乱|一团乱|理不清|想通|捋一捋)/, category: 'action' },
  { keyword: '积极分享', topic: '生活微光', patterns: /(开心|有趣|好事|分享|笑|轻松|欣慰|阳光|散步|散心|喝茶)/, category: 'topic' }
]

/**
 * 过滤和清洗有效消息
 */
export function sanitizeDialogs(dialogs: ChatDialogItem[]): ChatDialogItem[] {
  if (!Array.isArray(dialogs)) return []
  return dialogs.filter((item) => {
    if (!item || !item.text) return false
    const trimmed = item.text.trim()
    if (!trimmed) return false
    if (trimmed === '...' || trimmed === '…' || trimmed === '正在输入...') return false
    return true
  })
}

/**
 * 从真实对话文本中提取候选关键词与频次
 */
function extractWordFrequencies(texts: string[]): Map<string, number> {
  const freq = new Map<string, number>()
  const combined = texts.join(' ')

  const words = combined.match(/[\u4e00-\u9fa5]{2,4}/g) || []

  for (const w of words) {
    if (STOP_WORDS.has(w)) continue
    if (isSystemCategorizationTag(w)) continue
    // 排除全单字重叠词如“哈哈哈哈”取前两字“哈哈”
    const normalized = w.length > 2 && w[0] === w[1] && w[1] === w[2] ? w.slice(0, 2) : w
    freq.set(normalized, (freq.get(normalized) || 0) + 1)
  }

  return freq
}

/**
 * 基于本次会话真实对话，深度生成疗愈小结
 */
export async function generateHealingSummary(
  dialogs: ChatDialogItem[],
  sessionId: string = `sess_${Date.now()}`,
  userId: string = 'guest'
): Promise<HealingSessionSummary> {
  const targetUserId = userId || 'guest'
  const validDialogs = sanitizeDialogs(dialogs).filter(
    (d) => !d.userId || d.userId === targetUserId
  )
  const userMessages = validDialogs.filter((d) => d.role === 'user')
  const assistantMessages = validDialogs.filter((d) => d.role === 'assistant')

  // 1. 若没有任何有效对话（如直接点总结）
  if (userMessages.length === 0) {
    const defaultSummary: HealingSessionSummary = {
      sessionId,
      userId: targetUserId,
      generatedAt: Date.now(),
      totalRounds: 0,
      userMessageCount: 0,
      assistantMessageCount: 0,
      paragraphs: [
        '刚刚在林间静静坐了一小会儿。即使还没准备好开口，这里的空气也是温和接纳的。',
        '安静本身也是一种珍贵的疗愈。当你需要的时候，小安一直在树下等着你。',
        '不必急着追赶什么，累了就回来歇歇脚。',
      ],
      topics: ['安静片刻'],
      emotions: [], // 无虚构情绪
      systemValence: 'neutral',
      wordCloud: [
        { word: '安静', size: 'xl', weight: 8, category: 'action' },
        { word: '陪伴', size: 'lg', weight: 7, category: 'need' },
        { word: '歇脚', size: 'md', weight: 6, category: 'action' },
      ],
      growthMessage: '今天也为自己留出了一片安静的林地',
      selfCareSuggestion: '喝一杯温水，放松肩膀，给心留个喘息的缝隙。',
    }
    saveSessionSummary(defaultSummary, targetUserId)
    return defaultSummary
  }

  // 2. 分析用户全部输入的情绪倾向
  const userTexts = userMessages.map((m) => m.text)
  const allUserJoined = userTexts.join(' ')
  const emotionSet = new Set<EmotionCategory>()
  let negativeCount = 0
  let positiveCount = 0
  let neutralCount = 0

  userTexts.forEach((text) => {
    const analysis = analyzeEmotion(text)
    analysis.moods.forEach((m) => {
      // 显式过滤系统技术分类标签（如「中性」、「不明确」）
      if (!isSystemCategorizationTag(m)) {
        emotionSet.add(m)
      }
    })
    if (analysis.valence === 'negative') negativeCount++
    if (analysis.valence === 'positive') positiveCount++
    if (analysis.valence === 'neutral') neutralCount++
  })

  // 3. 匹配对话中的主题与需求特征
  const matchedTopics: string[] = []
  const topicKeywords: Array<{ word: string; weight: number; category: 'topic' | 'action' | 'need' }> = []

  TOPIC_PATTERNS.forEach(({ keyword, topic, patterns, category }) => {
    if (patterns.test(allUserJoined)) {
      if (!isSystemCategorizationTag(topic)) matchedTopics.push(topic)
      if (!isSystemCategorizationTag(keyword)) topicKeywords.push({ word: keyword, weight: 8, category })
    }
  })

  // 4. 动态构建情绪词云（严格根据本次真实会话提取，绝不强塞模版关键词）
  const wordFreq = extractWordFrequencies(userTexts)
  const wordCandidateMap = new Map<string, { weight: number; category: 'emotion' | 'topic' | 'action' | 'need' }>()

  // 4.1 加入真实明确表达的情绪词（权重最高，彻底过滤系统分类标签）
  emotionSet.forEach((emo) => {
    if (isSystemCategorizationTag(emo)) return
    wordCandidateMap.set(emo, { weight: 12, category: 'emotion' })
  })

  // 4.2 加入匹配到的具体主题词
  topicKeywords.forEach(({ word, weight, category }) => {
    if (isSystemCategorizationTag(word)) return
    const existing = wordCandidateMap.get(word)
    wordCandidateMap.set(word, {
      weight: (existing ? existing.weight : 0) + weight,
      category,
    })
  })

  // 4.3 结合本次真实文本高频词
  wordFreq.forEach((cnt, word) => {
    if (
      word.length >= 2 &&
      word.length <= 4 &&
      !STOP_WORDS.has(word) &&
      !isSystemCategorizationTag(word)
    ) {
      const existing = wordCandidateMap.get(word)
      if (existing) {
        existing.weight += cnt * 2
      } else if (cnt >= 1) {
        wordCandidateMap.set(word, { weight: cnt * 3, category: 'topic' })
      }
    }
  })

  // 4.4 针对对话极其简短且无明确特征词的自然兜底（仅在完全没有任何候选词时介入，绝不加入「中性」）
  if (wordCandidateMap.size === 0) {
    if (allUserJoined.includes('平静') || allUserJoined.includes('安静')) {
      wordCandidateMap.set('平静', { weight: 8, category: 'emotion' })
    } else {
      wordCandidateMap.set('倾听', { weight: 6, category: 'action' })
      wordCandidateMap.set('陪伴', { weight: 6, category: 'need' })
    }
  }

  // 4.5 强制安全过滤：绝不允许系统分类词或带有“中性”前缀的词进入
  SYSTEM_CATEGORIZATION_TAGS.forEach((tag) => {
    wordCandidateMap.delete(tag)
  })
  for (const k of Array.from(wordCandidateMap.keys())) {
    if (isSystemCategorizationTag(k)) {
      wordCandidateMap.delete(k)
    }
  }

  // 过滤并排序词云候选，保留权重最高的前 6 ~ 10 个词（内容不足时不强行凑数）
  const sortedCandidates = Array.from(wordCandidateMap.entries())
    .filter(([word]) => !isSystemCategorizationTag(word))
    .sort((a, b) => b[1].weight - a[1].weight)
    .slice(0, 10)

  // 根据在本次对话中的真实权重阶梯分布分配字号
  const wordCloud: WordCloudItem[] = sortedCandidates.map(([word, meta], index) => {
    let size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md'
    if (sortedCandidates.length === 1) {
      size = 'xl'
    } else if (sortedCandidates.length <= 3) {
      size = index === 0 ? 'xl' : 'lg'
    } else {
      if (index === 0) size = 'xxl'
      else if (index <= 2) size = 'xl'
      else if (index <= 4) size = 'lg'
      else if (index <= 6) size = 'md'
      else size = 'sm'
    }

    return {
      word,
      size,
      weight: meta.weight,
      category: meta.category,
    }
  })

  // 5. 动态生成个性化疗愈总结文字（符合温柔心理咨询风格，不夸大、不编造）
  const paragraphs: string[] = []
  let growthMessage = '今天也发了一点芽'
  let selfCareSuggestion = '今晚试着早半小时放下屏幕，给自己一个温热的拥抱。'

  const topicsList = Array.from(new Set(matchedTopics)).filter(
    (t) => !isSystemCategorizationTag(t)
  )
  const emotionsList = Array.from(emotionSet).filter(
    (e) => !isSystemCategorizationTag(e)
  )

  const isBrief = userMessages.length <= 1 && allUserJoined.length < 25

  if (isBrief) {
    const firstWord = userTexts[0] || ''
    paragraphs.push(
      `今天你在林间留下了这句：「${firstWord.length > 20 ? firstWord.slice(0, 18) + '...' : firstWord}」。`
    )
    if (emotionsList.length > 0) {
      paragraphs.push(
        `虽然只是一小步，但能真实觉察到心里的「${emotionsList.join('、')}」，这本身就是一份敏锐与诚实。`
      )
    } else {
      paragraphs.push('哪怕只是简短的一两句问候，也是把心里的一扇小窗轻轻推开了一条缝。')
    }
    paragraphs.push('林间的风吹过了，你的声音被好好听到了。想说的时候，我们随时再来。')

    growthMessage = '心里悄悄探出了第一片嫩叶'
    selfCareSuggestion = '给自己倒杯温水，轻轻活动一下肩颈。'
  } else if (negativeCount >= positiveCount && negativeCount > 0) {
    const topicText =
      topicsList.length > 0 ? `关于${topicsList.join('、')}的烦扰` : '心头那些沉甸甸的琐事'
    paragraphs.push(
      `今天你把${topicText}坦诚地说了出来。感到${emotionsList.join('与') || '疲惫'}的时候，能不把它硬生生压下去，本身就需要很多勇气。`
    )
    paragraphs.push(
      '那些乱糟糟的念头和紧绷的感受，不必立刻变得井井有条，它们被允许在林间安放一会儿。你不需要时刻都坚强无瑕。'
    )
    paragraphs.push('风吹散了一些杂音，小安陪你守住了当下的呼吸。脚步可以慢下来，芽会按照它自己的节奏抬头。')

    growthMessage = '雨滴打湿的泥土里，小芽正蓄积温润的力量'
    selfCareSuggestion = '洗一个温水澡，把双肩自然下沉，今晚允许自己什么都不必解决。'
  } else if (positiveCount > negativeCount) {
    const topicText =
      topicsList.length > 0 ? `关于${topicsList.join('、')}的美好细节` : '生活里那些明亮温热的瞬间'
    paragraphs.push(
      `今天在林间听你分享了${topicText}，字句里流淌着难得的${emotionsList.join('与') || '轻松与明亮'}。`
    )
    paragraphs.push('心里有光照进来的时候，记得好好把它留存。这些微小的愉悦与温暖，都是属于你自己的坚韧养分。')
    paragraphs.push('谢谢你把这份生机带到林间。步调轻快的同时，也记得给自己留出深呼吸的驻足时刻。')

    growthMessage = '迎着柔和的阳光，新叶舒展得格外透亮'
    selfCareSuggestion = '记下今天让你笑起来的一两个微小细节，睡前回味一下。'
  } else {
    // 平和 / 客观日常陈述
    const topicText = topicsList.length > 0 ? `关于${topicsList.join('、')}的生活点滴` : '日常的对话'
    paragraphs.push(
      `今天在林间完成了这段${topicText}。生活的步调不总是波澜起伏，安稳平凡的记录一样蕴藏着安顿的力量。`
    )
    paragraphs.push('心里的感受在交流中慢慢落了地。不管是忙碌还是平静，你都认真陪伴了自己一段路。')
    paragraphs.push('林间的绿意始终在这里。随时回来坐坐，听听自己的呼吸。')

    growthMessage = '平静的泥土下，根系悄悄向下扎得更稳了'
    selfCareSuggestion = '放下手机闭目养神五分钟，感受空气吸入胸膛的清凉。'
  }

  const result: HealingSessionSummary = {
    sessionId,
    userId: targetUserId,
    generatedAt: Date.now(),
    totalRounds: userMessages.length,
    userMessageCount: userMessages.length,
    assistantMessageCount: assistantMessages.length,
    paragraphs,
    topics: topicsList.length > 0 ? topicsList : ['生活点滴'],
    emotions: emotionsList, // 严格真实用户情绪：若未明确表达情绪，则为空数组，绝不虚构「平静」或系统「中性」
    systemValence:
      negativeCount > positiveCount
        ? 'negative'
        : positiveCount > negativeCount
        ? 'positive'
        : 'neutral',
    wordCloud,
    growthMessage,
    selfCareSuggestion,
  }

  saveSessionSummary(result, targetUserId)
  return result
}

/**
 * 本地持久化单次会话小结（按用户 ID 隔离存储）
 */
export function saveSessionSummary(summary: HealingSessionSummary, userId?: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    const uid = userId || summary.userId || 'guest'
    const safeSummary: HealingSessionSummary = {
      ...summary,
      userId: uid,
      topics: (summary.topics || []).filter((t) => !isSystemCategorizationTag(t)),
      emotions: (summary.emotions || []).filter((e) => !isSystemCategorizationTag(e)),
      wordCloud: (summary.wordCloud || []).filter((w) => !isSystemCategorizationTag(w.word)),
    }
    localStorage.setItem(
      `${SUMMARY_STORAGE_PREFIX}${uid}_${summary.sessionId}`,
      JSON.stringify(safeSummary)
    )
    localStorage.setItem(`${LATEST_SUMMARY_SESSION_KEY}${uid}`, summary.sessionId)
  } catch (e) {
    console.warn('Failed to save healing session summary:', e)
  }
}

/**
 * 获取指定会话或最近一次会话的小结（按用户 ID 隔离读取）
 */
export function getSessionSummary(
  sessionId?: string,
  userId: string = 'guest'
): HealingSessionSummary | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const uid = userId || 'guest'
    const targetId = sessionId || localStorage.getItem(`${LATEST_SUMMARY_SESSION_KEY}${uid}`)
    if (!targetId) return null
    const raw = localStorage.getItem(`${SUMMARY_STORAGE_PREFIX}${uid}_${targetId}`)
    if (raw) {
      const parsed: HealingSessionSummary = JSON.parse(raw)
      // 严格检查数据归属：当前已认证用户是否与数据所属用户一致
      if (parsed.userId && parsed.userId !== uid) {
        console.warn('Summary userId mismatch, discarding foreign user data')
        return null
      }
      if (sessionId && parsed.sessionId !== sessionId) {
        return null
      }
      return {
        ...parsed,
        topics: (parsed.topics || []).filter((t) => !isSystemCategorizationTag(t)),
        emotions: (parsed.emotions || []).filter((e) => !isSystemCategorizationTag(e)),
        wordCloud: (parsed.wordCloud || []).filter((w) => !isSystemCategorizationTag(w.word)),
      }
    }
  } catch (e) {
    console.warn('Failed to get session summary:', e)
  }
  return null
}

/**
 * 获取特定用户的活动会话 ID
 */
export function getUserActiveSessionId(userId: string = 'guest'): string {
  if (typeof localStorage === 'undefined') {
    return `sess_${Date.now()}`
  }
  try {
    const saved = localStorage.getItem(`${ACTIVE_SESSION_STORAGE_PREFIX}${userId}`)
    if (saved) return saved
    const newId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
    localStorage.setItem(`${ACTIVE_SESSION_STORAGE_PREFIX}${userId}`, newId)
    return newId
  } catch {
    return `sess_${Date.now()}`
  }
}

/**
 * 设置特定用户的活动会话 ID
 */
export function setUserActiveSessionId(userId: string = 'guest', sessionId: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(`${ACTIVE_SESSION_STORAGE_PREFIX}${userId}`, sessionId)
  } catch {}
}

/**
 * 结束并重置用户当前的聊天会话，生成属于该用户的全新会话 ID
 */
export function resetUserChatSession(userId: string = 'guest'): string {
  const newSessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  setUserActiveSessionId(userId, newSessionId)
  saveUserChatDialogs(userId, newSessionId, [])
  return newSessionId
}

/**
 * 读取特定用户在指定会话（或当前活动会话）下的真实对话记录
 */
export function getUserChatDialogs(userId: string = 'guest', sessionId?: string): ChatDialogItem[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const targetSessionId = sessionId || getUserActiveSessionId(userId)
    const raw = localStorage.getItem(`${CHAT_DIALOGS_STORAGE_PREFIX}${userId}_${targetSessionId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => !item.userId || item.userId === userId)
      }
    }
  } catch (e) {
    console.warn('Failed to load chat dialogs for user:', e)
  }
  return []
}

/**
 * 保存特定用户在指定会话下的真实对话记录
 */
export function saveUserChatDialogs(
  userId: string = 'guest',
  sessionId: string,
  dialogs: ChatDialogItem[]
): void {
  if (typeof localStorage === 'undefined') return
  try {
    const safeDialogs = (dialogs || []).map((d) => ({
      ...d,
      userId: d.userId || userId,
      sessionId: d.sessionId || sessionId,
    }))
    localStorage.setItem(
      `${CHAT_DIALOGS_STORAGE_PREFIX}${userId}_${sessionId}`,
      JSON.stringify(safeDialogs)
    )
  } catch (e) {
    console.warn('Failed to save chat dialogs for user:', e)
  }
}
