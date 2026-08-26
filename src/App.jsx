import { useEffect, useRef, useState } from 'react'
import Chat from './components/Chat.jsx'
import Home from './components/Home.jsx'
import Intro from './components/Intro.jsx'
import Notice from './components/Notice.jsx'
import Onboarding from './components/Onboarding.jsx'
import Profile from './components/Profile.jsx'
import TabBar from './components/TabBar.jsx'
import Timetable from './components/Timetable.jsx'
import { useChat } from './hooks/useChat.js'
import { useProfile } from './hooks/useProfile.js'
import { MODES } from './lib/urgency.js'

const TABS = new Set(['home', 'chat', 'notice', 'me'])

/** 전시·캡처용 딥링크: ?screen=home&year=4&mode=mate&ask=포트폴리오 뭐부터 정리해? */
function readDeepLink() {
  const params = new URLSearchParams(window.location.search)
  const screen = params.get('screen')
  const year = Number(params.get('year'))
  const mode = params.get('mode')
  return {
    screen: screen === 'onboard' || screen === 'timetable' || TABS.has(screen) ? screen : null,
    year: [1, 2, 3, 4].includes(year) ? year : null,
    mode: MODES[mode] ? mode : null,
    ask: params.get('ask') || '',
  }
}

export default function App() {
  const [link] = useState(readDeepLink)
  const { profile, update, setGrade, learn, reset } = useProfile()
  const applied = useRef(false)
  if (!applied.current) {
    applied.current = true
    if (link.year && link.year !== profile.grade) setGrade(link.year)
    if (link.mode && link.mode !== profile.mode) update({ mode: link.mode })
    if (link.year && !profile.onboarded) update({ onboarded: true, interests: profile.interests.length ? profile.interests : ['클라우드·인프라'], goal: profile.goal === '아직 없음' && link.year >= 3 ? '취업' : profile.goal })
  }
  const [screen, setScreen] = useState(link.screen ?? (profile.onboarded ? 'home' : 'intro'))
  const [noticeDraft, setNoticeDraft] = useState('')
  const mode = profile.mode

  return (
    <div className="stage">
      <div className="app">
        {screen === 'intro' && (
          <Intro
            onboarded={profile.onboarded}
            onStart={() => setScreen('onboard')}
            onContinue={() => setScreen('home')}
          />
        )}
        {screen === 'onboard' && (
          <Onboarding
            profile={profile}
            setGrade={setGrade}
            update={update}
            onDone={(withTimetable) => setScreen(withTimetable ? 'timetable' : 'home')}
            onBack={() => setScreen('intro')}
          />
        )}
        {screen === 'timetable' && (
          <Timetable profile={profile} update={update} onDone={() => setScreen('home')} />
        )}
        {TABS.has(screen) && (
          <Session
            key={`${profile.grade}`}
            profile={profile}
            update={update}
            setGrade={setGrade}
            learn={learn}
            reset={reset}
            mode={mode}
            screen={screen}
            setScreen={setScreen}
            noticeDraft={noticeDraft}
            setNoticeDraft={setNoticeDraft}
            initialAsk={link.ask}
          />
        )}
      </div>
      <aside className="stage-note" aria-hidden="true">
        <b>동학 同學</b>
        1학년의 관심사부터 4학년의 포트폴리오까지, 성향과 관심을 학기마다 알아가며 다음 한 걸음을 알려주는 AI 학사 메이트.
        <small>폰에서 열면 앱처럼 보여요. 왼쪽 화면을 그대로 눌러 보세요.</small>
      </aside>
    </div>
  )
}

/** 학년 하나의 세션. 학년이 바뀌면 key로 리마운트되어 대화가 새로 시작된다. */
function Session({ profile, update, setGrade, learn, reset, mode, screen, setScreen, noticeDraft, setNoticeDraft, initialAsk }) {
  const chat = useChat(profile, mode, learn)
  const asked = useRef(false)

  useEffect(() => {
    if (initialAsk && !asked.current) {
      asked.current = true
      chat.send(initialAsk)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function ask(text) {
    setScreen('chat')
    chat.send(text)
  }

  function changeMode(next) {
    update({ mode: next })
    chat.regreet(next)
  }

  return (
    <>
      {screen === 'home' && (
        <Home
          profile={profile}
          update={update}
          onAsk={ask}
          onGoChat={() => setScreen('chat')}
          onOpenNotice={(body) => {
            setNoticeDraft(body)
            setScreen('notice')
          }}
          onEditTimetable={() => setScreen('timetable')}
        />
      )}
      {screen === 'chat' && (
        <Chat profile={profile} mode={mode} onChangeMode={changeMode} messages={chat.messages} loading={chat.loading} send={chat.send} />
      )}
      {screen === 'notice' && (
        <Notice
          grade={profile.grade}
          draft={noticeDraft}
          setDraft={setNoticeDraft}
          onNotice={(text) => {
            setNoticeDraft('')
            ask(text)
          }}
        />
      )}
      {screen === 'me' && (
        <Profile
          profile={profile}
          update={update}
          setGrade={setGrade}
          onChangeMode={changeMode}
          onEditTimetable={() => setScreen('timetable')}
          onReset={() => {
            reset()
            setScreen('intro')
          }}
        />
      )}
      <TabBar screen={screen} onGo={setScreen} />
    </>
  )
}
