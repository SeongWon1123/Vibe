import { useCallback, useState } from 'react'
import { KEYWORDS, semesterLabel } from '../data/standard.js'

const KEY = 'donghak.profile.v3'

export function emptyProfile(grade = 1) {
  return {
    grade,
    semester: semesterLabel(grade),
    interests: [],
    goal: '아직 없음',
    credits: { total: 0, major: 0, general: 0 },
    timetable: [],
    keywords: [],
    portfolio: [],
    mode: 'senior',
    onboarded: false,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p && p.credits && Array.isArray(p.timetable) ? { ...emptyProfile(p.grade), ...p } : null
  } catch {
    return null
  }
}

/** 전시·캡처용: ?p=<base64 json> 으로 프로필을 통째로 주입 */
function fromLink() {
  try {
    const raw = new URLSearchParams(window.location.search).get('p')
    if (!raw) return null
    const p = JSON.parse(decodeURIComponent(escape(atob(raw))))
    return { ...emptyProfile(p.grade || 1), ...p, onboarded: true }
  } catch {
    return null
  }
}

function save(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile))
  } catch {
    /* 저장 불가 환경이면 메모리로만 */
  }
}

export function useProfile() {
  const [profile, setProfileState] = useState(() => fromLink() ?? load() ?? emptyProfile(1))

  const update = useCallback((patch) => {
    setProfileState((prev) => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }
      save(next)
      return next
    })
  }, [])

  /** 학년만 바꾼다. 학점·시간표는 사용자가 넣은 값이므로 건드리지 않는다. */
  const setGrade = useCallback((grade) => update({ grade, semester: semesterLabel(grade) }), [update])

  const learn = useCallback(
    (text) => {
      const found = KEYWORDS.filter((k) => text.includes(k))
      if (!found.length) return
      update((prev) => ({ keywords: [...new Set([...prev.keywords, ...found])].slice(-8) }))
    },
    [update],
  )

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* noop */
    }
    setProfileState(emptyProfile(1))
  }, [])

  return { profile, update, setGrade, learn, reset }
}
