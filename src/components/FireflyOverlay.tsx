import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

interface Firefly {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  glowSize: number
  colorType: 'paleYellow' | 'mintGreen' | 'goldenGreen'
  baseAlpha: number
  minAlpha: number
  pulseSpeed: number
  pulsePhase: number
  wanderAngle: number
  wanderSpeed: number
  isLargeOrb: boolean
}

const COLOR_MAP = {
  paleYellow: {
    core: (alpha: number) => `rgba(235, 255, 185, ${alpha.toFixed(3)})`,
    inner: (alpha: number) => `rgba(215, 248, 160, ${(alpha * 0.45).toFixed(3)})`,
    outer: 'rgba(195, 238, 135, 0)',
  },
  mintGreen: {
    core: (alpha: number) => `rgba(188, 252, 215, ${alpha.toFixed(3)})`,
    inner: (alpha: number) => `rgba(165, 242, 198, ${(alpha * 0.45).toFixed(3)})`,
    outer: 'rgba(140, 225, 180, 0)',
  },
  goldenGreen: {
    core: (alpha: number) => `rgba(248, 242, 175, ${alpha.toFixed(3)})`,
    inner: (alpha: number) => `rgba(235, 228, 148, ${(alpha * 0.45).toFixed(3)})`,
    outer: 'rgba(215, 205, 118, 0)',
  },
}

function createFireflies(width: number, height: number): Firefly[] {
  // 根据屏幕面积自适应计算粒子数量，保持疏密自然与层级丰富
  const count = Math.min(34, Math.max(16, Math.floor((width * height) / 48000)))
  const fireflies: Firefly[] = []

  const colorTypes: ('paleYellow' | 'mintGreen' | 'goldenGreen')[] = [
    'paleYellow',
    'mintGreen',
    'goldenGreen',
  ]

  for (let i = 0; i < count; i++) {
    // 约 22% 为少量较大的柔和背景光斑，其余为灵动小光点
    const isLargeOrb = i % 5 === 0

    const size = isLargeOrb
      ? 2.6 + Math.random() * 1.6 // 2.6px - 4.2px
      : 1.1 + Math.random() * 1.3 // 1.1px - 2.4px

    const glowSize = isLargeOrb
      ? 22 + Math.random() * 16 // 22px - 38px 大柔和光斑
      : 9 + Math.random() * 9 // 9px - 18px 精致发光环

    // 较大光斑透明度略低，营造温润的景深虚化感；小光点透明度略高
    const baseAlpha = isLargeOrb
      ? 0.32 + Math.random() * 0.22
      : 0.52 + Math.random() * 0.36

    const minAlpha = 0.04 + Math.random() * 0.09
    const pulseSpeed = 0.012 + Math.random() * 0.024
    const colorType = colorTypes[i % colorTypes.length]

    // 缓慢漂浮速度 (0.15 - 0.45 px/frame)
    const speed = 0.16 + Math.random() * 0.28
    const wanderAngle = Math.random() * Math.PI * 2

    // 随机均匀分散在视口各处（涵盖四周与上下，不挤在正中）
    const x = Math.random() * width
    const y = Math.random() * height

    fireflies.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.12,
      vy: -0.08 - Math.random() * 0.18, // 微微向上缓缓浮动的自然倾向
      size,
      glowSize,
      colorType,
      baseAlpha,
      minAlpha,
      pulseSpeed,
      pulsePhase: Math.random() * Math.PI * 2,
      wanderAngle,
      wanderSpeed: speed,
      isLargeOrb,
    })
  }

  return fireflies
}

/**
 * 舒缓模式专属：自然柔和萤火虫光点背景动画
 * - 位于背景之上、内容之下 (z-index: 0, pointer-events: none)
 * - 仅在舒缓模式 (calm / soothing) 下运行与显示
 * - 纯 Canvas 轻量重绘，无任何 DOM 垃圾与组件重渲染消耗
 * - 支持 prefers-reduced-motion 降级
 */
export function FireflyOverlay() {
  const { soothing } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number | null = null
    let fireflies: Firefly[] = []
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    // 监听窗口尺寸变化
    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
      fireflies = createFireflies(width, height)
    }

    window.addEventListener('resize', handleResize)
    fireflies = createFireflies(width, height)

    // 检查系统的减少动态效果偏好
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // 单帧绘制函数
    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height)

      for (const p of fireflies) {
        // 计算呼吸明暗度（使用平滑正弦波曲线）
        p.pulsePhase += p.pulseSpeed
        const breath = 0.5 + 0.5 * Math.sin(p.pulsePhase)
        const alpha = p.minAlpha + (p.baseAlpha - p.minAlpha) * Math.pow(breath, 1.35)

        if (alpha <= 0.01) continue

        const colors = COLOR_MAP[p.colorType]

        // 1. 柔和光斑与微光晕染
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.glowSize
        )
        gradient.addColorStop(0, colors.core(alpha))
        gradient.addColorStop(0.3, colors.inner(alpha))
        gradient.addColorStop(1, colors.outer)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2)
        ctx.fill()

        // 2. 小光点增加细腻微白核心，模拟真实萤火虫发光体
        if (!p.isLargeOrb && alpha > 0.18) {
          ctx.fillStyle = `rgba(255, 255, 235, ${(alpha * 0.85).toFixed(3)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2)
          ctx.fill()
        }

        // 3. 自然缓慢游弋漂移更新
        if (!reducedMotionQuery.matches) {
          p.wanderAngle += (Math.random() - 0.5) * 0.06
          p.x += Math.cos(p.wanderAngle) * p.wanderSpeed + p.vx
          p.y += Math.sin(p.wanderAngle) * p.wanderSpeed + p.vy

          // 边缘平滑环绕
          const margin = p.glowSize + 15
          if (p.x < -margin) p.x = width + margin
          else if (p.x > width + margin) p.x = -margin

          if (p.y < -margin) p.y = height + margin
          else if (p.y > height + margin) p.y = -margin
        }
      }
    }

    // 动画循环
    let isRunning = soothing

    const loop = () => {
      if (!isRunning) return
      renderFrame()
      animId = requestAnimationFrame(loop)
    }

    if (soothing) {
      if (reducedMotionQuery.matches) {
        // 用户开启减少动态效果：仅静态绘制一帧微弱柔光
        renderFrame()
      } else {
        animId = requestAnimationFrame(loop)
      }
    } else {
      ctx.clearRect(0, 0, width, height)
    }

    return () => {
      isRunning = false
      if (animId !== null) {
        cancelAnimationFrame(animId)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [soothing])

  return (
    <canvas
      ref={canvasRef}
      className="firefly-canvas"
      aria-hidden="true"
    />
  )
}
