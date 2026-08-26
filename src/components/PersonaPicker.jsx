import { useState } from 'react'
import { studentName } from '../lib/urgency.js'

export default function PersonaPicker({ personas, selectedId, onPick, onBack }) {
  const [choice, setChoice] = useState(selectedId)

  return (
    <div className="screen bare">
      <div className="wiz-top">
        {onBack && (
          <button type="button" className="back" aria-label="뒤로" onClick={onBack}>
            <svg viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="wiz-track">
          <div className="wiz-fill" style={{ width: '100%' }} />
        </div>
        <div className="wiz-step">1/1</div>
      </div>
      <div className="wiz-brand">동학 · 그때의 나</div>
      <div className="wiz-q">몇 학년의 나를 볼까?</div>
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
                {persona.profile.goal === '미정' ? '진로 미정' : persona.profile.goal}
                <br />
                {audit ? `${audit.totalCredits}학점 · 빈칸 ${audit.missing.length}` : '졸업사정 전'}
              </span>
            </button>
          )
        })}
      </div>
      <div className="wiz-bottom">
        <button type="button" className="btn-primary" onClick={() => onPick(choice)}>
          이 학년으로 시작
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="wiz-note">
        같은 학생 {studentName(personas[0])}의 1~4학년이에요. 이름은 그대로, 학기·학점·목표만 달라져요.
        <br />
        학년을 바꾸면 대화가 처음부터 다시 시작돼요.
      </div>
    </div>
  )
}
