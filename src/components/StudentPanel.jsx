import { studentName, urgency } from '../lib/urgency.js'

export default function StudentPanel({ personas, selectedId, onSelect, onAsk, onNotice }) {
  const selected = personas.find((item) => item.id === selectedId) ?? personas[0]
  const items = urgency(selected)
  const name = studentName(selected)
  const missing = selected.profile.gradAudit?.missing ?? []
  const goal = selected.profile.goal === '미정' ? '진로 아직 없음' : selected.profile.goal

  return (
    <aside className="panel">
      <header className="brand">
        <div>
          <p className="logo">동학</p>
          <p className="tag">내 4년 · 지금 학년에만 맞춰</p>
        </div>
        <p className="me">{name}</p>
      </header>

      <div className="years">
        <p className="years-label">그때의 나</p>
        <div className="year-row" role="tablist" aria-label="내 학년">
          {personas.map((persona) => (
            <button
              key={persona.id}
              type="button"
              role="tab"
              aria-selected={persona.id === selected.id}
              className={persona.id === selected.id ? 'year on' : 'year'}
              onClick={() => onSelect(persona.id)}
            >
              {persona.profile.grade}학년
            </button>
          ))}
        </div>
      </div>

      <section className="id-card">
        <p className="id-kicker">지금 이 학기</p>
        <p className="id-name">{selected.profile.semester}</p>
        <p className="id-meta">{goal}</p>
        <p className="id-credits">
          {selected.profile.gradAudit
            ? `${selected.profile.gradAudit.totalCredits}학점 이수`
            : '졸업사정 전'}
        </p>
        {missing.length > 0 && (
          <ul className="gaps">
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="urgent">
        <h2>지금 손댈 것</h2>
        {items.map((item) => (
          <button key={item.title} type="button" className="job" onClick={() => onAsk(item.ask)}>
            <span className="when">{item.when}</span>
            <span className="what">{item.title}</span>
            <span className="why">{item.detail}</span>
          </button>
        ))}
      </section>

      <NoticeBox onNotice={onNotice} />
    </aside>
  )
}

function NoticeBox({ onNotice }) {
  return (
    <section className="paste">
      <h2>공지 → 내 캘린더</h2>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const body = new FormData(event.currentTarget).get('notice')
          const text = String(body || '').trim()
          if (!text) return
          onNotice(`${text}\n\n접수 마감일 저장해줘`)
          event.currentTarget.reset()
        }}
      >
        <textarea name="notice" placeholder="학과 공지 붙여넣기" />
        <button className="go" type="submit">
          마감일 넣기
        </button>
      </form>
    </section>
  )
}
