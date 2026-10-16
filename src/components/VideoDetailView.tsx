import React, { useState, useEffect, useRef } from 'react'
import { VideoItem } from '../types'
import { videoCatalog } from '../data/content'

interface VideoDetailViewProps {
  videoId: string
  onBack: () => void
  onSelectVideo: (id: string) => void
}

export function VideoDetailView({ videoId, onBack, onSelectVideo }: VideoDetailViewProps) {
  const video: VideoItem = videoCatalog.find((v) => v.id === videoId) || videoCatalog[0]

  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [volume, setVolume] = useState<number>(0.85)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [isWatched, setIsWatched] = useState<boolean>(false)
  const [toast, setToast] = useState<string>('')

  // 收藏与打卡状态同步
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('xiaoan_favorites') || '[]') as string[]
      setIsBookmarked(favs.includes(video.id))

      const watched = JSON.parse(localStorage.getItem('xiaoan_watched') || '[]') as string[]
      setIsWatched(watched.includes(video.id))
    } catch {
      // ignore
    }

    // 重置播放状态（严格遵循规范：进入详情页不要自动播放有声视频）
    setIsPlaying(false)
    setCurrentTime(0)
    setHasError(false)
    setIsLoading(Boolean(video.isReady && video.videoUrl))

    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [videoId, video.id, video.isReady, video.videoUrl])

  // 音量与静音控制
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume
      videoRef.current.muted = isMuted
    }
  }, [volume, isMuted])

  // 播放/暂停控制
  const togglePlay = () => {
    const el = videoRef.current
    if (!el || !video.isReady) return

    if (isPlaying) {
      el.pause()
      setIsPlaying(false)
    } else {
      el.play()
        .then(() => {
          setIsPlaying(true)
          setHasError(false)
        })
        .catch((err) => {
          console.warn('[VideoPlayer] Play prevented:', err.message)
          setIsPlaying(false)
        })
    }
  }

  // 进度拖动/点击跳转
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = videoRef.current
    if (!el || duration <= 0) return

    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const targetTime = ratio * duration
    el.currentTime = targetTime
    setCurrentTime(targetTime)
  }

  // 音量切换与静音
  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (val > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  // 全屏切换
  const toggleFullscreen = () => {
    const el = videoRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  // 收藏与打卡
  const toggleBookmark = () => {
    try {
      const favs = JSON.parse(localStorage.getItem('xiaoan_favorites') || '[]') as string[]
      let nextFavs: string[]
      if (favs.includes(video.id)) {
        nextFavs = favs.filter((id) => id !== video.id)
        setIsBookmarked(false)
        setToast('已从收藏夹移除')
      } else {
        nextFavs = [...favs, video.id]
        setIsBookmarked(true)
        setToast('已加入我的收藏 🌿')
      }
      localStorage.setItem('xiaoan_favorites', JSON.stringify(nextFavs))
      setTimeout(() => setToast(''), 2500)
    } catch {
      // ignore
    }
  }

  const handleMarkWatched = () => {
    try {
      const watched = JSON.parse(localStorage.getItem('xiaoan_watched') || '[]') as string[]
      if (!watched.includes(video.id)) {
        const nextWatched = [...watched, video.id]
        localStorage.setItem('xiaoan_watched', JSON.stringify(nextWatched))
      }
      setIsWatched(true)
      setToast('恭喜完成本次视频疗愈打卡 ✨')
      setTimeout(() => setToast(''), 2500)
    } catch {
      // ignore
    }
  }

  // 格式化时间 mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  // 关联视频推荐：同分类中除当前视频外的其他条目
  const relatedVideos = videoCatalog.filter((v) => v.category === video.category && v.id !== video.id)

  return (
    <div className="video-detail-container">
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button onClick={() => setToast('')}>知道了</button>
        </div>
      )}

      {/* 主布局：左侧播放器，右侧课程详情 */}
      <div className="video-detail-grid">
        {/* 左侧：播放器卡片 */}
        <div className="video-player-card glass-card">
          <div className="video-screen" style={{ borderColor: video.accentColor }}>
            {/* 场景 1: 素材未就绪时（提示内容准备中，杜绝黑屏） */}
            {!video.isReady ? (
              <div className="video-unready-stage">
                <div className="unready-icon">⏳</div>
                <div className="unready-badge">素材准备中</div>
                <h3 className="unready-title">{video.title}</h3>
                <p className="unready-tip">
                  本期精选视频资源正在录制与完善授权中。
                  <br />
                  请先阅读右侧疗愈导语与适合人群，或体验已上架的推荐内容。
                </p>
                <div className="unready-actions">
                  <button
                    type="button"
                    className="primary-button unready-btn"
                    onClick={() => onSelectVideo('relax-1')}
                  >
                    播放《把一天放慢》
                  </button>
                  <button
                    type="button"
                    className="secondary-button unready-btn"
                    onClick={onBack}
                  >
                    返回视频库
                  </button>
                </div>
              </div>
            ) : hasError ? (
              /* 场景 2: 视频加载或解码报错兜底提示 */
              <div className="video-unready-stage">
                <div className="unready-icon">🍃</div>
                <div className="unready-badge error-badge">播放异常</div>
                <h3 className="unready-title">视频加载失败</h3>
                <p className="unready-tip">未能加载本地视频文件，请检查网络或稍后重试。</p>
                <div className="unready-actions">
                  <button
                    type="button"
                    className="primary-button unready-btn"
                    onClick={() => {
                      setHasError(false)
                      setIsLoading(true)
                      videoRef.current?.load()
                    }}
                  >
                    重试加载
                  </button>
                  <button
                    type="button"
                    className="secondary-button unready-btn"
                    onClick={onBack}
                  >
                    返回视频库
                  </button>
                </div>
              </div>
            ) : (
              /* 场景 3: 真实可播视频舞台 */
              <div className="video-viewport" onClick={togglePlay}>
                <video
                  ref={videoRef}
                  src={video.videoUrl}
                  poster={video.posterUrl}
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration
                    if (!isNaN(d) && d > 0) {
                      setDuration(d)
                    }
                    setIsLoading(false)
                  }}
                  onTimeUpdate={(e) => {
                    setCurrentTime(e.currentTarget.currentTime)
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => {
                    setIsPlaying(false)
                    handleMarkWatched()
                  }}
                  onError={() => {
                    setHasError(true)
                    setIsLoading(false)
                    setIsPlaying(false)
                  }}
                  onWaiting={() => setIsLoading(true)}
                  onPlaying={() => setIsLoading(false)}
                  className="video-native-element"
                />

                {/* 居中大播放按钮 (暂停状态时展示) */}
                {!isPlaying && !isLoading && (
                  <button
                    type="button"
                    className="video-center-play-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlay()
                    }}
                    aria-label="播放视频"
                  >
                    ▶
                  </button>
                )}

                {/* 加载缓冲指示器 */}
                {isLoading && (
                  <div className="video-loading-spinner" aria-label="视频加载中">
                    <span className="spinner-dot" />
                    <span>加载中...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 底部控制台 (播放、时间、进度条、音量、全屏) */}
          {video.isReady && !hasError && (
            <div className="video-control-bar">
              <button
                type="button"
                className="video-bar-play-toggle"
                onClick={togglePlay}
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? '❚❚ 暂停' : '▶ 播放'}
              </button>

              <span className="video-timestamp">
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </span>

              {/* 可交互进度条 */}
              <div
                className="video-progress-track"
                onClick={handleSeek}
                role="slider"
                aria-label="播放进度"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
              >
                <div className="video-progress-fill" style={{ width: `${progressPercent}%` }} />
                <div className="video-progress-thumb" style={{ left: `${progressPercent}%` }} />
              </div>

              {/* 音量控制区 */}
              <div className="video-volume-control" title="调整音量">
                <button
                  type="button"
                  className="video-volume-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? '取消静音' : '静音'}
                >
                  {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="video-volume-slider"
                  aria-label="音量大小"
                />
              </div>

              {/* 全屏按钮 */}
              <button
                type="button"
                className="video-fullscreen-btn"
                onClick={toggleFullscreen}
                title="全屏播放"
                aria-label="全屏"
              >
                ⛶
              </button>

              {/* 收藏与打卡 */}
              <div className="video-bar-actions">
                <button
                  type="button"
                  className={`video-action-btn ${isBookmarked ? 'active' : ''}`}
                  onClick={toggleBookmark}
                  title="收藏"
                >
                  {isBookmarked ? '★ 已收藏' : '☆ 收藏'}
                </button>

                <button
                  type="button"
                  className={`video-action-btn ${isWatched ? 'active' : ''}`}
                  onClick={handleMarkWatched}
                >
                  {isWatched ? '✓ 已打卡' : '打卡完成'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：课程元信息、简介、适合人群及关联精选推荐 */}
        <div className="video-info-card glass-card">
          <header className="video-info-header">
            <div className="video-theme-pill-row">
              <span className="video-category-pill">{video.category}</span>
              {video.isReady ? (
                <span className="video-ready-pill ready">可直接播放</span>
              ) : (
                <span className="video-ready-pill unready">内容筹备中</span>
              )}
            </div>
            <div className="video-title-row">
              <h2>{video.title}</h2>
              <span className="video-time-tag">时长 {video.time}</span>
            </div>
            <p className="video-sub-desc">{video.sub}</p>
            <div className="video-tags-list">
              {video.tags.map((tag) => (
                <span key={tag} className="video-tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          <section className="video-meta-section">
            <h4>🌿 疗愈导语与知识</h4>
            <p className="video-full-desc">{video.description}</p>
          </section>

          <section className="video-meta-section">
            <h4>💡 适合人群</h4>
            <p className="video-suitable-text">{video.suitable}</p>
          </section>

          {video.sourceInfo && (
            <section className="video-meta-section video-license-note">
              <h4>📜 素材来源与许可说明</h4>
              <p className="video-license-detail">
                来源归属：{video.sourceInfo.author}
                <br />
                许可类型：{video.sourceInfo.license}
                {video.sourceInfo.notes && (
                  <>
                    <br />
                    备注说明：{video.sourceInfo.notes}
                  </>
                )}
              </p>
            </section>
          )}

          {/* 同主题精选推荐 */}
          {relatedVideos.length > 0 && (
            <section className="video-related-section">
              <h4>同主题精选内容</h4>
              <div className="related-videos-list">
                {relatedVideos.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="related-video-item"
                    onClick={() => onSelectVideo(item.id)}
                  >
                    <div
                      className="related-thumb"
                      style={{ background: item.accentColor }}
                    >
                      ▶
                    </div>
                    <div className="related-text">
                      <strong>{item.title}</strong>
                      <small>{item.sub}</small>
                    </div>
                    <div className="related-status-meta">
                      <span className="related-time">{item.time}</span>
                      {item.isReady ? (
                        <span className="status-tag ready">可播放</span>
                      ) : (
                        <span className="status-tag pending">筹备中</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="video-back-row">
            <button type="button" className="secondary-button" onClick={onBack}>
              返回视频库
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
