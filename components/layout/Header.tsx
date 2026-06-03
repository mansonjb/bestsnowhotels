'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/app/[locale]/dictionaries'

interface HeaderProps {
  locale: Locale
  dict: {
    nav: { home: string; destinations: string; countries: string; skiAreas: string; best: string; about: string }
  }
}

const localeLabels: Record<Locale, string> = { en: 'EN', fr: 'FR', es: 'ES', pt: 'PT' }
const allLocales: Locale[] = ['en', 'fr', 'es', 'pt']

export default function Header({ locale, dict }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    return segments.join('/') || `/${newLocale}`
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-ice-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-bold text-lg text-slate-deep"
            onClick={() => setOpen(false)}
          >
            <span aria-hidden className="text-2xl">❄</span>
            <span>BestSnowHotels</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ice-800">
            <Link href={`/${locale}/destinations`} className="hover:text-slate-deep transition">
              {dict.nav.destinations}
            </Link>
            <Link href={`/${locale}/countries`} className="hover:text-slate-deep transition">
              {dict.nav.countries}
            </Link>
            <Link href={`/${locale}/ski-areas`} className="hover:text-slate-deep transition">
              {dict.nav.skiAreas}
            </Link>
            <Link href={`/${locale}/best`} className="hover:text-slate-deep transition">
              {dict.nav.best}
            </Link>
            <Link href={`/${locale}/about`} className="hover:text-slate-deep transition">
              {dict.nav.about}
            </Link>

            <div className="flex items-center gap-1 ml-2 border-l border-ice-200 pl-4">
              {allLocales.map((l) => (
                <Link
                  key={l}
                  href={switchLocale(l)}
                  className={
                    'text-xs font-semibold px-2 py-1 rounded ' +
                    (l === locale
                      ? 'bg-slate-deep text-white'
                      : 'text-ice-700 hover:bg-ice-50')
                  }
                >
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded text-ice-800"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-ice-100 pt-3 space-y-2">
            <Link
              href={`/${locale}/destinations`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ice-800"
            >
              {dict.nav.destinations}
            </Link>
            <Link
              href={`/${locale}/countries`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ice-800"
            >
              {dict.nav.countries}
            </Link>
            <Link
              href={`/${locale}/ski-areas`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ice-800"
            >
              {dict.nav.skiAreas}
            </Link>
            <Link
              href={`/${locale}/best`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ice-800"
            >
              {dict.nav.best}
            </Link>
            <Link
              href={`/${locale}/about`}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-ice-800"
            >
              {dict.nav.about}
            </Link>
            <div className="flex items-center gap-2 pt-2 border-t border-ice-100">
              {allLocales.map((l) => (
                <Link
                  key={l}
                  href={switchLocale(l)}
                  onClick={() => setOpen(false)}
                  className={
                    'text-xs font-semibold px-3 py-1 rounded ' +
                    (l === locale
                      ? 'bg-slate-deep text-white'
                      : 'text-ice-700 bg-ice-50')
                  }
                >
                  {localeLabels[l]}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
