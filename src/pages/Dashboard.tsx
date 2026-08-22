import { useMemo, useState } from 'react'
import { useData, useFilteredEvaluations, type DashboardFilters } from '../context/DataContext'
import { PERSPECTIVES, PERSPECTIVE_ORDER } from '../data/perspectives'
import { PerspectiveSection } from '../components/dashboard/PerspectiveDashboard'
import { ExecutiveSummary } from '../components/dashboard/ExecutiveSummary'
import type { PerspectiveCode } from '../types/kpi'
import { monthName } from '../utils/dateUtils'

const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export function Dashboard() {
  const { records } = useData()
  const years = useMemo(() => Array.from(new Set(records.map((r) => r.year))).sort((a, b) => b - a), [records])

  const [filters, setFilters] = useState<DashboardFilters>({ year: 'all', month: 'all', quarter: 'all', perspective: 'all' })
  const { perspectiveEvaluations, kpiEvaluations, globalIndex } = useFilteredEvaluations(filters)

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
        Datos ficticios utilizados exclusivamente para demostración del prototipo. Las metas provienen del Plan Estratégico OC-SENI 2026-2035.
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Balanced Scorecard — OC-SENI</h1>
          <p className="text-sm text-slate-500">Seguimiento del Plan Estratégico 2026-2035</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={filters.year} onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value === 'all' ? 'all' : Number(e.target.value) }))} className={selectClass}>
            <option value="all">Todos los años</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filters.month} onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value === 'all' ? 'all' : Number(e.target.value) }))} className={selectClass}>
            <option value="all">Todos los meses</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{monthName(m)}</option>)}
          </select>
          <select value={filters.quarter} onChange={(e) => setFilters((f) => ({ ...f, quarter: e.target.value === 'all' ? 'all' : Number(e.target.value) }))} className={selectClass}>
            <option value="all">Todos los trimestres</option>
            {[1, 2, 3, 4].map((q) => <option key={q} value={q}>Q{q}</option>)}
          </select>
          <select
            value={filters.perspective}
            onChange={(e) => setFilters((f) => ({ ...f, perspective: e.target.value as 'all' | PerspectiveCode }))}
            className={selectClass}
          >
            <option value="all">Todas las perspectivas</option>
            {PERSPECTIVE_ORDER.map((code) => <option key={code} value={code}>{PERSPECTIVES[code].name}</option>)}
          </select>
        </div>
      </div>

      <ExecutiveSummary kpiEvaluations={kpiEvaluations} perspectiveEvaluations={perspectiveEvaluations} globalIndex={globalIndex} />

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-600">Sistema de semáforos:</span>
        <span>🟢 Cumple — meta alcanzada</span>
        <span>🟡 Atención — cerca de desviarse (regla de implementación del dashboard, no del Plan Estratégico)</span>
        <span>🔴 No cumple — meta incumplida</span>
        <span>⚪ Sin datos</span>
      </div>

      <div className="space-y-8">
        {[...perspectiveEvaluations].reverse().map((pe) => (
          <PerspectiveSection key={pe.perspective.code} evaluation={pe} />
        ))}
      </div>
    </div>
  )
}
