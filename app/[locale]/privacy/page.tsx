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

const COPY: Record<Locale, { paragraphs: string[] }> = {
  en: {
    paragraphs: [
      'BestSnowHotels does not collect personal information directly. We use lightweight analytics (page-view counts, country-level data) to understand which destinations interest readers most.',
      'Booking partners (Stay22, Booking, Expedia, Hotels.com) operate under their own privacy policies. Once you click through to them, their terms apply.',
      'We may set a small number of cookies for affiliate attribution. You can disable cookies in your browser, and it will not stop you browsing BestSnowHotels.',
    ],
  },
  fr: {
    paragraphs: [
      'BestSnowHotels ne collecte pas d\'informations personnelles en direct. Nous utilisons des outils d\'analyse légers (nombre de pages vues, données par pays) pour comprendre quelles destinations intéressent le plus nos lecteurs.',
      'Les partenaires de réservation (Stay22, Booking, Expedia, Hotels.com) appliquent leurs propres politiques de confidentialité. Dès que vous cliquez vers l\'un d\'eux, ce sont leurs conditions qui s\'appliquent.',
      'Nous pouvons déposer quelques cookies pour l\'attribution des commissions d\'affiliation. Vous pouvez désactiver les cookies dans votre navigateur, cela ne vous empêchera pas de consulter BestSnowHotels.',
    ],
  },
  es: {
    paragraphs: [
      'BestSnowHotels no recopila información personal de manera directa. Utilizamos herramientas de analítica ligeras (recuento de páginas vistas, datos por país) para entender qué destinos interesan más a nuestros lectores.',
      'Los socios de reserva (Stay22, Booking, Expedia, Hotels.com) aplican sus propias políticas de privacidad. En cuanto haces clic hacia uno de ellos, son sus condiciones las que rigen.',
      'Es posible que coloquemos algunas cookies para la atribución de comisiones de afiliación. Puedes desactivar las cookies en tu navegador, y esto no te impedirá consultar BestSnowHotels.',
    ],
  },
  pt: {
    paragraphs: [
      'O BestSnowHotels não recolhe informações pessoais diretamente. Usamos ferramentas de análise leves (contagem de páginas vistas, dados por país) para perceber que destinos interessam mais aos nossos leitores.',
      'Os parceiros de reserva (Stay22, Booking, Expedia, Hotels.com) aplicam as suas próprias políticas de privacidade. Assim que clica para um deles, são os termos desse parceiro que se aplicam.',
      'Podemos colocar alguns cookies para a atribuição de comissões de afiliação. Pode desactivar os cookies no seu navegador, e isso não o impedirá de consultar o BestSnowHotels.',
    ],
  },
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()
  const dict = await getDictionary(locale as Locale)
  const copy = COPY[locale as Locale]

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-8">
        {dict.footer.privacy}
      </h1>
      <div className="space-y-5 text-ice-800/90 leading-relaxed">
        {copy.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  )
}
