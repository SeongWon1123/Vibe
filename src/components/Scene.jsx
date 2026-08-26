import { useId } from 'react'

/**
 * 순천 노을 씬. 길이음의 갈대·새는 그대로, 물가 대신 캠퍼스 능선(시계탑·강의동)을 얹었다.
 * variant: 'full' (390×844 인트로) | 'hero' (390×310 홈 상단)
 */
export default function Scene({ variant = 'hero' }) {
  const id = useId().replace(/:/g, '')
  const full = variant === 'full'
  const H = full ? 844 : 310
  const horizon = full ? 590 : 213
  const sun = full ? { cx: 255, cy: 500, r: 100, core: 17 } : { cx: 266, cy: 178, r: 66, core: 13 }

  return (
    <svg
      className="scene"
      viewBox={`0 0 390 ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#221A2E" />
          <stop offset=".32" stopColor="#4E3342" />
          <stop offset=".55" stopColor="#9A4B38" />
          <stop offset=".68" stopColor="#D5814F" />
          <stop offset=".76" stopColor="#EFAF7E" />
        </linearGradient>
        <linearGradient id={`ground${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E29963" />
          <stop offset=".45" stopColor="#9E5138" />
          <stop offset="1" stopColor="#2B1C28" />
        </linearGradient>
        <radialGradient id={`glow${id}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFE7BC" stopOpacity=".85" />
          <stop offset="1" stopColor="#FFDCA0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`fade${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#150E17" stopOpacity="0" />
          <stop offset="1" stopColor="#150E17" stopOpacity=".6" />
        </linearGradient>
      </defs>

      <rect width="390" height={horizon} fill={`url(#sky${id})`} />
      <circle cx={sun.cx} cy={sun.cy} r={sun.r} fill={`url(#glow${id})`} />
      <circle cx={sun.cx} cy={sun.cy + 4} r={sun.core} fill="#FFEBC8" />

      <g
        className="birds"
        stroke="#2A1E2C"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        transform={full ? 'translate(0 0)' : 'translate(0 -150)'}
      >
        <path d="M92 210 q7 -8 14 0 q7 -8 14 0" />
        <path d="M140 188 q6 -7 12 0 q6 -7 12 0" />
        <path d="M116 236 q5 -6 10 0 q5 -6 10 0" />
      </g>

      {/* 먼 산 능선 */}
      <path
        d={`M0 ${horizon - 30} Q70 ${horizon - 70} 150 ${horizon - 38} T300 ${horizon - 52} T390 ${horizon - 34} L390 ${horizon + 6} L0 ${horizon + 6} Z`}
        fill="#3A2536"
        opacity=".9"
      />

      {/* 캠퍼스 실루엣: 시계탑 + 강의동 두 채 */}
      <g fill="#2A1D2A" transform={`translate(0 ${horizon})`}>
        <rect x="150" y="-64" width="14" height="70" />
        <rect x="147" y="-70" width="20" height="7" />
        <circle cx="157" cy="-52" r="4.2" fill="#FFEBC8" opacity=".85" />
        <rect x="96" y="-38" width="52" height="44" />
        <rect x="166" y="-30" width="72" height="36" />
        <rect x="240" y="-22" width="40" height="28" />
        {/* 창문 불빛 */}
        <g fill="#F0B279" opacity=".7">
          <rect x="104" y="-30" width="5" height="6" />
          <rect x="116" y="-30" width="5" height="6" />
          <rect x="128" y="-30" width="5" height="6" />
          <rect x="176" y="-22" width="5" height="6" />
          <rect x="190" y="-22" width="5" height="6" />
          <rect x="216" y="-22" width="5" height="6" />
        </g>
      </g>

      <rect y={horizon} width="390" height={H - horizon} fill={`url(#ground${id})`} />
      <path
        d={
          full
            ? 'M390 600 C300 610 240 602 202 620 C164 638 208 656 152 678 C108 696 40 704 0 730 L0 760 L80 742 C140 722 172 712 202 694 C246 668 202 652 248 632 C288 616 334 614 390 606 Z'
            : 'M390 220 C305 226 244 220 206 233 C168 246 208 258 156 272 C114 284 42 288 0 306 L0 310 L74 310 C132 296 168 289 198 278 C240 262 198 250 242 237 C282 226 332 228 390 224 Z'
        }
        fill="#F0B279"
        opacity=".9"
      />

      <g
        className="reeds-l"
        stroke="#150E17"
        strokeWidth="2.2"
        fill="#150E17"
        strokeLinecap="round"
        transform={full ? undefined : 'translate(0 -534)'}
      >
        <path d="M24 844 C27 780 20 750 30 716" fill="none" />
        <ellipse cx="31" cy="710" rx="3.4" ry="11" transform="rotate(10 31 710)" />
        <path d="M46 844 C46 792 53 764 47 736" fill="none" />
        <ellipse cx="47" cy="730" rx="3" ry="10" transform="rotate(-7 47 730)" />
        <path d="M64 844 C68 798 62 774 72 744" fill="none" />
        <ellipse cx="73" cy="738" rx="3" ry="9.5" transform="rotate(12 73 738)" />
      </g>
      <g
        className="reeds-r"
        stroke="#150E17"
        strokeWidth="2.2"
        fill="#150E17"
        strokeLinecap="round"
        transform={full ? undefined : 'translate(0 -534)'}
      >
        <path d="M352 844 C355 788 348 760 359 726" fill="none" />
        <ellipse cx="360" cy="720" rx="3.4" ry="11" transform="rotate(11 360 720)" />
        <path d="M374 844 C374 796 381 770 375 744" fill="none" />
        <ellipse cx="375" cy="738" rx="3" ry="9.5" transform="rotate(-7 375 738)" />
      </g>

      <rect y={horizon - 30} width="390" height={H - horizon + 30} fill={`url(#fade${id})`} />
    </svg>
  )
}
