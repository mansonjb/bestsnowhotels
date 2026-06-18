import Link from 'next/link'
import type { Locale } from '@/app/[locale]/dictionaries'

interface FooterProps {
  locale: Locale
  dict: {
    footer: {
      tagline: string
      explore: string
      info: string
      about: string
      disclosure: string
      privacy: string
      contact: string
      disclosureText: string
      copyright: string
      network: string
      networkHoneymoon: string
      networkPets: string
    }
    nav: { destinations: string; countries: string; skiAreas: string; best: string; weather: string }
  }
}

export default function Footer({ locale, dict }: FooterProps) {
  return (
    <footer className="mt-24 border-t border-ice-100 bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 font-bold text-lg text-slate-deep"
            >
              <span aria-hidden className="text-2xl">❄</span>
              <span>BestSnowHotels</span>
            </Link>
            <p className="mt-3 text-sm text-ice-800/80 max-w-md leading-relaxed">
              {dict.footer.tagline}
            </p>
            <p className="mt-4 text-xs text-ice-700/70 max-w-md">
              {dict.footer.disclosureText}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-deep text-sm mb-3 uppercase tracking-wide">
              {dict.footer.explore}
            </h4>
            <ul className="space-y-2 text-sm text-ice-800/90">
              <li>
                <Link href={`/${locale}/destinations`} className="hover:text-slate-deep">
                  {dict.nav.destinations}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/countries`} className="hover:text-slate-deep">
                  {dict.nav.countries}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/ski-areas`} className="hover:text-slate-deep">
                  {dict.nav.skiAreas}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/best`} className="hover:text-slate-deep">
                  {dict.nav.best}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/weather`} className="hover:text-slate-deep">
                  {dict.nav.weather}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-deep text-sm mb-3 uppercase tracking-wide">
              {dict.footer.info}
            </h4>
            <ul className="space-y-2 text-sm text-ice-800/90">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-slate-deep">
                  {dict.footer.about}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/disclosure`} className="hover:text-slate-deep">
                  {dict.footer.disclosure}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-slate-deep">
                  {dict.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ice-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ice-700/70">
          <span>{dict.footer.copyright}</span>
          <span className="text-ice-500/80">
            {dict.footer.network}{' '}
            <a
              href="https://www.myhoneymoonhotel.com"
              target="_blank"
              rel="noopener"
              className="hover:text-ice-700 underline-offset-2 hover:underline"
            >
              {dict.footer.networkHoneymoon}
            </a>
            {' · '}
            <a
              href="https://www.hotelswithpets.com"
              target="_blank"
              rel="noopener"
              className="hover:text-ice-700 underline-offset-2 hover:underline"
            >
              {dict.footer.networkPets}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
