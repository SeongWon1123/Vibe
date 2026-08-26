import { useState } from 'react'
import { ENTRY_YEARS } from '../data/curriculum.js'
import { GOALS, INTERESTS, gradOf } from '../data/standard.js'
import { MODES } from '../lib/urgency.js'

const STEPS = ['학년', '관심', '목표', '학점', '말투']

function Arrow() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  )
}

function n(v) {
  const x = Number(v)
  return Number.isFinite(x) && x >= 0 ? Math.min(200, Math.round(x)) : 0
}

export default function Onboarding({ profile, setGrade, setEntryYear, update, onDone, onBack }) {
  const [step, setStep] = useState(0)
  const [credits, setCredits] = useState({
    total: profile.credits.total || '',
    major: profile.credits.major || '',
    general: profile.credits.general || '',
  })
  const last = step === STEPS.length - 1
  const grad = gradOf(profile)

  function commit() {
    update({ credits: { total: n(credits.total), major: n(credits.major), general: n(credits.general) }, onboarded: true })
  }

  function next() {
    if (last) {
      commit()
      onDone(true)
      return
    }
    setStep(step + 1)
  }

  function toggleInterest(item) {
    const has = profile.interests.includes(item)
    let list = has ? profile.interests.filter((x) => x !== item) : [...profile.interests, item]
    if (item === '아직 모르겠어' && !has) list = ['아직 모르겠어']
    else list = list.filter((x) => x !== '아직 모르겠어')
    update({ interests: list })
  }

  return (
    <div className="screen bare">
      <div className="wiz-top">
        <button type="button" className="back" aria-label="뒤로" onClick={() => (step === 0 ? onBack() : setStep(step - 1))}>
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="wiz-track">
          <div className="wiz-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="wiz-step">
          {step + 1}/{STEPS.length}
        </div>
      </div>
      <div className="wiz-brand">동학 · {STEPS[step]}</div>

      {step === 0 && (
        <>
          <div className="wiz-q">지금 몇 학년이야?</div>
          <div className="wiz-opts" role="radiogroup">
            {[1, 2, 3, 4].map((g) => (
              <button key={g} type="button" role="radio" aria-checked={profile.grade === g} className={profile.grade === g ? 'wopt on' : 'wopt'} style={{ minHeight: 0 }} onClick={() => setGrade(g)}>
                <span className="grade">{g}학년</span>
                <span className="cap">{g === 1 ? '관심 분야 찾는 해' : g === 2 ? '트랙 정하는 해' : g === 3 ? '자격증·인턴 준비' : '포트폴리오·취업'}</span>
              </button>
            ))}
          </div>
          <div className="wiz-q" style={{ fontSize: 17, paddingTop: 22 }}>입학년도(학번)는?</div>
          <div className="chips" style={{ padding: '12px 26px 0' }} role="radiogroup" aria-label="입학년도">
            {ENTRY_YEARS.map((y) => (
              <button key={y} type="button" role="radio" aria-checked={profile.entryYear === y} className={profile.entryYear === y ? 'fchip on' : 'fchip'} onClick={() => setEntryYear(y)}>
                {String(y).slice(2)}학번
              </button>
            ))}
          </div>
          <div className="wiz-note">
            {profile.entryYear}학년도 {gradOf(profile) ? `교육과정 기준 — 졸업 ${grad.total}학점 · 전공 ${grad.major} · 교양 ${grad.general}` : ''}
            <br />
            휴학이 있으면 학번을 직접 골라 줘.
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="wiz-q">요즘 관심 가는 건?</div>
          <div className="wiz-opts" role="group">
            {INTERESTS.map((item) => {
              const on = profile.interests.includes(item)
              return (
                <button key={item} type="button" aria-pressed={on} className={on ? 'wopt on' : 'wopt'} style={{ minHeight: 0 }} onClick={() => toggleInterest(item)}>
                  <span className="who">{item}</span>
                </button>
              )
            })}
          </div>
          <div className="wiz-note">여러 개 골라도 돼. 상담하면서 바뀌면 동학이 알아서 따라가.</div>
        </>
      )}

      {step === 2 && (
        <>
          <div className="wiz-q">졸업하고 나면?</div>
          <div className="wiz-opts" role="radiogroup">
            {GOALS.map((g) => (
              <button key={g} type="button" role="radio" aria-checked={profile.goal === g} className={profile.goal === g ? 'wopt on' : 'wopt'} style={{ minHeight: 0 }} onClick={() => update({ goal: g })}>
                <span className="who">{g}</span>
              </button>
            ))}
          </div>
          <div className="wiz-note">아직 없어도 괜찮아. 1~2학년은 원래 그래.</div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="wiz-q">지금까지 이수한 학점은?</div>
          <div className="fields">
            <Field label={`총 이수학점 (졸업 ${grad.total})`} value={credits.total} onChange={(v) => setCredits({ ...credits, total: v })} />
            <Field label={`전공 (${grad.major} 이상 · 필수 ${grad.majorRequired} + 선택 ${grad.majorElective})`} value={credits.major} onChange={(v) => setCredits({ ...credits, major: v })} />
            <Field label={`교양 (${grad.general}${grad.generalMax !== grad.general ? `~${grad.generalMax}` : ''})`} value={credits.general} onChange={(v) => setCredits({ ...credits, general: v })} />
          </div>
          <div className="wiz-note">향림통 성적 조회의 숫자를 그대로 적으면 돼. 모르면 비워 두고 나중에 내 정보에서 넣어도 돼.</div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="wiz-q">동학이 어떤 사이면 좋겠어?</div>
          <div className="wiz-opts" role="radiogroup" style={{ gridTemplateColumns: '1fr' }}>
            {Object.values(MODES).map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={profile.mode === m.id} className={profile.mode === m.id ? 'wopt on' : 'wopt'} style={{ minHeight: 0 }} onClick={() => update({ mode: m.id })}>
                <span className="who" style={{ fontSize: 16 }}>{m.label}</span>
                <span className="cap">{m.desc}</span>
              </button>
            ))}
          </div>
          <div className="wiz-note">다음 화면에서 이번 학기 시간표를 넣으면 {profile.entryYear}학번 교육과정과 대조해 피드백해 줘.</div>
        </>
      )}

      <div className="wiz-bottom">
        <button type="button" className="btn-primary" onClick={next} disabled={step === 1 && profile.interests.length === 0}>
          {last ? '시간표 넣으러 가기' : '다음'}
          <Arrow />
        </button>
        {last && (
          <button type="button" className="btn-outline" style={{ width: '100%', marginTop: 8 }} onClick={() => { commit(); onDone(false) }}>
            시간표는 나중에
          </button>
        )}
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
