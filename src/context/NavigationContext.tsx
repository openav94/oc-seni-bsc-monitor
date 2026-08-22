import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { KpiRecord } from '../types/kpi'

export type TabId = 'entrada' | 'basedatos' | 'dashboard' | 'resumen'

interface NavigationContextValue {
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
  databaseFilterKpi: string | null
  /** Navega a la pestaña Base de Datos filtrando por un KPI específico (trazabilidad Dashboard/Resumen → Base de Datos). */
  goToRecordsForKpi: (kpiCode: string) => void
  clearDatabaseFilter: () => void
  editingRecord: KpiRecord | null
  duplicating: boolean
  /** Envía un registro existente a Entrada de Datos para edición o duplicación. */
  startEdit: (record: KpiRecord, mode?: 'edit' | 'duplicate') => void
  clearEditing: () => void
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [databaseFilterKpi, setDatabaseFilterKpi] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<KpiRecord | null>(null)
  const [duplicating, setDuplicating] = useState(false)

  const value = useMemo<NavigationContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      databaseFilterKpi,
      goToRecordsForKpi: (kpiCode: string) => {
        setDatabaseFilterKpi(kpiCode)
        setActiveTab('basedatos')
      },
      clearDatabaseFilter: () => setDatabaseFilterKpi(null),
      editingRecord,
      duplicating,
      startEdit: (record: KpiRecord, mode: 'edit' | 'duplicate' = 'edit') => {
        setEditingRecord(record)
        setDuplicating(mode === 'duplicate')
        setActiveTab('entrada')
      },
      clearEditing: () => {
        setEditingRecord(null)
        setDuplicating(false)
      },
    }),
    [activeTab, databaseFilterKpi, editingRecord, duplicating],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation debe usarse dentro de NavigationProvider')
  return ctx
}
