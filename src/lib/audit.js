import { findCourse, getCurriculum, plannedFor } from '../data/curriculum.js'
import { gradOf } from '../data/standard.js'

export function thisSemesterCredits(timetable) {
  return timetable.reduce((sum, c) => sum + (Number(c.credits) || 0), 0)
}

/** 학점 관리 요약. 사용자가 입력한 학점 + 시간표에서 계산한 이번 학기 예정 학점. 기준은 입학년도 교육과정. */
export function audit(profile) {
  const g = gradOf(profile)
  const c = profile.credits
  const planned = thisSemesterCredits(profile.timetable)
  const expected = c.total + planned
  const remaining = Math.max(0, g.total - expected)
  const majorLeft = Math.max(0, g.major - c.major)
  const generalLeft = Math.max(0, g.general - c.general)
  const missing = []
  if (remaining > 0) missing.push(`총 ${remaining}학점 더 (졸업 ${g.total})`)
  if (majorLeft > 0) missing.push(`전공 ${majorLeft}학점 (${g.major} 이상)`)
  if (generalLeft > 0) missing.push(`교양 ${generalLeft}학점 (${g.general}${g.generalMax !== g.general ? `~${g.generalMax}` : ''})`)
  if (profile.grade >= 3) missing.push('졸업인증 (자격증·공모전·어학 중 1)')
  if (profile.grade === 4) missing.push('이매지니어프로젝트Ⅱ (캡스톤) 이수')
  return {
    grad: g,
    planned,
    expected,
    remaining,
    majorLeft,
    generalLeft,
    ratio: Math.min(1, c.total / g.total),
    expectedRatio: Math.min(1, expected / g.total),
    missing,
    entered: c.total > 0 || c.major > 0 || c.general > 0,
  }
}

/**
 * 입력한 시간표를 입학년도 교육과정표와 대조한다.
 * - matched: 교육과정에 있는 과목 (전필/전선, 배치 학년·학기)
 * - unknown: 교육과정표에 없는 과목명 (교양·타과·오타)
 * - missingPlanned: 이 학년·학기 배치 과목인데 시간표에 없는 것 (전필 우선)
 * - requiredAll: 전공필수 전체 목록 (졸업까지 반드시 이수)
 */
export function curriculumCheck(profile) {
  const semester = 2 // 데모는 2학기 기준
  const cur = getCurriculum(profile.entryYear)
  const table = profile.timetable
  const matched = []
  const unknown = []
  for (const row of table) {
    const c = findCourse(row.name, profile.entryYear)
    if (c) matched.push({ ...row, ...c, entered: row.name, type: c.required ? '전필' : c.other ? '타전공인정' : '전선' })
    else unknown.push(row.name)
  }
  const names = new Set(matched.map((m) => m.name))
  const planned = plannedFor(profile.grade, semester, profile.entryYear)
  const missingPlanned = planned.filter((c) => !names.has(c.name))
  const offYear = matched.filter((m) => m.years && !m.years.includes(profile.grade))
  const requiredAll = cur.courses.filter((c) => c.required)
  const majorCredits = matched.reduce((s, m) => s + (Number(m.credits) || 0), 0)
  const total = thisSemesterCredits(table)
  let load = ''
  if (table.length === 0) load = '시간표를 넣으면 교육과정과 대조해 줄게.'
  else if (total < 12) load = `${total}학점이면 가벼운 편. 정규 학기는 보통 15~18학점이야.`
  else if (total > 21) load = `${total}학점은 최대치를 넘어. 수강 가능 학점을 확인해.`
  else load = `${total}학점 — 무난한 부담.`

  const lines = []
  const reqMissing = missingPlanned.filter((c) => c.required)
  if (reqMissing.length) lines.push(`이번 학기 전공필수인데 시간표에 없음: ${reqMissing.map((c) => c.name).join(', ')}`)
  if (unknown.length) lines.push(`${cur.year}학번 전공 교육과정표에 없는 과목: ${unknown.join(', ')} (교양·타과 과목이면 정상, 아니면 과목명 확인)`)
  if (offYear.length) lines.push(`권장 학년이 다른 과목: ${offYear.map((m) => `${m.name}(${m.years.join('·')}학년 배치)`).join(', ')}`)
  const other = missingPlanned.filter((c) => !c.required)
  if (other.length) lines.push(`이 학기 배치 전공 중 안 넣은 것: ${other.slice(0, 6).map((c) => c.name).join(', ')}${other.length > 6 ? ` 외 ${other.length - 6}` : ''}`)
  if (table.length && !lines.length) lines.push(`${cur.year}학번 교육과정과 잘 맞아.`)

  return { curriculum: cur, matched, unknown, missingPlanned, offYear, requiredAll, majorCredits, total, load, lines }
}
