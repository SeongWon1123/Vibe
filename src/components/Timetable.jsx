import { useState } from 'react'
import { CURRICULUM, plannedFor } from '../data/curriculum.js'
import { DAYS, PERIODS, periodLabel } from '../data/standard.js'
import { curriculumCheck, thisSemesterCredits } from '../lib/audit.js'

const COLORS = ['#F7E9E0', '#EAE6F5', '#E3EEE4', '#F6EFD9', '#E4EEF6', '#F1E4EC']

/** 주간 시간표 그리드. 홈에서는 compact, 편집 화면에서는 full. */
export function TimetableGrid({ timetable, compact = false }) {
  const used = PERIODS.filter((p) => timetable.some((c) => p >= c.start && p <= c.end))
  const rows = compact ? PERIODS.slice(Math.max(0, (used[0] || 1) - 1), Math.max(used[used.length - 1] || 4, 4)) : PERIODS
  return (
    <div className={compact ? 'tt compact' : 'tt'}>
      <div className="tt-head">
        <span />
        {DAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      {rows.map((p) => (
        <div key={p} className="tt-row">
          <span className="tt-time">{compact ? p : periodLabel(p)}</span>
          {DAYS.map((d) => {
            const idx = timetable.findIndex((c) => c.day === d && p >= c.start && p <= c.end)
            const c = timetable[idx]
            const first = c && c.start === p
            return (
              <span key={d} className={c ? 'tt-cell on' : 'tt-cell'} style={c ? { background: COLORS[idx % COLORS.length] } : undefined}>
                {first ? c.name : ''}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** 교육과정 대조 결과 카드 (홈·시간표 공용) */
export function CurriculumCard({ profile, onAsk }) {
  const chk = curriculumCheck(profile)
  return (
    <div className="record">
      <div className="cap">교육과정 대조 · {profile.semester} 기준</div>
      {profile.timetable.length === 0 ? (
        <p className="p-note" style={{ padding: '4px 0 0' }}>시간표를 넣으면 전공필수 누락·선수과목·학점 부담을 교육과정표와 대조해 줘요.</p>
      ) : (
        <ul className="lines">
          {chk.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
          <li>{chk.load}</li>
        </ul>
      )}
      {onAsk && profile.timetable.length > 0 && (
        <button type="button" className="more" style={{ marginTop: 8 }} onClick={() => onAsk('내 시간표 교육과정이랑 맞아?')}>
          동학에게 자세히 묻기
        </button>
      )}
    </div>
  )
}

export default function Timetable({ profile, update, onDone }) {
  const [draft, setDraft] = useState({ name: '', credits: 3, day: '월', start: 1, end: 2 })
  const list = profile.timetable
  const planned = thisSemesterCredits(list)
  const suggestions = plannedFor(profile.grade, 2).filter((c) => !list.some((r) => r.name === c.name))

  function add(e) {
    e?.preventDefault()
    const name = draft.name.trim()
    if (!name) return
    const start = Number(draft.start)
    const end = Math.max(start, Number(draft.end))
    const known = CURRICULUM.find((c) => c.name === name)
    update({ timetable: [...list, { name, credits: Number(draft.credits) || known?.credits || 0, day: draft.day, start, end }] })
    setDraft({ ...draft, name: '' })
  }

  function remove(i) {
    update({ timetable: list.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="screen">
      <div className="phead phead-row">
        <div>
          <h1>시간표</h1>
          <p>
            {profile.semester} · {list.length}과목 {planned}학점
          </p>
        </div>
        <button type="button" className="year-pill dark" onClick={onDone}>
          완료
        </button>
      </div>

      <div className="sec" style={{ paddingTop: 12 }}>
        <TimetableGrid timetable={list} />
      </div>

      <form className="paste" onSubmit={add} style={{ paddingTop: 20 }}>
        <label htmlFor="course">과목 추가</label>
        <div className="tt-form">
          <input id="course" className="in" list="curriculum" placeholder="과목명 (교육과정표에서 자동완성)" value={draft.name} onChange={(e) => { const known = CURRICULUM.find((c) => c.name === e.target.value); setDraft({ ...draft, name: e.target.value, credits: known ? known.credits : draft.credits }) }} />
          <datalist id="curriculum">
            {CURRICULUM.map((c) => (
              <option key={c.name} value={c.name} />
            ))}
          </datalist>
          <input className="in sm" type="number" min="0" max="6" aria-label="학점" value={draft.credits} onChange={(e) => setDraft({ ...draft, credits: e.target.value })} />
          <span className="unit">학점</span>
        </div>
        <div className="tt-form">
          <select className="in sm" aria-label="요일" value={draft.day} onChange={(e) => setDraft({ ...draft, day: e.target.value })}>
            {DAYS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
          <select className="in sm" aria-label="시작 교시" value={draft.start} onChange={(e) => setDraft({ ...draft, start: e.target.value })}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}교시({periodLabel(p)})
              </option>
            ))}
          </select>
          <span className="unit">~</span>
          <select className="in sm" aria-label="끝 교시" value={draft.end} onChange={(e) => setDraft({ ...draft, end: e.target.value })}>
            {PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}교시
              </option>
            ))}
          </select>
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} disabled={!draft.name.trim()}>
            추가
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="chips" style={{ marginTop: 10 }}>
            <span className="unit">이 학기 배치 과목:</span>
            {suggestions.map((c) => (
              <button key={c.name} type="button" className="fchip" onClick={() => setDraft({ ...draft, name: c.name, credits: c.credits })}>
                {c.name} · {c.type}
              </button>
            ))}
          </div>
        )}
      </form>

      <div className="sec">
        <CurriculumCard profile={profile} />
      </div>

      <div className="sec">
        <div className="sec-head">
          <div className="sec-title">이번 학기 과목</div>
          <span className="more">홈·상담에 바로 반영돼요</span>
        </div>
        {list.length === 0 && <div className="p-note">아직 과목이 없어요. 위에서 추가하면 여기와 홈에 나타나요.</div>}
        {list.map((c, i) => (
          <div key={`${c.name}-${i}`} className="p-row">
            <span>
              {c.name} <small>· {c.credits}학점 · {c.day} {c.start}~{c.end}교시</small>
            </span>
            <button type="button" className="more" onClick={() => remove(i)} aria-label={`${c.name} 삭제`}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
