import type { ReactNode } from 'react'
import { CheckCircle2, CircleAlert, CircleSlash, Gauge, TrendingDown, TrendingUp } from 'lucide-react'
import type { KpiEvaluation, PerspectiveEvaluation } from '../../types/kpi'
import { previousGlobalComplianceIndex } from '../../services/calculationService'
import { useData } from '../../context/DataContext'

interface ExecutiveSummaryProps {
  kpiEvaluations: KpiEvaluation[]
  perspectiveEvaluations: PerspectiveEvaluation[]
  globalIndex: number
}

function SummaryCard({ icon, label, value, sub, accent }: { icon: ReactNode; label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${accent ?? 'bg-brand-50 text-brand-600'}`}>{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-xl font-bold text-navy-900">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  )
}

export function ExecutiveSummary({ kpiEvaluations, perspectiveEvaluations, globalIndex }: ExecutiveSummaryProps) {
  const { lastUpdated } = useData()
  const withData = kpiEvaluations.filter((e) => e.hasData)
  const inTarget = withData.filter((e) => e.latest?.status === 'good')
  const outOfTarget = withData.filter((e) => e.latest && e.latest.status !== 'good')
  const noData = kpiEvaluations.filter((e) => !e.hasData)

  const previousIndex = previousGlobalComplianceIndex(perspectiveEvaluations)
  const variation = previousIndex != null ? globalIndex - previousIndex : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryCard icon={<Gauge size={20} />} label="Indicadores totales" value={`${kpiEvaluations.length} KPI`} />
      <SummaryCard
        icon={<CheckCircle2 size={20} />}
        label="KPI cumpliendo meta"
        value={`${inTarget.length}`}
        sub={withData.length ? `${Math.round((inTarget.length / withData.length) * 100)}% de los evaluados` : undefined}
        accent="bg-status-good/10 text-status-good"
      />
      <SummaryCard
        icon={<CircleAlert size={20} />}
        label="KPI fuera de meta"
        value={`${outOfTarget.length}`}
        sub={withData.length ? `${Math.round((outOfTarget.length / withData.length) * 100)}% de los evaluados` : undefined}
        accent="bg-status-bad/10 text-status-bad"
      />
      <SummaryCard icon={<CircleSlash size={20} />} label="KPI sin datos" value={`${noData.length}`} accent="bg-slate-100 text-slate-500" />
      <SummaryCard
        icon={variation == null ? <Gauge size={20} /> : variation >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
        label="Cumplimiento general BSC"
        value={`${Math.round(globalIndex)}%`}
        sub={
          variation == null
            ? `Actualizado: ${lastUpdated ? new Date(lastUpdated).toLocaleDateString('es-DO') : '—'}`
            : `${variation >= 0 ? '+' : ''}${variation.toFixed(1)} pp vs. período anterior`
        }
      />
    </div>
  )
}
