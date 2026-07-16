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
    nav: {
      destinations: string; countries: string; skiAreas: string; best: string; weather: string
      guides: string; skiInSkiOut: string; compare: string; when: string
    }
  }
}

const REGIONS_LABEL = { en: 'Ski regions', fr: 'Régions de ski', es: 'Regiones de esquí', pt: 'Regiões de esqui', it: 'Regioni sciistiche' } as Record<Locale, string>

const PLAN = {
  heading: { en: 'Plan your trip', fr: 'Préparer son séjour', es: 'Planifica tu viaje', pt: 'Planeie a viagem', it: 'Pianifica il viaggio' } as Record<Locale, string>,
  winter: { en: 'Winter 2027', fr: 'Hiver 2027', es: 'Invierno 2027', pt: 'Inverno 2027', it: 'Inverno 2027' } as Record<Locale, string>,
  opening: { en: 'Opening dates', fr: "Dates d'ouverture", es: 'Fechas de apertura', pt: 'Datas de abertura', it: 'Date di apertura' } as Record<Locale, string>,
  themes: { en: 'Ski guides by theme', fr: 'Guides ski par thème', es: 'Guías por tema', pt: 'Guias por tema', it: 'Guide per tema' } as Record<Locale, string>,
  family: { en: 'Family skiing by country', fr: 'Ski en famille par pays', es: 'Esquí en familia por país', pt: 'Esqui em família por país', it: 'Sci in famiglia per paese' } as Record<Locale, string>,
  nearAirport: { en: 'Ski resorts near an airport', fr: "Stations près d'un aéroport", es: 'Estaciones cerca de un aeropuerto', pt: 'Estâncias perto de um aeroporto', it: 'Località vicino a un aeroporto' } as Record<Locale, string>,
  southern: { en: 'Ski in July & August', fr: 'Skier en juillet et août', es: 'Esquiar en julio y agosto', pt: 'Esquiar em julho e agosto', it: 'Sciare a luglio e agosto' } as Record<Locale, string>,
}

export default function Footer({ locale, dict }: FooterProps) {
  return (
    <footer className="mt-24 border-t border-ice-100 bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="sm:col-span-2">
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
                <Link href={`/${locale}/regions`} className="hover:text-slate-deep">
                  {REGIONS_LABEL[locale]}
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
              {PLAN.heading[locale]}
            </h4>
            <ul className="space-y-2 text-sm text-ice-800/90">
              <li>
                <Link href={`/${locale}/guides`} className="hover:text-slate-deep">{dict.nav.guides}</Link>
              </li>
              <li>
                <Link href={`/${locale}/family-ski`} className="hover:text-slate-deep">{PLAN.family[locale]}</Link>
              </li>
              <li>
                <Link href={`/${locale}/ski-near`} className="hover:text-slate-deep">{PLAN.nearAirport[locale]}</Link>
              </li>
              <li>
                <Link href={`/${locale}/southern-hemisphere`} className="hover:text-slate-deep">{PLAN.southern[locale]}</Link>
              </li>
              <li>
                <Link href={`/${locale}/winter-2027`} className="hover:text-slate-deep">{PLAN.winter[locale]}</Link>
              </li>
              <li>
                <Link href={`/${locale}/ski-in-ski-out`} className="hover:text-slate-deep">{dict.nav.skiInSkiOut}</Link>
              </li>
              <li>
                <Link href={`/${locale}/compare`} className="hover:text-slate-deep">{dict.nav.compare}</Link>
              </li>
              <li>
                <Link href={`/${locale}/when`} className="hover:text-slate-deep">{dict.nav.when}</Link>
              </li>
              <li>
                <Link href={`/${locale}/opening-dates`} className="hover:text-slate-deep">{PLAN.opening[locale]}</Link>
              </li>
              <li>
                <Link href={`/${locale}/ski-guides`} className="hover:text-slate-deep">{PLAN.themes[locale]}</Link>
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
                <Link href={`/${locale}/methodology`} className="hover:text-slate-deep">
                  {({ en: 'How we score resorts', fr: 'Notre méthodologie', es: 'Nuestra metodología', pt: 'A nossa metodologia', it: 'La nostra metodologia' } as Record<string, string>)[locale] ?? 'Methodology'}
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
