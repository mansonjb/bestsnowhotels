interface DisclosureBannerProps {
  text: string
}

export default function DisclosureBanner({ text }: DisclosureBannerProps) {
  return (
    <div className="bg-ice-100 border-b border-ice-200">
      <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-[11px] text-ice-800/80 text-center">
        {text}
      </p>
    </div>
  )
}
