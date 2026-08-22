import { AlertOctagon } from 'lucide-react'
import { PERSPECTIVES } from '../../data/perspectives'
import { STATUS_META } from '../../utils/format'
import type { KpiStatus, PerspectiveCode } from '../../types/kpi'

export interface AlertEntry {
  kpiCode: string
  indicator: string
  perspective: PerspectiveCode
  value: number
  unit: string
  targetLabel: string
  status: KpiStatus
  deviationPct: number
}

export function StrategicAlerts({ alerts }: { alerts: AlertEntry[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-status-good/30 bg-status-good/5 p-4 text-sm text-status-good">
        Ningún KPI requiere atención en el período evaluado: todos los indicadores con datos disponibles cumplen su meta.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((a) => {
        const meta = STATUS_META[a.status]
        return (
          <div key={a.kpiCode} className={`flex items-start gap-3 rounded-xl border p-4 ${meta.className}`}>
            <AlertOctagon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide">{a.kpiCode} · {PERSPECTIVES[a.perspective].name}</p>
              <p className="text-sm font-semibold text-navy-900">{a.indicator}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-600">
                <span>Resultado: <strong>{Number.isFinite(a.value) ? a.value.toFixed(1) : '—'} {a.unit}</strong></span>
                <span>Meta esperada: <strong>{a.targetLabel}</strong></span>
                <span>Desviación: <strong>{a.deviationPct >= 0 ? '+' : ''}{a.deviationPct.toFixed(1)}%</strong></span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
