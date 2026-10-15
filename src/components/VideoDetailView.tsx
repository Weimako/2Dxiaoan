import { useState, useEffect } from 'react'
import { VideoItem } from '../types'
import { videoCatalog } from '../data/content'
import mascotScene from '../assets/mascot-scene.png'
import { Xiaoan2D } from './Xiaoan2D'

interface VideoDetailViewProps {
  videoId: string
  onBack: () => void
  onSelectVideo: (id: string) => void
}

export function VideoDetailView({ videoId, onBack, onSelectVideo }: VideoDetailViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [isWatched, setIsWatched] = useState<boolean>(false)
  const [toast, setToast] = useState<string>('')

  const video = videoCatalog.find((v) => v.id === videoId) || videoCatalog[0]

  // Parse time to seconds (e.g. "04:20" -> 260s)
  const [minsStr, secsStr] = video.time.split(':')
  const totalSeconds = (parseInt(minsStr) || 3) * 60 + (parseInt(secsStr) || 30)

  // Load bookmark and watched status
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('xiaoan_favorites') || '[]') as string[]
      setIsBookmarked(favs.includes(video.id))

      const watched = JSON.parse(localStorage.getItem('xiaoan_watched') || '[]') as string[]
      setIsWatched(watched.includes(video.id))
    } catch {
      // ignore
    }
    setIsPlaying(false)
    setCurrentTime(0)
  }, [videoId, video.id])

  // Playback timer simulation
  useEffect(() => {
    let interval: number | null = null
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalSeconds) {
            setIsPlaying(false)
            handleMarkWatched()
            return totalSeconds
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, totalSeconds])

  function togglePlay() {
    setIsPlaying(!isPlaying)
  }

  function toggleBookmark() {
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

  function handleMarkWatched() {
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

  const curMins = Math.floor(currentTime / 60)
  const curSecs = currentTime % 60
  const progressPercent = (currentTime / totalSeconds) * 100

  // Related videos (same category excluding current, or first 3)
  const relatedVideos = videoCatalog
    .filter((v) => v.category === video.category && v.id !== video.id)
    .slice(0, 3)

  return (
    <div className="video-detail-container">
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
          <button onClick={() => setToast('')}>知道了</button>
        </div>
      )}

      {/* Main player and info layout */}
      <div className="video-detail-grid">
        {/* Left: simulated video screen & player controls */}
        <div className="video-player-card glass-card">
          <div className="video-screen" style={{ borderColor: video.accentColor }}>
            {/* Visual stage / animated poster */}
            <div className="video-poster-art">
              <div className="video-poster-3d-wrap">
                <Xiaoan2D
                  size="medium"
                  isSpeaking={isPlaying}
                  isReplying={isPlaying}
                  enableTalkingAnimation={true}
                />
              </div>
              <div className="video-screen-overlay">
                <span className="video-category-chip">{video.category}</span>
                <h3 className="video-screen-title">{video.title}</h3>
                <p className="video-screen-sub">{video.sub}</p>
              </div>
            </div>

            {/* Play/Pause center action button */}
            <button
              type="button"
              className={`video-center-play-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={togglePlay}
              aria-label={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
          </div>

          {/* Player control timeline */}
          <div className="video-control-bar">
            <button
              type="button"
              className="video-bar-play-toggle"
              onClick={togglePlay}
            >
              {isPlaying ? '暂停' : '播放'}
            </button>

            <span className="video-timestamp">
              {String(curMins).padStart(2, '0')}:{String(curSecs).padStart(2, '0')} / {video.time}
            </span>

            {/* Progress track */}
            <div
              className="video-progress-track"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
                setCurrentTime(Math.floor(ratio * totalSeconds))
              }}
            >
              <div className="video-progress-fill" style={{ width: `${progressPercent}%` }} />
              <div className="video-progress-thumb" style={{ left: `${progressPercent}%` }} />
            </div>

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
        </div>

        {/* Right: metadata, description, audience & related recommendations */}
        <div className="video-info-card glass-card">
          <header className="video-info-header">
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

          {/* Related recommendation list */}
          {relatedVideos.length > 0 && (
            <section className="video-related-section">
              <h4>同主题推荐内容</h4>
              <div className="related-videos-list">
                {relatedVideos.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="related-video-item"
                    onClick={() => onSelectVideo(item.id)}
                  >
                    <div className="related-thumb" style={{ background: item.accentColor }}>
                      ▶
                    </div>
                    <div className="related-text">
                      <strong>{item.title}</strong>
                      <small>{item.sub}</small>
                    </div>
                    <span className="related-time">{item.time}</span>
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
