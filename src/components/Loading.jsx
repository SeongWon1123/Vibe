import { useEffect, useState } from 'react'

const MSGS = ['교육과정표와 대조하는 중', '졸업요건 빈칸을 확인하는 중', '이번 학기 것만 골라내는 중']

export default function Loading() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % MSGS.length), 2200)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="thinking" role="status" aria-live="polite">
      <div className="logo-mark bob" style={{ width: 24, height: 24, fontSize: 13, borderRadius: 7 }}>
        同
      </div>
      <span>{MSGS[index]}</span>
      <div className="load-bar">
        <div className="load-fill" />
      </div>
    </div>
  )
}
