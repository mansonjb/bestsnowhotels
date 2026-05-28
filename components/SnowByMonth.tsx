import type { MonthSnow } from '@/lib/snow'
import { monthLabel } from '@/lib/dates'
import type { Locale } from '@/app/[locale]/dictionaries'

interface SnowByMonthProps {
  data: MonthSnow[]
  locale: Locale
}

/**
 * Small bar chart of indicative average snow depth (cm) by month, near the top
 * of the resort. Heights are relative to the snowiest month in the set.
 */
export default function SnowByMonth({ data, locale }: SnowByMonthProps) {
  const max = Math.max(...data.map((d) => d.cm), 1)

  return (
    <div className="flex items-end justify-between gap-3 h-40">
      {data.map((m) => (
        <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="text-xs font-bold text-slate-deep tabular-nums mb-1">
            {m.cm}
            <span className="ml-0.5 font-normal text-ice-500">cm</span>
          </div>
          <div
            className="w-full max-w-[44px] rounded-t-lg bg-gradient-to-t from-ice-300 to-ice-500"
            style={{ height: `${Math.max(8, (m.cm / max) * 100)}%` }}
          />
          <div className="mt-2 text-xs font-medium text-ice-600 capitalize">
            {monthLabel(m.month, locale)}
          </div>
        </div>
      ))}
    </div>
  )
}
