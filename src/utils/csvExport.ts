import type { KpiRecord } from '../types/kpi'
import { KPI_BY_CODE } from '../data/kpiDefinitions'
import { PERSPECTIVES } from '../data/perspectives'
import { STATUS_META } from './format'

function csvEscape(value: string | number): string {
  const str = String(value ?? '')
  if (/[",\n;]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function recordsToCsv(records: KpiRecord[]): string {
  const headers = [
    'ID', 'Fecha de registro', 'Periodo', 'Perspectiva', 'Codigo KPI', 'Indicador',
    'Valor', 'Unidad', 'Meta', 'Estado', 'Observaciones',
  ]
  const rows = records.map((r) => {
    const kpi = KPI_BY_CODE[r.kpiCode]
    return [
      r.id,
      r.date,
      r.periodLabel,
      PERSPECTIVES[kpi.perspective].name,
      kpi.code,
      kpi.indicator,
      Number.isFinite(r.calculatedValue) ? r.calculatedValue.toFixed(2) : '',
      kpi.unit,
      kpi.targetLabel,
      STATUS_META[r.status].label,
      r.notes ?? '',
    ].map(csvEscape)
  })
  return [headers.map(csvEscape).join(','), ...rows.map((row) => row.join(','))].join('\n')
}

export function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([`﻿${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
