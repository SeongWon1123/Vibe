import { useCallback, useState } from 'react'
import { KEYWORDS } from '../data/standard.js'
import { standardFor } from '../lib/audit.js'

const KEY = 'donghak.profile.v2'

export function emptyProfile(grade = 1) {
  const std = standardFor(grade)
  return {
    grade,
    semester: std.semester,
    interests: [],
    goal: '아직 없음',
    credits: std.credits,
    timetable: std.timetable,
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
    return p && p.credits && Array.isArray(p.timetable) ? p : null
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
  const [profile, setProfileState] = useState(() => load() ?? emptyProfile(1))

  const update = useCallback((patch) => {
    setProfileState((prev) => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }
      save(next)
      return next
    })
  }, [])

  /** 학년을 바꾸면 학점·시간표를 그 학년 표준값으로 다시 깔아 준다 (사용자가 다시 고칠 수 있음). */
  const setGrade = useCallback(
    (grade) => {
      const std = standardFor(grade)
      update({ grade, semester: std.semester, credits: std.credits, timetable: std.timetable })
    },
    [update],
  )

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
