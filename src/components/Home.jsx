import { QUICK } from '../hooks/useChat.js'
import { studentName, urgency } from '../lib/urgency.js'
import Mark from './Mark.jsx'
import Scene from './Scene.jsx'

const GRAD_CREDITS = 130

export default function Home({ persona, onAsk, onGoChat, onChangeYear }) {
  const name = studentName(persona)
  const audit = persona.profile.gradAudit
  const goal = persona.profile.goal === '미정' ? '진로 미정' : persona.profile.goal
  const jobs = urgency(persona)
  const missing = audit?.missing ?? []
  const ratio = audit ? Math.min(1, audit.totalCredits / GRAD_CREDITS) : 0
  const dash = 113
  const first = jobs[0]

  return (
    <div className="screen">
      <div className="hero">
        <Scene variant="hero" />
        <div className="hero-top">
          <Mark glass light />
          <button type="button" className="year-pill" onClick={onChangeYear}>
            {persona.profile.grade}학년 · 바꾸기
          </button>
        </div>
        <div className="hero-content">
          <div className="hero-eyebrow">
            {name}의 {persona.profile.grade}학년 · {persona.profile.semester} · {goal}
          </div>
          <div className="hero-title">
            {name}, 이번 학기
            <br />
            먼저 닫을 건 {first ? first.title : '이거'}야
          </div>
          <button type="button" className="hero-cta" onClick={onGoChat}>
            동학에게 물어보기
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
          {audit ? `${Math.round(ratio * 100)}%` : '—'}
        </div>
        <div>
          <b>{audit ? `졸업까지 ${audit.totalCredits} / ${GRAD_CREDITS}학점` : '졸업사정 전'}</b>
          <div className="meta">
            {audit
              ? missing.length
                ? `빈칸 ${missing.length}개 · ${missing[0]}`
                : '빈칸 없음'
              : '지금은 기초 과목이 먼저예요'}
          </div>
          <div className="rate">
            <i>★</i> 이수 {persona.profile.completedCourses.length}과목
          </div>
        </div>
        <button type="button" className="resume" onClick={() => onAsk('졸업까지 뭐가 남았어?')}>
          자세히
        </button>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">지금 급한 것</div>
          <button type="button" className="more" onClick={() => onAsk('이번 학기에 뭘 해야 할까?')}>
            왜 급한지 묻기
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
          <div className="sec-title">장부에 남은 것</div>
        </div>
        <div className="record">
          <div className="cap">{audit ? '졸업사정 기준' : '1학년은 졸업사정 대상이 아니에요'}</div>
          <b>{audit ? (missing.length ? '아직 안 닫힌 요건' : '모든 요건 충족') : '올해는 기초 과목을 쌓는 해'}</b>
          <div className="chips">
            {(audit ? missing : ['자료구조입문', '이산수학', '교양 영역 열기']).map((item) => (
              <span key={item} className={audit ? 'chip warn' : 'chip'}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">바로 물어보기</div>
          <button type="button" className="more" onClick={onGoChat}>
            상담 열기
          </button>
        </div>
        {QUICK.map((item) => (
          <button key={item.send} type="button" className="feed-tease" onClick={() => onAsk(item.send)}>
            <div className="ft-top">
              <div className="avatar">{name.slice(0, 1)}</div>
              <div>
                <b>{name}</b> <span className="cap">· {persona.profile.grade}학년의 내가 자주 묻는 질문</span>
              </div>
            </div>
            <p>{item.send}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
