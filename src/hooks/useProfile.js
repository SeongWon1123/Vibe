import { useCallback, useState } from 'react'
import { ENTRY_YEARS } from '../data/curriculum.js'
import { KEYWORDS, guessEntryYear, semesterLabel } from '../data/standard.js'

const KEY = 'donghak.profile.v4'

function validYear(y, grade) {
  return ENTRY_YEARS.includes(Number(y)) ? Number(y) : Math.max(ENTRY_YEARS[0], Math.min(ENTRY_YEARS[ENTRY_YEARS.length - 1], guessEntryYear(grade)))
}

export function emptyProfile(grade = 1, entryYear) {
  return {
    grade,
    entryYear: validYear(entryYear, grade),
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
    if (!(p && p.credits && Array.isArray(p.timetable))) return null
    return { ...emptyProfile(p.grade, p.entryYear), ...p, entryYear: validYear(p.entryYear, p.grade) }
  } catch {
    return null
  }
}

/** 전시·캡처용: ?p=<base64 json> 으로 프로필을 통째로 주입 */
function fromLink() {
  try {
    const raw = new URLSearchParams(window.location.search).get('p')
    if (!raw) return null
    // URL에서 '+'가 공백으로 바뀌고, URL-safe base64('-','_')도 올 수 있다
    const b64 = raw.replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/')
    const p = JSON.parse(decodeURIComponent(escape(atob(b64))))
    return { ...emptyProfile(p.grade || 1, p.entryYear), ...p, entryYear: validYear(p.entryYear, p.grade || 1), onboarded: true }
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

  /** 학년만 바꾼다. 학점·시간표는 사용자가 넣은 값이므로 건드리지 않는다. 입학년도는 아직 손대지 않았으면 추정값으로 따라간다. */
  const setGrade = useCallback(
    (grade) =>
      update((prev) => ({
        grade,
        semester: semesterLabel(grade),
        entryYear: prev.entryYearTouched ? prev.entryYear : validYear(guessEntryYear(grade), grade),
      })),
    [update],
  )

  const setEntryYear = useCallback((entryYear) => update((prev) => ({ entryYear: validYear(entryYear, prev.grade), entryYearTouched: true })), [update])

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

  return { profile, update, setGrade, setEntryYear, learn, reset }
}
