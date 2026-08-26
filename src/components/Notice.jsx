import { useState } from 'react'

export const DEMO_NOTICE = `[교무처] 2026학년도 2학기 공인영어성적 제출 안내
졸업예정자는 토익 성적표를 9월 25일(금)까지 제출해야 합니다.
다음 토익 정기시험: 2026년 9월 12일(토) 오전 9시, 접수 마감 9월 1일(화)`

export default function Notice({ onNotice }) {
  const [text, setText] = useState('')

  function submit(event) {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    onNotice(`${body}\n\n접수 마감일 저장해줘`)
    setText('')
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
          학과 공지를 그대로 붙여 넣으세요.
          <br />
          접수 마감만 집어 .ics 파일로 드려요.
        </p>
      </div>

      <form className="paste" onSubmit={submit}>
        <label htmlFor="notice">공지 본문</label>
        <textarea
          id="notice"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="[교무처] … 접수 마감 9월 1일(화)"
        />
        <div className="row">
          <button type="button" className="btn-outline" onClick={() => setText(DEMO_NOTICE)}>
            예시 공지 넣기
          </button>
          <button type="submit" className="btn-primary" disabled={!text.trim()}>
            마감일 넣기
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </div>
      </form>

      <div className="steps">
        <div className="step">
          <div className="stat-dot">1</div>
          <div>
            <b>붙여 넣기</b>
            <p>교무처·학과 공지를 통째로. 날짜가 여러 개여도 돼요.</p>
          </div>
        </div>
        <div className="step">
          <div className="stat-dot">2</div>
          <div>
            <b>동학이 접수 마감을 집어요</b>
            <p>상담 탭에 일정 카드가 생겨요. 시험일이 아니라 접수 마감이 기준이에요.</p>
          </div>
        </div>
        <div className="step">
          <div className="stat-dot">3</div>
          <div>
            <b>캘린더에 넣기</b>
            <p>.ics를 열면 폰·PC 캘린더에 바로 등록돼요. 하루 전 알림이 붙어 있어요.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
