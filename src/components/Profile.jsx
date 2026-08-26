import { useState } from 'react'
import { ENTRY_YEARS } from '../data/curriculum.js'
import { GOALS, INTERESTS, gradOf } from '../data/standard.js'
import { audit } from '../lib/audit.js'
import { MODES } from '../lib/urgency.js'

export default function Profile({ profile, update, setGrade, setEntryYear, onChangeMode, onEditTimetable, onReset, startEditing = false }) {
  const a = audit(profile)
  const grad = gradOf(profile)
  const [editing, setEditing] = useState(startEditing || !a.entered)
  const [credits, setCredits] = useState({
    total: profile.credits.total || '',
    major: profile.credits.major || '',
    general: profile.credits.general || '',
  })

  function saveCredits() {
    const n = (v) => Math.max(0, Math.min(200, Math.round(Number(v) || 0)))
    update({ credits: { total: n(credits.total), major: n(credits.major), general: n(credits.general) } })
    setEditing(false)
  }

  function toggleInterest(item) {
    const has = profile.interests.includes(item)
    let list = has ? profile.interests.filter((x) => x !== item) : [...profile.interests, item]
    if (item === '아직 모르겠어' && !has) list = ['아직 모르겠어']
    else list = list.filter((x) => x !== '아직 모르겠어')
    update({ interests: list })
  }

  return (
    <div className="screen">
      <div className="p-head">
        <div className="p-avatar">{profile.grade}</div>
        <b>{profile.semester}</b>
        <div className="cap">인공지능공학부 · {String(profile.entryYear).slice(2)}학번 · {profile.goal}</div>
      </div>
      <div className="p-stats">
        <div className="p-stat">
          <b>{a.entered ? profile.credits.total : '—'}</b>
          <div className="cap">이수 학점</div>
        </div>
        <div className="p-stat">
          <b>+{a.planned}</b>
          <div className="cap">이번 학기</div>
        </div>
        <div className="p-stat">
          <b>{a.entered ? a.remaining : '—'}</b>
          <div className="cap">졸업까지</div>
        </div>
      </div>

      <div className="p-menu">
        <div className="p-group">학점 관리 · {profile.entryYear}학년도 교육과정 기준</div>
        {editing ? (
          <div className="fields" style={{ padding: '4px 0 8px' }}>
            <Field label={`총 이수학점 / ${grad.total}`} value={credits.total} onChange={(v) => setCredits({ ...credits, total: v })} />
            <Field label={`전공 / ${grad.major} (필수 ${grad.majorRequired} + 선택 ${grad.majorElective})`} value={credits.major} onChange={(v) => setCredits({ ...credits, major: v })} />
            <Field label={`교양 / ${grad.general}${grad.generalMax !== grad.general ? `~${grad.generalMax}` : ''}`} value={credits.general} onChange={(v) => setCredits({ ...credits, general: v })} />
            <div className="row" style={{ display: 'flex', gap: 8 }}>
              {a.entered && (
                <button type="button" className="btn-outline" onClick={() => setEditing(false)}>취소</button>
              )}
              <button type="button" className="btn-primary" style={{ flex: 1.4, padding: 12 }} onClick={saveCredits}>저장</button>
            </div>
            <div className="p-note" style={{ paddingTop: 0 }}>향림통 성적 조회의 숫자를 그대로 적어. 학점은 네가 넣은 값만 써.</div>
          </div>
        ) : (
          <>
            <Bar label="총 이수" value={profile.credits.total} max={grad.total} extra={a.planned} />
            <Bar label="전공" value={profile.credits.major} max={grad.major} />
            <Bar label="교양" value={profile.credits.general} max={grad.general} />
            <button type="button" className="p-row" onClick={() => { setCredits({ total: profile.credits.total || '', major: profile.credits.major || '', general: profile.credits.general || '' }); setEditing(true) }}>
              <span>학점 수정</span>
              <small>향림통 성적 기준</small>
            </button>
          </>
        )}
        <button type="button" className="p-row" onClick={onEditTimetable}>
          <span>시간표 편집</span>
          <small>{profile.timetable.length}과목 · {a.planned}학점</small>
        </button>
        {a.entered && a.missing.length > 0 && (
          <div className="why">
            <div className="cap">졸업까지 남은 것</div>
            {a.missing.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        )}

        <div className="p-group">관심 · 목표</div>
        <div className="chips" style={{ padding: '4px 0 6px' }}>
          {INTERESTS.map((item) => (
            <button key={item} type="button" className={profile.interests.includes(item) ? 'fchip on' : 'fchip'} onClick={() => toggleInterest(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="chips" style={{ padding: '4px 0 6px' }}>
          {GOALS.map((g) => (
            <button key={g} type="button" className={profile.goal === g ? 'fchip on' : 'fchip'} onClick={() => update({ goal: g })}>
              {g}
            </button>
          ))}
        </div>
        {profile.keywords.length > 0 && (
          <div className="why">
            <div className="cap">상담에서 드러난 관심</div>
            <p>{profile.keywords.join(' · ')}</p>
          </div>
        )}

        <div className="p-group">동학 설정</div>
        <div className="seg wide" role="radiogroup" aria-label="말투">
          {Object.values(MODES).map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={profile.mode === m.id} className={profile.mode === m.id ? 'on' : ''} onClick={() => onChangeMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="p-row">
          <span>학년</span>
          <div className="seg">
            {[1, 2, 3, 4].map((g) => (
              <button key={g} type="button" className={profile.grade === g ? 'on' : ''} onClick={() => setGrade(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="p-row" style={{ alignItems: 'flex-start' }}>
          <span style={{ paddingTop: 6 }}>학번</span>
          <div className="chips" style={{ justifyContent: 'flex-end' }}>
            {ENTRY_YEARS.map((y) => (
              <button key={y} type="button" className={profile.entryYear === y ? 'fchip on' : 'fchip'} style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setEntryYear(y)}>
                {String(y).slice(2)}
              </button>
            ))}
          </div>
        </div>
        <div className="p-note" style={{ paddingTop: 4 }}>학년·학번을 바꿔도 학점·시간표는 그대로예요. 교육과정 대조와 졸업기준만 그 학번 것으로 바뀌고, 학년을 바꾸면 대화는 새로 시작돼요.</div>
        <button type="button" className="p-row" onClick={onReset}>
          <span style={{ color: 'var(--dusk-deep)' }}>처음부터 다시 설정</span>
        </button>

        <div className="p-group">안내</div>
        <div className="p-note">
          입력한 정보는 이 기기 브라우저에만 저장돼요. 교육과정표와 졸업기준은 국립순천대학교 2021~2026학년도 교육과정에서 가져왔고, 학사일정·공지는 샘플이에요. 동학은 인공지능공학부 학생이 만든 바이브코딩 경진대회 출품작이며, 답변은 참고용이고 최종 확인은 학과 사무실에서 해주세요.
        </div>
      </div>
    </div>
  )
}

function Bar({ label, value, max, extra = 0 }) {
  const pct = Math.min(100, (value / max) * 100)
  const pct2 = Math.min(100, ((value + extra) / max) * 100)
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span>{label}</span>
        <span>
          {value}
          {extra ? <small> +{extra}</small> : null} / {max}
        </span>
      </div>
      <div className="bar-track">
        {extra ? <div className="bar-fill ghost" style={{ width: `${pct2}%` }} /> : null}
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type="number" inputMode="numeric" min="0" max="200" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
