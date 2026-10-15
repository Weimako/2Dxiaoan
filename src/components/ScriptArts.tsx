import React from 'react'

export function ScriptArtTiredFriend() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#tired-glow)" opacity="0.65" />
        {/* Soft evening window */}
        <rect x="25" y="20" width="46" height="56" rx="10" fill="#eaf3eb" stroke="#a4caa9" strokeWidth="1.2" />
        <line x1="48" y1="20" x2="48" y2="76" stroke="#c0dcc5" strokeWidth="1.2" />
        <line x1="25" y1="48" x2="71" y2="48" stroke="#c0dcc5" strokeWidth="1.2" />
        {/* Crescent moon in window */}
        <path d="M54 28 C54 35, 60 38, 65 37 C61 40, 52 38, 52 30 C52 29, 53 28, 54 28 Z" fill="#ebdc98" />
        {/* Soft warm desk mug with steam */}
        <rect x="76" y="44" width="34" height="34" rx="8" fill="url(#mug-grad)" stroke="#ffffff" strokeWidth="1.2" />
        <path d="M110 52 C116 52, 116 64, 110 64" stroke="#a3cca9" strokeWidth="2.5" strokeLinecap="round" />
        {/* Steam */}
        <path d="M86 38 C86 32, 90 32, 90 26" stroke="#90c497" strokeWidth="1.8" strokeLinecap="round" opacity="0.75" />
        <path d="M96 40 C96 34, 100 34, 100 28" stroke="#90c497" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
        {/* Little leaf on mug */}
        <path d="M93 61 C90 56, 96 54, 98 58 C98 62, 92 63, 93 61 Z" fill="#4d8c5f" />
        <defs>
          <radialGradient id="tired-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#e4f4e2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#e4f4e2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mug-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#eef8ed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtWordsHurt() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#words-glow)" opacity="0.65" />
        {/* Protective gentle aura bubble */}
        <circle cx="70" cy="52" r="32" fill="url(#bubble-grad)" stroke="#a6d5ae" strokeWidth="1.5" />
        {/* Sprouting gentle seedling in center */}
        <path d="M70 66 L70 42" stroke="#488757" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M70 52 C60 44, 58 54, 70 54 Z" fill="#67b278" />
        <path d="M70 45 C78 37, 84 47, 70 47 Z" fill="#88c996" />
        {/* Ground mound */}
        <ellipse cx="70" cy="68" rx="16" ry="5" fill="#d9eed7" />
        {/* Surrounding gentle stars */}
        <circle cx="36" cy="38" r="2.5" fill="#eed998" />
        <circle cx="106" cy="36" r="2" fill="#90caa0" />
        <circle cx="102" cy="68" r="2.5" fill="#eed998" />
        <defs>
          <radialGradient id="words-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#dff0dd" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#dff0dd" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bubble-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
            <stop offset="100%" stopColor="rgba(235, 248, 234, 0.75)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtGroupVoice() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#voice-glow)" opacity="0.65" />
        {/* Notebook / board */}
        <rect x="36" y="24" width="68" height="52" rx="10" fill="#ffffff" stroke="#9ecba3" strokeWidth="1.4" />
        {/* Notebook lines */}
        <line x1="48" y1="38" x2="92" y2="38" stroke="#bcdbbb" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="48" x2="84" y2="48" stroke="#bcdbbb" strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="58" x2="76" y2="58" stroke="#bcdbbb" strokeWidth="2" strokeLinecap="round" />
        {/* Emerging idea lightbulb badge */}
        <circle cx="94" cy="56" r="14" fill="#f8eed2" stroke="#e0ca86" strokeWidth="1.2" />
        <path d="M94 48 C91 48, 89 50, 89 53 C89 55, 91 56, 92 58 L96 58 C97 56, 99 55, 99 53 C99 50, 97 48, 94 48 Z" fill="#ebc85a" />
        <line x1="92" y1="60" x2="96" y2="60" stroke="#bda142" strokeWidth="1.2" strokeLinecap="round" />
        {/* Speaking sound wave dots */}
        <circle cx="28" cy="46" r="2.5" fill="#71b581" />
        <circle cx="24" cy="54" r="3" fill="#4d9b62" />
        <circle cx="28" cy="62" r="2" fill="#71b581" />
        <defs>
          <radialGradient id="voice-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ebf5e9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ebf5e9" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtSelfCritic() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#critic-glow)" opacity="0.65" />
        {/* Soft resting pillow */}
        <rect x="36" y="38" width="68" height="40" rx="14" fill="url(#pillow-grad)" stroke="#ffffff" strokeWidth="1.4" />
        {/* Pillow center softness curve */}
        <path d="M52 56 Q70 64 88 56" stroke="#bedcbf" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        {/* Golden night stars and soothing moon above */}
        <path d="M68 20 C68 28, 76 32, 82 30 C77 34, 65 32, 65 22 C65 21, 66 20, 68 20 Z" fill="#ebd990" />
        <circle cx="44" cy="26" r="2.5" fill="#e8d794" />
        <circle cx="98" cy="25" r="2" fill="#e8d794" />
        <circle cx="106" cy="38" r="1.5" fill="#a0cea8" />
        <defs>
          <radialGradient id="critic-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f3f1e2" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f3f1e2" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pillow-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#edf5ec" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtComfortFriend() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#comfort-glow)" opacity="0.65" />
        {/* Two cups side by side representing companionship */}
        {/* Left Cup */}
        <rect x="42" y="44" width="26" height="28" rx="7" fill="#fdfdf9" stroke="#9ec9a3" strokeWidth="1.2" />
        <path d="M42 50 C38 50, 38 58, 42 58" stroke="#9ec9a3" strokeWidth="1.8" strokeLinecap="round" />
        {/* Right Cup */}
        <rect x="74" y="44" width="26" height="28" rx="7" fill="#eef7ee" stroke="#87be8f" strokeWidth="1.2" />
        <path d="M100 50 C104 50, 104 58, 100 58" stroke="#87be8f" strokeWidth="1.8" strokeLinecap="round" />
        {/* Intertwining warm steam */}
        <path d="M55 38 C55 30, 65 32, 65 24" stroke="#71b582" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        <path d="M87 38 C87 30, 77 32, 77 24" stroke="#e0c878" strokeWidth="1.6" strokeLinecap="round" opacity="0.8" />
        {/* Warm heart or leaf between them */}
        <circle cx="71" cy="40" r="4" fill="#eedb9b" />
        <circle cx="112" cy="48" r="2.5" fill="#a4d5ab" />
        <defs>
          <radialGradient id="comfort-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eaf4ea" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#eaf4ea" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtDeclineParty() {
  return (
    <div className="script-art-wrap" aria-hidden="true">
      <svg viewBox="0 0 140 100" className="script-art-svg" fill="none">
        <circle cx="70" cy="50" r="42" fill="url(#party-glow)" opacity="0.65" />
        {/* Serene windowsill and tranquil potted houseplant */}
        <rect x="30" y="68" width="80" height="8" rx="4" fill="#e4efe3" stroke="#b2d6b7" strokeWidth="1.2" />
        {/* Plant pot */}
        <polygon points="58,68 64,48 76,48 82,68" fill="#eed9c0" stroke="#cbb497" strokeWidth="1.2" />
        {/* Sprouting monstera leaves */}
        <path d="M70 48 C64 34, 48 38, 52 48 C56 56, 68 50, 70 48 Z" fill="#529966" />
        <path d="M70 48 C76 32, 92 36, 88 48 C84 56, 72 50, 70 48 Z" fill="#75bb87" />
        <path d="M70 48 L70 30" stroke="#48875b" strokeWidth="1.5" />
        <circle cx="70" cy="28" r="3" fill="#8ed49e" />
        {/* Afternoon golden sunbeams */}
        <circle cx="106" cy="28" r="10" fill="#f8eecf" opacity="0.75" />
        <circle cx="34" cy="36" r="2" fill="#88c495" />
        <defs>
          <radialGradient id="party-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#eff6ed" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#eff6ed" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  )
}

export function ScriptArtThumbnail({ illustrationKey }: { illustrationKey: string }) {
  switch (illustrationKey) {
    case 'tiredFriend':
      return <ScriptArtTiredFriend />
    case 'wordsHurt':
      return <ScriptArtWordsHurt />
    case 'groupVoice':
      return <ScriptArtGroupVoice />
    case 'selfCritic':
      return <ScriptArtSelfCritic />
    case 'comfortFriend':
      return <ScriptArtComfortFriend />
    case 'declineParty':
      return <ScriptArtDeclineParty />
    default:
      return <ScriptArtTiredFriend />
  }
}
