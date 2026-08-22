/**
 * Motor de cálculo de KPI. Aislado deliberadamente de los componentes visuales:
 * recibe registros crudos (KpiRecord) y definiciones (KpiDefinition) y devuelve
 * valores, cumplimiento, estado y tendencia. Cambiar una fórmula aquí no requiere
 * tocar la interfaz.
 */
import type {
  KpiDefinition,
  KpiRecord,
  KpiStatus,
  KpiSeriesPoint,
  KpiEvaluation,
  PerspectiveEvaluation,
  TrendDirection,
} from '../types/kpi'
import { PERSPECTIVES } from '../data/perspectives'
import { comparePeriodKeys } from '../utils/dateUtils'

export function statusFor(kpi: KpiDefinition, value: number): KpiStatus {
  if (!Number.isFinite(value)) return 'no_data'
  const { target, favorableDirection, watchBand } = kpi
  if (favorableDirection === 'higher') {
    if (value >= target) return 'good'
    if (value >= target - watchBand) return 'watch'
    return 'bad'
  }
  if (value <= target) return 'good'
  if (value <= target + watchBand) return 'watch'
  return 'bad'
}

/** Cumplimiento relativo a la meta, en %. 100 = meta exactamente alcanzada. Se limita a [0, 150] para gauges. */
export function complianceFor(kpi: KpiDefinition, value: number): number {
  if (!Number.isFinite(value)) return 0
  const { target, favorableDirection } = kpi
  let pct: number
  if (favorableDirection === 'higher') {
    pct = target !== 0 ? (value / target) * 100 : value > 0 ? 100 : 0
  } else {
    pct = value > 0 ? (target / value) * 100 : 100
  }
  return Math.max(0, Math.min(150, pct))
}

export function buildRecord(
  kpi: KpiDefinition,
  inputs: Record<string, string | number>,
  meta: { date: string; year: number; month?: number; quarter?: number; semester?: number; periodKey: string; periodLabel: string; notes?: string },
  existingId?: string,
): KpiRecord {
  const result = kpi.compute(inputs)
  const now = new Date().toISOString()
  return {
    id: existingId ?? crypto.randomUUID(),
    kpiCode: kpi.code,
    date: meta.date,
    year: meta.year,
    month: meta.month,
    quarter: meta.quarter,
    semester: meta.semester,
    periodKey: meta.periodKey,
    periodLabel: meta.periodLabel,
    rawInputs: inputs,
    calculatedValue: result.value,
    secondary: result.secondary,
    target: kpi.target,
    compliancePercentage: complianceFor(kpi, result.value),
    status: statusFor(kpi, result.value),
    notes: meta.notes,
    createdAt: existingId ? now : now,
    updatedAt: now,
  }
}

/** Agrupa registros por período según la estrategia de agregación del KPI. */
export function aggregateSeries(kpi: KpiDefinition, records: KpiRecord[]): KpiSeriesPoint[] {
  const byPeriod = new Map<string, KpiRecord[]>()
  for (const r of records) {
    if (!byPeriod.has(r.periodKey)) byPeriod.set(r.periodKey, [])
    byPeriod.get(r.periodKey)!.push(r)
  }

  const points: KpiSeriesPoint[] = []
  for (const [periodKey, recs] of byPeriod.entries()) {
    const valid = recs.filter((r) => Number.isFinite(r.calculatedValue))
    if (valid.length === 0) continue

    let value: number
    if (kpi.aggregation === 'sum') {
      value = valid.reduce((acc, r) => acc + r.calculatedValue, 0)
    } else if (kpi.aggregation === 'group_avg_sum' && kpi.groupByField) {
      const byGroup = new Map<string, number>()
      for (const r of valid) {
        const groupKey = String(r.rawInputs[kpi.groupByField!] ?? '—')
        byGroup.set(groupKey, (byGroup.get(groupKey) ?? 0) + r.calculatedValue)
      }
      const sums = Array.from(byGroup.values())
      value = sums.reduce((a, b) => a + b, 0) / sums.length
    } else {
      value = valid.reduce((acc, r) => acc + r.calculatedValue, 0) / valid.length
    }

    const secondaryKeys = new Set<string>()
    for (const r of valid) if (r.secondary) for (const k of Object.keys(r.secondary)) secondaryKeys.add(k)
    let secondary: Record<string, number> | undefined
    if (secondaryKeys.size > 0) {
      secondary = {}
      for (const key of secondaryKeys) {
        const vals = valid.map((r) => r.secondary?.[key]).filter((v): v is number => Number.isFinite(v))
        if (vals.length) secondary[key] = vals.reduce((a, b) => a + b, 0) / vals.length
      }
    }

    points.push({
      periodKey,
      periodLabel: recs[0].periodLabel,
      value,
      target: kpi.target,
      status: statusFor(kpi, value),
      recordIds: recs.map((r) => r.id),
      secondary,
    })
  }

  return points.sort((a, b) => comparePeriodKeys(a.periodKey, b.periodKey))
}

/** Determina la tendencia comparando hasta los últimos 3 puntos válidos de la serie. */
export function trendFor(kpi: KpiDefinition, series: KpiSeriesPoint[]): TrendDirection {
  const valid = series.filter((p) => Number.isFinite(p.value))
  if (valid.length < 2) return 'no_data'
  const recent = valid.slice(-3)
  const first = recent[0].value
  const last = recent[recent.length - 1].value
  const delta = last - first
  const tolerance = Math.max(kpi.watchBand * 0.3, kpi.target * 0.005)
  if (Math.abs(delta) <= tolerance) return 'stable'
  const improving = kpi.favorableDirection === 'higher' ? delta > 0 : delta < 0
  return improving ? 'improving' : 'deteriorating'
}

export function evaluateKpi(kpi: KpiDefinition, records: KpiRecord[]): KpiEvaluation {
  const kpiRecords = records.filter((r) => r.kpiCode === kpi.code)
  const series = aggregateSeries(kpi, kpiRecords)
  const latest = series.length ? series[series.length - 1] : null
  return {
    kpi,
    latest,
    series,
    trend: trendFor(kpi, series),
    hasData: series.length > 0,
  }
}

export function evaluatePerspective(
  perspectiveCode: keyof typeof PERSPECTIVES,
  kpis: KpiDefinition[],
  records: KpiRecord[],
): PerspectiveEvaluation {
  const perspectiveKpis = kpis.filter((k) => k.perspective === perspectiveCode)
  const kpiEvaluations = perspectiveKpis.map((k) => evaluateKpi(k, records))
  const withData = kpiEvaluations.filter((e) => e.hasData && e.latest)

  const totalWeight = withData.reduce((acc, e) => acc + e.kpi.weight, 0)
  const compliancePercentage = totalWeight
    ? withData.reduce((acc, e) => {
        const capped = Math.min(100, complianceFor(e.kpi, e.latest!.value))
        return acc + capped * e.kpi.weight
      }, 0) / totalWeight
    : 0

  const kpisInTarget = withData.filter((e) => e.latest!.status === 'good').length

  return {
    perspective: PERSPECTIVES[perspectiveCode],
    kpiEvaluations,
    compliancePercentage,
    kpisInTarget,
    kpisTotal: perspectiveKpis.length,
  }
}

/** Índice Global de Cumplimiento Estratégico. Ponderación uniforme entre KPI (peso=1) para el prototipo. */
export function globalComplianceIndex(perspectiveEvaluations: PerspectiveEvaluation[]): number {
  const allWithData = perspectiveEvaluations.flatMap((p) => p.kpiEvaluations).filter((e) => e.hasData && e.latest)
  if (!allWithData.length) return 0
  const totalWeight = allWithData.reduce((acc, e) => acc + e.kpi.weight, 0)
  return (
    allWithData.reduce((acc, e) => acc + Math.min(100, complianceFor(e.kpi, e.latest!.value)) * e.kpi.weight, 0) /
    totalWeight
  )
}

/**
 * Índice global aproximado usando el penúltimo punto de la serie de cada KPI, para
 * estimar la variación respecto al período anterior (sección 9.2). Los KPI sin al
 * menos dos puntos se excluyen de este cálculo.
 */
export function previousGlobalComplianceIndex(perspectiveEvaluations: PerspectiveEvaluation[]): number | null {
  const withPrevious = perspectiveEvaluations
    .flatMap((p) => p.kpiEvaluations)
    .filter((e) => e.series.length >= 2)
  if (!withPrevious.length) return null
  const totalWeight = withPrevious.reduce((acc, e) => acc + e.kpi.weight, 0)
  return (
    withPrevious.reduce((acc, e) => {
      const prevPoint = e.series[e.series.length - 2]
      return acc + Math.min(100, complianceFor(e.kpi, prevPoint.value)) * e.kpi.weight
    }, 0) / totalWeight
  )
}

export function globalStatusLabel(index: number): { label: string; status: KpiStatus } {
  if (index >= 90) return { label: 'Desempeño sobresaliente', status: 'good' }
  if (index >= 75) return { label: 'Desempeño favorable', status: 'good' }
  if (index >= 60) return { label: 'Desempeño en observación', status: 'watch' }
  return { label: 'Desempeño crítico', status: 'bad' }
}
