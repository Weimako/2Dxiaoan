import { EmotionAnalysisResult, analyzeEmotion } from './emotionService'

export interface EmotionEntry {
  id: string
  time: string
  text: string
  analysis: EmotionAnalysisResult
  source?: 'text' | 'voice'
  userId?: string
}

const STORAGE_PREFIX = 'xiaoan_emotion_entries_v3_'

export const INITIAL_SAMPLE_TEXTS: Array<{ time: string; text: string }> = [
  { time: '08:14:34', text: '昨天晚上我在写数学作业，心里有点乱。' },
  { time: '08:14:47', text: '越想越烦。' },
  { time: '16:39:08', text: '不开心。' },
]

export function getEmotionEntries(userId: string = 'guest'): EmotionEntry[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter((item) => !item.userId || item.userId === userId)
      }
    }
  } catch (e) {
    console.warn('Failed to load emotion entries from storage:', e)
  }

  // 仅在访客无任何记录时生成基础引导样例，避免污染新登录的真实独立账户
  if (userId === 'guest') {
    const initial: EmotionEntry[] = INITIAL_SAMPLE_TEXTS.map((item, idx) => ({
      id: `sample_${idx + 1}`,
      time: item.time,
      text: item.text,
      analysis: analyzeEmotion(item.text),
      source: 'text',
      userId: 'guest',
    }))
    saveEmotionEntries(initial, 'guest')
    return initial
  }

  return []
}

export function saveEmotionEntries(entries: EmotionEntry[], userId: string = 'guest'): void {
  try {
    const safeEntries = (entries || []).map((e) => ({
      ...e,
      userId: e.userId || userId,
    }))
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(safeEntries))
  } catch (e) {
    console.warn('Failed to save emotion entries to storage:', e)
  }
}

export function addEmotionEntry(
  text: string,
  source: 'text' | 'voice' = 'text',
  customTime?: string,
  userId: string = 'guest'
): EmotionEntry {
  const now = new Date()
  const time =
    customTime ||
    `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

  const newEntry: EmotionEntry = {
    id: `em_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    time,
    text,
    analysis: analyzeEmotion(text),
    source,
    userId,
  }

  const current = getEmotionEntries(userId)
  const updated = [...current, newEntry]
  saveEmotionEntries(updated, userId)
  return newEntry
}

export function clearEmotionEntries(userId: string = 'guest'): void {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
  } catch (e) {
    console.warn('Failed to clear emotion entries:', e)
  }
}
