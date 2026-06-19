'use client'

import { useMemo, useState } from 'react'
import type { Destination } from '@/lib/destinations'
import type { Locale } from '@/app/[locale]/dictionaries'
import DestinationCard from './DestinationCard'
import { localizeCountry } from '@/lib/countryNames'
import { localizeVibe } from '@/lib/vibes'

interface FilterLabels {
  altitude: string
  pistes: string
  snowScore: string
  viewHotels: string
  filterCountry: string
  filterAll: string
}

interface DestinationFiltersProps {
  destinations: Destination[]
  locale: Locale
  labels: FilterLabels
  uiLabels: {
    minAltitude: string
    minSnow: string
    vibe: string
    reset: string
    showing: string
    noResults: string
  }
}

export default function DestinationFilters({
  destinations,
  locale,
  labels,
  uiLabels,
}: DestinationFiltersProps) {
  const [country, setCountry] = useState<string>('all')
  const [minAltitude, setMinAltitude] = useState<number>(0)
  const [minSnow, setMinSnow] = useState<number>(0)
  const [vibe, setVibe] = useState<string>('all')

  const countries = useMemo(() => {
    const set = new Map<string, string>()
    for (const d of destinations) set.set(d.country, d.flag)
    return Array.from(set.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [destinations])

  const vibes = useMemo(() => {
    const set = new Set<string>()
    for (const d of destinations) for (const v of d.vibes) set.add(v)
    return Array.from(set).sort()
  }, [destinations])

  const filtered = useMemo(() => {
    return destinations.filter((d) => {
      if (country !== 'all' && d.country !== country) return false
      if (d.altitudeBase < minAltitude) return false
      if (d.snowScore < minSnow) return false
      if (vibe !== 'all' && !d.vibes.includes(vibe)) return false
      return true
    })
  }, [destinations, country, minAltitude, minSnow, vibe])

  const reset = () => {
    setCountry('all')
    setMinAltitude(0)
    setMinSnow(0)
    setVibe('all')
  }

  const active =
    country !== 'all' || minAltitude > 0 || minSnow > 0 || vibe !== 'all'

  return (
    <div>
      {/* Filter bar */}
      <div className="bg-white border border-ice-100 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Country */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ice-700 mb-1.5">
              {labels.filterCountry}
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full bg-ice-50 border border-ice-200 rounded-lg px-3 py-2 text-sm text-slate-deep focus:outline-none focus:ring-2 focus:ring-ice-400"
            >
              <option value="all">{labels.filterAll}</option>
              {countries.map(([name, flag]) => (
                <option key={name} value={name}>
                  {flag} {localizeCountry(name, locale)}
                </option>
              ))}
            </select>
          </div>

          {/* Min altitude slider */}
          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wide text-ice-700 mb-1.5">
              <span>{uiLabels.minAltitude}</span>
              <span className="tabular-nums text-slate-deep">
                {minAltitude} m
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={2400}
              step={100}
              value={minAltitude}
              onChange={(e) => setMinAltitude(Number(e.target.value))}
              className="w-full accent-ice-700"
            />
          </div>

          {/* Min snow score slider */}
          <div>
            <label className="flex justify-between text-xs font-semibold uppercase tracking-wide text-ice-700 mb-1.5">
              <span>{uiLabels.minSnow}</span>
              <span className="tabular-nums text-slate-deep">{minSnow}/100</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minSnow}
              onChange={(e) => setMinSnow(Number(e.target.value))}
              className="w-full accent-ice-700"
            />
          </div>

          {/* Vibe */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-ice-700 mb-1.5">
              {uiLabels.vibe}
            </label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full bg-ice-50 border border-ice-200 rounded-lg px-3 py-2 text-sm text-slate-deep focus:outline-none focus:ring-2 focus:ring-ice-400"
            >
              <option value="all">{labels.filterAll}</option>
              {vibes
                .map((v) => ({ slug: v, label: localizeVibe(v, locale) }))
                .sort((a, b) => a.label.localeCompare(b.label, locale))
                .map(({ slug, label }) => (
                  <option key={slug} value={slug}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Result count + reset */}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-ice-100">
          <div className="text-sm text-ice-800">
            {uiLabels.showing}{' '}
            <span className="font-bold text-slate-deep tabular-nums">
              {filtered.length}
            </span>{' '}
            / {destinations.length}
          </div>
          {active && (
            <button
              type="button"
              onClick={reset}
              className="text-xs font-semibold text-ice-700 hover:text-slate-deep underline underline-offset-2"
            >
              {uiLabels.reset}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-ice-50 border border-ice-100 rounded-2xl p-10 text-center text-ice-700">
          {uiLabels.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((d) => (
            <DestinationCard
              key={d.slug}
              destination={d}
              locale={locale}
              labels={labels}
            />
          ))}
        </div>
      )}
    </div>
  )
}
