import { Cell, Pie, PieChart } from 'recharts'
import type { KpiStatus } from '../../types/kpi'

const STATUS_COLOR: Record<KpiStatus, string> = {
  good: '#1f9d55',
  watch: '#c98a02',
  bad: '#d0342c',
  no_data: '#94a3b8',
}

export function DonutProgress({ percentage, status, size = 96 }: { percentage: number; status: KpiStatus; size?: number }) {
  const pct = Math.max(0, Math.min(100, percentage))
  const data = [
    { name: 'avance', value: pct },
    { name: 'restante', value: 100 - pct },
  ]
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size / 2 - 14}
          outerRadius={size / 2}
          startAngle={90}
          endAngle={-270}
          isAnimationActive={false}
          stroke="none"
        >
          <Cell fill={STATUS_COLOR[status]} />
          <Cell fill="#e2e8f0" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-navy-900">
        {Math.round(pct)}%
      </div>
    </div>
  )
}
