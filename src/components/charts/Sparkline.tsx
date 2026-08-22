import { Line, LineChart, ResponsiveContainer } from 'recharts'
import type { KpiSeriesPoint } from '../../types/kpi'

export function Sparkline({ series, color = '#1f66b0' }: { series: KpiSeriesPoint[]; color?: string }) {
  if (series.length < 2) return <div className="h-8 w-full" />
  const data = series.map((p) => ({ valor: p.value }))
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
