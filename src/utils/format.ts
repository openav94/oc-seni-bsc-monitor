import type { KpiDefinition, KpiStatus, TrendDirection } from '../types/kpi'

export function formatKpiValue(kpi: KpiDefinition, value: number): string {
  if (!Number.isFinite(value)) return 'Sin datos'
  const decimals = kpi.unit === '%' || kpi.unit.includes('%') ? 1 : kpi.unit === 'horas/año' ? 1 : 1
  const rounded = value.toFixed(decimals)
  return `${rounded} ${kpi.unit}`
}

export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('es-DO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 })
}

export const STATUS_META: Record<KpiStatus, { label: string; icon: string; className: string }> = {
  good: { label: 'Cumple', icon: '🟢', className: 'bg-status-good/10 text-status-good border-status-good/30' },
  watch: { label: 'Atención', icon: '🟡', className: 'bg-status-watch/10 text-status-watch border-status-watch/30' },
  bad: { label: 'No cumple', icon: '🔴', className: 'bg-status-bad/10 text-status-bad border-status-bad/30' },
  no_data: { label: 'Sin datos', icon: '⚪', className: 'bg-slate-100 text-slate-500 border-slate-300' },
}

export const TREND_META: Record<TrendDirection, { label: string; arrow: string; className: string }> = {
  improving: { label: 'Mejorando', arrow: '↑', className: 'text-status-good' },
  deteriorating: { label: 'Deteriorándose', arrow: '↓', className: 'text-status-bad' },
  stable: { label: 'Estable', arrow: '→', className: 'text-slate-500' },
  no_data: { label: 'Sin histórico suficiente', arrow: '·', className: 'text-slate-400' },
}

export function formatPeriodShort(periodLabel: string): string {
  return periodLabel
}
