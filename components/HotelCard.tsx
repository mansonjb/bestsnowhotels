import SafeImage from './SafeImage'
import type { Hotel } from '@/lib/hotels'
import type { Locale } from '@/app/[locale]/dictionaries'
import {
  hotelRatingWord,
  hotelPriceWord,
  hotelBlurb,
  hotelReason,
  hotelDistanceLabel,
  whyWeLikeLabel,
  topPickLabel,
} from '@/lib/hotelContent'

interface HotelCardProps {
  hotel: Hotel
  /** Stay22 Allez deep link, built by the page with the resort + country. */
  bookHref: string
  resortName: string
  locale: Locale
  /** Render the larger, horizontal "top pick" treatment. */
  featured?: boolean
  labels: {
    reviews: string
    checkAvailability: string
    toSlopes: string
    from: string
    perNight: string
  }
}

function formatReviews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function RatingPill({ hotel, labels }: { hotel: Hotel; labels: HotelCardProps['labels'] }) {
  return (
    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-lg pl-1 pr-2 py-1 shadow-sm">
      <span className="bg-ice-600 text-white rounded-md px-1.5 py-0.5 text-xs font-bold leading-none tabular-nums">
        {hotel.rating.toFixed(1)}
      </span>
      <span className="text-ice-700 text-xs font-medium leading-none tabular-nums">
        {formatReviews(hotel.reviewCount)} {labels.reviews}
      </span>
    </div>
  )
}

function PricePill({ price }: { price: number }) {
  return (
    <div className="absolute top-3 right-3 bg-amber-400 text-slate-deep rounded-lg px-2.5 py-1.5 text-xs font-bold leading-none shadow-sm tabular-nums">
      €{price}
    </div>
  )
}

function HotelImage({ hotel }: { hotel: Hotel }) {
  if (!hotel.hasPhoto) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-ice-100 via-ice-200 to-ice-400">
        <div className="absolute inset-0 bg-snow-grain opacity-50" />
      </div>
    )
  }
  return (
    <SafeImage
      src={`/images/hotels/${hotel.id}.jpg`}
      alt={hotel.name}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover group-hover:scale-105 transition duration-500"
    />
  )
}

function Why({ reason, locale }: { reason: string; locale: Locale }) {
  return (
    <div className="mt-3 rounded-xl bg-ice-50 border border-ice-100 p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ice-700">
        <span aria-hidden>👍</span>
        {whyWeLikeLabel(locale)}
      </div>
      <p className="mt-1.5 text-xs text-ice-800/90 leading-relaxed">{reason}</p>
    </div>
  )
}

function Chips({ chips }: { chips: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span
          key={c}
          className="inline-block text-[10px] font-medium text-ice-700 bg-white border border-ice-200 rounded-full px-2 py-0.5"
        >
          {c}
        </span>
      ))}
    </div>
  )
}

function PriceFooter({
  price,
  labels,
  bookHref,
}: {
  price: number
  labels: HotelCardProps['labels']
  bookHref: string
}) {
  return (
    <div className="mt-auto pt-4 flex items-end justify-between gap-2">
      <div className="leading-none">
        <div className="text-[10px] uppercase tracking-wide text-ice-500">{labels.from}</div>
        <div className="mt-1 text-lg font-bold text-slate-deep tabular-nums">
          €{price}
          <span className="ml-1 text-xs font-normal text-ice-500">{labels.perNight}</span>
        </div>
      </div>
      <a
        href={bookHref}
        target="_blank"
        rel="noopener sponsored"
        className="shrink-0 bg-ice-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-ice-500 transition"
      >
        {labels.checkAvailability} →
      </a>
    </div>
  )
}

export default function HotelCard({
  hotel,
  bookHref,
  resortName,
  locale,
  featured = false,
  labels,
}: HotelCardProps) {
  const distance = hotelDistanceLabel(hotel.distanceToSlopesM)
  const ratingWord = hotelRatingWord(hotel.rating, locale)
  const priceWord = hotelPriceWord(hotel.priceFrom, locale)
  const reason = hotelReason(hotel, resortName, locale)
  const chips = [distance ? `≈ ${distance} ${labels.toSlopes}` : null, priceWord].filter(
    Boolean,
  ) as string[]

  if (featured) {
    return (
      <article className="group flex flex-col md:flex-row bg-white rounded-2xl border-2 border-ice-200 overflow-hidden card-hover">
        <div className="relative md:w-2/5 h-56 md:h-auto md:min-h-[320px] overflow-hidden">
          <HotelImage hotel={hotel} />
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
          <RatingPill hotel={hotel} labels={labels} />
          <PricePill price={hotel.priceFrom} />
          <div className="absolute bottom-3 left-3 bg-ice-600 text-white rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm">
            ★ {topPickLabel(locale)}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-xl font-bold text-slate-deep leading-snug">{hotel.name}</h3>
          <p className="mt-1 text-sm text-ice-600">
            <span className="font-semibold text-slate-deep">{ratingWord}</span>
            {' · '}
            <span className="tabular-nums">{formatReviews(hotel.reviewCount)}</span> {labels.reviews}
          </p>
          <Why reason={reason} locale={locale} />
          <p className="mt-3 text-sm text-ice-800/90 leading-relaxed">{hotelBlurb(hotel, resortName, locale)}</p>
          <Chips chips={chips} />
          <PriceFooter price={hotel.priceFrom} labels={labels} bookHref={bookHref} />
        </div>
      </article>
    )
  }

  return (
    <article className="group flex flex-col bg-white rounded-2xl border border-ice-100 overflow-hidden card-hover">
      <div className="relative h-48 overflow-hidden">
        <HotelImage hotel={hotel} />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/30 to-transparent" />
        <RatingPill hotel={hotel} labels={labels} />
        <PricePill price={hotel.priceFrom} />
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-slate-deep leading-snug">{hotel.name}</h3>
        <p className="mt-1 text-xs text-ice-600">
          <span className="font-semibold text-slate-deep">{ratingWord}</span>
          {' · '}
          <span className="tabular-nums">{formatReviews(hotel.reviewCount)}</span> {labels.reviews}
        </p>
        <Why reason={reason} locale={locale} />
        <Chips chips={chips} />
        <PriceFooter price={hotel.priceFrom} labels={labels} bookHref={bookHref} />
      </div>
    </article>
  )
}
