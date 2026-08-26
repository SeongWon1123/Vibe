import { useRef, useState } from 'react'
import { KNOWLEDGE } from '../data/knowledge.js'
import { eventFromNotice, icsLine } from '../lib/notice.js'
import { callName, localAdvice, openingNote } from '../lib/urgency.js'
import { parseIcsPayload } from '../lib/ics.js'

export const QUICK = [
  { send: '이번 학기에 뭘 해야 할까?', show: '이번 학기 뭐부터?' },
  { send: '졸업까지 뭐가 남았어?', show: '졸업까지 뭐 남았지' },
  { send: '들을 만한 교양 추천해줘', show: '교양 추천' },
]

const TONE = {
  senior: `[말투]
당신은 같은 학과를 먼저 졸업한 선배입니다. 다정한 반말. 후배가 뭘 물어도 먼저 한 문장 공감하거나 상황을 짚어 준 뒤, 본론을 짧게 말합니다.
"내가 그 학기 때는…" 같은 경험담을 가끔 한 줄 섞어도 좋습니다. 잔소리 대신 이유를 붙입니다.
학생을 부를 때는 "{{name}}아" 또는 "{{name}}" — 매 문장이 아니라 첫 문장이나 강조할 때만 씁니다.`,
  mate: `[말투]
당신은 같은 학기를 함께 굴리는 학업 메이트(동기 친구)입니다. 편하고 가벼운 반말, "우리", "같이", "~하자" 같은 표현을 씁니다.
가르치듯 말하지 않고 옆에서 계획을 같이 짜는 느낌. 이모지는 쓰지 않습니다. 격려는 짧게, 실행 목록은 구체적으로.
학생을 부를 때는 "{{name}}" — 매 문장이 아니라 처음이나 강조할 때만 씁니다.`,
}

export function buildSystemPrompt(persona, mode = 'senior') {
  const { profile, label } = persona
  const name = callName(persona)
  const tone = (TONE[mode] || TONE.senior).replaceAll('{{name}}', name)
  return `당신은 '동학(同學)'입니다. 국립순천대학교 인공지능공학부 학생 ${label}(${name})의 4년을 옆에서 보는 AI입니다.
아래 프로필은 다른 사람이 아니라 ${name}이가 ${profile.grade}학년일 때의 상태입니다.

${tone}

[학생 프로필 — ${name}의 ${profile.grade}학년]
${JSON.stringify(profile, null, 2)}

[학사 지식베이스]
${KNOWLEDGE}

[응답 규칙]
1. 학년·이수과목·이번 학기 수강 과목·목표를 근거로, 지금 학기에 실제로 손댈 일만 말한다.
2. 졸업요건 질문: gradAudit이 null이면 체크리스트를 만들지 말고 아직 졸업사정 대상이 아니라고 안심시킨 뒤 이번 학기 기초만 안내한다.
   missing이 있을 때만 그 항목을 체크리스트로 보여준다. 공인영어성적은 졸업 필수 요건이 아니므로 요구하지 않는다.
3. 교양 추천은 관심분야와 비어 있는 영역을 교차해서 고른다.
4. 공지를 붙여넣고 저장/캘린더를 말하면 접수·신청·제출 "마감일"을 기준으로 마지막 줄에만:
   [ICS]{"title":"행사명","date":"YYYY-MM-DD","time":"HH:MM","location":"장소"}[/ICS]
5. 한국어, 250~350자, 목록은 마크다운. "도와드릴게요", "추가로 궁금한 점" 같은 챗봇 상투구 금지.
   모르면 지어내지 말고 학과 사무실 확인을 권한다.`
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

function fallbackReply(persona, content) {
  const event = eventFromNotice(content)
  if (event) {
    return `${callName(persona)}아, 이 공지에서 마감일만 집었어.
캘린더에 넣어 두면 하루 전에 알림이 가니까 놓칠 일은 없을 거야.

${icsLine(event)}`
  }
  return (
    localAdvice(persona, content) ||
    `${callName(persona)}아, 그건 내가 가진 자료엔 없는 내용이야. 학과 사무실에 한 번 물어보는 게 정확해.`
  )
}

/** 페르소나 하나의 대화 상태. 페르소나가 바뀌면 호출 측에서 key로 리마운트한다. */
export function useChat(persona, mode = 'senior') {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: openingNote(persona, mode), greeting: true },
  ])
  const [loading, setLoading] = useState(false)
  const loadingRef = useRef(false)
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const modeRef = useRef(mode)
  modeRef.current = mode

  async function send(text) {
    const content = String(text ?? '').trim()
    if (!content || loadingRef.current) return false

    const userMessage = { role: 'user', content }
    const history = [...messagesRef.current.filter((item) => !item.greeting), userMessage]
    setMessages((prev) => [...prev, userMessage])
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content: body }) => ({ role, content: body })),
          systemPrompt: buildSystemPrompt(persona, modeRef.current),
        }),
      })
      const data = await res.json().catch(() => ({}))
      let reply = data.reply
      if (data.ok && !reply) {
        reply = fallbackReply(persona, content)
      } else if (!reply) {
        reply = data.error ? `연결이 잠깐 안 됐어. ${data.error}` : fallbackReply(persona, content)
      }
      reply = attachLocalEvent(reply, content)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: attachLocalEvent(fallbackReply(persona, content), content) },
      ])
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
    return true
  }

  /** 모드가 바뀌면 인사말만 새 톤으로 바꾼다 (대화는 유지). */
  function regreet(nextMode) {
    setMessages((prev) =>
      prev.map((m) => (m.greeting ? { ...m, content: openingNote(persona, nextMode) } : m)),
    )
  }

  return { messages, loading, send, regreet }
}
