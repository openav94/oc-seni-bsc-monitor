import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { KpiSeriesPoint } from '../../types/kpi'

interface KpiTrendChartProps {
  series: KpiSeriesPoint[]
  target: number
  unit: string
  height?: number
  color?: string
}

export function KpiTrendChart({ series, target, unit, height = 180, color = '#1f66b0' }: KpiTrendChartProps) {
  if (series.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-slate-400">
        Sin datos disponibles para el período seleccionado.
      </div>
    )
  }

  const data = series.map((p) => ({ periodo: p.periodLabel, valor: Number(p.value.toFixed(2)) }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <XAxis dataKey="periodo" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          formatter={(value: number) => [`${value} ${unit}`, 'Valor']}
          labelStyle={{ color: '#0f2138', fontWeight: 600 }}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <ReferenceLine y={target} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Meta', position: 'insideTopRight', fontSize: 10, fill: '#94a3b8' }} />
        <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
