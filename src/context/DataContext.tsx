import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { KpiRecord, PerspectiveCode } from '../types/kpi'
import { recordStore } from '../services/storageService'
import { DEMO_RECORDS } from '../data/demoData'
import { KPI_DEFINITIONS } from '../data/kpiDefinitions'
import { evaluateKpi, evaluatePerspective, globalComplianceIndex } from '../services/calculationService'
import { PERSPECTIVE_ORDER } from '../data/perspectives'

interface DataContextValue {
  records: KpiRecord[]
  addOrUpdateRecord: (record: KpiRecord) => void
  deleteRecord: (id: string) => void
  resetToDemoData: () => void
  lastUpdated: string | null
}

const DataContext = createContext<DataContextValue | null>(null)

function loadInitialRecords(): KpiRecord[] {
  if (!recordStore.isSeeded()) {
    recordStore.bulkLoad(DEMO_RECORDS)
    recordStore.markSeeded()
    return DEMO_RECORDS
  }
  return recordStore.getAll()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<KpiRecord[]>(() => loadInitialRecords())

  const addOrUpdateRecord = useCallback((record: KpiRecord) => {
    recordStore.upsert(record)
    setRecords(recordStore.getAll())
  }, [])

  const deleteRecord = useCallback((id: string) => {
    recordStore.remove(id)
    setRecords(recordStore.getAll())
  }, [])

  const resetToDemoData = useCallback(() => {
    recordStore.bulkLoad(DEMO_RECORDS)
    recordStore.markSeeded()
    setRecords([...DEMO_RECORDS])
  }, [])

  const lastUpdated = useMemo(() => {
    if (!records.length) return null
    return records.reduce((latest, r) => (r.updatedAt > latest ? r.updatedAt : latest), records[0].updatedAt)
  }, [records])

  const value = useMemo<DataContextValue>(
    () => ({ records, addOrUpdateRecord, deleteRecord, resetToDemoData, lastUpdated }),
    [records, addOrUpdateRecord, deleteRecord, resetToDemoData, lastUpdated],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData debe usarse dentro de DataProvider')
  return ctx
}

/** Deriva las evaluaciones de KPI y perspectiva a partir de los registros actuales. */
export function useEvaluations() {
  const { records } = useData()
  return useMemo(() => {
    const kpiEvaluations = KPI_DEFINITIONS.map((k) => evaluateKpi(k, records))
    const perspectiveEvaluations = PERSPECTIVE_ORDER.map((code) => evaluatePerspective(code, KPI_DEFINITIONS, records))
    const globalIndex = globalComplianceIndex(perspectiveEvaluations)
    return { kpiEvaluations, perspectiveEvaluations, globalIndex }
  }, [records])
}

export interface DashboardFilters {
  year: 'all' | number
  month: 'all' | number
  quarter: 'all' | number
  perspective: 'all' | PerspectiveCode
}

/**
 * Variante filtrada de las evaluaciones, usada por el Dashboard (sección 9.1).
 * Un registro solo se excluye por mes/trimestre si el propio registro tiene esa
 * granularidad; los KPI anuales/semestrales no se ven afectados por esos filtros.
 */
export function useFilteredEvaluations(filters: DashboardFilters) {
  const { records } = useData()
  return useMemo(() => {
    const filteredRecords = records.filter((r) => {
      if (filters.year !== 'all' && r.year !== filters.year) return false
      if (filters.month !== 'all' && r.month != null && r.month !== filters.month) return false
      if (filters.quarter !== 'all' && r.quarter != null && r.quarter !== filters.quarter) return false
      return true
    })
    const kpis =
      filters.perspective === 'all' ? KPI_DEFINITIONS : KPI_DEFINITIONS.filter((k) => k.perspective === filters.perspective)
    const perspectives = filters.perspective === 'all' ? PERSPECTIVE_ORDER : [filters.perspective]
    const kpiEvaluations = kpis.map((k) => evaluateKpi(k, filteredRecords))
    const perspectiveEvaluations = perspectives.map((code) => evaluatePerspective(code, KPI_DEFINITIONS, filteredRecords))
    const globalIndex = globalComplianceIndex(perspectiveEvaluations)
    return { kpiEvaluations, perspectiveEvaluations, globalIndex }
  }, [records, filters.year, filters.month, filters.quarter, filters.perspective])
}
