import { RadialBar, RadialBarChart, PolarAngleAxis } from 'recharts'
import type { KpiStatus } from '../../types/kpi'

const STATUS_COLOR: Record<KpiStatus, string> = {
  good: '#1f9d55',
  watch: '#c98a02',
  bad: '#d0342c',
  no_data: '#94a3b8',
}

interface GaugeChartProps {
  compliancePercentage: number
  status: KpiStatus
  size?: number
}

/** Gauge de cumplimiento respecto a la meta. 100% = meta alcanzada exactamente. */
export function GaugeChart({ compliancePercentage, status, size = 120 }: GaugeChartProps) {
  const clamped = Math.max(0, Math.min(120, compliancePercentage))
  const data = [{ value: clamped, fill: STATUS_COLOR[status] }]

  return (
    <div style={{ width: size, height: size }} className="relative">
      <RadialBarChart
        width={size}
        height={size}
        cx="50%"
        cy="50%"
        innerRadius="70%"
        outerRadius="100%"
        barSize={10}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 120]} angleAxisId={0} tick={false} />
        <RadialBar background dataKey="value" cornerRadius={8} angleAxisId={0} isAnimationActive={false} />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-navy-900">{Math.round(compliancePercentage)}%</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-400">vs. meta</span>
      </div>
    </div>
  )
}
