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
    title: `About BestSnowHotels`,
    alternates: { canonical: `${SITE_URL}/${locale}/about` },
  }
}

const COPY: Record<Locale, { title: string; paragraphs: string[] }> = {
  en: {
    title: 'About BestSnowHotels',
    paragraphs: [
      'BestSnowHotels is a small editorial project with one job: helping skiers find truly ski-in/ski-out hotels across the Alps and Pyrenees, without wading through generic booking sites.',
      'We pick 41 resorts in France, Switzerland, Austria, Italy, Spain and Andorra. For each one we list verified altitudes, piste kilometres, season dates and a transparent ski-in/ski-out note. The interactive map for every destination is powered by Stay22 — it compares Booking, Expedia and Hotels.com in real time, so you always see the best price.',
      'We earn a small commission when you book through our links. That commission costs you nothing extra. It funds the site, full stop.',
    ],
  },
  fr: {
    title: 'À propos de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels est un projet éditorial avec une mission unique : aider les skieurs à trouver de vrais hôtels ski-in/ski-out dans les Alpes et les Pyrénées, sans avoir à patauger dans des sites de réservation génériques.',
      'Nous sélectionnons 41 stations en France, Suisse, Autriche, Italie, Espagne et Andorre. Pour chacune, on liste les altitudes vérifiées, les kilomètres de pistes, les dates de saison et une note ski-in/ski-out transparente. La carte interactive de chaque destination est fournie par Stay22 — elle compare Booking, Expedia et Hotels.com en temps réel, vous voyez toujours le meilleur prix.',
      'Nous percevons une commission quand vous réservez via nos liens. Cette commission ne vous coûte rien de plus. Elle finance le site, point.',
    ],
  },
  es: {
    title: 'Acerca de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels es un proyecto editorial con una sola misión: ayudar a los esquiadores a encontrar hoteles realmente ski-in/ski-out en los Alpes y los Pirineos, sin perderse en sitios de reserva genéricos.',
      'Seleccionamos 41 estaciones en Francia, Suiza, Austria, Italia, España y Andorra. Para cada una listamos altitudes verificadas, kilómetros de pistas, fechas de temporada y una nota ski-in/ski-out transparente. El mapa interactivo de cada destino lo proporciona Stay22 — compara Booking, Expedia y Hotels.com en tiempo real, siempre ves el mejor precio.',
      'Recibimos una pequeña comisión cuando reservas a través de nuestros enlaces. Esta comisión no te cuesta nada adicional. Financia el sitio, fin.',
    ],
  },
  pt: {
    title: 'Sobre o BestSnowHotels',
    paragraphs: [
      'O BestSnowHotels é um pequeno projeto editorial com uma missão única: ajudar esquiadores a encontrar hotéis verdadeiramente ski-in/ski-out nos Alpes e nos Pirenéus, sem se perderem em sites de reserva genéricos.',
      'Selecionamos 41 estâncias em França, Suíça, Áustria, Itália, Espanha e Andorra. Para cada uma listamos altitudes verificadas, quilómetros de pistas, datas da época e uma nota ski-in/ski-out transparente. O mapa interativo de cada destino é fornecido pelo Stay22 — compara Booking, Expedia e Hotels.com em tempo real, vê sempre o melhor preço.',
      'Recebemos uma pequena comissão quando reserva através das nossas ligações. Esta comissão não lhe custa nada adicional. Financia o site, e mais nada.',
    ],
  },
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  await getDictionary(locale as Locale)
  const copy = COPY[locale as Locale]

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-8">
        {copy.title}
      </h1>
      <div className="prose prose-lg max-w-none space-y-5 text-ice-800/90 leading-relaxed">
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}
