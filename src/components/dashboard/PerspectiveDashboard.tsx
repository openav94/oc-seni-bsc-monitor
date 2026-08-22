import type { ReactNode } from 'react'
import { Line, LineChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { KpiEvaluation, PerspectiveEvaluation } from '../../types/kpi'
import { KpiCard } from '../shared/KpiCard'
import { StatusBadge } from '../shared/StatusBadge'
import { TrendIndicator } from '../shared/TrendIndicator'
import { KpiTrendChart } from '../charts/KpiTrendChart'
import { ComparisonBarChart } from '../charts/ComparisonBarChart'
import { DonutProgress } from '../charts/DonutProgress'
import { complianceFor } from '../../services/calculationService'
import { formatKpiValue } from '../../utils/format'
import { useData } from '../../context/DataContext'

function CardShell({ children, emphasis = false }: { children: ReactNode; emphasis?: boolean }) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-card ${emphasis ? 'border-brand-300 ring-1 ring-brand-100 sm:col-span-2' : 'border-slate-200'}`}>
      {children}
    </div>
  )
}

function CardHeader({ evaluation }: { evaluation: KpiEvaluation }) {
  const { kpi, latest, hasData } = evaluation
  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{kpi.code}</p>
        <p className="mt-0.5 text-sm font-semibold leading-snug text-navy-900">{kpi.indicator}</p>
      </div>
      <StatusBadge status={hasData ? latest!.status : 'no_data'} compact />
    </div>
  )
}

/** C-02 y PI-02: línea de tendencia con meta de referencia. */
function TrendCard({ evaluation, emphasis = false }: { evaluation: KpiEvaluation; emphasis?: boolean }) {
  const { kpi, latest, hasData, series, trend } = evaluation
  return (
    <CardShell emphasis={emphasis}>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <>
          <div className="flex items-baseline gap-3">
            <p className={`font-bold text-navy-900 ${emphasis ? 'text-4xl' : 'text-2xl'}`}>{formatKpiValue(kpi, latest!.value)}</p>
            <span className="text-xs text-slate-500">Meta: {kpi.targetLabel}</span>
            <TrendIndicator trend={trend} />
          </div>
          <KpiTrendChart series={series} target={kpi.target} unit={kpi.unit} height={emphasis ? 220 : 160} />
        </>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

/** C-03 y CL-03: comparación base vs. actual. */
function ComparisonCard({
  evaluation,
  baseKey,
  actualKey,
  baseLabel,
  actualLabel,
  chartUnit,
}: {
  evaluation: KpiEvaluation
  baseKey: string
  actualKey: string
  baseLabel: string
  actualLabel: string
  chartUnit: string
}) {
  const { kpi, latest, hasData, trend } = evaluation
  const base = latest?.secondary?.[baseKey]
  const actual = latest?.secondary?.[actualKey]

  return (
    <CardShell>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-navy-900">{formatKpiValue(kpi, latest!.value)}</p>
            <span className="text-xs text-slate-500">Meta: {kpi.targetLabel}</span>
            <TrendIndicator trend={trend} />
          </div>
          {base != null && actual != null && (
            <ComparisonBarChart
              data={[
                { label: baseLabel, value: Number(base.toFixed(1)) },
                { label: actualLabel, value: Number(actual.toFixed(1)) },
              ]}
              unit={chartUnit}
              height={140}
            />
          )}
        </>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

/** CL-01: horas de congestión y ENS en un único gráfico temporal. */
function DualLineCard({ evaluation }: { evaluation: KpiEvaluation }) {
  const { kpi, latest, hasData, series, trend } = evaluation
  const data = series.map((p) => ({
    periodo: p.periodLabel,
    'Horas de congestión': p.secondary?.horasCongestion != null ? Number(p.secondary.horasCongestion.toFixed(0)) : undefined,
    'ENS (MWh)': p.secondary?.ensMWh != null ? Number(p.secondary.ensMWh.toFixed(0)) : undefined,
  }))

  return (
    <CardShell emphasis>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-navy-900">{formatKpiValue(kpi, latest!.value)}</p>
            <span className="text-xs text-slate-500">Meta: {kpi.targetLabel}</span>
            <TrendIndicator trend={trend} />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="Horas de congestión" stroke="#1f66b0" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="ENS (MWh)" stroke="#c98a02" strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

/** PI-04 y AC-03: avance porcentual como donut. */
function DonutCard({ evaluation }: { evaluation: KpiEvaluation }) {
  const { kpi, latest, hasData, trend } = evaluation
  return (
    <CardShell>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <div className="flex items-center gap-4">
          <DonutProgress percentage={complianceFor(kpi, latest!.value)} status={latest!.status} />
          <div>
            <p className="text-xl font-bold text-navy-900">{formatKpiValue(kpi, latest!.value)}</p>
            <p className="text-xs text-slate-500">Meta: {kpi.targetLabel}</p>
            <div className="mt-1"><TrendIndicator trend={trend} /></div>
          </div>
        </div>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

/** AC-01: horas de capacitación por colaborador en el año más reciente con datos. */
function TrainingHoursCard({ evaluation }: { evaluation: KpiEvaluation }) {
  const { records } = useData()
  const { kpi, latest, hasData, trend } = evaluation

  const latestYear = latest ? Number(latest.periodKey) : null
  const byColaborador = new Map<string, number>()
  if (latestYear) {
    for (const r of records) {
      if (r.kpiCode !== kpi.code || r.year !== latestYear) continue
      const nombre = String(r.rawInputs.colaborador ?? '—')
      byColaborador.set(nombre, (byColaborador.get(nombre) ?? 0) + (Number(r.rawInputs.numeroHoras) || 0))
    }
  }
  const barData = Array.from(byColaborador.entries()).map(([label, value]) => ({ label: label.replace('Ing. ', ''), value }))

  return (
    <CardShell emphasis>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-navy-900">{formatKpiValue(kpi, latest!.value)}</p>
            <span className="text-xs text-slate-500">Meta: {kpi.targetLabel} (promedio institucional)</span>
            <TrendIndicator trend={trend} />
          </div>
          <ComparisonBarChart data={barData} unit="h" height={200} color="#28517f" />
        </>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

/** AC-04: rotación (gauge) + índice de clima laboral como indicador complementario. */
function RotationCard({ evaluation }: { evaluation: KpiEvaluation }) {
  const { kpi, latest, hasData, trend } = evaluation
  const clima = latest?.secondary?.indiceClimaLaboral

  return (
    <CardShell>
      <CardHeader evaluation={evaluation} />
      {hasData ? (
        <div className="flex items-center gap-4">
          <DonutProgress percentage={Math.min(100, complianceFor(kpi, latest!.value))} status={latest!.status} />
          <div>
            <p className="text-xl font-bold text-navy-900">{formatKpiValue(kpi, latest!.value)}</p>
            <p className="text-xs text-slate-500">Meta: {kpi.targetLabel}</p>
            <div className="mt-1"><TrendIndicator trend={trend} /></div>
            {clima != null && (
              <p className="mt-1 text-xs text-slate-500">Índice de clima laboral (complementario): <strong>{clima.toFixed(0)}%</strong></p>
            )}
          </div>
        </div>
      ) : (
        <p className="py-6 text-center text-sm italic text-slate-400">Sin datos disponibles para el período seleccionado.</p>
      )}
    </CardShell>
  )
}

function renderKpiCard(evaluation: KpiEvaluation) {
  switch (evaluation.kpi.code) {
    case 'C-02':
      return <TrendCard key={evaluation.kpi.code} evaluation={evaluation} />
    case 'C-03':
      return (
        <ComparisonCard
          key={evaluation.kpi.code}
          evaluation={evaluation}
          baseKey="reliqAñoBase"
          actualKey="reliqAñoActual"
          baseLabel="Año base"
          actualLabel="Año actual"
          chartUnit="reliquidaciones"
        />
      )
    case 'CL-01':
      return <DualLineCard key={evaluation.kpi.code} evaluation={evaluation} />
    case 'CL-03':
      return (
        <ComparisonCard
          key={evaluation.kpi.code}
          evaluation={evaluation}
          baseKey="duracionLineaBase"
          actualKey="duracionReal"
          baseLabel="Línea base"
          actualLabel="Actual"
          chartUnit="días"
        />
      )
    case 'PI-02':
      return <TrendCard key={evaluation.kpi.code} evaluation={evaluation} />
    case 'PI-04':
    case 'AC-03':
      return <DonutCard key={evaluation.kpi.code} evaluation={evaluation} />
    case 'PI-05':
      return <TrendCard key={evaluation.kpi.code} evaluation={evaluation} emphasis />
    case 'AC-01':
      return <TrainingHoursCard key={evaluation.kpi.code} evaluation={evaluation} />
    case 'AC-04':
      return <RotationCard key={evaluation.kpi.code} evaluation={evaluation} />
    default:
      return (
        <div key={evaluation.kpi.code} className="rounded-xl">
          <KpiCard evaluation={evaluation} visual="gauge" />
        </div>
      )
  }
}

export function PerspectiveSection({ evaluation }: { evaluation: PerspectiveEvaluation }) {
  const { perspective, kpiEvaluations, compliancePercentage, kpisInTarget, kpisTotal } = evaluation

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-navy-900">{perspective.name}</h3>
          <p className="text-xs text-slate-500">{perspective.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-brand-700">{Math.round(compliancePercentage)}%</p>
          <p className="text-xs text-slate-500">{kpisInTarget} de {kpisTotal} KPI en meta</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpiEvaluations.map(renderKpiCard)}
      </div>
    </section>
  )
}
