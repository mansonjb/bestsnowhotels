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
    title: `Affiliate disclosure | BestSnowHotels`,
    alternates: { canonical: `${SITE_URL}/${locale}/disclosure` },
  }
}

export default async function DisclosurePage({
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
        {dict.footer.disclosure}
      </h1>
      <div className="space-y-5 text-ice-800/90 leading-relaxed">
        <p>{dict.footer.disclosureText}</p>
        <p>
          BestSnowHotels partners with Stay22, which routes booking links to Booking.com,
          Expedia, Hotels.com and other operators. When you click through and book, the
          operator pays a small affiliate commission. You pay the same price whether you
          come via BestSnowHotels or directly.
        </p>
        <p>
          We do not accept payment for editorial coverage. Resort selection and ski-in/ski-out
          notes are written based on publicly available data and our own research.
        </p>
      </div>
    </article>
  )
}
