import Link from 'next/link'
import type { ChipGroup } from '@/lib/related'

// Each group gets its own on-brand tone (cool ice, warm alpenglow, deep slate)
// so the chip cloud reads as a colourful, rounded map of where to go next.
const TONE: Record<ChipGroup['key'], { chip: string; dot: string; title: string }> = {
  explore: {
    chip: 'bg-ice-50 text-ice-800 border-ice-200 hover:bg-ice-100 hover:border-ice-300',
    dot: 'bg-ice-500',
    title: 'text-ice-700',
  },
  bestFor: {
    chip: 'bg-alpenglow-500/10 text-alpenglow-600 border-alpenglow-400/40 hover:bg-alpenglow-500/20',
    dot: 'bg-alpenglow-500',
    title: 'text-alpenglow-600',
  },
  compare: {
    chip: 'bg-slate-deep/[0.05] text-slate-deep border-slate-deep/15 hover:bg-slate-deep/10',
    dot: 'bg-slate-deep',
    title: 'text-slate-deep',
  },
  plan: {
    chip: 'bg-white text-ice-800 border-ice-200 hover:bg-frost hover:border-ice-300',
    dot: 'bg-ice-400',
    title: 'text-ice-700',
  },
}

const ICON: Record<ChipGroup['key'], string> = {
  explore: '🧭',
  bestFor: '🏆',
  compare: '⚖️',
  plan: '🧳',
}

export default function HubChips({
  groups,
  heading,
  sub,
}: {
  groups: ChipGroup[]
  heading: string
  sub: string
}) {
  if (!groups.length) return null
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl border border-ice-100 bg-gradient-to-br from-ice-50/70 via-white to-white p-6 sm:p-8 shadow-sm shadow-ice-900/5">
        <h2 className="text-2xl font-bold text-slate-deep">{heading}</h2>
        <p className="mt-1 text-ice-800/75 mb-6">{sub}</p>
        <div className="space-y-5">
          {groups.map((g) => {
            const t = TONE[g.key]
            return (
              <div key={g.key}>
                <div
                  className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider mb-2.5 ${t.title}`}
                >
                  <span aria-hidden>{ICON[g.key]}</span>
                  {g.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <Link
                      key={it.href + it.label}
                      href={it.href}
                      className={`inline-flex items-center gap-1.5 text-sm font-medium border rounded-full px-3.5 py-1.5 transition ${t.chip}`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${t.dot}`} aria-hidden />
                      {it.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
