import { useRef, useState } from 'react'
import { KNOWLEDGE } from '../data/knowledge.js'
import { eventFromNotice, icsLine } from '../lib/notice.js'
import { localAdvice, openingNote } from '../lib/urgency.js'
import { audit } from '../lib/audit.js'
import { parseIcsPayload } from '../lib/ics.js'

const TONE = {
  senior: `[말투] 같은 학과를 먼저 졸업한 선배. 다정한 반말. 이름은 부르지 않는다. 잔소리 대신 이유를 한 줄 붙인다.`,
  mate: `[말투] 같은 학기를 함께 굴리는 동기 친구. 편한 반말, "우리", "같이", "~하자". 이모지는 쓰지 않는다.`,
}

export function buildSystemPrompt(profile, mode = 'senior') {
  const a = audit(profile)
  const summary = {
    학년: profile.grade,
    학기: profile.semester,
    관심분야: profile.interests,
    목표: profile.goal,
    상담에서_드러난_관심키워드: profile.keywords,
    이수학점: profile.credits,
    이번학기_시간표: profile.timetable.map((c) => `${c.name} ${c.credits}학점 (${c.day} ${c.start}~${c.end}교시)`),
    이번학기_신청학점: a.planned,
    예상누적학점: a.expected,
    졸업까지_남은것: a.missing,
  }
  return `당신은 '동학(同學)'입니다. 국립순천대학교 인공지능공학부 학생의 1학년부터 4학년까지 옆에서 성향과 관심을 알아가며 다음 한 걸음을 알려주는 AI 학사 메이트입니다.

${TONE[mode] || TONE.senior}

[학생 프로필 — 학생이 직접 입력한 값]
${JSON.stringify(summary, null, 2)}

[학사 지식베이스]
${KNOWLEDGE}

[응답 규칙 — 가장 중요]
1. **물어본 것에만 답한다.** 묻지 않은 졸업요건·다른 과목·일반적 조언을 덧붙이지 않는다. 마무리 인사·"추가로 궁금한 점" 같은 말도 쓰지 않는다.
2. 프로필(시간표·학점·관심·목표)을 근거로 구체적으로. 프로필에 없는 이수 과목을 지어내지 않는다.
3. 1~2학년에게는 관심 분야를 넓히는 방향, 3~4학년에게는 자격증·인턴·포트폴리오·취업/대학원 준비 방향으로 답한다.
4. 졸업요건은 물어볼 때만, 위 프로필의 학점 숫자를 그대로 써서 계산한다. 공인영어성적은 졸업 필수 요건이 아니다.
5. 공지를 붙여넣고 저장/캘린더를 말하면 접수·신청·제출 마감일 기준으로 마지막 줄에만:
   [ICS]{"title":"행사명","date":"YYYY-MM-DD","time":"HH:MM","location":"장소"}[/ICS]
6. 한국어, 150~250자. 목록이 필요할 때만 마크다운 목록. 모르면 지어내지 말고 학과 사무실 확인을 권한다.`
}

export function isPastedNotice(content) {
  return content.includes('마감일 저장해줘') || content.length > 220
}

function attachLocalEvent(reply, userText) {
  const local = eventFromNotice(userText)
  if (!local) return reply
  const parsed = parseIcsPayload(reply)
  if (parsed.event?.date === local.date) return reply
  const body = parsed.text?.trim() || reply
  return `${body}\n\n${icsLine(local)}`
}

function fallbackReply(profile, content) {
  const event = eventFromNotice(content)
  if (event) {
    return `이 공지에서 마감일만 집었어. 캘린더에 넣어 두면 하루 전에 알림이 가.

${icsLine(event)}`
  }
  return localAdvice(profile, content) || `그건 내가 가진 자료엔 없어. 학과 사무실에 물어보는 게 정확해.`
}

/** 대화 상태. profile/mode는 최신 값을 ref로 본다. */
export function useChat(profile, mode, onLearn) {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: openingNote(profile, mode), greeting: true },
  ])
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const latest = useRef({ profile, mode })
  latest.current = { profile, mode }

  async function send(text) {
    const content = String(text ?? '').trim()
    if (!content || loadingRef.current) return false
    const { profile: p, mode: m } = latest.current

    const userMessage = { role: 'user', content }
    const history = [...messagesRef.current.filter((item) => !item.greeting), userMessage]
    setMessages((prev) => [...prev, userMessage])
    loadingRef.current = true
    setLoading(true)
    onLearn?.(content)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content: body }) => ({ role, content: body })),
          systemPrompt: buildSystemPrompt(p, m),
        }),
      })
      const data = await res.json().catch(() => ({}))
      let reply = data.reply
      if (data.ok && !reply) reply = fallbackReply(p, content)
      else if (!reply) reply = data.error ? `연결이 잠깐 안 됐어. ${data.error}` : fallbackReply(p, content)
      reply = attachLocalEvent(reply, content)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: attachLocalEvent(fallbackReply(p, content), content) }])
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
    return true
  }

  function regreet(nextMode) {
    setMessages((prev) =>
      prev.map((msg) => (msg.greeting ? { ...msg, content: openingNote(latest.current.profile, nextMode) } : msg)),
    )
  }

  return { messages, loading, send, regreet }
}
