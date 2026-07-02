import { notFound } from 'next/navigation'
import Link from 'next/link'
import SafeImage from '@/components/SafeImage'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { BEST_FOR_LISTS } from '@/lib/bestFor'
import { destinations } from '@/lib/destinations'
import { SITE_URL } from '@/lib/site'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = (hasLocale(locale) ? locale : 'en') as Locale
  const dict = await getDictionary(l)
  return {
    title: `${dict.best.title} | BestSnowHotels`,
    description: dict.best.subtitle,
    alternates: {
      canonical: `${SITE_URL}/${l}/best`,
      languages: { ...Object.fromEntries(locales.map((x) => [x, `${SITE_URL}/${x}/best`])), "x-default": `${SITE_URL}/en/best` },
    },
  }
}

export default async function BestIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const l = locale as Locale
  const dict = await getDictionary(l)

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: dict.best.title,
    itemListElement: BEST_FOR_LISTS.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/${l}/best/${b.slug}`,
      name: b.name[l],
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {dict.best.title}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-3xl">{dict.best.subtitle}</p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {BEST_FOR_LISTS.map((b) => {
          const count = destinations.filter(b.filter).length
          return (
            <Link
              key={b.slug}
              href={`/${l}/best/${b.slug}`}
              className="group card-hover block bg-white rounded-2xl border border-ice-100 overflow-hidden"
            >
              <div className="relative h-40 overflow-hidden">
                <SafeImage
                  src={`/images/destinations/${b.heroSlug}.jpg`}
                  alt={b.name[l]}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-deep/80 via-slate-deep/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h2 className="text-xl font-bold text-white drop-shadow-md leading-snug">
                    {b.name[l]}
                  </h2>
                  <p className="text-sm text-white/90 drop-shadow tabular-nums mt-1">
                    {count} {count === 1 ? dict.destinations.resort : dict.destinations.resorts}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-ice-800/80 leading-relaxed line-clamp-3">{b.intro[l]}</p>
                <div className="mt-4 text-sm font-semibold text-ice-700 group-hover:text-ice-900 transition">
                  {dict.best.exploreList} →
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
