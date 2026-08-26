const TABS = [
  {
    id: 'home',
    label: '홈',
    icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  },
  {
    id: 'chat',
    label: '상담',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    id: 'notice',
    label: '공지',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
  },
  {
    id: 'me',
    label: '내 정보',
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
]

export default function TabBar({ screen, onGo }) {
  return (
    <nav className="nav" aria-label="주요 화면">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={screen === tab.id ? 'nav-item on' : 'nav-item'}
          aria-current={screen === tab.id ? 'page' : undefined}
          onClick={() => onGo(tab.id)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {tab.icon}
          </svg>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
