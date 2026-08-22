import type { KpiStatus } from '../../types/kpi'
import { STATUS_META } from '../../utils/format'

export function StatusBadge({ status, compact = false }: { status: KpiStatus; compact?: boolean }) {
  const meta = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.className}`}
    >
      <span aria-hidden>{meta.icon}</span>
      {!compact && <span>{meta.label}</span>}
    </span>
  )
}
