import { noticesFor } from '../data/notices.js'

export default function Notice({ persona, draft, setDraft, onNotice }) {
  const samples = noticesFor(persona.profile.grade, 4)

  function submit(event) {
    event.preventDefault()
    const body = draft.trim()
    if (!body) return
    onNotice(`${body}\n\n마감일 저장해줘`)
  }

  return (
    <div className="screen">
      <div className="phead">
        <h1>공지</h1>
        <p>붙여 넣으면 마감일만 뽑아 캘린더로</p>
      </div>

      <div className="ai-card">
        <svg className="bg" viewBox="0 0 340 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path
            d="M340 90 C270 98 230 90 196 104 C164 118 200 128 158 140 L340 140 Z"
            fill="#DE9663"
            opacity=".35"
          />
          <g stroke="#F0C9A4" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity=".7">
            <path d="M262 30 q6 -7 12 0 q6 -7 12 0" />
            <path d="M296 48 q5 -6 10 0 q5 -6 10 0" />
          </g>
        </svg>
        <h3>공지 → 캘린더</h3>
        <p>
          학과·교무처 공지를 그대로 붙여 넣으세요.
          <br />
          접수·신청 마감만 집어 .ics 파일로 드려요.
        </p>
      </div>

      <form className="paste" onSubmit={submit}>
        <label htmlFor="notice">공지 본문</label>
        <textarea
          id="notice"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="[인공지능공학부] … 접수 마감 10월 30일(금)"
        />
        <div className="row">
          <button type="button" className="btn-outline" onClick={() => setDraft('')} disabled={!draft}>
            비우기
          </button>
          <button type="submit" className="btn-primary" disabled={!draft.trim()}>
            마감일 캘린더에 넣기
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">최근 공지</div>
          <span className="more">누르면 위에 채워져요</span>
        </div>
        {samples.map((n) => (
          <button key={n.id} type="button" className="feed-tease" onClick={() => setDraft(n.body)}>
            <div className="ft-top">
              <div className="avatar">{n.from.slice(0, 1)}</div>
              <div>
                <b>{n.from}</b> <span className="cap">· {n.posted.slice(5).replace('-', '/')}</span>
              </div>
            </div>
            <p>{n.title}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
