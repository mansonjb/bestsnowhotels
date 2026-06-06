import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'BestSnowHotels: ski-in/ski-out hotels in the Alps and Pyrenees'

export default async function OG() {
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
          Ski-in/ski-out hotels across the Alps and Pyrenees
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
          <span>267 resorts</span>
          <span>·</span>
          <span>7 countries</span>
          <span>·</span>
          <span>5 languages</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
