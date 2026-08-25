import { useState } from 'react'
import ChatWindow from './components/ChatWindow.jsx'
import PersonaSwitcher from './components/PersonaSwitcher.jsx'
import personas from './data/personas.json'

export default function App() {
  const [selectedId, setSelectedId] = useState(personas[0].id)
  const persona = personas.find((item) => item.id === selectedId) ?? personas[0]

  return (
    <div className="min-h-svh bg-stone-200">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-stone-50 shadow-sm">
        <PersonaSwitcher
          personas={personas}
          selectedId={persona.id}
          onSelect={setSelectedId}
        />
        <ChatWindow key={persona.id} persona={persona} />
      </div>
    </div>
  )
}
