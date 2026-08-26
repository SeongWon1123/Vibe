import { GRAD, STANDARD } from '../data/standard.js'

export function thisSemesterCredits(timetable) {
  return timetable.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)
}

/** 학점 관리 요약. 사용자가 입력한 학점 + 시간표에서 계산한 이번 학기 예정 학점. */
export function audit(profile) {
  const c = profile.credits
  const planned = thisSemesterCredits(profile.timetable)
  const expected = c.total + planned
  const remaining = Math.max(0, GRAD.total - expected)
  const majorLeft = Math.max(0, GRAD.major - c.major)
  const generalLeft = Math.max(0, GRAD.general - c.general)
  const missing = []
  if (remaining > 0) missing.push(`총 ${remaining}학점 더`)
  if (majorLeft > 0) missing.push(`전공 ${majorLeft}학점`)
  if (generalLeft > 0) missing.push(`교양 ${generalLeft}학점`)
  if (profile.grade >= 3) missing.push('졸업인증 (자격증·공모전·어학 중 1)')
  if (profile.grade === 4) missing.push('졸업작품 최종발표')
  return {
    planned,
    expected,
    remaining,
    majorLeft,
    generalLeft,
    ratio: Math.min(1, c.total / GRAD.total),
    expectedRatio: Math.min(1, expected / GRAD.total),
    missing,
  }
}

export function standardFor(grade) {
  const s = STANDARD[grade] || STANDARD[1]
  return { semester: s.semester, credits: { ...s.credits }, timetable: s.timetable.map((c) => ({ ...c })) }
}
