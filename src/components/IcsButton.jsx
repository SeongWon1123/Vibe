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
    <div className="slip">
      <div className="cap">캘린더 일정</div>
      <b>{event.title}</b>
      <span>
        {event.date} {weekday} {time}
        {location ? ` · ${location}` : ''}
      </span>
      <span>하루 전 알림 포함</span>
      <button type="button" className="btn-start" onClick={handleSave}>
        <svg viewBox="0 0 24 24">
          <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        캘린더에 넣기 (.ics)
      </button>
    </div>
  )
}
