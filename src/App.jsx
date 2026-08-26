import { useEffect, useRef, useState } from 'react'
import Chat from './components/Chat.jsx'
import Home from './components/Home.jsx'
import Intro from './components/Intro.jsx'
import Notice from './components/Notice.jsx'
import PersonaPicker from './components/PersonaPicker.jsx'
import Profile from './components/Profile.jsx'
import TabBar from './components/TabBar.jsx'
import personas from './data/personas.json'
import { useChat } from './hooks/useChat.js'

const TABS = new Set(['home', 'chat', 'notice', 'me'])

/** 전시·캡처용 딥링크: ?screen=home&year=4&ask=졸업까지 뭐가 남았어? */
function readDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const screen = params.get('screen')
  const year = Number(params.get('year'))
  const persona = personas.find((item) => item.profile.grade === year)
  return {
    screen: screen === 'pick' || TABS.has(screen) ? screen : 'intro',
    personaId: (persona ?? personas[0]).id,
    ask: params.get('ask') || '',
  }
}

export default function App() {
  const [link] = useState(readDeepLink)
  const [screen, setScreen] = useState(link.screen)
  const [personaId, setPersonaId] = useState(link.personaId)
  const persona = personas.find((item) => item.id === personaId) ?? personas[0]

  function pick(id) {
    setPersonaId(id)
    setScreen('home')
  }

  return (
    <div className="stage">
      <div className="app">
        {screen === 'intro' && (
          <Intro onPick={() => setScreen('pick')} onBrowse={() => pick(personas[0].id)} />
        )}
        {screen === 'pick' && (
          <PersonaPicker
            personas={personas}
            selectedId={personaId}
            onPick={pick}
            onBack={() => setScreen('intro')}
          />
        )}
        {TABS.has(screen) && (
          <Session
            key={persona.id}
            persona={persona}
            screen={screen}
            setScreen={setScreen}
            initialAsk={link.ask}
          />
        )}
      </div>
      <aside className="stage-note" aria-hidden="true">
        <b>동학 同學</b>
        같은 질문에도 학년·이수과목·목표에 따라 다른 답을 주는 국립순천대 AI 학사 선배.
        <small>폰에서 열면 앱처럼 보여요. 왼쪽 화면을 그대로 눌러 보세요.</small>
      </aside>
    </div>
  )
}

/** 페르소나 하나의 세션. key로 리마운트되어 학년이 바뀌면 대화가 처음부터 시작된다. */
function Session({ persona, screen, setScreen, initialAsk }) {
  const chat = useChat(persona)
  const asked = useRef(false)

  useEffect(() => {
    if (initialAsk && !asked.current) {
      asked.current = true
      chat.send(initialAsk)
    }
    // 딥링크 질문은 최초 마운트에 한 번만 보낸다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ask(text) {
    setScreen('chat')
    chat.send(text)
  }

  return (
    <>
      {screen === 'home' && (
        <Home
          persona={persona}
          onAsk={ask}
          onGoChat={() => setScreen('chat')}
          onChangeYear={() => setScreen('pick')}
        />
      )}
      {screen === 'chat' && (
        <Chat persona={persona} messages={chat.messages} loading={chat.loading} send={chat.send} />
      )}
      {screen === 'notice' && <Notice onNotice={ask} />}
      {screen === 'me' && (
        <Profile
          persona={persona}
          onChangeYear={() => setScreen('pick')}
          onGoIntro={() => setScreen('intro')}
        />
      )}
      <TabBar screen={screen} onGo={setScreen} />
    </>
  )
}
