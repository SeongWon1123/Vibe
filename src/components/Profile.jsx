import { MODES, callName } from '../lib/urgency.js'

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export default function Profile({ persona, mode, onChangeMode, onChangeYear, onGoIntro }) {
  const name = callName(persona)
  const { profile } = persona
  const audit = profile.gradAudit
  const goal = profile.goal === '미정' ? '진로 고민 중' : profile.goal

  return (
    <div className="screen">
      <div className="p-head">
        <div className="p-avatar">{name.slice(0, 1)}</div>
        <b>{persona.label}</b>
        <div className="cap">
          인공지능공학부 · {profile.semester} · {goal}
        </div>
      </div>
      <div className="p-stats">
        <div className="p-stat">
          <b>{audit ? audit.totalCredits : '—'}</b>
          <div className="cap">이수 학점</div>
        </div>
        <div className="p-stat">
          <b>{profile.completedCourses.length}</b>
          <div className="cap">이수 과목</div>
        </div>
        <div className="p-stat">
          <b>{audit ? audit.missing.length : '—'}</b>
          <div className="cap">남은 요건</div>
        </div>
      </div>

      <div className="p-menu">
        <div className="p-group">동학 설정</div>
        <div className="seg wide" role="radiogroup" aria-label="말투">
          {Object.values(MODES).map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={mode === m.id}
              className={mode === m.id ? 'on' : ''}
              onClick={() => onChangeMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="p-note" style={{ paddingTop: 8 }}>
          {MODES[mode]?.desc}
        </div>
        <button type="button" className="p-row" onClick={onChangeYear}>
          <span>학년 바꾸기</span>
          <small>{profile.grade}학년</small>
        </button>
        <button type="button" className="p-row" onClick={onGoIntro}>
          <span>처음 화면으로</span>
          <Chevron />
        </button>

        <div className="p-group">관심 · 목표</div>
        <div className="why">
          <div className="cap">동학이 답할 때 보는 것</div>
          {profile.interests.map((item) => (
            <p key={item}>{item}</p>
          ))}
          <p>목표: {goal}</p>
        </div>

        <div className="p-group">이수 과목 {profile.completedCourses.length}</div>
        <div className="chips" style={{ padding: '4px 0 8px' }}>
          {profile.completedCourses.map((course) => (
            <span key={course} className="chip">
              {course}
            </span>
          ))}
        </div>

        <div className="p-group">안내</div>
        <div className="p-row">
          <span>데이터</span>
          <small>가상 학생 · 샘플 교육과정</small>
        </div>
        <div className="p-row">
          <span>모델</span>
          <small>OpenAI 호환 LLM · 서버 프록시</small>
        </div>
        <div className="p-note">
          동학은 국립순천대학교 인공지능공학부 학생이 만든 바이브코딩 경진대회 출품작이에요. 데모는 가상
          학생 데이터를 쓰며, 실서비스에는 본인 인증과 학사시스템 연동이 필요해요. 답변은 참고용이고
          최종 확인은 학과 사무실에서 해주세요.
        </div>
      </div>
    </div>
  )
}
