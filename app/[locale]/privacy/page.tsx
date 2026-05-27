import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, locales } from '../dictionaries'
import type { Locale } from '../dictionaries'
import { SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'

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
    title: `Privacy policy | BestSnowHotels`,
    alternates: { canonical: `${SITE_URL}/${locale}/privacy` },
  }
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-8">
        {dict.footer.privacy}
      </h1>
      <div className="space-y-5 text-ice-800/90 leading-relaxed">
        <p>
          BestSnowHotels does not collect personal information directly. We use lightweight
          analytics (page-view counts, country-level data) to understand which destinations
          interest readers most.
        </p>
        <p>
          Booking partners (Stay22, Booking, Expedia, Hotels.com) operate their own privacy
          policies. When you click through to one of them, their terms apply.
        </p>
        <p>
          We may set a small set of cookies for affiliate attribution. You can disable cookies
          in your browser; this will not affect your ability to browse BestSnowHotels.
        </p>
      </div>
    </article>
  )
}
