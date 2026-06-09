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
      'We cover 379 resorts in France, Switzerland, Austria, Italy, Spain, Andorra, Germany, Norway, Sweden, Finland, Japan, the United States, Morocco, Algeria, Lesotho, South Africa, Egypt and Canada. For each one, we list verified altitudes, piste kilometres, season dates and a transparent ski-in/ski-out note. The interactive map on every destination page is powered by Stay22. It compares Booking, Expedia and Hotels.com in real time so you always see the best price.',
      'We earn a small commission when you book through our links. That commission costs you nothing extra. It funds the site, and that\'s all.',
    ],
  },
  fr: {
    title: 'À propos de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels est un petit projet éditorial avec une mission unique : aider les skieurs à trouver de vrais hôtels ski-in/ski-out dans les Alpes et les Pyrénées, sans passer des heures sur des sites de réservation génériques.',
      'Nous couvrons 379 stations en France, en Suisse, en Autriche, en Italie, en Espagne, en Andorre, en Allemagne, en Norvège, en Suède, en Finlande, au Japon, aux États-Unis, au Maroc, en Algérie, au Lesotho, en Afrique du Sud, en Égypte et au Canada. Pour chacune, nous indiquons les altitudes vérifiées, les kilomètres de pistes, les dates de saison et une note ski-in/ski-out transparente. La carte interactive de chaque destination est fournie par Stay22. Elle compare Booking, Expedia et Hotels.com en temps réel, vous voyez donc toujours le meilleur prix.',
      'Nous percevons une petite commission lorsque vous réservez via nos liens. Cette commission ne vous coûte rien de plus. Elle finance le site, point final.',
    ],
  },
  es: {
    title: 'Acerca de BestSnowHotels',
    paragraphs: [
      'BestSnowHotels es un pequeño proyecto editorial con una sola misión : ayudar a los esquiadores a encontrar hoteles realmente ski-in/ski-out en los Alpes y los Pirineos, sin perderse en sitios de reserva genéricos.',
      'Cubrimos 379 estaciones en Francia, Suiza, Austria, Italia, España, Andorra, Alemania, Noruega, Suecia, Finlandia, Japón, Estados Unidos, Marruecos, Argelia, Lesoto, Sudáfrica, Egipto y Canadá. Para cada una indicamos las altitudes verificadas, los kilómetros de pistas, las fechas de temporada y una nota ski-in/ski-out transparente. El mapa interactivo de cada destino lo proporciona Stay22. Compara Booking, Expedia y Hotels.com en tiempo real, así que siempre ves el mejor precio.',
      'Recibimos una pequeña comisión cuando reservas a través de nuestros enlaces. Esta comisión no te cuesta nada adicional. Sirve para financiar el sitio, y nada más.',
    ],
  },
  pt: {
    title: 'Sobre o BestSnowHotels',
    paragraphs: [
      'O BestSnowHotels é um pequeno projeto editorial com uma missão única: ajudar os esquiadores a encontrar hotéis verdadeiramente ski-in/ski-out nos Alpes e nos Pirenéus, sem se perderem em sites de reserva genéricos.',
      'Cobrimos 379 estâncias em França, na Suíça, na Áustria, em Itália, em Espanha, em Andorra, na Alemanha, na Noruega, na Suécia, na Finlândia, no Japão, nos Estados Unidos, em Marrocos, na Argélia, no Lesoto, na África do Sul, no Egito e no Canadá. Para cada uma indicamos as altitudes verificadas, os quilómetros de pistas, as datas da época e uma nota ski-in/ski-out transparente. O mapa interativo de cada destino é fornecido pelo Stay22. Compara Booking, Expedia e Hotels.com em tempo real, por isso vê sempre o melhor preço.',
      'Recebemos uma pequena comissão quando reserva através das nossas ligações. Essa comissão não lhe custa nada adicional. Serve para financiar o site, e mais nada.',
    ],
  },
  it: {
    title: 'Chi è BestSnowHotels',
    paragraphs: [
      'BestSnowHotels è un piccolo progetto editoriale con un\'unica missione: aiutare gli sciatori a trovare hotel davvero ski-in/ski-out sulle Alpi e sui Pirenei, senza perdersi tra siti di prenotazione generici.',
      'Copriamo 379 località in Francia, Svizzera, Austria, Italia, Spagna, Andorra, Germania, Norvegia, Svezia, Finlandia, Giappone, Stati Uniti, Marocco, Algeria, Lesotho, Sudafrica, Egitto e Canada. Per ognuna indichiamo quote verificate, chilometri di piste, date di stagione e una nota ski-in/ski-out trasparente. La mappa interattiva di ogni destinazione è fornita da Stay22. Confronta Booking, Expedia e Hotels.com in tempo reale, così vedi sempre il miglior prezzo.',
      'Riceviamo una piccola commissione quando prenoti tramite i nostri link. Quella commissione non ti costa nulla in più. Serve a finanziare il sito, e niente altro.',
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
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
