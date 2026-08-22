import { X, ArrowRight, Info } from 'lucide-react'
import type { KpiEvaluation } from '../../types/kpi'
import { StatusBadge } from './StatusBadge'
import { TrendIndicator } from './TrendIndicator'
import { KpiTrendChart } from '../charts/KpiTrendChart'
import { formatKpiValue } from '../../utils/format'
import { useNavigation } from '../../context/NavigationContext'
import { PERSPECTIVES } from '../../data/perspectives'

export function KpiDetailModal({ evaluation, onClose }: { evaluation: KpiEvaluation; onClose: () => void }) {
  const { kpi, latest, series, trend, hasData } = evaluation
  const { goToRecordsForKpi } = useNavigation()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
              <span>{kpi.code}</span>
              <span className="text-slate-300">•</span>
              <span>{PERSPECTIVES[kpi.perspective].name}</span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-navy-900">{kpi.indicator}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Objetivo estratégico</p>
            <p className="mt-1 text-sm text-slate-700">{kpi.objective}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Valor actual" value={hasData ? formatKpiValue(kpi, latest!.value) : 'Sin datos'} />
            <Stat label="Meta" value={kpi.targetLabel} />
            <Stat label="Frecuencia" value={kpi.frequency.replace('_', '/')} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estado</p>
              <div className="mt-1">{hasData ? <StatusBadge status={latest!.status} /> : <StatusBadge status="no_data" />}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Evolución histórica</p>
            <TrendIndicator trend={trend} />
          </div>
          <KpiTrendChart series={series} target={kpi.target} unit={kpi.unit} />

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              <Info size={13} /> Fórmula utilizada
            </p>
            <p className="mt-1 font-mono text-sm text-navy-800">{kpi.formulaText}</p>
            {kpi.formulaIsAssumption && (
              <p className="mt-1 text-xs italic text-slate-500">
                Fórmula propuesta para fines de implementación del sistema (no está expresada literalmente en el Plan Estratégico).
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Fuente del dato</p>
              <p className="mt-1 text-sm text-slate-700">{kpi.source}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Última actualización</p>
              <p className="mt-1 text-sm text-slate-700">{hasData ? latest!.periodLabel : '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alertas configuradas</p>
            <p className="mt-1 text-sm text-slate-700">{kpi.alerts}</p>
          </div>

          <button
            onClick={() => {
              goToRecordsForKpi(kpi.code)
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-brand-600 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            Ver registros originales en Base de Datos <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-navy-900">{value}</p>
    </div>
  )
}
