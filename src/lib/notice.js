const YEAR_HINT = /20(\d{2})\s*학년도/

export function eventFromNotice(text) {
  if (!text || text.length < 8) return null
  const wantsSave = /저장|캘린더|ics|마감/i.test(text)
  const looksNotice = /공지|안내|토익|영어성적|교무|접수/i.test(text)
  if (!wantsSave && !looksNotice) return null
  if (!wantsSave) return null

  const yearMatch = text.match(YEAR_HINT)
  const year = yearMatch ? 2000 + Number(yearMatch[1]) : 2026

  const deadline =
    text.match(/접수\s*마감[^\d]{0,6}(\d{1,2})\s*월\s*(\d{1,2})\s*일/) ||
    text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일\s*\([월화수목금토일]\)\s*까지/)

  if (!deadline) return null

  const month = String(deadline[1]).padStart(2, '0')
  const day = String(deadline[2]).padStart(2, '0')
  const title = /토익|영어/.test(text) ? '공인영어 접수 마감' : '학과 공지 마감'
  return {
    title,
    date: `${year}-${month}-${day}`,
    time: '09:00',
    location: /온라인/.test(text) ? '온라인' : '',
  }
}

export function icsLine(event) {
  return `[ICS]${JSON.stringify({
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
  })}[/ICS]`
}
