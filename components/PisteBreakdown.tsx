import type { Destination } from '@/lib/destinations'

interface PisteBreakdownProps {
  destination: Destination
  labels: {
    easy: string
    intermediate: string
    difficult: string
  }
}

/**
 * Visual breakdown of a resort's pisted terrain: a stacked bar by difficulty
 * plus the approximate kilometres at each level (total piste km split by the
 * indicative percentages stored on the destination).
 */
export default function PisteBreakdown({ destination: d, labels }: PisteBreakdownProps) {
  const { easy, intermediate, difficult } = d.runs
  const km = (pct: number) => Math.round((d.pistesKm * pct) / 100)

  const levels = [
    { key: 'easy', label: labels.easy, pct: easy, km: km(easy), color: 'bg-sky-500', dot: 'bg-sky-500' },
    { key: 'intermediate', label: labels.intermediate, pct: intermediate, km: km(intermediate), color: 'bg-red-500', dot: 'bg-red-500' },
    { key: 'difficult', label: labels.difficult, pct: difficult, km: km(difficult), color: 'bg-slate-deep', dot: 'bg-slate-deep' },
  ]

  return (
    <div className="bg-white rounded-2xl border border-ice-100 p-6">
      {/* Stacked difficulty bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {levels.map((lv) => (
          <div key={lv.key} className={lv.color} style={{ width: `${lv.pct}%` }} />
        ))}
      </div>

      {/* Legend with km per level */}
      <div className="grid grid-cols-3 gap-3">
        {levels.map((lv) => (
          <div key={lv.key}>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${lv.dot}`} aria-hidden />
              <span className="text-xs font-medium text-ice-700">{lv.label}</span>
            </div>
            <div className="mt-1 text-sm font-bold text-slate-deep tabular-nums">
              {lv.pct}%{' '}
              <span className="font-normal text-ice-500">({lv.km} km)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
