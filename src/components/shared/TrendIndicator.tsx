import type { TrendDirection } from '../../types/kpi'
import { TREND_META } from '../../utils/format'

export function TrendIndicator({ trend }: { trend: TrendDirection }) {
  const meta = TREND_META[trend]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${meta.className}`}>
      <span aria-hidden className="text-sm">{meta.arrow}</span>
      {meta.label}
    </span>
  )
}
