function pad(value) {
  return String(value).padStart(2, '0')
}

function parseWallClock(date, time = '09:00') {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return { year, month, day, hour: hour || 0, minute: minute || 0 }
}

function formatIcsLocal({ year, month, day, hour, minute }) {
  return `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`
}

function addHours(parts, hours) {
  const next = new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
  next.setHours(next.getHours() + hours)
  return {
    year: next.getFullYear(),
    month: next.getMonth() + 1,
    day: next.getDate(),
    hour: next.getHours(),
    minute: next.getMinutes(),
  }
}

export function buildIcs({ title, date, time = '09:00', location = '' }) {
  const start = parseWallClock(date, time)
  const dtStart = formatIcsLocal(start)
  const dtEnd = formatIcsLocal(addHours(start, 1))
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DongHak//KR',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@donghak`,
    `DTSTART;TZID=Asia/Seoul:${dtStart}`,
    `DTEND;TZID=Asia/Seoul:${dtEnd}`,
    `SUMMARY:${title}`,
    location ? `LOCATION:${location}` : '',
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title} 하루 전 알림`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function downloadIcs(icsString, filename = 'donghak-event.ics') {
  const blob = new Blob([icsString], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function parseIcsPayload(content) {
  const match = content.match(/\[ICS\]([\s\S]*?)\[\/ICS\]/)
  if (!match) return { text: content, event: null }
  const text = content.replace(match[0], '').trim()
  try {
    const event = JSON.parse(match[1])
    if (!event || typeof event.title !== 'string' || typeof event.date !== 'string') {
      return { text: content, event: null }
    }
    return { text, event }
  } catch {
    return { text: content, event: null }
  }
}
