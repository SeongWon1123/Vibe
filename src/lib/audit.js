import { findCourse, plannedFor } from '../data/curriculum.js'
import { GRAD } from '../data/standard.js'

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
    entered: c.total > 0 || c.major > 0 || c.general > 0,
  }
}

/**
 * 입력한 시간표를 교육과정과 대조한다.
 * - matched: 교육과정에 있는 과목 (전필/전선/교양 구분)
 * - unknown: 교육과정표에 없는 과목명 (오타거나 타과·신규 과목)
 * - missingPlanned: 이 학년·학기 배치 과목인데 시간표에 없는 것 (전필 우선)
 * - prereq: 선수과목이 있는 과목 — 이수 여부를 확인하라는 메모
 * - load: 학점 부담 코멘트
 */
export function curriculumCheck(profile) {
  const semester = 2 // 데모는 2학기 기준
  const table = profile.timetable
  const matched = []
  const unknown = []
  for (const row of table) {
    const c = findCourse(row.name)
    if (c) matched.push({ ...row, ...c, entered: row.name })
    else unknown.push(row.name)
  }
  const names = new Set(matched.map((m) => m.name))
  const planned = plannedFor(profile.grade, semester)
  const missingPlanned = planned.filter((c) => !names.has(c.name))
  const prereq = matched.filter((m) => m.requires?.length).map((m) => ({ name: m.name, requires: m.requires }))
  const majorCredits = matched.filter((m) => m.type.startsWith('전')).reduce((s, m) => s + (Number(m.credits) || 0), 0)
  const generalCredits = matched.filter((m) => m.type.startsWith('교')).reduce((s, m) => s + (Number(m.credits) || 0), 0)
  const total = thisSemesterCredits(table)
  let load = ''
  if (table.length === 0) load = '시간표를 넣으면 교육과정과 대조해 줄게.'
  else if (total < 12) load = `${total}학점이면 가벼운 편. 정규 학기는 보통 15~18학점이야.`
  else if (total > 21) load = `${total}학점은 최대치를 넘어. 수강 가능 학점을 확인해.`
  else load = `${total}학점 — 무난한 부담.`

  const lines = []
  if (missingPlanned.some((c) => c.type === '전필'))
    lines.push(`이번 학기 전공필수인데 시간표에 없음: ${missingPlanned.filter((c) => c.type === '전필').map((c) => c.name).join(', ')}`)
  if (unknown.length) lines.push(`교육과정표에서 못 찾은 과목: ${unknown.join(', ')} (과목명 확인)`)
  if (prereq.length) lines.push(`선수과목 확인: ${prereq.map((p) => `${p.name} ← ${p.requires.join('·')}`).join(' / ')}`)
  const other = missingPlanned.filter((c) => c.type !== '전필')
  if (other.length) lines.push(`이 학기 배치 과목 중 안 넣은 것: ${other.map((c) => c.name).join(', ')}`)
  if (table.length && !lines.length) lines.push('이 학기 교육과정과 잘 맞아.')

  return { matched, unknown, missingPlanned, prereq, majorCredits, generalCredits, total, load, lines }
}
