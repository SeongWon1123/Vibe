const YEAR_HINT = /20(\d{2})\s*학년도/

function titleFor(text) {
  if (/졸업작품|캡스톤|발표\s*신청/.test(text)) return '졸업작품 발표 신청 마감'
  if (/졸업인증/.test(text)) return '졸업인증 서류 제출 마감'
  if (/장학/.test(text)) return '장학금 신청 마감'
  if (/수강신청\s*정정|정정\s*기간/.test(text)) return '수강신청 정정 마감'
  if (/수강\s*철회/.test(text)) return '수강 철회 마감'
  if (/토익|영어/.test(text)) return '영어 시험 접수 마감'
  return '학과 공지 마감'
}

/** '마감'이 적힌 줄 안에서만 시각을 찾는다. 다른 행사 시각(발표회 오후 1시 등)과 섞이지 않게. */
function timeFrom(text) {
  const line = text.split('\n').find((row) => /마감/.test(row)) || ''
  const clock = line.match(/(\d{1,2}):(\d{2})/)
  if (clock) return `${String(Number(clock[1])).padStart(2, '0')}:${clock[2]}`
  const korean = line.match(/(오전|오후)?\s*(\d{1,2})\s*시/)
  if (korean) {
    const h = Number(korean[2])
    const pm = korean[1] === '오후' && h < 12
    return `${String(pm ? h + 12 : h).padStart(2, '0')}:00`
  }
  return '17:00'
}

export function eventFromNotice(text) {
  if (!text || text.length < 8) return null
  const wantsSave = /저장|캘린더|ics|마감/i.test(text)
  const looksNotice = /공지|안내|접수|교무|학과|학사|장학/i.test(text)
  if (!wantsSave || !looksNotice) return null

  const yearMatch = text.match(YEAR_HINT)
  const year = yearMatch ? 2000 + Number(yearMatch[1]) : 2026

  const deadline =
    text.match(/(?:접수|신청|제출)\s*마감[^\d\n]{0,14}(\d{1,2})\s*월\s*(\d{1,2})\s*일/) ||
    text.match(/마감[^\d\n]{0,10}(\d{1,2})\s*월\s*(\d{1,2})\s*일/) ||
    text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*\([월화수목금토일]\)\s*(?:\d{1,2}:\d{2}\s*)?까지/)

  if (!deadline) return null

  const month = String(deadline[1]).padStart(2, '0')
  const day = String(deadline[2]).padStart(2, '0')
  const location = /학과 사무실/.test(text) ? '학과 사무실' : /온라인|홈페이지|향림통/.test(text) ? '온라인' : ''
  return { title: titleFor(text), date: `${year}-${month}-${day}`, time: timeFrom(text), location }
}

export function icsLine(event) {
  return `[ICS]${JSON.stringify({
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
  })}[/ICS]`
}
