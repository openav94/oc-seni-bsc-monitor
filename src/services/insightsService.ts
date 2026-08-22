/**
 * Motor de hallazgos, alertas, fortalezas y desviaciones para la pestaña Resumen.
 * Todo el texto se genera a partir de los datos calculados; no hay redacciones
 * estáticas independientes del estado real de los registros.
 */
import type { KpiEvaluation } from '../types/kpi'
import { complianceFor } from './calculationService'

export interface Finding {
  kpiCode: string
  text: string
  tone: 'positive' | 'warning' | 'negative'
}

export interface DeviationEntry {
  kpiCode: string
  indicator: string
  perspective: string
  value: number
  target: number
  unit: string
  deviationPct: number
}

function deviationPct(evaluation: KpiEvaluation): number {
  if (!evaluation.latest) return 0
  const compliance = complianceFor(evaluation.kpi, evaluation.latest.value)
  return compliance - 100
}

export function buildFindings(evaluations: KpiEvaluation[]): Finding[] {
  const findings: Finding[] = []

  for (const ev of evaluations) {
    if (!ev.hasData || !ev.latest) continue
    const { kpi, latest, trend } = ev
    const target = kpi.targetLabel

    if (kpi.code === 'PI-05' && latest.status === 'good') {
      const goodStreak = ev.series.filter((p) => p.status === 'good').length
      if (goodStreak >= 3) {
        findings.push({
          kpiCode: kpi.code,
          tone: 'positive',
          text: `La disponibilidad del SCADA/EMS se mantiene por encima de la meta de ${target} durante los últimos ${goodStreak} períodos (${latest.value.toFixed(2)}% actual).`,
        })
      }
    }

    if (kpi.code === 'CL-03') {
      if (latest.status !== 'good') {
        findings.push({
          kpiCode: kpi.code,
          tone: 'warning',
          text: `El tiempo promedio de interconexión continúa por debajo de la reducción del 20% necesaria (avance actual: ${latest.value.toFixed(1)}%).`,
        })
      } else {
        findings.push({
          kpiCode: kpi.code,
          tone: 'positive',
          text: `El tiempo promedio de interconexión ya alcanza la reducción estratégica objetivo (${latest.value.toFixed(1)}% vs. meta de ${target}).`,
        })
      }
    }

    if (kpi.code === 'C-04' && latest.status === 'good') {
      findings.push({
        kpiCode: kpi.code,
        tone: 'positive',
        text: `La efectividad de cobro (${latest.value.toFixed(1)}%) supera la meta institucional de ${target}.`,
      })
    }

    if (kpi.code === 'PI-02' && trend === 'improving') {
      findings.push({
        kpiCode: kpi.code,
        tone: 'positive',
        text: `La automatización de puntos de medición presenta una evolución positiva respecto al período anterior (${latest.value.toFixed(1)}% actual).`,
      })
    }

    if (trend === 'deteriorating') {
      findings.push({
        kpiCode: kpi.code,
        tone: 'negative',
        text: `${kpi.indicator} muestra una tendencia de deterioro en los últimos períodos (valor actual: ${latest.value.toFixed(1)} ${kpi.unit}).`,
      })
    }
  }

  if (findings.length === 0) {
    findings.push({
      kpiCode: '—',
      tone: 'warning',
      text: 'Aún no hay suficientes registros para generar hallazgos automáticos. Agregue datos en la pestaña Entrada de Datos.',
    })
  }

  return findings
}

export function buildAlerts(evaluations: KpiEvaluation[]) {
  return evaluations
    .filter((e) => e.hasData && e.latest && e.latest.status !== 'good')
    .map((e) => ({
      kpiCode: e.kpi.code,
      indicator: e.kpi.indicator,
      perspective: e.kpi.perspective,
      value: e.latest!.value,
      unit: e.kpi.unit,
      targetLabel: e.kpi.targetLabel,
      status: e.latest!.status,
      deviationPct: deviationPct(e),
    }))
    .sort((a, b) => a.deviationPct - b.deviationPct)
}

export function buildStrengths(evaluations: KpiEvaluation[], topN = 3) {
  return evaluations
    .filter((e) => e.hasData && e.latest && e.latest.status === 'good')
    .map((e) => ({
      kpiCode: e.kpi.code,
      indicator: e.kpi.indicator,
      value: e.latest!.value,
      unit: e.kpi.unit,
      compliance: complianceFor(e.kpi, e.latest!.value),
    }))
    .sort((a, b) => b.compliance - a.compliance)
    .slice(0, topN)
}

export function buildDeviations(evaluations: KpiEvaluation[], topN = 5): DeviationEntry[] {
  return evaluations
    .filter((e) => e.hasData && e.latest)
    .map((e) => ({
      kpiCode: e.kpi.code,
      indicator: e.kpi.indicator,
      perspective: e.kpi.perspective,
      value: e.latest!.value,
      target: e.kpi.target,
      unit: e.kpi.unit,
      deviationPct: deviationPct(e),
    }))
    .sort((a, b) => Math.abs(a.deviationPct) < Math.abs(b.deviationPct) ? 1 : -1)
    .slice(0, topN)
}
