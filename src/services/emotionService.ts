/**
 * 中文自然语言情感与情绪分析引擎 (Xiaoan Chinese NLP Emotion Engine)
 *
 * 核心设计原则：
 * 1. 深度语义组合分析，非单一关键字机械匹配；
 * 2. 精准识别中文网络表达（如「哈哈哈」「笑死了」「嘿嘿」「呵呵」）；
 * 3. 严格处理否定反转（如「我一点也不开心」-> 难过/消极，非开心）；
 * 4. 识别转折句重力（如「虽然...但是...」关注后半句重心）；
 * 5. 识别苦笑/反讽/情绪掩饰（如「哈哈哈，我真的快崩溃了」-> 崩溃/焦虑，非开心；「我难过得都笑了」-> 复杂/难过）；
 * 6. 严谨支持中性与不确定判断（如「嗯」「好的」「知道了」「正在写作业」-> 中性/平静，绝不强行判定为负面）。
 */

export type EmotionCategory =
  | '开心'
  | '难过'
  | '焦虑'
  | '生气'
  | '平静'
  | '中性'
  | '复杂'
  | '无奈'
  | '崩溃'
  | '不明确'

export interface EmotionAnalysisResult {
  text: string
  normalizedText: string
  moods: EmotionCategory[]
  primaryEmotion: EmotionCategory
  valence: 'positive' | 'negative' | 'neutral' | 'mixed'
  confidence: number // 0.0 - 1.0
  reasoning: string
}

// -------------------------------------------------------------
// 1. 词典定义与特征库
// -------------------------------------------------------------

// 纯中性日常确认词
const NEUTRAL_ACKNOWLEDGEMENTS = new Set([
  '嗯',
  '嗯嗯',
  '哦',
  '哦哦',
  '好的',
  '好',
  '收到',
  '知道了',
  '知道啦',
  '行',
  '行吧',
  '可以',
  'ok',
  'okk',
  '对',
  '对的',
  '是的',
  '在呢',
  '明白了',
  '好呀',
  '收到啦',
])

// 否定前缀词库
const NEGATION_WORDS = [
  '一点也不',
  '一点都不',
  '绝不',
  '并不是',
  '完全不',
  '并不',
  '没有',
  '毫无',
  '从不',
  '不怎么',
  '不太',
  '没太',
  '别',
  '莫',
  '不',
  '没',
]

// 程度副词及权重倍率
const DEGREE_ADVERBS: Record<string, number> = {
  超级: 1.6,
  特别: 1.5,
  非常: 1.5,
  极度: 1.7,
  太: 1.4,
  真的: 1.3,
  好: 1.25,
  十分: 1.4,
  极其: 1.6,
  简直: 1.3,
  有点: 0.8,
  稍微: 0.7,
  一丝: 0.6,
}

// 情绪基础词典
const EMOTION_LEXICON: Record<
  string,
  { category: EmotionCategory; weight: number; valence: 'positive' | 'negative' | 'neutral' }
> = {
  // --- 开心 / 积极 ---
  开心: { category: '开心', weight: 1.5, valence: 'positive' },
  高兴: { category: '开心', weight: 1.5, valence: 'positive' },
  快乐: { category: '开心', weight: 1.5, valence: 'positive' },
  太好了: { category: '开心', weight: 1.6, valence: 'positive' },
  成功了: { category: '开心', weight: 1.4, valence: 'positive' },
  终于成功了: { category: '开心', weight: 1.7, valence: 'positive' },
  真棒: { category: '开心', weight: 1.5, valence: 'positive' },
  太棒了: { category: '开心', weight: 1.6, valence: 'positive' },
  好棒: { category: '开心', weight: 1.4, valence: 'positive' },
  好开心: { category: '开心', weight: 1.7, valence: 'positive' },
  幸福: { category: '开心', weight: 1.5, valence: 'positive' },
  欣慰: { category: '开心', weight: 1.3, valence: 'positive' },
  好耶: { category: '开心', weight: 1.5, valence: 'positive' },
  赞: { category: '开心', weight: 1.2, valence: 'positive' },
  给力: { category: '开心', weight: 1.3, valence: 'positive' },
  轻松: { category: '开心', weight: 1.2, valence: 'positive' },
  舒服: { category: '开心', weight: 1.2, valence: 'positive' },
  安心: { category: '开心', weight: 1.2, valence: 'positive' },
  踏实: { category: '开心', weight: 1.2, valence: 'positive' },
  满足: { category: '开心', weight: 1.3, valence: 'positive' },
  棒极了: { category: '开心', weight: 1.6, valence: 'positive' },

  // --- 难过 / 悲伤 ---
  难过: { category: '难过', weight: 1.6, valence: 'negative' },
  伤心: { category: '难过', weight: 1.7, valence: 'negative' },
  悲伤: { category: '难过', weight: 1.7, valence: 'negative' },
  痛苦: { category: '难过', weight: 1.8, valence: 'negative' },
  想哭: { category: '难过', weight: 1.6, valence: 'negative' },
  呜呜: { category: '难过', weight: 1.3, valence: 'negative' },
  心酸: { category: '难过', weight: 1.5, valence: 'negative' },
  心痛: { category: '难过', weight: 1.6, valence: 'negative' },
  心碎: { category: '难过', weight: 1.7, valence: 'negative' },
  委屈: { category: '难过', weight: 1.5, valence: 'negative' },
  失落: { category: '难过', weight: 1.4, valence: 'negative' },
  沮丧: { category: '难过', weight: 1.4, valence: 'negative' },
  绝望: { category: '难过', weight: 1.9, valence: 'negative' },
  难受: { category: '难过', weight: 1.5, valence: 'negative' },
  心凉: { category: '难过', weight: 1.4, valence: 'negative' },
  落寞: { category: '难过', weight: 1.3, valence: 'negative' },
  压抑: { category: '难过', weight: 1.4, valence: 'negative' },

  // --- 焦虑 / 紧张 / 担忧 / 崩溃 ---
  焦虑: { category: '焦虑', weight: 1.7, valence: 'negative' },
  紧张: { category: '焦虑', weight: 1.5, valence: 'negative' },
  担心: { category: '焦虑', weight: 1.5, valence: 'negative' },
  好慌: { category: '焦虑', weight: 1.6, valence: 'negative' },
  心慌: { category: '焦虑', weight: 1.5, valence: 'negative' },
  不知所措: { category: '焦虑', weight: 1.6, valence: 'negative' },
  不知道怎么办: { category: '焦虑', weight: 1.6, valence: 'negative' },
  怎么办: { category: '焦虑', weight: 1.3, valence: 'negative' },
  抓狂: { category: '焦虑', weight: 1.5, valence: 'negative' },
  透不过气: { category: '焦虑', weight: 1.6, valence: 'negative' },
  压力好大: { category: '焦虑', weight: 1.6, valence: 'negative' },
  压力大: { category: '焦虑', weight: 1.4, valence: 'negative' },
  崩溃: { category: '崩溃', weight: 1.9, valence: 'negative' },
  快崩溃了: { category: '崩溃', weight: 2.0, valence: 'negative' },
  心态崩了: { category: '崩溃', weight: 1.8, valence: 'negative' },
  受不了了: { category: '崩溃', weight: 1.7, valence: 'negative' },
  要疯了: { category: '焦虑', weight: 1.7, valence: 'negative' },
  心烦: { category: '焦虑', weight: 1.4, valence: 'negative' },
  心里有点乱: { category: '焦虑', weight: 1.3, valence: 'negative' },
  心乱: { category: '焦虑', weight: 1.3, valence: 'negative' },

  // --- 生气 / 愤怒 ---
  生气: { category: '生气', weight: 1.6, valence: 'negative' },
  愤怒: { category: '生气', weight: 1.8, valence: 'negative' },
  气死我了: { category: '生气', weight: 1.9, valence: 'negative' },
  气死: { category: '生气', weight: 1.7, valence: 'negative' },
  好气: { category: '生气', weight: 1.5, valence: 'negative' },
  火大: { category: '生气', weight: 1.6, valence: 'negative' },
  发火: { category: '生气', weight: 1.5, valence: 'negative' },
  烦死了: { category: '生气', weight: 1.6, valence: 'negative' },
  越想越烦: { category: '生气', weight: 1.5, valence: 'negative' },
  讨厌: { category: '生气', weight: 1.4, valence: 'negative' },
  恶心: { category: '生气', weight: 1.5, valence: 'negative' },
  暴躁: { category: '生气', weight: 1.6, valence: 'negative' },
  大无语: { category: '生气', weight: 1.3, valence: 'negative' },
  无语死了: { category: '生气', weight: 1.4, valence: 'negative' },

  // --- 疲惫 / 消耗 / 困倦 ---
  好累: { category: '难过', weight: 1.5, valence: 'negative' },
  太累了: { category: '难过', weight: 1.6, valence: 'negative' },
  累: { category: '难过', weight: 1.3, valence: 'negative' },
  疲惫: { category: '难过', weight: 1.5, valence: 'negative' },
  身心俱疲: { category: '难过', weight: 1.7, valence: 'negative' },
  透支: { category: '难过', weight: 1.6, valence: 'negative' },
  好困: { category: '中性', weight: 1.0, valence: 'neutral' },
}

// -------------------------------------------------------------
// 2. 核心语义分析算法
// -------------------------------------------------------------

export function analyzeEmotion(rawInput: string): EmotionAnalysisResult {
  // 基础预处理
  const text = (rawInput || '').trim()
  const cleanPunctuation = text.replace(/[\s\r\n]+/g, ' ')

  // 1. 极短无信息或空文本检查
  if (!text) {
    return {
      text: '',
      normalizedText: '',
      moods: ['中性'],
      primaryEmotion: '中性',
      valence: 'neutral',
      confidence: 0.95,
      reasoning: '空文本或无有效字符输入',
    }
  }

  // 纯符号或纯数字检测
  if (/^[\d\s.,!?，。！？~～_#@%&*()（）+-]+$/.test(text)) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['中性'],
      primaryEmotion: '中性',
      valence: 'neutral',
      confidence: 0.9,
      reasoning: '纯符号或数字，无情绪特征',
    }
  }

  // 2. 纯日常回复语/确认词优先判断为中性
  const trimmedLower = text.toLowerCase().replace(/[！!。，,.~～\s]/g, '')
  if (NEUTRAL_ACKNOWLEDGEMENTS.has(trimmedLower)) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['中性'],
      primaryEmotion: '中性',
      valence: 'neutral',
      confidence: 0.95,
      reasoning: '标准日常确认或中性答复',
    }
  }

  // 3. 特殊复合语义模式优先匹配
  // 3.1 苦笑/矛盾情绪：「我难过得都笑了」「哭笑不得」「笑着笑着就哭了」
  if (
    /难过得都笑了|哭笑不得|笑着笑着就哭了|又哭又笑|悲喜交加|既.*(开心|高兴).*又.*(担心|难过|焦虑)/.test(
      text
    )
  ) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['难过', '复杂'],
      primaryEmotion: '难过',
      valence: 'mixed',
      confidence: 0.9,
      reasoning: '检测到矛盾/复合情绪表达，核心基调呈现难过与复杂心绪',
    }
  }

  // 3.2 笑声伪装/情绪崩盘：「哈哈哈，我真的快崩溃了」「笑死了，我好难受」「2333心态崩了」
  const hasLaughMask = /哈{2,}|嘿嘿|嘻嘻|笑死|233/.test(text)
  const hasBreakdown = /快崩溃了|崩溃了|心态崩了|受不了了|要疯了|绝望|想死|好痛苦|心好累/.test(text)

  if (hasLaughMask && hasBreakdown) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['崩溃', '焦虑'],
      primaryEmotion: '崩溃',
      valence: 'negative',
      confidence: 0.92,
      reasoning: '检测到笑声掩饰下的崩溃/重度焦虑，后半段真实负面情绪为主要语义',
    }
  }

  // 3.3 反讽/无奈语义：「你可真厉害，呵呵」「真棒，呵呵」「可真行，呵呵」
  if (
    /(你(可)?真(厉害|棒|行|牛)|厉害啊|真优秀|佩服).*呵呵/.test(text) ||
    /呵呵.*(可真|真有你的)/.test(text)
  ) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['无奈'],
      primaryEmotion: '无奈',
      valence: 'negative',
      confidence: 0.88,
      reasoning: '褒义词与「呵呵」搭配，呈现明显反讽与无奈态度',
    }
  }

  // 3.4 独立「呵呵」歧义表达：在没有明确上下文时，判定为轻度无奈或情绪不明确，避免机械判定为开心或暴怒
  if (/^呵呵+[！!。，,.~～\s]*$/.test(text) || /^呵呵哒[！!。，,.~～\s]*$/.test(text)) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['无奈', '不明确'],
      primaryEmotion: '无奈',
      valence: 'neutral',
      confidence: 0.82,
      reasoning: '「呵呵」具有多重语境含义（可能表达冷淡、无奈或礼貌应对），缺乏充足上下文时判定为轻度无奈或情绪不明确',
    }
  }

  // 3.5 纯网络欢笑表达（无转折、无负面关键词）
  // 例如：哈哈哈、哈哈哈哈、嘿嘿、嘻嘻、笑死了、23333
  const isPureLaugh =
    /^(哈{2,}|嘿嘿|嘻嘻|嘻嘻嘻|笑死(了)?|233+)[！!~～\s\w]*$/.test(text) ||
    (!hasBreakdown &&
      !/(难受|难过|伤心|讨厌|生气|烦|累|差|烂|惨)/.test(text) &&
      /^(哈{3,}|笑死了)/.test(text))

  if (isPureLaugh) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['开心'],
      primaryEmotion: '开心',
      valence: 'positive',
      confidence: 0.95,
      reasoning: '常见积极网络笑声与轻松欢快表达',
    }
  }

  // 4. 深度分句与语义分析（支持否定词反转、转折重力权衡）
  // 分句：按逗号、句号、感叹号、问号、分号切分
  const clauses = text
    .split(/[,，。！？!?;；\n]+/)
    .map((c) => c.trim())
    .filter(Boolean)

  if (clauses.length === 0) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['中性'],
      primaryEmotion: '中性',
      valence: 'neutral',
      confidence: 0.9,
      reasoning: '无有效句子语义片段',
    }
  }

  const scores: Record<EmotionCategory, number> = {
    开心: 0,
    难过: 0,
    焦虑: 0,
    生气: 0,
    平静: 0,
    中性: 0,
    复杂: 0,
    无奈: 0,
    崩溃: 0,
    不明确: 0,
  }

  let totalSignals = 0

  // 逐句解析
  clauses.forEach((clause, clauseIdx) => {
    // 转折与让步词加权：让步从句（虽然/尽管）降权，转折主句（但/但是）赋予高权重
    const isConcession = /虽然|尽管|虽说/.test(clause)
    const isAdversative = /但是|但|然而|不过|可是|却/.test(clause)
    let clauseWeight = 1.0
    if (isConcession) {
      clauseWeight = 0.5
    } else if (isAdversative || clauseIdx === clauses.length - 1) {
      clauseWeight = 1.6
    }

    // 检查笑声特征
    if (/哈{2,}|嘿嘿|嘻嘻|笑死/.test(clause)) {
      scores['开心'] += 1.8 * clauseWeight
      totalSignals += 1
    }

    // 检查单句是否含有否定词
    // 如「我一点也不开心」：先找否定词，再看紧跟其后的是否是情绪词
    let matchedLexiconInClause = false

    for (const [term, meta] of Object.entries(EMOTION_LEXICON)) {
      const termPos = clause.indexOf(term)
      if (termPos !== -1) {
        matchedLexiconInClause = true
        totalSignals += 1

        // 检查前面紧邻是否有否定词
        const prefix = clause.slice(Math.max(0, termPos - 6), termPos)
        let isNegated = false
        for (const neg of NEGATION_WORDS) {
          if (prefix.endsWith(neg) || prefix.includes(neg)) {
            isNegated = true
            break
          }
        }

        // 程度词乘数
        let degreeMult = 1.0
        for (const [adv, mult] of Object.entries(DEGREE_ADVERBS)) {
          if (prefix.includes(adv)) {
            degreeMult = mult
            break
          }
        }

        const effectiveScore = meta.weight * degreeMult * clauseWeight

        if (isNegated) {
          // 否定反转逻辑：
          // 否定积极（如「不开心」「并不高兴」）-> 翻转为 难过 / 不快
          if (meta.valence === 'positive') {
            scores['难过'] += effectiveScore * 1.4
          } else {
            // 否定消极（如「不难过」「并不焦虑」）-> 翻转为 平静 / 释然
            scores['平静'] += effectiveScore * 1.2
          }
        } else {
          // 肯定命中
          scores[meta.category] += effectiveScore
        }
      }
    }
  })

  // 5. 综合判定与阈值决策
  const validEmotions = (
    Object.entries(scores) as [EmotionCategory, number][]
  )
    .filter(([cat, sc]) => sc > 0.4 && cat !== '中性' && cat !== '不明确')
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score)

  // 5.1 若无明显情绪词命中
  if (validEmotions.length === 0 || totalSignals === 0) {
    // 纯客观描述句子判定为中性/平静
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: ['中性'],
      primaryEmotion: '中性',
      valence: 'neutral',
      confidence: 0.85,
      reasoning: '语句表述平实，未检测到明显情绪词汇与感叹倾向',
    }
  }

  // 5.2 单一主导情绪
  const topEmotion = validEmotions[0]
  const secondEmotion = validEmotions[1]

  // 区分正负对抗（是否存在明显难以割舍的混合情绪）
  const hasPositive = scores['开心'] > 0.8
  const maxNegative = Math.max(
    scores['难过'],
    scores['焦虑'],
    scores['生气'],
    scores['崩溃']
  )
  const hasNegative = maxNegative > 0.8

  if (hasPositive && hasNegative && Math.abs(scores['开心'] - maxNegative) < 0.5) {
    return {
      text,
      normalizedText: cleanPunctuation,
      moods: [topEmotion.category, '复杂'],
      primaryEmotion: topEmotion.category,
      valence: 'mixed',
      confidence: 0.82,
      reasoning: '语句中同时并存积极与消极倾向，呈现复合情绪体验',
    }
  }

  // 挑选展示标签（至多 2 个，主情绪在前）
  const resultMoods: EmotionCategory[] = [topEmotion.category]
  if (secondEmotion && secondEmotion.score > topEmotion.score * 0.55) {
    resultMoods.push(secondEmotion.category)
  }

  let finalValence: 'positive' | 'negative' | 'neutral' | 'mixed' = 'neutral'
  if (topEmotion.category === '开心' || topEmotion.category === '平静') {
    finalValence = 'positive'
  } else if (
    topEmotion.category === '难过' ||
    topEmotion.category === '焦虑' ||
    topEmotion.category === '生气' ||
    topEmotion.category === '崩溃' ||
    topEmotion.category === '无奈'
  ) {
    finalValence = 'negative'
  }

  const confidence = Math.min(0.96, Math.max(0.75, 0.7 + topEmotion.score * 0.08))

  return {
    text,
    normalizedText: cleanPunctuation,
    moods: resultMoods,
    primaryEmotion: topEmotion.category,
    valence: finalValence,
    confidence: Math.round(confidence * 100) / 100,
    reasoning: `综合分析主导情绪为「${topEmotion.category}」，分值: ${topEmotion.score.toFixed(1)}`,
  }
}
