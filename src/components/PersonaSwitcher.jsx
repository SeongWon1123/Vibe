export default function PersonaSwitcher({ personas, selectedId, onSelect }) {
  const selected = personas.find((p) => p.id === selectedId) ?? personas[0]
  if (!selected) return null

  const { profile, label } = selected
  const missing = profile.gradAudit?.missing ?? []

  return (
    <header className="border-b border-navy/10 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-navy">
            동학 <span className="font-normal text-stone-500">同學</span>
          </h1>
        </div>
        <div className="flex shrink-0 rounded-lg bg-stone-100 p-0.5">
          {personas.map((persona) => {
            const active = persona.id === selected.id
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => onSelect(persona.id)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium sm:px-3 sm:text-sm ${
                  active ? 'bg-navy text-white shadow-sm' : 'text-stone-600 hover:text-navy'
                }`}
              >
                {persona.profile.grade}학년
              </button>
            )
          })}
        </div>
      </div>

      <section className="border-t border-stone-100 bg-stone-50 px-4 py-3">
        <p className="text-sm font-medium text-navy">{label}</p>
        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-stone-600 sm:grid-cols-4">
          <div>
            <dt className="text-stone-400">학년</dt>
            <dd>{profile.semester}</dd>
          </div>
          <div>
            <dt className="text-stone-400">관심</dt>
            <dd className="truncate">{profile.interests.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-stone-400">목표</dt>
            <dd className="truncate">{profile.goal}</dd>
          </div>
          <div>
            <dt className="text-stone-400">이수</dt>
            <dd>
              {profile.gradAudit
                ? `${profile.gradAudit.totalCredits}학점${
                    missing.length ? ` · 부족 ${missing.length}` : ''
                  }`
                : '졸업사정 전'}
            </dd>
          </div>
        </dl>
        {missing.length > 0 && (
          <p className="mt-2 text-xs text-stone-500">부족: {missing.join(', ')}</p>
        )}
      </section>
    </header>
  )
}
