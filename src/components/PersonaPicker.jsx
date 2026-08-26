import { useState } from 'react'
import { MODES, callName } from '../lib/urgency.js'

export default function PersonaPicker({ personas, selectedId, mode, onPick, onBack }) {
  const [step, setStep] = useState(1)
  const [choice, setChoice] = useState(selectedId)
  const [tone, setTone] = useState(mode)
  const name = callName(personas[0])

  return (
    <div className="screen bare">
      <div className="wiz-top">
        <button
          type="button"
          className="back"
          aria-label="뒤로"
          onClick={() => (step === 2 ? setStep(1) : onBack?.())}
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="wiz-track">
          <div className="wiz-fill" style={{ width: step === 1 ? '50%' : '100%' }} />
        </div>
        <div className="wiz-step">{step}/2</div>
      </div>

      {step === 1 ? (
        <>
          <div className="wiz-brand">동학 · 그때의 나</div>
          <div className="wiz-q">몇 학년의 {name}이를 볼까?</div>
          <div className="wiz-opts" role="radiogroup" aria-label="학년">
            {personas.map((persona) => {
              const on = persona.id === choice
              const audit = persona.profile.gradAudit
              return (
                <button
                  key={persona.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={on ? 'wopt on' : 'wopt'}
                  onClick={() => setChoice(persona.id)}
                >
                  <span className="grade">{persona.profile.grade}학년</span>
                  <span className="who">{persona.profile.semester}</span>
                  <span className="cap">
                    {persona.profile.goal === '미정' ? '진로 고민 중' : persona.profile.goal}
                    <br />
                    {audit ? `${audit.totalCredits}학점 · 남은 요건 ${audit.missing.length}` : '졸업사정 전'}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="wiz-bottom">
            <button type="button" className="btn-primary" onClick={() => setStep(2)}>
              다음
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="wiz-note">
            같은 학생 {personas[0].label}의 1~4학년이에요. 이름은 그대로, 학기·학점·목표만 달라져요.
          </div>
        </>
      ) : (
        <>
          <div className="wiz-brand">동학 · 말투</div>
          <div className="wiz-q">동학이 어떤 사이면 좋겠어?</div>
          <div className="wiz-opts" role="radiogroup" aria-label="동학 모드" style={{ gridTemplateColumns: '1fr' }}>
            {Object.values(MODES).map((m) => {
              const on = m.id === tone
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  className={on ? 'wopt on' : 'wopt'}
                  style={{ minHeight: 0 }}
                  onClick={() => setTone(m.id)}
                >
                  <span className="who" style={{ fontSize: 16 }}>
                    {m.label}
                  </span>
                  <span className="cap">{m.desc}</span>
                  <span className="cap" style={{ marginTop: 6, fontStyle: 'italic' }}>
                    {m.id === 'senior'
                      ? `"${name}아, 이번 학기는 이거 먼저 챙기면 돼."`
                      : `"${name}, 우리 이번 학기 이렇게 가자."`}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="wiz-bottom">
            <button type="button" className="btn-primary" onClick={() => onPick(choice, tone)}>
              이렇게 시작
              <svg viewBox="0 0 24 24">
                <path d="M5 12h14m-7-7 7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="wiz-note">말투는 상담 화면 위에서 언제든 바꿀 수 있어요.</div>
        </>
      )}
    </div>
  )
}
