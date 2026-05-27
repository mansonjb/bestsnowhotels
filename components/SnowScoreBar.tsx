interface SnowScoreBarProps {
  score: number
  label: string
}

export default function SnowScoreBar({ score, label }: SnowScoreBarProps) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-ice-700 mb-1">
        <span className="uppercase tracking-wide">{label}</span>
        <span className="tabular-nums font-bold text-slate-deep">{pct}/100</span>
      </div>
      <div className="h-2 rounded-full bg-ice-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ice-400 via-ice-500 to-ice-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
