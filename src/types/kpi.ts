/**
 * Modelo de datos central del Sistema de Seguimiento del Balanced Scorecard OC-SENI.
 * Todas las metas, frecuencias y definiciones oficiales provienen de la sección 4.2
 * (Tablas 5-8) del Plan Estratégico Integral OC-SENI 2026-2035.
 */

export type PerspectiveCode = 'COM' | 'CLI' | 'PRO' | 'APR'

export type FrequencyCode = 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'diaria_semanal'

export type FavorableDirection = 'higher' | 'lower'

export type KpiStatus = 'good' | 'watch' | 'bad' | 'no_data'

export type TrendDirection = 'improving' | 'deteriorating' | 'stable' | 'no_data'

export interface PerspectiveDefinition {
  code: PerspectiveCode
  name: string
  shortName: string
  description: string
  order: number
}

export type FieldType = 'number' | 'date' | 'text' | 'select' | 'textarea'

export interface KpiFieldOption {
  value: string
  label: string
}

export interface KpiFieldDef {
  key: string
  label: string
  type: FieldType
  unit?: string
  required?: boolean
  min?: number
  max?: number
  step?: number
  options?: KpiFieldOption[]
  helpText?: string
  placeholder?: string
}

/** Resultado devuelto por el motor de cálculo de un KPI, independiente de la UI. */
export interface KpiComputeResult {
  /** Valor natural del indicador, en su propia unidad (%, días, horas, casos, etc.) */
  value: number
  /** Componentes secundarios a mostrar (ej. CL-01 horas + MWh) */
  secondary?: Record<string, number>
  /** Advertencias de consistencia detectadas durante el cálculo */
  warnings?: string[]
}

export interface KpiDefinition {
  code: string
  perspective: PerspectiveCode
  objective: string
  indicator: string
  description: string
  unit: string
  target: number
  targetLabel: string
  targetOperator: '>=' | '<=' | '='
  frequency: FrequencyCode
  favorableDirection: FavorableDirection
  /** Peso relativo dentro de su perspectiva. Uniforme (1) para el prototipo. */
  weight: number
  formulaText: string
  formulaIsAssumption: boolean
  source: string
  visualizationHint: string
  alerts: string
  /** Ancho de la banda "atención" (amarillo) en la unidad propia del KPI. Regla de implementación del dashboard. */
  watchBand: number
  /**
   * Estrategia para agregar varios registros dentro de un mismo período:
   * - mean: promedio simple de los valores calculados (mayoría de los KPI de ratio/%).
   * - sum: suma de los valores calculados (conteos, ej. casos de IA).
   * - group_avg_sum: agrupa registros por `groupByField`, suma dentro de cada grupo
   *   y promedia entre grupos (ej. horas de capacitación acumuladas por colaborador).
   */
  aggregation: 'mean' | 'sum' | 'group_avg_sum'
  groupByField?: string
  /**
   * Clave del campo de tipo fecha que determina el período del registro (año/mes/
   * trimestre/semestre). Si no se define, la Entrada de Datos solicita el período
   * explícitamente (año + mes/trimestre/semestre según la frecuencia del KPI).
   */
  primaryDateField?: string
  fields: KpiFieldDef[]
  /** Motor de cálculo del KPI, aislado de los componentes visuales. */
  compute: (inputs: Record<string, string | number>) => KpiComputeResult
}

export interface KpiRecord {
  id: string
  kpiCode: string
  /** Fecha de registro (ISO) usada como referencia temporal principal */
  date: string
  year: number
  month?: number
  quarter?: number
  semester?: number
  /** Clave de período legible usada para agrupar y graficar, ej. "2026-03", "2026-Q1" */
  periodKey: string
  periodLabel: string
  rawInputs: Record<string, string | number>
  calculatedValue: number
  secondary?: Record<string, number>
  target: number
  compliancePercentage: number
  status: KpiStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface KpiSeriesPoint {
  periodKey: string
  periodLabel: string
  value: number
  target: number
  status: KpiStatus
  recordIds: string[]
  /** Promedio de los componentes secundarios de los registros del período (ej. horas + MWh en CL-01). */
  secondary?: Record<string, number>
}

export interface KpiEvaluation {
  kpi: KpiDefinition
  latest: KpiSeriesPoint | null
  series: KpiSeriesPoint[]
  trend: TrendDirection
  hasData: boolean
}

export interface PerspectiveEvaluation {
  perspective: PerspectiveDefinition
  kpiEvaluations: KpiEvaluation[]
  compliancePercentage: number
  kpisInTarget: number
  kpisTotal: number
}
