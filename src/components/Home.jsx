import { ddayLabel, upcoming, weekOfTerm } from '../data/calendar.js'
import { noticesFor } from '../data/notices.js'
import { PORTFOLIO, nextSteps, quickQuestions } from '../data/standard.js'
import { audit } from '../lib/audit.js'
import Mark from './Mark.jsx'
import Scene from './Scene.jsx'
import { CurriculumCard, TimetableGrid } from './Timetable.jsx'

function greeting(hour, week) {
  if (week === 0) return '방학 잘 보내고 있어?'
  if (hour < 11) return '좋은 아침'
  if (hour < 17) return '오후 수업 잘 듣고 있어?'
  if (hour < 22) return '오늘 하루 어땠어?'
  return '아직 안 자?'
}

function insight(profile) {
  const k = profile.keywords
  const i = profile.interests.filter((x) => x !== '아직 모르겠어')
  if (k.length >= 2) return `요즘 상담에서 ${k.slice(-2).join('·')} 얘기가 자주 나와. 그쪽으로 관심이 모이는 중.`
  if (i.length) return `${i[0]} 쪽 관심으로 시작했어. 상담하면서 더 알아갈게.`
  return '아직 관심 분야를 찾는 중. 상담할수록 동학이 너를 더 잘 알게 돼.'
}

export default function Home({ profile, update, onAsk, onGoChat, onOpenNotice, onEditTimetable, onEditCredits }) {
  const now = new Date()
  const week = weekOfTerm(now)
  const events = upcoming(profile.grade, now, 3)
  const notices = noticesFor(profile.grade, 2)
  const steps = nextSteps(profile)
  const a = audit(profile)
  const dash = 113
  const next = events[0]
  const chips = [...profile.interests.filter((x) => x !== '아직 모르겠어'), ...profile.keywords].slice(0, 6)

  return (
    <div className="screen">
      <div className="hero">
        <Scene variant="hero" />
        <div className="hero-top">
          <Mark glass light />
          <span className="year-pill">{profile.grade}학년 · {profile.goal}</span>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            {profile.semester} · {week === 0 ? '개강 전' : `${week}주차`}
          </div>
          <div className="hero-title">
            {greeting(now.getHours(), week)}
            <br />
            {next ? `${next.title}까지 ${ddayLabel(next.dday)}` : '이번 주도 차근차근'}
          </div>
          <button type="button" className="hero-cta" onClick={onGoChat}>
            동학이랑 얘기하기
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {a.entered ? (
        <div className="ongoing">
          <div className="ring" aria-hidden="true">
            <svg viewBox="0 0 42 42">
              <circle cx="21" cy="21" r="18" fill="none" stroke="#ECE7E1" strokeWidth="3.5" />
              <circle cx="21" cy="21" r="18" fill="none" stroke="#E9C7B4" strokeWidth="3.5" strokeDasharray={dash} strokeDashoffset={dash - dash * a.expectedRatio} strokeLinecap="round" transform="rotate(-90 21 21)" />
              <circle cx="21" cy="21" r="18" fill="none" stroke="var(--dusk)" strokeWidth="3.5" strokeDasharray={dash} strokeDashoffset={dash - dash * a.ratio} strokeLinecap="round" transform="rotate(-90 21 21)" />
            </svg>
            {Math.round(a.ratio * 100)}%
          </div>
          <div>
            <b>
              {profile.credits.total} / {a.grad.total}학점
            </b>
            <div className="meta">
              이번 학기 +{a.planned} → 예상 {a.expected} · 남은 {a.remaining}학점
            </div>
            <div className="rate">
              전공 {profile.credits.major}/{a.grad.major} · 교양 {profile.credits.general}/{a.grad.general} · {String(profile.entryYear).slice(2)}학번 기준
            </div>
          </div>
          <button type="button" className="resume" onClick={() => onAsk('졸업까지 뭐가 남았어?')}>
            자세히
          </button>
        </div>
      ) : (
        <button type="button" className="ongoing" style={{ width: 'calc(100% - 52px)', textAlign: 'left', border: '1px dashed var(--line)', background: '#fff' }} onClick={onEditCredits}>
          <div className="ring" aria-hidden="true">?</div>
          <div>
            <b>이수 학점을 넣어 줘</b>
            <div className="meta">향림통 성적 조회 숫자를 그대로. 졸업까지 남은 학점을 계산해 줄게.</div>
          </div>
          <span className="resume">입력</span>
        </button>
      )}

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">이번 학기 시간표</div>
          <button type="button" className="more" onClick={onEditTimetable}>
            {profile.timetable.length ? '편집' : '입력'}
          </button>
        </div>
        {profile.timetable.length ? (
          <TimetableGrid timetable={profile.timetable} compact />
        ) : (
          <button type="button" className="feed-tease" onClick={onEditTimetable}>
            <p>시간표를 넣으면 교육과정과 대조해서 피드백해 줘요</p>
          </button>
        )}
        <div style={{ marginTop: 10 }}>
          <CurriculumCard profile={profile} onAsk={onAsk} />
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">동학이 파악한 나</div>
        </div>
        <div className="record">
          <div className="chips" style={{ marginBottom: 8 }}>
            {chips.length ? chips.map((c) => (
              <span key={c} className="chip warn">
                {c}
              </span>
            )) : <span className="chip">아직 탐색 중</span>}
          </div>
          <b style={{ marginBottom: 0, fontWeight: 500, color: '#4a433e' }}>{insight(profile)}</b>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">다음 한 걸음</div>
          <button type="button" className="more" onClick={() => onAsk('이번 학기에 뭘 해야 할까?')}>
            동학에게 묻기
          </button>
        </div>
        <div className="spots">
          {steps.map((s, index) => (
            <button key={s.title} type="button" className="spot" onClick={() => onAsk(s.ask)}>
              <div className={index === 0 ? 'thumb late' : 'thumb'}>
                <span className="when">{s.when}</span>
                <span className="big">{s.title}</span>
              </div>
              <div className="cap">{s.detail}</div>
            </button>
          ))}
        </div>
      </div>

      {profile.grade === 4 && (
        <div className="sec">
          <div className="sec-head">
            <div className="sec-title">포트폴리오 체크</div>
            <span className="more">
              {profile.portfolio.length}/{PORTFOLIO.length}
            </span>
          </div>
          <div className="record">
            {PORTFOLIO.map((item) => {
              const on = profile.portfolio.includes(item.id)
              return (
                <label key={item.id} className="check">
                  <input type="checkbox" checked={on} onChange={() => update({ portfolio: on ? profile.portfolio.filter((x) => x !== item.id) : [...profile.portfolio, item.id] })} />
                  <span className={on ? 'done' : ''}>{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">다가오는 일정</div>
          <span className="more">학사일정 기준</span>
        </div>
        <ul className="agenda">
          {events.map((e) => (
            <li key={e.title} className="agenda-row">
              <span className={e.dday <= 7 && e.dday >= 0 ? 'dday hot' : 'dday'}>{ddayLabel(e.dday)}</span>
              <span className="agenda-title">{e.title}</span>
              <span className="agenda-date">
                {e.date.slice(5).replace('-', '/')} · {e.kind}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {notices.length > 0 && (
        <div className="sec">
          <div className="sec-head">
            <div className="sec-title">학과 공지</div>
            <span className="more">누르면 마감일을 캘린더로</span>
          </div>
          {notices.map((n) => (
            <button key={n.id} type="button" className="feed-tease" onClick={() => onOpenNotice(n.body)}>
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
      )}

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">자주 묻는 질문</div>
        </div>
        <div className="chips">
          {quickQuestions(profile.grade).map((q) => (
            <button key={q} type="button" className="fchip" onClick={() => onAsk(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
