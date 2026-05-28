import type { Destination } from '@/lib/destinations'

interface PisteBreakdownProps {
  destination: Destination
  labels: {
    green: string
    blue: string
    red: string
    black: string
    runs: string
  }
}

/**
 * Number of marked runs by piste colour, as a stacked bar plus a per-colour
 * count. Colours with no runs (e.g. green in Italy, Austria and Switzerland)
 * are skipped. Counts are indicative.
 */
export default function PisteBreakdown({ destination: d, labels }: PisteBreakdownProps) {
  const { green, blue, red, black } = d.pisteCounts
  const total = green + blue + red + black

  const levels = [
    { key: 'green', label: labels.green, count: green, bar: 'bg-green-500', dot: 'bg-green-500' },
    { key: 'blue', label: labels.blue, count: blue, bar: 'bg-sky-500', dot: 'bg-sky-500' },
    { key: 'red', label: labels.red, count: red, bar: 'bg-red-500', dot: 'bg-red-500' },
    { key: 'black', label: labels.black, count: black, bar: 'bg-slate-deep', dot: 'bg-slate-deep' },
  ].filter((lv) => lv.count > 0)

  return (
    <div className="bg-white rounded-2xl border border-ice-100 p-6">
      {/* Total runs */}
      <div className="mb-5">
        <span className="text-3xl font-bold text-slate-deep tabular-nums">{total}</span>{' '}
        <span className="text-sm text-ice-600">{labels.runs}</span>
      </div>

      {/* Stacked bar by run count */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5">
        {levels.map((lv) => (
          <div
            key={lv.key}
            className={lv.bar}
            style={{ width: `${(lv.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Per-colour counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {levels.map((lv) => (
          <div key={lv.key}>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${lv.dot}`} aria-hidden />
              <span className="text-xs font-medium text-ice-700">{lv.label}</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-deep tabular-nums">
              {lv.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
