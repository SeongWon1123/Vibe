import { buildIcs, downloadIcs } from '../lib/ics.js'

function weekdayLabel(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const parsed = new Date(`${date}T00:00:00+09:00`)
  if (Number.isNaN(parsed.getTime())) return ''
  return days[parsed.getDay()]
}

export default function IcsButton({ event }) {
  if (!event) return null

  const time = event.time || '09:00'
  const location = event.location || ''
  const weekday = weekdayLabel(event.date)
  const dateLine = [event.date, weekday ? `(${weekday})` : '', time, location ? `· ${location}` : '']
    .filter(Boolean)
    .join(' ')

  function handleSave() {
    const ics = buildIcs({
      title: event.title,
      date: event.date,
      time,
      location,
    })
    downloadIcs(ics)
  }

  return (
    <div className="mt-3 rounded-xl border border-navy/15 bg-white p-3 text-left shadow-sm">
      <p className="text-sm font-semibold text-navy">📅 {event.title}</p>
      <p className="mt-1 text-xs text-stone-600">{dateLine}</p>
      <button
        type="button"
        onClick={handleSave}
        className="mt-3 w-full rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-dark"
      >
        내 캘린더에 저장
      </button>
    </div>
  )
}
