import { ImageResponse } from 'next/og'
import { locales, hasLocale } from './dictionaries'
import type { Locale } from './dictionaries'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'BestSnowHotels: ski-in/ski-out hotels around the world'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const TAGLINE: Record<Locale, string> = {
  en: 'Ski-in/ski-out hotels around the world',
  fr: 'Hôtels ski-in/ski-out partout dans le monde',
  es: 'Hoteles ski-in/ski-out en todo el mundo',
  pt: 'Hotéis ski-in/ski-out em todo o mundo',
  it: 'Hotel ski-in/ski-out in tutto il mondo',
  nl: 'Ski-in/ski-out hotels over de hele wereld',
  ja: '世界中のski-in/ski-outホテル',
  'zh-hk': '全球 ski-in/ski-out 酒店',
}

const LABELS: Record<Locale, { resorts: string; countries: string; languages: string }> = {
  en: { resorts: 'resorts', countries: 'countries', languages: 'languages' },
  fr: { resorts: 'stations', countries: 'pays', languages: 'langues' },
  es: { resorts: 'estaciones', countries: 'países', languages: 'idiomas' },
  pt: { resorts: 'estâncias', countries: 'países', languages: 'idiomas' },
  it: { resorts: 'località', countries: 'paesi', languages: 'lingue' },
  nl: { resorts: 'skigebieden', countries: 'landen', languages: 'talen' },
  ja: { resorts: 'リゾート', countries: 'カ国', languages: '言語' },
  'zh-hk': { resorts: '滑雪場', countries: '國家/地區', languages: '語言' },
}

export default async function OG({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const l: Locale = hasLocale(locale) ? locale : 'en'
  const lbl = LABELS[l]
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1f3d57 0%, #1c5882 50%, #2f8cc0 100%)',
          fontFamily: 'sans-serif',
          color: 'white',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 96,
            marginBottom: 20,
          }}
        >
          ❄
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            textAlign: 'center',
            lineHeight: 1.05,
          }}
        >
          BestSnowHotels
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            color: '#c5e2f3',
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          {TAGLINE[l]}
        </div>
        <div
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 50,
            fontSize: 22,
            color: '#e3f1fa',
          }}
        >
          <span>455 {lbl.resorts}</span>
          <span>·</span>
          <span>24 {lbl.countries}</span>
          <span>·</span>
          <span>7 {lbl.languages}</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
