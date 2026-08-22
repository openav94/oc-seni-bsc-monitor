import { useState } from 'react'
import type { KpiEvaluation } from '../../types/kpi'
import { StatusBadge } from './StatusBadge'
import { TrendIndicator } from './TrendIndicator'
import { GaugeChart } from '../charts/GaugeChart'
import { Sparkline } from '../charts/Sparkline'
import { KpiDetailModal } from './KpiDetailModal'
import { formatKpiValue } from '../../utils/format'
import { complianceFor } from '../../services/calculationService'

interface KpiCardProps {
  evaluation: KpiEvaluation
  emphasis?: boolean
  visual?: 'gauge' | 'sparkline'
}

export function KpiCard({ evaluation, emphasis = false, visual = 'gauge' }: KpiCardProps) {
  const [open, setOpen] = useState(false)
  const { kpi, latest, hasData, trend, series } = evaluation

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex w-full flex-col gap-3 rounded-xl border bg-white p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-panel ${
          emphasis ? 'border-brand-300 ring-1 ring-brand-100' : 'border-slate-200'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{kpi.code}</p>
            <p className="mt-0.5 text-sm font-semibold leading-snug text-navy-900">{kpi.indicator}</p>
          </div>
          {hasData ? <StatusBadge status={latest!.status} compact /> : <StatusBadge status="no_data" compact />}
        </div>

        {!hasData ? (
          <p className="py-4 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
        ) : (
          <div className="flex items-center gap-4">
            {visual === 'gauge' ? (
              <GaugeChart compliancePercentage={complianceFor(kpi, latest!.value)} status={latest!.status} size={emphasis ? 108 : 84} />
            ) : null}
            <div className="flex-1">
              <p className={`font-bold text-navy-900 ${emphasis ? 'text-3xl' : 'text-2xl'}`}>{formatKpiValue(kpi, latest!.value)}</p>
              <p className="text-xs text-slate-500">Meta: {kpi.targetLabel}</p>
              <div className="mt-1">
                <TrendIndicator trend={trend} />
              </div>
              {visual === 'sparkline' && (
                <div className="mt-2">
                  <Sparkline series={series} />
                </div>
              )}
            </div>
          </div>
        )}
      </button>
      {open && <KpiDetailModal evaluation={evaluation} onClose={() => setOpen(false)} />}
    </>
  )
}
