import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { KNOWLEDGE } from '../data/knowledge.js'
import { eventFromNotice, icsLine } from '../lib/notice.js'
import { givenName, localAdvice, openingNote } from '../lib/urgency.js'
import { parseIcsPayload } from '../lib/ics.js'
import IcsButton from './IcsButton.jsx'

const QUICK = [
  { send: '이번 학기에 뭘 해야 할까?', show: '이번 학기, 뭐가 급해' },
  { send: '졸업까지 뭐가 남았어?', show: '졸업까지 뭐가 남음' },
  { send: '들을 만한 교양 추천해줘', show: '교양 뭐가 비었어' },
]

function buildSystemPrompt(persona) {
  const { profile, label } = persona
  return `당신은 '동학(同學)'입니다. 국립순천대학교 과방에서 아래 학년을 보는 선배입니다.
말투는 짧고 단정한 존댓말. 위로하지 말고, 지금 학기에 손댈 일만 말합니다.
이모지, '도와드릴게요', '추가로 궁금한 점' 같은 챗봇 상투구는 쓰지 않습니다.

[학생 프로필]
${JSON.stringify(profile, null, 2)}

[학사 지식베이스]
${KNOWLEDGE}

[응답 규칙]
1. 프로필의 학년·이수과목·목표를 근거로 답한다. 학생을 부를 때는 호칭 "${label}"만 쓴다.
   (예: "${label}님은 아직 네트워크를 안 들으셨으니...")
2. 졸업요건 질문: gradAudit이 null이면 체크리스트를 만들지 말고
   "아직 졸업사정 대상이 아니에요"라고 한 뒤 이번 학기 기초만 안내한다.
   missing이 있을 때만 그 항목을 체크리스트로 보여준다.
3. 교양 추천은 관심분야와 비어 있는 영역을 교차해서 고른다.
4. 공지를 붙여넣고 저장/캘린더를 말하면 마지막 줄에만:
   [ICS]{"title":"행사명","date":"YYYY-MM-DD","time":"HH:MM","location":"장소"}[/ICS]
5. 한국어, 300자 안팎, 마크다운 목록. 모르면 지어내지 말고 학과 사무실 확인이 필요해요.`
}

function toMarkdown(text) {
  return text.replace(/\n/g, '  \n')
}

function isPastedNotice(content) {
  return content.includes('접수 마감일 저장해줘') || content.length > 220
}

export default function ChatWindow({ persona, sendRef }) {
  const [messages, setMessages] = useState(() => [
    { role: 'assistant', content: openingNote(persona), greeting: true },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const loadingRef = useRef(false)
  const messagesRef = useRef(messages)

  useLayoutEffect(() => {
    messagesRef.current = messages
    sendRef.current = send
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const content = text.trim()
    if (!content || loadingRef.current) return

    const userMessage = { role: 'user', content }
    const history = [...messagesRef.current.filter((item) => !item.greeting), userMessage]
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content: body }) => ({ role, content: body })),
          systemPrompt: buildSystemPrompt(persona),
        }),
      })
      const data = await res.json().catch(() => ({}))
      let reply = data.reply
      if (data.ok && !reply) {
        reply = fallbackReply(persona, content)
      } else if (!reply) {
        reply = data.error
          ? `연결이 안 됐어요. ${data.error}`
          : fallbackReply(persona, content)
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
  }

  function handleSubmit(event) {
    event.preventDefault()
    send(input)
  }

  return (
    <section className="talk">
      <div className="thread">
        {messages.map((message, index) => {
          if (message.role === 'user') {
            if (isPastedNotice(message.content)) {
              const firstLine = message.content.split('\n').find((line) => line.trim()) || '학과 공지'
              return (
                <article key={index} className="clip">
                  <span>붙여 넣은 공지</span>
                  <p>{firstLine}</p>
                </article>
              )
            }
            return (
              <article key={index} className="bubble me">
                {message.content}
              </article>
            )
          }

          const parsed = message.greeting
            ? { text: message.content, event: null }
            : parseIcsPayload(message.content)

          return (
            <div key={index}>
              <article className="bubble you">
                <div className="markdown-body">
                  <Markdown>{toMarkdown(parsed.text)}</Markdown>
                </div>
              </article>
              <IcsButton event={parsed.event} />
            </div>
          )
        })}
        {loading && <p className="typing">보는 중</p>}
        <div ref={bottomRef} />
      </div>

      <div className="composer">
        <div className="chips">
          {QUICK.map((item) => (
            <button key={item.send} type="button" className="chip" onClick={() => send(item.send)}>
              {item.show}
            </button>
          ))}
        </div>
        <form className="bar" onSubmit={handleSubmit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send(input)
              }
            }}
            placeholder="이번 학기, 졸업, 공지"
            rows={2}
          />
          <button className="send" type="submit" disabled={loading || !input.trim()}>
            보내기
          </button>
        </form>
      </div>
    </section>
  )
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
    return `이 공지에서 접수 마감만 집었습니다.
캘린더에 넣으면 하루 전에 알림이 갑니다.

${icsLine(event)}`
  }
  return (
    localAdvice(persona, content) ||
    `${givenName(persona.label)} 질문 기준으로는 장부에 없는 내용이에요. 학과 사무실 확인이 필요해요.`
  )
}
