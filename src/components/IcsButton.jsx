import { buildIcs, downloadIcs } from '../lib/ics.js'

function weekdayLabel(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const parsed = new Date(`${date}T00:00:00+09:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  return `(${days[parsed.getDay()]})`
}

export default function IcsButton({ event }) {
  if (!event) return null

  const time = event.time || '09:00'
  const location = event.location || ''
  const weekday = weekdayLabel(event.date)

  function handleSave() {
    downloadIcs(
      buildIcs({
        title: event.title,
        date: event.date,
        time,
        location,
      }),
    )
  }

  return (
    <div className="slip" style={{ marginTop: 8 }}>
      <b>{event.title}</b>
      <span>
        {event.date} {weekday} {time}
        {location ? ` · ${location}` : ''}
      </span>
      <button type="button" className="dl" onClick={handleSave}>
        캘린더에 넣기
      </button>
    </div>
  )
}
