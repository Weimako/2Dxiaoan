export type AssessmentCategory = 'exploration' | 'scale'

export interface AssessmentOption {
  label: string
  score: number
  hint?: string
}

export interface AssessmentQuestion {
  id: string
  prompt: string
  subtitle?: string
  options: AssessmentOption[]
}

export interface DimensionDef {
  key: string
  name: string
  description?: string
  maxScore?: number
}

export interface DimensionPoint {
  title: string
  text: string
  tag?: string
}

export interface RadarDimension {
  name: string
  value: number // 0 - 100 percentage
}

export interface BarDimension {
  name: string
  score: number
  maxScore: number
  level: string
}

export interface AssessmentEvaluation {
  topicId: string
  topicTitle: string
  category: AssessmentCategory
  score?: number
  maxScore?: number
  levelName: string
  levelColor?: string
  weatherSummary?: string
  summary: string
  detailedPoints: DimensionPoint[]
  careAdvice: string[]
  radarDimensions?: RadarDimension[]
  barDimensions?: BarDimension[]
  disclaimer: string
  shareSummary: string
}

export interface AssessmentTopic {
  id: string
  category: AssessmentCategory
  title: string
  subtitle: string
  badge: string
  color: string
  accentColor: string
  description: string
  purpose: string
  targetAudience?: string
  questions: AssessmentQuestion[]
  dimensions: DimensionDef[]
  chartType: 'radar' | 'bar'
  evaluate: (answers: number[]) => AssessmentEvaluation
  disclaimer: string
}

export interface SavedAssessmentRecord {
  id: string
  topicId: string
  topicTitle: string
  category: AssessmentCategory
  date: string
  timestamp: number
  answers: number[]
  evaluation: AssessmentEvaluation
  userId?: string
}
