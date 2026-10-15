import React from 'react'
import { BarDimension } from '../types/assessment'

interface DynamicScaleBarProps {
  score?: number
  maxScore?: number
  levelName: string
  levelColor?: string
  barDimensions?: BarDimension[]
}

export function DynamicScaleBar({
  score = 0,
  maxScore = 27,
  levelName,
  levelColor = '#5e9d68',
  barDimensions = [],
}: DynamicScaleBarProps) {
  const scorePercent = Math.min(100, Math.round((score / maxScore) * 100))

  return (
    <div className="scale-visualization-card">
      <div className="scale-total-dial">
        <div className="scale-score-badge" style={{ borderColor: levelColor }}>
          <span className="scale-score-number">{score}</span>
          <span className="scale-score-max">/ {maxScore} 分</span>
        </div>
        <div className="scale-level-badge" style={{ backgroundColor: `${levelColor}22`, color: levelColor }}>
          {levelName}
        </div>
      </div>

      {/* Progress track */}
      <div className="scale-track-wrap">
        <div className="scale-track-bar">
          <div
            className="scale-track-fill"
            style={{ width: `${scorePercent}%`, backgroundColor: levelColor }}
          />
        </div>
        <div className="scale-track-labels">
          <span>0 (正常/微弱)</span>
          <span>参考阈值</span>
          <span>{maxScore} (重度)</span>
        </div>
      </div>

      {/* Dimension breakdown */}
      {barDimensions.length > 0 && (
        <div className="scale-dims-list">
          <div className="scale-dims-header">各维度评估分布</div>
          {barDimensions.map((dim, i) => {
            const dimPct = Math.min(100, Math.round((dim.score / dim.maxScore) * 100))
            return (
              <div key={i} className="scale-dim-item">
                <div className="scale-dim-info">
                  <span className="scale-dim-name">{dim.name}</span>
                  <span className="scale-dim-val">
                    {dim.score}/{dim.maxScore} 分 · {dim.level}
                  </span>
                </div>
                <div className="scale-dim-bar">
                  <div
                    className="scale-dim-fill"
                    style={{
                      width: `${dimPct}%`,
                      backgroundColor: dimPct > 55 ? '#c5a85e' : '#629e71',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
