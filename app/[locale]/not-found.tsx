import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="text-6xl mb-4">❄</div>
      <h1 className="text-4xl font-bold text-slate-deep tracking-tight mb-4">
        Off-piste detour
      </h1>
      <p className="text-ice-800/80 mb-8">
        We couldn&apos;t find that page. Let&apos;s get you back to the snow.
      </p>
      <Link
        href="/en"
        className="inline-block bg-slate-deep text-white font-semibold px-7 py-3 rounded-full hover:bg-ice-800 transition"
      >
        Back home →
      </Link>
    </section>
  )
}
