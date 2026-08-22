import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useNavigation } from '../context/NavigationContext'
import { KPI_DEFINITIONS, KPI_BY_CODE } from '../data/kpiDefinitions'
import { PERSPECTIVES, PERSPECTIVE_ORDER } from '../data/perspectives'
import { DatabaseTable, type SortKey } from '../components/database/DatabaseTable'
import { RecordDetailModal } from '../components/database/RecordDetailModal'
import { ConfirmDialog } from '../components/shared/ConfirmDialog'
import { downloadCsv, recordsToCsv } from '../utils/csvExport'
import type { KpiRecord, KpiStatus, PerspectiveCode } from '../types/kpi'

const PAGE_SIZE = 12

const selectClass = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export function Database() {
  const { records, deleteRecord } = useData()
  const { databaseFilterKpi, clearDatabaseFilter, startEdit } = useNavigation()

  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState<string>('all')
  const [perspectiveFilter, setPerspectiveFilter] = useState<'all' | PerspectiveCode>('all')
  const [kpiFilter, setKpiFilter] = useState<string>(databaseFilterKpi ?? 'all')
  const [statusFilter, setStatusFilter] = useState<'all' | KpiStatus>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState<KpiRecord | null>(null)
  const [deleting, setDeleting] = useState<KpiRecord | null>(null)

  const effectiveKpiFilter = databaseFilterKpi ?? kpiFilter

  const years = useMemo(() => Array.from(new Set(records.map((r) => r.year))).sort((a, b) => b - a), [records])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const kpi = KPI_BY_CODE[r.kpiCode]
      if (yearFilter !== 'all' && String(r.year) !== yearFilter) return false
      if (perspectiveFilter !== 'all' && kpi.perspective !== perspectiveFilter) return false
      if (effectiveKpiFilter !== 'all' && r.kpiCode !== effectiveKpiFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const haystack = `${kpi.code} ${kpi.indicator} ${r.notes ?? ''} ${r.periodLabel}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [records, yearFilter, perspectiveFilter, effectiveKpiFilter, statusFilter, search])

  const sorted = useMemo(() => {
    const copy = [...filtered]
    const dir = sortAsc ? 1 : -1
    copy.sort((a, b) => {
      switch (sortKey) {
        case 'date':
          return a.date.localeCompare(b.date) * dir
        case 'perspective':
          return KPI_BY_CODE[a.kpiCode].perspective.localeCompare(KPI_BY_CODE[b.kpiCode].perspective) * dir
        case 'kpiCode':
          return a.kpiCode.localeCompare(b.kpiCode) * dir
        case 'value':
          return (a.calculatedValue - b.calculatedValue) * dir
        case 'status':
          return a.status.localeCompare(b.status) * dir
        default:
          return 0
      }
    })
    return copy
  }, [filtered, sortKey, sortAsc])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const paginated = sorted.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE)

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((v) => !v)
    else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-5 px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Base de Datos</h1>
          <p className="mt-1 text-sm text-slate-500">Registros históricos utilizados para calcular los 16 KPI del Balanced Scorecard.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCsv(`oc-seni-bsc-registros-${Date.now()}.csv`, recordsToCsv(sorted))}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download size={16} /> Exportar CSV
          </button>
          <button
            onClick={() => downloadCsv(`oc-seni-bsc-registros-${Date.now()}.xls`, recordsToCsv(sorted))}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            title="Genera un archivo compatible con Excel a partir del CSV"
          >
            <Download size={16} /> Exportar Excel
          </button>
        </div>
      </div>

      {databaseFilterKpi && (
        <div className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          <span>Filtrando por trazabilidad desde el Dashboard: <strong>{databaseFilterKpi}</strong></span>
          <button onClick={clearDatabaseFilter} className="font-semibold underline">Quitar filtro</button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por KPI, indicador, observación…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1) }} className={selectClass}>
          <option value="all">Todos los años</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={perspectiveFilter}
          onChange={(e) => { setPerspectiveFilter(e.target.value as 'all' | PerspectiveCode); setPage(1) }}
          className={selectClass}
        >
          <option value="all">Todas las perspectivas</option>
          {PERSPECTIVE_ORDER.map((code) => <option key={code} value={code}>{PERSPECTIVES[code].name}</option>)}
        </select>
        <select
          value={effectiveKpiFilter}
          onChange={(e) => { setKpiFilter(e.target.value); if (databaseFilterKpi) clearDatabaseFilter(); setPage(1) }}
          className={selectClass}
        >
          <option value="all">Todos los KPI</option>
          {KPI_DEFINITIONS.map((k) => <option key={k.code} value={k.code}>{k.code}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as 'all' | KpiStatus); setPage(1) }} className={selectClass}>
          <option value="all">Todos los estados</option>
          <option value="good">Cumple</option>
          <option value="watch">Atención</option>
          <option value="bad">No cumple</option>
        </select>
      </div>

      <DatabaseTable
        records={paginated}
        sortKey={sortKey}
        sortAsc={sortAsc}
        onSort={handleSort}
        onView={setViewing}
        onEdit={(r) => startEdit(r, 'edit')}
        onDuplicate={(r) => startEdit(r, 'duplicate')}
        onDelete={setDeleting}
      />

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{sorted.length} registro(s) encontrado(s)</span>
        <div className="flex items-center gap-2">
          <button disabled={pageSafe <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Anterior</button>
          <span>Página {pageSafe} de {totalPages}</span>
          <button disabled={pageSafe >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      {viewing && <RecordDetailModal record={viewing} onClose={() => setViewing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Eliminar registro"
          message={`¿Está seguro de eliminar el registro de ${KPI_BY_CODE[deleting.kpiCode].code} (${deleting.periodLabel})? Esta acción no se puede deshacer.`}
          onConfirm={() => { deleteRecord(deleting.id); setDeleting(null) }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
