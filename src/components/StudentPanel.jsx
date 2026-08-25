import { givenName, urgency } from '../lib/urgency.js'

export default function StudentPanel({ personas, selectedId, onSelect, onAsk, onNotice }) {
  const selected = personas.find((item) => item.id === selectedId) ?? personas[0]
  const items = urgency(selected)
  const name = givenName(selected.label)
  const missing = selected.profile.gradAudit?.missing ?? []
  const goal = selected.profile.goal === '미정' ? '진로 미정' : selected.profile.goal

  return (
    <aside className="panel">
      <div className="mark">
        <span className="seal" aria-hidden="true">
          同
        </span>
        <div>
          <h1 className="wordmark">동학</h1>
          <p className="tag">4학년이 되어서야 알게 되는 것들</p>
        </div>
      </div>

      <div className="year-row">
        {personas.map((persona) => (
          <button
            key={persona.id}
            type="button"
            className={persona.id === selected.id ? 'year on' : 'year'}
            onClick={() => onSelect(persona.id)}
          >
            {persona.profile.grade}학년
          </button>
        ))}
      </div>

      <div className="now">
        <span>지금 내 학기</span>
        <strong>{selected.profile.semester}</strong>
      </div>
      <p className="who-line">
        {name} · {goal}
        {selected.profile.gradAudit
          ? ` · ${selected.profile.gradAudit.totalCredits}학점`
          : ' · 졸업사정 전'}
      </p>
      {missing.length > 0 && (
        <ul className="gaps">
          {missing.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      <section className="urgent">
        <h2>지금 급한 것 · 누르면 물어봄</h2>
        {items.map((item) => (
          <button key={item.title} type="button" className="job" onClick={() => onAsk(item.ask)}>
            <span className="when">{item.when}</span>
            <span className="what">{item.title}</span>
            <span className="why">{item.detail}</span>
          </button>
        ))}
      </section>

      <NoticeBox onNotice={onNotice} />

      <p className="foot">데모용 샘플 · 국립순천대학교 컴퓨터공학과</p>
    </aside>
  )
}

function NoticeBox({ onNotice }) {
  return (
    <section className="paste">
      <h2>학과 공지 → 내 캘린더</h2>
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
        <textarea name="notice" placeholder="공지 그대로 붙여 넣으면 됩니다." />
        <button className="go" type="submit">
          마감일을 캘린더에 넣기
        </button>
      </form>
      <p className="hint">접수 마감이 적힌 글이면 일정 쪽지가 생깁니다. 폰 캘린더로 바로 받을 수 있어요.</p>
    </section>
  )
}
