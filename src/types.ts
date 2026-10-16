import { ReactNode } from 'react'

export type Page =
  | 'login'
  | 'home'
  | 'assessment'
  | 'quiz'
  | 'result'
  | 'settings'
  | 'tools'
  | 'tool-breathing'
  | 'tool-mood'
  | 'tool-meditation'
  | 'tool-energy'
  | 'videos'
  | 'video-detail'
  | 'chat'
  | 'emotion'
  | 'summary'
  | 'profile'
  | 'scripts'
  | 'articles'

export type IconName =
  | 'apple'
  | 'lock'
  | 'heart'
  | 'settings'
  | 'moon'
  | 'type'
  | 'arrow'
  | 'eye'
  | 'home'
  | 'video'
  | 'sparkles'
  | 'check'
  | 'bookmark'
  | 'share'
  | 'play'
  | 'pause'
  | 'rotate'
  | 'sun'
  | 'calendar'
  | 'user'

export interface VideoSourceInfo {
  author?: string
  license: string
  sourceUrl?: string
  confirmDate?: string
  notes?: string
}

export interface VideoItem {
  id: string
  title: string
  sub: string
  time: string
  category: string
  tags: string[]
  description: string
  suitable: string
  accentColor: string
  watchedCount?: number
  /** 本地视频实际播放资源路径 (如 /videos/psychology/breathe_calm.mp4) */
  videoUrl?: string
  /** 备用视频播放路径 */
  fallbackVideoUrl?: string
  /** 封面海报图路径 */
  posterUrl?: string
  /** 视频资源是否已在项目中就绪可用 (false 则提示内容准备中) */
  isReady?: boolean
  /** 版权许可与素材来源记录 */
  sourceInfo?: VideoSourceInfo
}

export interface MoodEntry {
  id: string
  date: string
  time: string
  mood: string
  note: string
  tags: string[]
}

export interface EnergyResult {
  score: number
  level: string
  date: string
  advice: string
  details: {
    sleep: string
    mood: string
    pressure: string
    energy: string
  }
}

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
