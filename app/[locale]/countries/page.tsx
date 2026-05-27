import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { COUNTRIES } from '@/lib/countries'
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
  return {
    title: `Ski countries — Where to ski in Europe | BestSnowHotels`,
    alternates: { canonical: `${SITE_URL}/${locale}/countries` },
  }
}

export default async function CountriesIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const l = locale as Locale

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-deep tracking-tight">
          {dict.nav.countries}
        </h1>
        <p className="mt-4 text-lg text-ice-800/80 max-w-2xl">
          {dict.home.byCountrySubtitle}
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COUNTRIES.map((c) => {
          const count = destinations.filter((d) => d.country === c.name).length
          return (
            <Link
              key={c.slug}
              href={`/${l}/countries/${c.slug}`}
              className="card-hover bg-white border border-ice-100 rounded-2xl p-6 block"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl" aria-hidden>
                  {c.flag}
                </span>
                <div>
                  <h2 className="text-xl font-bold text-slate-deep">{c.name}</h2>
                  <div className="text-xs text-ice-700 tabular-nums">
                    {count} {count === 1 ? 'resort' : 'resorts'}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-ice-800/80 leading-relaxed line-clamp-4">
                {c.intro[l]}
              </p>
              <div className="mt-4 text-sm font-semibold text-ice-700">
                {dict.destinations.exploreMore}
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
