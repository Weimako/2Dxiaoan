import React from 'react'
import { RadarDimension } from '../types/assessment'

interface DynamicRadarChartProps {
  dimensions: RadarDimension[]
  centerLabel?: string
  accentColor?: string
  size?: number
}

export function DynamicRadarChart({
  dimensions,
  centerLabel,
  accentColor = '#5a9c69',
  size = 360,
}: DynamicRadarChartProps) {
  if (!dimensions || dimensions.length < 3) {
    return null
  }

  const cx = 180
  const cy = 165
  const maxRadius = 118
  const n = dimensions.length

  // Generate levels for background concentric polygons
  const levels = [0.25, 0.5, 0.75, 1.0]

  // Helper to compute (x, y) for an index and radius
  function getPoint(index: number, radius: number): [number, number] {
    // Start from top (-PI / 2) and go clockwise
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / n
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10]
  }

  // Polygon points string for a given ratio
  function getLevelPoints(ratio: number): string {
    const r = maxRadius * ratio
    return dimensions.map((_, i) => getPoint(i, r).join(',')).join(' ')
  }

  // Data polygon points
  const dataPointsArr = dimensions.map((dim, i) => {
    // clamp value between 15 and 100 for visual neatness
    const clamped = Math.max(18, Math.min(100, dim.value))
    const r = (clamped / 100) * maxRadius
    return getPoint(i, r)
  })

  const dataPolygonStr = dataPointsArr.map((pt) => pt.join(',')).join(' ')

  // Label coordinates (placed slightly outside maxRadius)
  const labelRadius = maxRadius + 28
  const labelPositions = dimensions.map((dim, i) => {
    const [x, y] = getPoint(i, labelRadius)
    // fine tune text alignment based on position
    let textAnchor: 'middle' | 'start' | 'end' = 'middle'
    if (x < cx - 15) textAnchor = 'end'
    else if (x > cx + 15) textAnchor = 'start'

    let dy = 5
    if (y < cy - 40) dy = -4
    else if (y > cy + 40) dy = 14

    return { name: dim.name, value: dim.value, x, y: y + dy, textAnchor }
  })

  return (
    <div className="dynamic-radar-container" style={{ width: '100%', maxWidth: '380px', margin: 'auto' }}>
      <svg
        className="radar-chart dynamic-radar-svg"
        viewBox="0 0 360 340"
        role="img"
        aria-label="动态多维自评雷达图"
      >
        <defs>
          <radialGradient id="radarGlowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
            <stop offset="70%" stopColor={accentColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Concentric grid polygons */}
        {levels.map((lvl) => (
          <polygon
            key={lvl}
            points={getLevelPoints(lvl)}
            fill="none"
            stroke="rgba(74, 124, 88, 0.2)"
            strokeWidth="1.2"
            strokeDasharray={lvl < 1 ? '3 3' : undefined}
          />
        ))}

        {/* Spokes / Axis lines from center */}
        {dimensions.map((_, i) => {
          const [x, y] = getPoint(i, maxRadius)
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="rgba(74, 124, 88, 0.22)"
              strokeWidth="1.2"
            />
          )
        })}

        {/* Filled Data Polygon with soft animation */}
        <polygon
          className="radar-fill"
          points={dataPolygonStr}
          fill="url(#radarGlowGradient)"
          stroke={accentColor}
          strokeWidth="2.6"
          strokeLinejoin="round"
        />

        {/* Vertex Dots */}
        {dataPointsArr.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="6.5" fill="#ffffff" stroke={accentColor} strokeWidth="2.5" />
            <circle cx={x} cy={y} r="2.5" fill={accentColor} />
          </g>
        ))}

        {/* Center dot / label */}
        <circle cx={cx} cy={cy} r="3" fill="rgba(74, 124, 88, 0.4)" />

        {/* Dimension Labels */}
        {labelPositions.map((lbl, i) => (
          <g key={i}>
            <text
              x={lbl.x}
              y={lbl.y}
              textAnchor={lbl.textAnchor}
              fontSize="12.5"
              fontWeight="700"
              fill="currentColor"
              className="radar-label"
            >
              {lbl.name}
            </text>
            <text
              x={lbl.x}
              y={lbl.y + 14}
              textAnchor={lbl.textAnchor}
              fontSize="10"
              fontWeight="600"
              fill="rgba(95, 128, 105, 0.85)"
              className="radar-score-label"
            >
              {lbl.value}%
            </text>
          </g>
        ))}
      </svg>
      {centerLabel && (
        <div className="radar-center-caption">
          <span>{centerLabel}</span>
        </div>
      )}
    </div>
  )
}
