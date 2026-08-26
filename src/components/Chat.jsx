import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import { QUICK, isPastedNotice } from '../hooks/useChat.js'
import { parseIcsPayload } from '../lib/ics.js'
import { MODES } from '../lib/urgency.js'
import IcsButton from './IcsButton.jsx'
import Loading from './Loading.jsx'

function toMarkdown(text) {
  return text.replace(/\n/g, '  \n')
}

export default function Chat({ persona, mode, onChangeMode, messages, loading, send }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  async function submit(text) {
    const ok = await send(text)
    if (ok !== false) setInput('')
  }

  return (
    <>
      <div className="screen chat-screen">
        <div className="phead phead-row">
          <div>
            <h1>동학</h1>
            <p>
              {persona.label}의 {persona.profile.grade}학년 · {persona.profile.semester}
            </p>
          </div>
          <div className="seg" role="radiogroup" aria-label="말투">
            {Object.values(MODES).map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                className={mode === m.id ? 'on' : ''}
                onClick={() => onChangeMode(m.id)}
              >
                {m.short}
              </button>
            ))}
          </div>
        </div>
        <div className="thread">
          {messages.map((message, index) => {
            if (message.role === 'user') {
              if (isPastedNotice(message.content)) {
                const firstLine =
                  message.content.split('\n').find((line) => line.trim()) || '학과 공지'
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
              <div key={index} className="you-row">
                {index === 0 && (
                  <div className="who">
                    <div className="logo-mark">同</div>
                    동학 · {MODES[mode]?.label}
                  </div>
                )}
                <article className="bubble you">
                  <div className="markdown-body">
                    <Markdown>{toMarkdown(parsed.text)}</Markdown>
                  </div>
                </article>
                <IcsButton event={parsed.event} />
              </div>
            )
          })}
          {loading && <Loading />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="composer">
        <div className="quick">
          {QUICK.map((item) => (
            <button
              key={item.send}
              type="button"
              className="fchip"
              disabled={loading}
              onClick={() => submit(item.send)}
            >
              {item.show}
            </button>
          ))}
        </div>
        <form
          className="bar"
          onSubmit={(event) => {
            event.preventDefault()
            submit(input)
          }}
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                submit(input)
              }
            }}
            placeholder="궁금한 거 편하게 물어봐"
            rows={1}
            aria-label="질문 입력"
          />
          <button className="send" type="submit" disabled={loading || !input.trim()} aria-label="보내기">
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
