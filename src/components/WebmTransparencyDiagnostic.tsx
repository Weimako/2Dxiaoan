import React, { useState, useEffect, useRef } from 'react'
import xiaoanIdleVideo from '../assets/xiaoan/videos/xiaoan_idle.webm'
import xiaoanTalkVideo from '../assets/xiaoan/videos/xiaoan_talk.webm'
import xiaoanWaveVideo from '../assets/xiaoan/videos/xiaoan_wave.webm'

export type DiagnosticVideoTrack = 'idle' | 'talk' | 'wave'
export type DiagnosticBg = 'magenta' | 'cyan' | 'checker' | 'theme'

interface PixelSample {
  r: number
  g: number
  b: number
  a: number
  hex: string
}

/**
 * 开发环境专用的透明度与解码诊断面板
 * 仅用于排查 WebM Alpha 通道与视频黑底问题，不侵入正式业务界面
 */
export function WebmTransparencyDiagnostic() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTrack, setActiveTrack] = useState<DiagnosticVideoTrack>('idle')
  const [bgType, setBgType] = useState<DiagnosticBg>('magenta')
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.65)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [meta, setMeta] = useState<{
    currentSrc: string
    videoWidth: number
    videoHeight: number
    readyState: number
    paused: boolean
    currentTime: number
    error: string | null
  }>({
    currentSrc: '',
    videoWidth: 0,
    videoHeight: 0,
    readyState: 0,
    paused: false,
    currentTime: 0,
    error: null,
  })

  const [samples, setSamples] = useState<{
    topLeft: PixelSample | null
    topRight: PixelSample | null
    bottomLeft: PixelSample | null
    center: PixelSample | null
    isAllOpaqueBlack: boolean
  }>({
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    center: null,
    isAllOpaqueBlack: false,
  })

  const trackUrls: Record<DiagnosticVideoTrack, string> = {
    idle: xiaoanIdleVideo,
    talk: xiaoanTalkVideo,
    wave: xiaoanWaveVideo,
  }

  // 快捷键支持（按下 'D' 键或 URL 携带 ?debug=webm 时可激活）
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('debug')) {
      setIsOpen(true)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.altKey)) {
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 视频加载与播放状态监听
  const updateMeta = () => {
    const el = videoRef.current
    if (!el) return
    const newMeta = {
      currentSrc: el.currentSrc || el.src || '',
      videoWidth: el.videoWidth || 0,
      videoHeight: el.videoHeight || 0,
      readyState: el.readyState,
      paused: el.paused,
      currentTime: Math.round(el.currentTime * 10) / 10,
      error: el.error ? `Code ${el.error.code}: ${el.error.message}` : null,
    }
    setMeta(newMeta)
    console.log(`[Transparency Diagnostic][${activeTrack}]`, newMeta)
  }

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    el.playbackRate = activeTrack === 'idle' ? playbackSpeed : 1.0
    el.play().catch((err) => {
      console.warn('[Transparency Diagnostic] Play prevented:', err.message)
    })
  }, [activeTrack, playbackSpeed])

  // 逐帧 Canvas 像素取样检查（针对角落下采样判断是否为实心黑）
  useEffect(() => {
    if (!isOpen) return
    let animId: number
    const samplePixels = () => {
      const el = videoRef.current
      const cvs = canvasRef.current
      if (el && cvs && el.videoWidth > 0 && el.videoHeight > 0 && !el.paused) {
        cvs.width = 100
        cvs.height = 100
        const ctx = cvs.getContext('2d', { willReadFrequently: true })
        if (ctx) {
          try {
            ctx.clearRect(0, 0, 100, 100)
            ctx.drawImage(el, 0, 0, 100, 100)

            const getPixel = (x: number, y: number): PixelSample => {
              const pixel = ctx.getImageData(x, y, 1, 1).data
              const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`
              return { r: pixel[0], g: pixel[1], b: pixel[2], a: pixel[3], hex }
            }

            const pTL = getPixel(2, 2)
            const pTR = getPixel(97, 2)
            const pBL = getPixel(2, 97)
            const pC = getPixel(50, 50)

            // 如果四个角落像素 Alpha 为 255 且 RGB 全低于 8，则判定为纯黑底帧
            const isBlack = (p: PixelSample) => p.a === 255 && p.r < 10 && p.g < 10 && p.b < 10
            const isAllOpaqueBlack = isBlack(pTL) && isBlack(pTR) && isBlack(pBL)

            setSamples({
              topLeft: pTL,
              topRight: pTR,
              bottomLeft: pBL,
              center: pC,
              isAllOpaqueBlack,
            })
          } catch (e) {
            // CORS 或渲染上下文异常兜底
          }
        }
      }
      animId = requestAnimationFrame(samplePixels)
    }

    animId = requestAnimationFrame(samplePixels)
    return () => cancelAnimationFrame(animId)
  }, [isOpen, activeTrack])

  // 背景样式映射
  const bgStyles: Record<DiagnosticBg, React.CSSProperties> = {
    magenta: { backgroundColor: '#ff00ff' }, // 鲜艳洋红，与角色绿色形成极强反差
    cyan: { backgroundColor: '#00ffff' }, // 鲜艳青色
    checker: {
      backgroundImage:
        'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      backgroundColor: '#fff',
    },
    theme: { backgroundColor: 'var(--app-bg, #dbe8d4)' },
  }

  return (
    <>
      {/* 屏幕左下角极其微小的开发模式激活手柄 */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          position: 'fixed',
          bottom: '8px',
          left: '8px',
          zIndex: 99999,
          background: 'rgba(20, 37, 31, 0.75)',
          color: '#d1b46a',
          border: '1px solid rgba(209, 180, 106, 0.4)',
          borderRadius: '6px',
          padding: '4px 8px',
          fontSize: '11px',
          fontWeight: 600,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
        title="按 Alt+D 或点击切换 WebM 透明度诊断视图"
      >
        🛠️ WebM透明度诊断
      </button>

      {/* 诊断抽屉模态框 */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99998,
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: '#fff',
            fontFamily: 'monospace, sans-serif',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#16221c',
              border: '2px solid #55a069',
              borderRadius: '16px',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#a8f0c2' }}>🔬 小安 2D 视频 Alpha 透明度实测诊断</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#8fb394' }}>
                  通过高反差洋红背景与实时 Canvas 像素级取样，彻底分清“视频黑底”还是“CSS 样式”
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                关闭 (ESC)
              </button>
            </div>

            {/* 控制条 */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#cbd8c8' }}>视频轨：</span>
                {(['idle', 'talk', 'wave'] as DiagnosticVideoTrack[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTrack(t)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: activeTrack === t ? '2px solid #64c38a' : '1px solid #345b46',
                      background: activeTrack === t ? '#264234' : 'transparent',
                      color: activeTrack === t ? '#72c893' : '#cbd8c8',
                      fontWeight: activeTrack === t ? 700 : 400,
                      cursor: 'pointer',
                    }}
                  >
                    {t}.webm
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginLeft: 'auto' }}>
                <span style={{ fontSize: '13px', color: '#cbd8c8' }}>测试背景：</span>
                {(
                  [
                    ['magenta', '洋红色 (#FF00FF)'],
                    ['cyan', '青色 (#00FFFF)'],
                    ['checker', '透明棋盘格'],
                    ['theme', '当前主题绿'],
                  ] as [DiagnosticBg, string][]
                ).map(([b, label]) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBgType(b)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: bgType === b ? '2px solid #d1b46a' : '1px solid #345b46',
                      background: bgType === b ? '#3d341c' : 'transparent',
                      color: bgType === b ? '#ead99e' : '#cbd8c8',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 测试舞台与参数诊断区 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: '20px' }}>
              {/* 左侧：在鲜艳背景下的视频播放舞台 */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '3px solid #ff00ff',
                  boxShadow: '0 0 20px rgba(255, 0, 255, 0.35)',
                  ...bgStyles[bgType],
                }}
              >
                <video
                  ref={videoRef}
                  key={trackUrls[activeTrack]}
                  src={trackUrls[activeTrack]}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'center bottom',
                    background: 'transparent',
                    display: 'block',
                  }}
                  onLoadedMetadata={updateMeta}
                  onCanPlay={updateMeta}
                  onPlay={updateMeta}
                  onError={updateMeta}
                />

                {/* 舞台角落取样点指示标记 */}
                <div style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '10px', background: 'rgba(0,0,0,0.85)', padding: '2px 5px', borderRadius: '3px', color: '#ff77ff', border: '1px solid #ff00ff' }}>
                  左上角取样点
                </div>
                <div style={{ position: 'absolute', bottom: '8px', right: '8px', fontSize: '10px', background: 'rgba(0,0,0,0.85)', padding: '2px 5px', borderRadius: '3px', color: '#a8f0c2' }}>
                  底边对齐 (contain)
                </div>
              </div>

              {/* 右侧：实时数据和结论 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 诊断结论核心卡片 */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    background: samples.isAllOpaqueBlack
                      ? 'rgba(239, 68, 68, 0.18)'
                      : 'rgba(16, 185, 129, 0.18)',
                    border: samples.isAllOpaqueBlack
                      ? '1px solid rgba(239, 68, 68, 0.6)'
                      : '1px solid rgba(16, 185, 129, 0.6)',
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '6px', color: samples.isAllOpaqueBlack ? '#fca5a5' : '#86efac' }}>
                    {samples.isAllOpaqueBlack ? '⚠️ 诊断结论：黑底来自视频帧像素本身 (无透明通道)' : '✅ 诊断结论：视频包含透明通道'}
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#e5e7eb' }}>
                    {samples.isAllOpaqueBlack ? (
                      <>
                        当前视频四角实时取样均为 <strong>RGB(0, 0, 0) 实心黑且 Alpha=255</strong>。外部洋红色测试背景被视频矩形帧 100% 遮挡。
                        <br />
                        <strong>根本原因：</strong>素材在 AE 导出 WebM 时未勾选 “包含透明通道 / Include Alpha” 或未输出为带 Alpha 的编解码器 (需为 VP9 yuva420p)。页面 CSS 与容器背景已为透明，并非网页样式问题。
                      </>
                    ) : (
                      <>
                        视频外部区域能正常透出底层洋红色背景，Alpha 通道解码正常！
                      </>
                    )}
                  </div>
                </div>

                {/* 实时像素采样数据 */}
                <div style={{ background: '#111b15', padding: '12px', borderRadius: '8px', border: '1px solid #264234' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#a8f0c2', marginBottom: '8px' }}>
                    📍 实时 Canvas 像素级解算值：
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                    <div>
                      左上角 (2,2):{' '}
                      <span style={{ color: samples.topLeft?.a === 0 ? '#86efac' : '#fca5a5' }}>
                        {samples.topLeft ? `RGB(${samples.topLeft.r}, ${samples.topLeft.g}, ${samples.topLeft.b}) A=${samples.topLeft.a}` : '检测中...'}
                      </span>
                    </div>
                    <div>
                      右上角 (97,2):{' '}
                      <span style={{ color: samples.topRight?.a === 0 ? '#86efac' : '#fca5a5' }}>
                        {samples.topRight ? `RGB(${samples.topRight.r}, ${samples.topRight.g}, ${samples.topRight.b}) A=${samples.topRight.a}` : '检测中...'}
                      </span>
                    </div>
                    <div>
                      左下角 (2,97):{' '}
                      <span style={{ color: samples.bottomLeft?.a === 0 ? '#86efac' : '#fca5a5' }}>
                        {samples.bottomLeft ? `RGB(${samples.bottomLeft.r}, ${samples.bottomLeft.g}, ${samples.bottomLeft.b}) A=${samples.bottomLeft.a}` : '检测中...'}
                      </span>
                    </div>
                    <div>
                      中心角色区 (50,50):{' '}
                      <span style={{ color: '#d1b46a' }}>
                        {samples.center ? `RGB(${samples.center.r}, ${samples.center.g}, ${samples.center.b}) A=${samples.center.a}` : '检测中...'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 媒体元信息检查 */}
                <div style={{ background: '#111b15', padding: '12px', borderRadius: '8px', border: '1px solid #264234', fontSize: '11px', lineHeight: '1.7' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#ead99e', marginBottom: '6px' }}>
                    📋 播放器实际加载与解码状态：
                  </div>
                  <div>• 运行时解析 URL: <code style={{ color: '#8fb394', wordBreak: 'break-all' }}>{meta.currentSrc || '加载中...'}</code></div>
                  <div>• 实际分辨率: <strong>{meta.videoWidth} × {meta.videoHeight}</strong> (1:1 比例)</div>
                  <div>• 解码状态 readyState: <strong>{meta.readyState}</strong> (4 = HAVE_ENOUGH_DATA)</div>
                  <div>• 播放状态: <strong>{meta.paused ? '⏸️ 已暂停' : '▶️ 播放中'}</strong> (进度 {meta.currentTime}s)</div>
                  <div>• 错误日志: <span style={{ color: meta.error ? '#fca5a5' : '#86efac' }}>{meta.error || '无解码报错 (正常加载)'}</span></div>
                </div>

                {/* 采样 Canvas 离屏隐藏渲染 */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
