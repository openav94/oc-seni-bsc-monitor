import { Award, Target, TrendingDown } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEvaluations } from '../context/DataContext'
import { globalStatusLabel } from '../services/calculationService'
import { buildAlerts, buildDeviations, buildFindings, buildStrengths } from '../services/insightsService'
import { StrategicAlerts } from '../components/dashboard/StrategicAlerts'
import { STATUS_META, TREND_META, formatKpiValue } from '../utils/format'
import { PERSPECTIVES } from '../data/perspectives'

const STATUS_COLOR = { good: '#1f9d55', watch: '#c98a02', bad: '#d0342c', no_data: '#94a3b8' } as const

export function Summary() {
  const { kpiEvaluations, perspectiveEvaluations, globalIndex } = useEvaluations()
  const { label, status } = globalStatusLabel(globalIndex)
  const meta = STATUS_META[status]

  const findings = buildFindings(kpiEvaluations)
  const alerts = buildAlerts(kpiEvaluations)
  const strengths = buildStrengths(kpiEvaluations, 3)
  const deviations = buildDeviations(kpiEvaluations, 5)

  const perspectiveChartData = perspectiveEvaluations.map((p) => ({
    name: p.perspective.shortName,
    value: Math.round(p.compliancePercentage),
    status: p.compliancePercentage >= 90 ? 'good' : p.compliancePercentage >= 70 ? 'watch' : 'bad',
  }))

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Resumen Ejecutivo del Desempeño Estratégico</h1>
        <p className="mt-1 text-sm text-slate-500">
          Orientado a la toma de decisiones gerenciales. Todo el contenido se genera automáticamente a partir de los
          registros almacenados; no contiene redacciones estáticas.
        </p>
      </div>

      <div className={`flex flex-col items-center gap-1 rounded-2xl border p-8 text-center ${meta.className}`}>
        <p className="text-xs font-semibold uppercase tracking-wide">Cumplimiento general del Balanced Scorecard</p>
        <p className="text-5xl font-extrabold text-navy-900">{globalIndex.toFixed(1)}%</p>
        <p className="text-sm font-semibold">{meta.icon} Estado general: {label}</p>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">Desempeño por perspectiva</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perspectiveChartData} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef2f6" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#0f2138', fontWeight: 600 }} width={110} />
              <Tooltip formatter={(v: number) => [`${v}%`, 'Cumplimiento']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}>
                {perspectiveChartData.map((d) => (
                  <Cell key={d.name} fill={STATUS_COLOR[d.status as keyof typeof STATUS_COLOR]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">Principales hallazgos</h2>
        <ul className="space-y-2">
          {findings.map((f, i) => (
            <li key={i} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-card">
              {f.text}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
          <TrendingDown size={18} className="text-status-bad" /> Alertas estratégicas — requieren atención
        </h2>
        <StrategicAlerts alerts={alerts} />
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <Award size={18} className="text-status-good" /> Principales fortalezas
          </h2>
          <ol className="space-y-2">
            {strengths.length === 0 && <p className="text-sm italic text-slate-400">Aún no hay KPI cumpliendo su meta con datos suficientes.</p>}
            {strengths.map((s, i) => (
              <li key={s.kpiCode} className="flex items-center gap-3 rounded-lg border border-status-good/30 bg-status-good/5 p-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-status-good text-xs font-bold text-white">{i + 1}</span>
                <span className="flex-1 text-slate-700">{s.indicator}</span>
                <span className="font-semibold text-status-good">{s.value.toFixed(1)} {s.unit}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-navy-900">
            <Target size={18} className="text-status-bad" /> Principales desviaciones
          </h2>
          <ol className="space-y-2">
            {deviations.map((d, i) => (
              <li key={d.kpiCode} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-card">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white">{i + 1}</span>
                <span className="flex-1 text-slate-700">{d.indicator}</span>
                <span className={`font-semibold ${d.deviationPct >= 0 ? 'text-status-good' : 'text-status-bad'}`}>
                  {d.deviationPct >= 0 ? '+' : ''}{d.deviationPct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-900">Tendencias</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 text-left">KPI</th>
                <th className="px-4 py-2.5 text-left">Perspectiva</th>
                <th className="px-4 py-2.5 text-right">Valor actual</th>
                <th className="px-4 py-2.5 text-left">Tendencia (últimos períodos)</th>
              </tr>
            </thead>
            <tbody>
              {kpiEvaluations.map((e) => {
                const tMeta = TREND_META[e.trend]
                return (
                  <tr key={e.kpi.code} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-2.5 font-semibold text-brand-700">{e.kpi.code} — {e.kpi.indicator}</td>
                    <td className="px-4 py-2.5 text-slate-500">{PERSPECTIVES[e.kpi.perspective].shortName}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-navy-900">{e.hasData ? formatKpiValue(e.kpi, e.latest!.value) : '—'}</td>
                    <td className={`px-4 py-2.5 font-semibold ${tMeta.className}`}>{tMeta.arrow} {tMeta.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        Datos ficticios utilizados exclusivamente para demostración del prototipo. Las metas corresponden al Plan
        Estratégico OC-SENI 2026-2035; los valores de desempeño mostrados son simulados.
      </p>
    </div>
  )
}
