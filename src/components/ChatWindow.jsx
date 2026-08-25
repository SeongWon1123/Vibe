import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { KNOWLEDGE } from '../data/knowledge.js'
import { parseIcsPayload } from '../lib/ics.js'
import IcsButton from './IcsButton.jsx'

const QUICK_QUESTIONS = [
  '이번 학기에 뭘 해야 할까?',
  '졸업까지 뭐가 남았어?',
  '들을 만한 교양 추천해줘',
]

function buildSystemPrompt(profile) {
  return `당신은 '동학(同學)'입니다. 국립순천대학교 학생의 4년을 함께하는 AI 선배로,
학생 프로필과 학사 지식을 근거로 구체적이고 실행 가능한 조언을 합니다.

[학생 프로필]
${JSON.stringify(profile, null, 2)}

[학사 지식베이스]
${KNOWLEDGE}

[응답 규칙]
1. 반드시 프로필의 학년·이수과목·목표를 근거로 답한다. 근거가 된 프로필 항목을 자연스럽게 언급한다.
   (예: "성원님은 아직 네트워크를 안 들으셨으니...")
2. 졸업요건 질문에는 gradAudit의 missing 항목을 체크리스트로 보여준다.
3. 교양 추천은 관심분야 + 졸업요건에서 비어있는 영역을 교차해서 추천한다.
4. 사용자가 공지사항 텍스트를 붙여넣고 저장/캘린더를 언급하면, 응답 마지막 줄에
   정확히 다음 형식의 JSON 한 줄을 추가한다:
   [ICS]{"title":"행사명","date":"YYYY-MM-DD","time":"HH:MM","location":"장소"}[/ICS]
5. 답변은 한국어, 300자 내외, 마크다운 목록 활용. 모르는 것은 지어내지 말고
   "학과 사무실 확인이 필요해요"라고 답한다.`
}

function greeting(label) {
  return `안녕하세요, ${label}님! 무엇이 궁금한가요?`
}

export default function ChatWindow({ persona }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setMessages([
      { role: 'assistant', content: greeting(persona.label), greeting: true },
    ])
    setInput('')
    setLoading(false)
  }, [persona.id, persona.label])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const content = text.trim()
    if (!content || loading) return

    const userMessage = { role: 'user', content }
    const history = [...messages.filter((m) => !m.greeting), userMessage]
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          systemPrompt: buildSystemPrompt(persona.profile),
        }),
      })
      const data = await res.json().catch(() => ({}))
      let reply = data.reply
      if (!reply && data.ok) {
        reply = `(LLM 연결 예정) 질문: ${content}`
      }
      if (!reply) {
        reply = '잠시 후 다시 시도해주세요'
      }
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '잠시 후 다시 시도해주세요' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    send(input)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((message, index) => {
          const parsed =
            message.role === 'assistant' && !message.greeting
              ? parseIcsPayload(message.content)
              : { text: message.content, event: null }
          const isUser = message.role === 'user'
          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-navy text-white'
                    : 'bg-white text-stone-800 shadow-sm ring-1 ring-stone-200'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{parsed.text}</p>
                ) : (
                  <div className="markdown-body">
                    <Markdown>{parsed.text}</Markdown>
                  </div>
                )}
                <IcsButton event={parsed.event} />
              </div>
            </div>
          )
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-3.5 py-2.5 text-sm text-stone-400 shadow-sm ring-1 ring-stone-200">
              생각 중…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-stone-200 bg-white px-4 py-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => send(question)}
              className="shrink-0 rounded-full border border-navy/15 bg-stone-50 px-3 py-1 text-xs text-navy hover:bg-navy hover:text-white"
            >
              {question}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                send(input)
              }
            }}
            placeholder="궁금한 점을 물어보세요"
            rows={2}
            className="min-w-0 flex-1 resize-none rounded-xl border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-navy"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
          >
            전송
          </button>
        </form>
      </div>
    </div>
  )
}
