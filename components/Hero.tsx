import Link from 'next/link'
import type { Locale } from '@/app/[locale]/dictionaries'

interface HeroProps {
  locale: Locale
  dict: {
    hero: {
      badge: string
      title: string
      subtitle: string
      cta: string
      stat1Value: string
      stat1Label: string
      stat2Value: string
      stat2Label: string
      stat3Value: string
      stat3Label: string
    }
  }
}

export default function Hero({ locale, dict }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-ice-50 via-white to-white border-b border-ice-100">
      {/* Background snow texture */}
      <div className="absolute inset-0 bg-snow-grain opacity-30 pointer-events-none" />

      {/* Decorative peaks SVG */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full text-ice-100"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,200 L0,140 L180,40 L320,120 L500,30 L680,110 L860,20 L1040,90 L1220,40 L1440,110 L1440,200 Z"
          fill="currentColor"
        />
      </svg>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 sm:pt-24 sm:pb-40">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-ice-700 bg-ice-100 px-4 py-1.5 rounded-full mb-6">
            {dict.hero.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-deep leading-tight">
            {dict.hero.title}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-ice-800/80 leading-relaxed">
            {dict.hero.subtitle}
          </p>

          <div className="mt-10">
            <Link
              href={`/${locale}/destinations`}
              className="inline-block bg-slate-deep text-white font-semibold px-8 py-3.5 rounded-full hover:bg-ice-800 transition shadow-lg shadow-ice-900/20"
            >
              {dict.hero.cta} →
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
            {[
              { v: dict.hero.stat1Value, l: dict.hero.stat1Label },
              { v: dict.hero.stat2Value, l: dict.hero.stat2Label },
              { v: dict.hero.stat3Value, l: dict.hero.stat3Label },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-2xl sm:text-3xl font-bold text-ice-700 tabular-nums">
                  {s.v}
                </div>
                <div className="text-xs font-medium uppercase tracking-wide text-ice-600 mt-1">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
