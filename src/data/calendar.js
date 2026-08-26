// ※ 데모용 샘플 학사일정 (2026학년도 2학기). 실제 일정은 학교 학사일정을 따른다.
export const TERM_START = '2026-09-01'

export const ACADEMIC_EVENTS = [
  { date: '2026-09-01', title: '2학기 개강', kind: '학사', grades: [1, 2, 3, 4] },
  { date: '2026-09-07', title: '수강신청 정정 마감', kind: '학사', grades: [1, 2, 3, 4] },
  { date: '2026-09-18', title: '2학기 국가장학금 2차 신청 마감', kind: '장학', grades: [1, 2, 3, 4] },
  { date: '2026-10-19', title: '중간고사 시작', kind: '시험', grades: [1, 2, 3, 4] },
  { date: '2026-10-30', title: '졸업작품 발표 신청 마감', kind: '졸업', grades: [4] },
  { date: '2026-11-06', title: '졸업인증 서류 제출 마감', kind: '졸업', grades: [4] },
  { date: '2026-11-20', title: '졸업작품 최종발표회', kind: '졸업', grades: [3, 4] },
  { date: '2026-11-27', title: '수강 철회 마감', kind: '학사', grades: [1, 2, 3, 4] },
  { date: '2026-12-14', title: '기말고사 시작', kind: '시험', grades: [1, 2, 3, 4] },
  { date: '2026-12-21', title: '동계 계절학기 수강신청', kind: '학사', grades: [1, 2, 3] },
]

/** 오늘 기준 다가오는 일정 n개. 데모가 언제 열려도 비지 않게, 지난 일정은 뒤로 돌린다. */
export function upcoming(grade, today = new Date(), count = 3) {
  const list = ACADEMIC_EVENTS.filter((e) => e.grades.includes(grade))
  const iso = today.toISOString().slice(0, 10)
  const future = list.filter((e) => e.date >= iso)
  const picked = future.length >= count ? future : [...future, ...list.filter((e) => e.date < iso)]
  return picked.slice(0, count).map((e) => ({ ...e, dday: dday(e.date, today) }))
}

export function dday(date, today = new Date()) {
  const target = new Date(`${date}T00:00:00+09:00`)
  const base = new Date(today)
  base.setHours(0, 0, 0, 0)
  return Math.round((target - base) / 86400000)
}

export function ddayLabel(n) {
  if (n === 0) return 'D-DAY'
  return n > 0 ? `D-${n}` : `지남`
}

export function weekOfTerm(today = new Date()) {
  const start = new Date(`${TERM_START}T00:00:00+09:00`)
  const diff = Math.floor((today - start) / (7 * 86400000)) + 1
  // 개강 전이면 0
  return Math.min(16, Math.max(0, diff))
}
