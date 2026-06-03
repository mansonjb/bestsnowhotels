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

const COPY: Record<Locale, { paragraphs: string[] }> = {
  en: {
    paragraphs: [
      'BestSnowHotels works with Stay22, which routes booking links to Booking.com, Expedia, Hotels.com and a few other operators. When you click through and book, the operator pays a small affiliate commission. You pay the same price whether you come via BestSnowHotels or directly.',
      'We do not accept payment for editorial coverage. Resort selection and ski-in/ski-out notes are written from publicly available data and our own research.',
    ],
  },
  fr: {
    paragraphs: [
      'BestSnowHotels travaille avec Stay22, qui redirige les liens de réservation vers Booking.com, Expedia, Hotels.com et quelques autres opérateurs. Quand vous cliquez et que vous réservez, l\'opérateur verse une petite commission d\'affiliation. Vous payez le même prix que vous passiez par BestSnowHotels ou directement par l\'opérateur.',
      'Nous n\'acceptons pas de rémunération pour une mise en avant éditoriale. La sélection des stations et les notes ski-in/ski-out sont rédigées à partir de données publiques et de nos propres recherches.',
    ],
  },
  es: {
    paragraphs: [
      'BestSnowHotels trabaja con Stay22, que redirige los enlaces de reserva a Booking.com, Expedia, Hotels.com y otros operadores. Cuando haces clic y reservas, el operador abona una pequeña comisión de afiliación. Pagas el mismo precio tanto si pasas por BestSnowHotels como si reservas directamente.',
      'No aceptamos pagos por cobertura editorial. La selección de estaciones y las notas ski-in/ski-out se redactan a partir de datos públicos y de nuestras propias investigaciones.',
    ],
  },
  pt: {
    paragraphs: [
      'O BestSnowHotels trabalha com a Stay22, que redirige as ligações de reserva para o Booking.com, a Expedia, o Hotels.com e alguns outros operadores. Quando clica e reserva, o operador paga uma pequena comissão de afiliação. Paga o mesmo preço quer venha pelo BestSnowHotels quer reserve diretamente.',
      'Não aceitamos pagamentos para destaque editorial. A selecção de estâncias e as notas ski-in/ski-out são redigidas a partir de dados públicos e da nossa própria pesquisa.',
    ],
  },
  it: {
    paragraphs: [
      'BestSnowHotels collabora con Stay22, che indirizza i link di prenotazione a Booking.com, Expedia, Hotels.com e ad alcuni altri operatori. Quando clicchi e prenoti, l\'operatore versa una piccola commissione di affiliazione. Paghi lo stesso prezzo che tu passi per BestSnowHotels o prenoti direttamente.',
      'Non accettiamo pagamenti per coperture editoriali. La selezione delle località e le note ski-in/ski-out sono redatte a partire da dati pubblici e dalle nostre ricerche.',
    ],
  },
}

export default async function DisclosurePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const copy = COPY[locale as Locale]

  return (
    <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-8">
        {dict.footer.disclosure}
      </h1>
      <div className="space-y-5 text-ice-800/90 leading-relaxed">
        <p>{dict.footer.disclosureText}</p>
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}
