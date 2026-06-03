import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import '../globals.css'
import { getDictionary, hasLocale, locales } from './dictionaries'
import type { Locale } from './dictionaries'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
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
  }
  const descriptions: Record<Locale, string> = {
    en: 'Find ski-in/ski-out hotels across 152 resorts in France, Switzerland, Austria, Italy, Spain and Andorra. Real altitudes, real snow data, best prices.',
    fr: 'Trouvez des hôtels ski-in/ski-out dans 152 stations en France, en Suisse, en Autriche, en Italie, en Espagne et en Andorre. Altitudes réelles, données d\'enneigement, meilleurs prix.',
    es: 'Encuentra hoteles ski-in/ski-out en 152 estaciones de Francia, Suiza, Austria, Italia, España y Andorra. Altitudes reales, datos de nieve, los mejores precios.',
    pt: 'Encontre hotéis ski-in/ski-out em 152 estâncias em França, na Suíça, na Áustria, em Itália, em Espanha e em Andorra. Altitudes reais, dados de neve, os melhores preços.',
  }
  const l = hasLocale(locale) ? locale : 'en'

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: titles[l], template: '%s' },
    description: descriptions[l],
    authors: [{ name: 'BestSnowHotels', url: SITE_URL }],
    creator: 'BestSnowHotels',
    publisher: 'BestSnowHotels',
    applicationName: 'BestSnowHotels',
    category: 'travel',
    openGraph: {
      siteName: 'BestSnowHotels',
      type: 'website',
      locale:
        l === 'fr' ? 'fr_FR' : l === 'es' ? 'es_ES' : l === 'pt' ? 'pt_PT' : 'en_GB',
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

        {/* Google Analytics 4. Loaded after interactive so it does not block LCP. */}
        <Script
          id="ga4-loader"
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-L8WQTP6VZ8"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-L8WQTP6VZ8');`,
          }}
        />
      </body>
    </html>
  )
}
