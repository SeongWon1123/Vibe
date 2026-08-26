import { QUICK } from '../hooks/useChat.js'
import { ddayLabel, upcoming, weekOfTerm } from '../data/calendar.js'
import { noticesFor } from '../data/notices.js'
import { callName, urgency } from '../lib/urgency.js'
import Mark from './Mark.jsx'
import Scene from './Scene.jsx'

const GRAD_CREDITS = 130

function greeting(name, hour, week) {
  if (week === 0) return `${name}아, 방학 잘 보내고 있어?`
  if (hour < 11) return `${name}아, 좋은 아침`
  if (hour < 17) return `${name}아, 오후 수업 잘 듣고 있어?`
  if (hour < 22) return `${name}아, 오늘 하루 어땠어?`
  return `${name}아, 아직 안 자?`
}

export default function Home({ persona, onAsk, onGoChat, onOpenNotice, onChangeYear }) {
  const name = callName(persona)
  const { profile } = persona
  const audit = profile.gradAudit
  const now = new Date()
  const week = weekOfTerm(now)
  const events = upcoming(profile.grade, now, 3)
  const notices = noticesFor(profile.grade, 2)
  const jobs = urgency(persona)
  const missing = audit?.missing ?? []
  const ratio = audit ? Math.min(1, audit.totalCredits / GRAD_CREDITS) : 0
  const dash = 113
  const next = events[0]

  return (
    <div className="screen">
      <div className="hero">
        <Scene variant="hero" />
        <div className="hero-top">
          <Mark glass light />
          <button type="button" className="year-pill" onClick={onChangeYear}>
            {profile.grade}학년 · 바꾸기
          </button>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            {profile.semester} · {week === 0 ? '개강 전' : `${week}주차`}
          </div>
          <div className="hero-title">
            {greeting(name, now.getHours(), week)}
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

      <div className="ongoing">
        <div className="ring" aria-hidden="true">
          <svg viewBox="0 0 42 42">
            <circle cx="21" cy="21" r="18" fill="none" stroke="#ECE7E1" strokeWidth="3.5" />
            <circle
              cx="21"
              cy="21"
              r="18"
              fill="none"
              stroke="var(--dusk)"
              strokeWidth="3.5"
              strokeDasharray={dash}
              strokeDashoffset={dash - dash * ratio}
              strokeLinecap="round"
              transform="rotate(-90 21 21)"
            />
          </svg>
          {audit ? `${Math.round(ratio * 100)}%` : `${profile.grade}학년`}
        </div>
        <div>
          <b>{audit ? `졸업까지 ${audit.totalCredits} / ${GRAD_CREDITS}학점` : '졸업사정은 아직'}</b>
          <div className="meta">
            {audit
              ? missing.length
                ? `남은 요건 ${missing.length}개 · ${missing[0]}`
                : '남은 요건 없음'
              : '지금은 기초 과목만 잘 챙기면 돼요'}
          </div>
          <div className="rate">
            <i>★</i> 이수 {profile.completedCourses.length}과목 · 이번 학기 {profile.currentCourses.length}과목
          </div>
        </div>
        <button type="button" className="resume" onClick={() => onAsk('졸업까지 뭐가 남았어?')}>
          자세히
        </button>
      </div>

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

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">이번 학기 체크</div>
          <button type="button" className="more" onClick={() => onAsk('이번 학기에 뭘 해야 할까?')}>
            동학에게 묻기
          </button>
        </div>
        <div className="spots">
          {jobs.map((job, index) => (
            <button key={job.title} type="button" className="spot" onClick={() => onAsk(job.ask)}>
              <div className={index === 0 ? 'thumb late' : 'thumb'}>
                <span className="when">{job.when}</span>
                <span className="big">{job.title}</span>
              </div>
              <div className="cap">{job.detail}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">이번 학기 듣는 과목</div>
        </div>
        <div className="record">
          <div className="cap">{profile.semester} 수강 신청 기준</div>
          <div className="chips">
            {profile.currentCourses.map((course) => (
              <span key={course} className="chip">
                {course}
              </span>
            ))}
          </div>
          {missing.length > 0 && (
            <>
              <div className="cap" style={{ marginTop: 12 }}>
                졸업사정에서 아직 안 닫힌 것
              </div>
              <div className="chips">
                {missing.map((item) => (
                  <span key={item} className="chip warn">
                    {item}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
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
          {QUICK.map((item) => (
            <button key={item.send} type="button" className="fchip" onClick={() => onAsk(item.send)}>
              {item.send}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
