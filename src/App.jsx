import { useState } from 'react'
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

export default function App() {
  const [screen, setScreen] = useState('intro')
  const [personaId, setPersonaId] = useState(personas[0].id)
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
function Session({ persona, screen, setScreen }) {
  const chat = useChat(persona)

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
