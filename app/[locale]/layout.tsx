import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import '../globals.css'
import { getDictionary, hasLocale, locales } from './dictionaries'
import type { Locale } from './dictionaries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Analytics from '@/components/Analytics'
import { STAY22_ID, SITE_URL } from '@/lib/site'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const titles: Record<Locale, string> = {
    en: 'BestSnowHotels: ski-in/ski-out hotels in the Alps and Pyrenees',
    fr: 'BestSnowHotels : hôtels ski-in/ski-out dans les Alpes et les Pyrénées',
    es: 'BestSnowHotels : hoteles ski-in/ski-out en los Alpes y los Pirineos',
    pt: 'BestSnowHotels: hotéis ski-in/ski-out nos Alpes e nos Pirenéus',
    it: 'BestSnowHotels: hotel ski-in/ski-out sulle Alpi e sui Pirenei',
    nl: 'BestSnowHotels: ski-in/ski-out hotels in de Alpen en de Pyreneeën',
  }
  const descriptions: Record<Locale, string> = {
    en: 'Find ski-in/ski-out hotels across 455 resorts in France, Switzerland, Austria, Italy, Spain, Andorra, Germany, Norway, Sweden, Finland, Japan, the United States, Morocco, Algeria, Lesotho, South Africa, Egypt, Canada, South Korea, Australia, New Zealand and Chile. Real altitudes, real snow data, best prices.',
    fr: 'Trouvez des hôtels ski-in/ski-out dans 455 stations en France, en Suisse, en Autriche, en Italie, en Espagne, en Andorre, en Allemagne, en Norvège, en Suède, en Finlande, au Japon, aux États-Unis, au Maroc, en Algérie, au Lesotho, en Afrique du Sud, en Égypte, au Canada, en Corée du Sud, en Australie, en Nouvelle-Zélande et au Chili. Altitudes réelles, données d\'enneigement, meilleurs prix.',
    es: 'Encuentra hoteles ski-in/ski-out en 455 estaciones de Francia, Suiza, Austria, Italia, España, Andorra, Alemania, Noruega, Suecia, Finlandia, Japón, Estados Unidos, Marruecos, Argelia, Lesoto, Sudáfrica, Egipto, Canadá, Corea del Sur, Australia, Nueva Zelanda y Chile. Altitudes reales, datos de nieve, los mejores precios.',
    pt: 'Encontre hotéis ski-in/ski-out em 455 estâncias em França, na Suíça, na Áustria, em Itália, em Espanha, em Andorra, na Alemanha, na Noruega, na Suécia, na Finlândia, no Japão, nos Estados Unidos, em Marrocos, na Argélia, no Lesoto, na África do Sul, no Egito, no Canadá, na Coreia do Sul, na Austrália, na Nova Zelândia e no Chile. Altitudes reais, dados de neve, os melhores preços.',
    it: 'Trova hotel ski-in/ski-out in 455 località tra Francia, Svizzera, Austria, Italia, Spagna, Andorra, Germania, Norvegia, Svezia, Finlandia, Giappone, Stati Uniti, Marocco, Algeria, Lesotho, Sudafrica, Egitto, Canada, Corea del Sud, Australia, Nuova Zelanda e Cile. Quote reali, dati neve veri, prezzi migliori.',
    nl: 'Vind ski-in/ski-out hotels in 455 skigebieden in Frankrijk, Zwitserland, Oostenrijk, Italië, Spanje, Andorra, Duitsland, Noorwegen, Zweden, Finland, Japan, de Verenigde Staten, Marokko, Algerije, Lesotho, Zuid-Afrika, Egypte, Canada, Zuid-Korea, Australië, Nieuw-Zeeland en Chili. Echte hoogtes, echte sneeuwdata, de beste prijzen.',
  }
  const l = hasLocale(locale) ? locale : 'en'

  // Google Search Console "HTML tag" verification. Paste the token from the
  // GSC verification screen into the GOOGLE_SITE_VERIFICATION env var on Vercel
  // and redeploy; Next renders <meta name="google-site-verification" ...> on
  // every page. Left undefined (and omitted) when the env var is not set, so
  // it is a no-op until you actually need it. The simplest path is usually the
  // Google Analytics method instead (GA4 is already installed) which needs no
  // token at all; see GSC-SETUP.md.
  const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titles[l], template: '%s' },
    description: descriptions[l],
    authors: [{ name: 'BestSnowHotels', url: SITE_URL }],
    creator: 'BestSnowHotels',
    publisher: 'BestSnowHotels',
    applicationName: 'BestSnowHotels',
    category: 'travel',
    verification: googleVerification ? { google: googleVerification } : undefined,
    openGraph: {
      siteName: 'BestSnowHotels',
      type: 'website',
      locale:
        l === 'fr' ? 'fr_FR' : l === 'es' ? 'es_ES' : l === 'pt' ? 'pt_PT' : l === 'it' ? 'it_IT' : l === 'nl' ? 'nl_NL' : 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  return (
    <html lang={locale} className={inter.className}>
      <head>
        <link rel="preconnect" href="https://www.stay22.com" />
        <link rel="dns-prefetch" href="https://scripts.stay22.com" />
        <link rel="preconnect" href="https://www.booking.com" />
      </head>
      <body className="bg-powder text-slate-deep antialiased">
        <Header locale={locale as Locale} dict={dict} />
        <main>{children}</main>
        <Footer locale={locale as Locale} dict={dict} />

        {/* Stay22 LetMeAllez. Auto-upgrades Booking.com links across the site
            to multi-platform affiliate links (Booking, Expedia, Hotels.com). */}
        <Script
          id="stay22-letmeallez"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(s,t,a,y,twenty,two){s.Stay22=s.Stay22||{};s.Stay22.params={lmaID:'${STAY22_ID}'};twenty=t.createElement(a);two=t.getElementsByTagName(a)[0];twenty.async=1;twenty.src=y;two.parentNode.insertBefore(twenty,two)})(window,document,'script','https://scripts.stay22.com/letmeallez.js');`,
          }}
        />

        {/* Google Analytics 4 + Microsoft Clarity, injected client-side and gated
            on the geo-suppression cookie (see components/Analytics.tsx and
            proxy.ts). Singapore datacenter bots never fire these tags, so they
            stop polluting analytics, while real SG visitors still browse + book. */}
        <Analytics />
      </body>
    </html>
  )
}
