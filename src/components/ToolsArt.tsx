import React from 'react'

export function CardVisualVideo() {
  return (
    <div className="card-visual-wrap visual-video" aria-hidden="true">
      <svg viewBox="0 0 160 110" className="card-visual-svg" fill="none">
        {/* Background ambient glow circle */}
        <circle cx="80" cy="55" r="48" fill="url(#video-sun-glow)" opacity="0.6" />

        {/* Soft landscape horizon */}
        <path
          d="M10 88 C40 75, 70 82, 100 76 C130 70, 150 78, 160 82 L160 110 L0 110 Z"
          fill="url(#video-hill-grad)"
          opacity="0.35"
        />

        {/* Video Film Frame / Screen Card */}
        <rect
          x="32"
          y="22"
          width="96"
          height="62"
          rx="14"
          fill="url(#video-screen-fill)"
          stroke="url(#video-screen-stroke)"
          strokeWidth="1.5"
        />

        {/* Screen inner gentle frame */}
        <rect
          x="38"
          y="28"
          width="84"
          height="50"
          rx="9"
          fill="#5a8e6b"
          fillOpacity="0.18"
        />

        {/* Center Glowing Play Button Badge */}
        <circle cx="80" cy="53" r="16" fill="url(#video-play-bg)" />
        <circle cx="80" cy="53" r="16" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="1.2" />
        <polygon points="76,46 88,53 76,60" fill="#ffffff" />

        {/* Small floating sparkles/leaves */}
        <path
          d="M125 24 C128 20, 134 22, 133 28 C132 32, 126 30, 125 24 Z"
          fill="#78ad85"
          opacity="0.75"
        />
        <circle cx="34" cy="22" r="2.5" fill="#e8d79a" opacity="0.8" />
        <circle cx="138" cy="65" r="2" fill="#88bfa0" opacity="0.7" />

        {/* Gradients */}
        <defs>
          <radialGradient id="video-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d5ecd4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d5ecd4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="video-hill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#75a882" />
            <stop offset="100%" stopColor="#4e805b" />
          </linearGradient>
          <linearGradient id="video-screen-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
            <stop offset="100%" stopColor="rgba(235, 246, 235, 0.7)" />
          </linearGradient>
          <linearGradient id="video-screen-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="100%" stopColor="rgba(145, 195, 160, 0.5)" />
          </linearGradient>
          <linearGradient id="video-play-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5aa070" />
            <stop offset="100%" stopColor="#3d7e52" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function CardVisualScript() {
  return (
    <div className="card-visual-wrap visual-script" aria-hidden="true">
      <svg viewBox="0 0 160 110" className="card-visual-svg" fill="none">
        {/* Soft background glow */}
        <circle cx="75" cy="50" r="46" fill="url(#script-sun-glow)" opacity="0.6" />

        {/* First dialogue bubble (Back / Warm cream) */}
        <rect
          x="28"
          y="22"
          width="76"
          height="44"
          rx="15"
          fill="url(#bubble-warm-fill)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.5"
        />
        {/* Tail for back bubble */}
        <path
          d="M44 65 L40 76 L54 65 Z"
          fill="url(#bubble-warm-fill)"
        />
        {/* Lines inside first bubble */}
        <line x1="42" y1="35" x2="88" y2="35" stroke="#7e9c85" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="42" y1="45" x2="74" y2="45" stroke="#9bbba2" strokeWidth="2.5" strokeLinecap="round" />

        {/* Second dialogue bubble (Front / Soft Forest Green) */}
        <rect
          x="58"
          y="42"
          width="78"
          height="46"
          rx="15"
          fill="url(#bubble-green-fill)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth="1.5"
        />
        {/* Tail for front bubble */}
        <path
          d="M118 87 L124 98 L108 87 Z"
          fill="url(#bubble-green-fill)"
        />
        {/* Gentle sprouting leaf in front bubble */}
        <path
          d="M74 65 C74 58, 83 55, 87 61 C87 67, 78 70, 74 65 Z"
          fill="#488c5d"
        />
        <path
          d="M87 61 C91 57, 98 59, 97 65 C95 69, 89 67, 87 61 Z"
          fill="#76b889"
        />
        {/* Lines inside second bubble */}
        <line x1="103" y1="62" x2="122" y2="62" stroke="#487e5b" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
        <line x1="74" y1="73" x2="122" y2="73" stroke="#487e5b" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />

        {/* Small floating sparkles */}
        <circle cx="140" cy="30" r="3" fill="#e5d496" opacity="0.85" />
        <circle cx="22" cy="46" r="2" fill="#7ab388" opacity="0.7" />

        <defs>
          <radialGradient id="script-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d8ecd8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d8ecd8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bubble-warm-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#faf7ea" />
            <stop offset="100%" stopColor="#ede5cf" />
          </linearGradient>
          <linearGradient id="bubble-green-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#def1db" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function CardVisualArticle() {
  return (
    <div className="card-visual-wrap visual-article" aria-hidden="true">
      <svg viewBox="0 0 160 110" className="card-visual-svg" fill="none">
        {/* Ambient warm glow */}
        <circle cx="80" cy="50" r="46" fill="url(#article-sun-glow)" opacity="0.6" />

        {/* Open Book Outer Shadow / Cover */}
        <path
          d="M26 68 C48 61, 72 63, 80 68 C88 63, 112 61, 134 68 L134 74 C112 67, 88 69, 80 74 C72 69, 48 67, 26 74 Z"
          fill="#4b7556"
          opacity="0.35"
        />

        {/* Left Book Page */}
        <path
          d="M28 32 C50 25, 74 27, 80 32 L80 68 C74 63, 50 61, 28 68 Z"
          fill="url(#page-left-fill)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.2"
        />
        {/* Left page text lines */}
        <line x1="38" y1="41" x2="68" y2="39" stroke="#7e9c85" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="49" x2="70" y2="47" stroke="#9bbba2" strokeWidth="2" strokeLinecap="round" />
        <line x1="38" y1="57" x2="62" y2="55" stroke="#9bbba2" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Right Book Page */}
        <path
          d="M80 32 C86 27, 110 25, 132 32 L132 68 C110 61, 86 63, 80 68 Z"
          fill="url(#page-right-fill)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="1.2"
        />
        {/* Right page text lines */}
        <line x1="92" y1="39" x2="122" y2="41" stroke="#7e9c85" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="47" x2="122" y2="49" stroke="#9bbba2" strokeWidth="2" strokeLinecap="round" />
        <line x1="90" y1="55" x2="114" y2="57" stroke="#9bbba2" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

        {/* Book spine line */}
        <line x1="80" y1="32" x2="80" y2="69" stroke="#507c5c" strokeWidth="1.5" />

        {/* Sprouting bookmark leaf rising from center */}
        <path
          d="M80 32 C78 20, 86 14, 88 12 C90 19, 86 27, 80 32 Z"
          fill="#5a9c68"
        />
        <path
          d="M80 25 C82 22, 87 23, 86 26 C85 28, 82 27, 80 25 Z"
          fill="#82c490"
        />

        {/* Floating golden reading spark */}
        <circle cx="128" cy="22" r="3" fill="#e8d79a" opacity="0.9" />
        <circle cx="32" cy="20" r="2" fill="#7eb58a" opacity="0.75" />

        <defs>
          <radialGradient id="article-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3ecdb" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f3ecdb" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="page-left-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#edf5ec" />
          </linearGradient>
          <linearGradient id="page-right-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fafaf3" />
            <stop offset="100%" stopColor="#e4eee2" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function CardVisualMeditation() {
  return (
    <div className="card-visual-wrap visual-meditation" aria-hidden="true">
      <svg viewBox="0 0 160 110" className="card-visual-svg" fill="none">
        {/* Soft tranquil moonlight glow */}
        <circle cx="80" cy="55" r="46" fill="url(#meditation-glow)" opacity="0.6" />

        {/* Concentric Serene Water Rings / Waves */}
        <ellipse cx="80" cy="74" rx="55" ry="14" stroke="#78a885" strokeWidth="1.2" opacity="0.3" />
        <ellipse cx="80" cy="74" rx="42" ry="10" stroke="#689f77" strokeWidth="1.5" opacity="0.45" />
        <ellipse cx="80" cy="74" rx="28" ry="7" stroke="#528e64" strokeWidth="1.8" opacity="0.65" />

        {/* Serene Singing Bowl / Lotus Base */}
        <path
          d="M58 52 C58 72, 102 72, 102 52 C95 56, 65 56, 58 52 Z"
          fill="url(#bowl-fill)"
          stroke="url(#bowl-stroke)"
          strokeWidth="1.5"
        />

        {/* Gentle dewdrop / meditation spark ascending above bowl */}
        <path
          d="M80 26 C80 26, 88 38, 88 43 C88 47.4, 84.4 51, 80 51 C75.6 51, 72 47.4, 72 43 C72 38, 80 26, 80 26 Z"
          fill="url(#drop-grad)"
        />
        <circle cx="77" cy="40" r="2.5" fill="#ffffff" opacity="0.75" />

        {/* Ambient tranquil sparkles / stars */}
        <circle cx="124" cy="35" r="2.5" fill="#ebd99f" opacity="0.85" />
        <circle cx="36" cy="36" r="2" fill="#95cca8" opacity="0.75" />
        <circle cx="112" cy="20" r="1.5" fill="#ffffff" opacity="0.9" />

        <defs>
          <radialGradient id="meditation-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d2ebd5" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#d2ebd5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bowl-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f7f6eb" />
            <stop offset="100%" stopColor="#dbe8d7" />
          </linearGradient>
          <linearGradient id="bowl-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="100%" stopColor="rgba(110, 175, 130, 0.6)" />
          </linearGradient>
          <linearGradient id="drop-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#76bf88" />
            <stop offset="100%" stopColor="#438557" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// 3 Quick Tool Icons
export function QuickIconBreathing() {
  return (
    <div className="quick-tool-icon-box icon-breathing" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#e2f3e0" opacity="0.85" />
        <circle cx="12" cy="12" r="6" stroke="#4a8a5b" strokeWidth="2" strokeDasharray="3 3" />
        <path
          d="M12 6 C12 6, 15.5 10.5, 15.5 13 C15.5 14.9, 13.9 16.5, 12 16.5 C10.1 16.5, 8.5 14.9, 8.5 13 C8.5 10.5, 12 6, 12 6 Z"
          fill="#529966"
        />
        <circle cx="10.8" cy="12.5" r="1.2" fill="#ffffff" opacity="0.8" />
      </svg>
    </div>
  )
}

export function QuickIconMood() {
  return (
    <div className="quick-tool-icon-box icon-mood" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#f7f1dc" opacity="0.85" />
        <rect x="7" y="6" width="10" height="12" rx="2.5" fill="#ffffff" stroke="#9e8a52" strokeWidth="1.2" />
        <path
          d="M9.5 9 C10 8.5, 11 8.8, 11 9.5 C11 10.2, 9.5 11, 9.5 11 C9.5 11, 8 10.2, 8 9.5 C8 8.8, 9 8.5, 9.5 9 Z"
          fill="#5aa070"
        />
        <line x1="12" y1="9.5" x2="14.5" y2="9.5" stroke="#7e9c85" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="9.5" y1="12" x2="14.5" y2="12" stroke="#b2baa7" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="9.5" y1="14.5" x2="13" y2="14.5" stroke="#b2baa7" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function QuickIconEnergy() {
  return (
    <div className="quick-tool-icon-box icon-energy" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#e4f0dc" opacity="0.85" />
        {/* Sunbeam energy petals */}
        <circle cx="12" cy="12" r="4.5" fill="#f2cf6b" />
        <circle cx="12" cy="12" r="4.5" stroke="#ffffff" strokeWidth="1.2" />
        <path d="M12 4 V5.5" stroke="#b8933b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M12 18.5 V20" stroke="#b8933b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 12 H5.5" stroke="#b8933b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18.5 12 H20" stroke="#b8933b" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M6.3 6.3 L7.4 7.4" stroke="#5e966e" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16.6 16.6 L17.7 17.7" stroke="#5e966e" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6.3 17.7 L7.4 16.6" stroke="#5e966e" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M16.6 7.4 L17.7 6.3" stroke="#5e966e" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  )
}
