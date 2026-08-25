import { useRef, useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import StudentPanel from './components/StudentPanel.jsx'
import personas from './data/personas.json'

export default function App() {
  const [selectedId, setSelectedId] = useState(personas[0].id)
  const sendRef = useRef(null)
  const persona = personas.find((item) => item.id === selectedId) ?? personas[0]

  function ask(text) {
    sendRef.current?.(text)
  }

  return (
    <div className="desk">
      <StudentPanel
        personas={personas}
        selectedId={persona.id}
        onSelect={setSelectedId}
        onAsk={ask}
        onNotice={ask}
      />
      <ChatWindow key={persona.id} persona={persona} sendRef={sendRef} />
    </div>
  )
}
