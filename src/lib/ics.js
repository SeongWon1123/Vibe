export function buildIcs({ title, date, time = '09:00', location = '' }) {
  const dt = date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00'
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DongHak//KR',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@donghak`,
    `DTSTART;TZID=Asia/Seoul:${dt}`,
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
