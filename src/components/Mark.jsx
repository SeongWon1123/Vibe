export default function Mark({ glass = false, caption, light = false }) {
  return (
    <div className="logo">
      <div className={glass ? 'logo-mark glass' : 'logo-mark'} aria-hidden="true">
        同
      </div>
      <div>
        <b style={light ? { color: '#fff' } : undefined}>동학</b>
        {caption && <div className="cap">{caption}</div>}
      </div>
    </div>
  )
}
