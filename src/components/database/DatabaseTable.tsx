import { ArrowDown, ArrowUp, Copy, Eye, Pencil, Trash2 } from 'lucide-react'
import type { KpiRecord } from '../../types/kpi'
import { KPI_BY_CODE } from '../../data/kpiDefinitions'
import { PERSPECTIVES } from '../../data/perspectives'
import { StatusBadge } from '../shared/StatusBadge'
import { formatKpiValue } from '../../utils/format'

export type SortKey = 'date' | 'perspective' | 'kpiCode' | 'value' | 'status'

interface DatabaseTableProps {
  records: KpiRecord[]
  sortKey: SortKey
  sortAsc: boolean
  onSort: (key: SortKey) => void
  onView: (record: KpiRecord) => void
  onEdit: (record: KpiRecord) => void
  onDuplicate: (record: KpiRecord) => void
  onDelete: (record: KpiRecord) => void
}

function SortHeader({ label, sortKey, activeKey, asc, onSort }: { label: string; sortKey: SortKey; activeKey: SortKey; asc: boolean; onSort: (k: SortKey) => void }) {
  const active = sortKey === activeKey
  return (
    <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 text-left font-semibold text-slate-500 hover:text-navy-800">
      {label}
      {active && (asc ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
    </button>
  )
}

export function DatabaseTable({ records, sortKey, sortAsc, onSort, onView, onEdit, onDuplicate, onDelete }: DatabaseTableProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-400">
        No hay registros que coincidan con los filtros seleccionados.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-[960px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left"><SortHeader label="Fecha" sortKey="date" activeKey={sortKey} asc={sortAsc} onSort={onSort} /></th>
            <th className="px-4 py-3 text-left">Período</th>
            <th className="px-4 py-3 text-left"><SortHeader label="Perspectiva" sortKey="perspective" activeKey={sortKey} asc={sortAsc} onSort={onSort} /></th>
            <th className="px-4 py-3 text-left"><SortHeader label="KPI" sortKey="kpiCode" activeKey={sortKey} asc={sortAsc} onSort={onSort} /></th>
            <th className="px-4 py-3 text-left">Indicador</th>
            <th className="px-4 py-3 text-right"><SortHeader label="Valor" sortKey="value" activeKey={sortKey} asc={sortAsc} onSort={onSort} /></th>
            <th className="px-4 py-3 text-left">Meta</th>
            <th className="px-4 py-3 text-left"><SortHeader label="Estado" sortKey="status" activeKey={sortKey} asc={sortAsc} onSort={onSort} /></th>
            <th className="px-4 py-3 text-left">Observaciones</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const kpi = KPI_BY_CODE[r.kpiCode]
            return (
              <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                <td className="max-w-[90px] truncate px-4 py-2.5 font-mono text-xs text-slate-400" title={r.id}>{r.id.slice(0, 8)}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.date}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.periodLabel}</td>
                <td className="px-4 py-2.5 text-slate-600">{PERSPECTIVES[kpi.perspective].shortName}</td>
                <td className="px-4 py-2.5 font-semibold text-brand-700">{kpi.code}</td>
                <td className="max-w-[220px] truncate px-4 py-2.5 text-slate-600" title={kpi.indicator}>{kpi.indicator}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-navy-900">{formatKpiValue(kpi, r.calculatedValue)}</td>
                <td className="px-4 py-2.5 text-slate-500">{kpi.targetLabel}</td>
                <td className="px-4 py-2.5"><StatusBadge status={r.status} compact /></td>
                <td className="max-w-[160px] truncate px-4 py-2.5 text-slate-500" title={r.notes}>{r.notes || '—'}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => onView(r)} title="Visualizar" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"><Eye size={15} /></button>
                    <button onClick={() => onEdit(r)} title="Editar" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"><Pencil size={15} /></button>
                    <button onClick={() => onDuplicate(r)} title="Duplicar" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"><Copy size={15} /></button>
                    <button onClick={() => onDelete(r)} title="Eliminar" className="rounded p-1.5 text-slate-400 hover:bg-status-bad/10 hover:text-status-bad"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
