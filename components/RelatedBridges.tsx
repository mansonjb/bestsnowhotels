import DestinationCard from './DestinationCard'
import type { Destination } from '@/lib/destinations'
import type { Locale } from '@/app/[locale]/dictionaries'

export interface Bridge {
  key: string
  title: string
  sub: string
  items: Destination[]
  accent: 'ice' | 'alpenglow'
}

/**
 * The end-of-page "bridges": one or more labelled rows of similar resorts (the
 * nearest by geography, then ones with a matching character), each as a card so
 * the reader always has an obvious next destination to jump to.
 */
export default function RelatedBridges({
  buckets,
  locale,
  cardLabels,
}: {
  buckets: Bridge[]
  locale: Locale
  cardLabels: { altitude: string; pistes: string; snowScore: string; viewHotels: string }
}) {
  const shown = buckets.filter((b) => b.items.length > 0)
  if (!shown.length) return null
  return (
    <section className="bg-ice-50 border-t border-ice-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {shown.map((b) => (
          <div key={b.key}>
            <div className="flex items-center gap-3 mb-1">
              <span
                className={`inline-block w-2.5 h-8 rounded-full ${
                  b.accent === 'alpenglow' ? 'bg-alpenglow-500' : 'bg-ice-500'
                }`}
                aria-hidden
              />
              <h2 className="text-2xl font-bold text-slate-deep">{b.title}</h2>
            </div>
            <p className="text-ice-800/80 mb-6 pl-[22px]">{b.sub}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {b.items.map((r) => (
                <DestinationCard key={r.slug} destination={r} locale={locale} labels={cardLabels} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
