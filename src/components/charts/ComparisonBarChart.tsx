import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ComparisonDatum {
  label: string
  value: number
}

interface ComparisonBarChartProps {
  data: ComparisonDatum[]
  unit?: string
  height?: number
  color?: string
}

export function ComparisonBarChart({ data, unit = '', height = 180, color = '#1f66b0' }: ComparisonBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          formatter={(value: number) => [`${value} ${unit}`, 'Valor']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}
