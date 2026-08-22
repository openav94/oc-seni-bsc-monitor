import { X } from 'lucide-react'
import type { KpiRecord } from '../../types/kpi'
import { KPI_BY_CODE } from '../../data/kpiDefinitions'
import { StatusBadge } from '../shared/StatusBadge'
import { formatKpiValue } from '../../utils/format'

export function RecordDetailModal({ record, onClose }: { record: KpiRecord; onClose: () => void }) {
  const kpi = KPI_BY_CODE[record.kpiCode]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{kpi.code} · {record.periodLabel}</p>
            <h2 className="text-base font-bold text-navy-900">{kpi.indicator}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-4">
          <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Valor calculado</p>
              <p className="text-lg font-bold text-navy-900">{formatKpiValue(kpi, record.calculatedValue)}</p>
            </div>
            <StatusBadge status={record.status} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Datos originales ingresados</p>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
              {kpi.fields.map((field) => (
                <div key={field.key} className="text-sm">
                  <dt className="text-slate-400">{field.label}</dt>
                  <dd className="font-medium text-slate-700">{String(record.rawInputs[field.key] ?? '—')}</dd>
                </div>
              ))}
            </dl>
          </div>

          {record.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Observaciones</p>
              <p className="mt-1 text-sm text-slate-700">{record.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <p>Creado: {new Date(record.createdAt).toLocaleString('es-DO')}</p>
            <p>Actualizado: {new Date(record.updatedAt).toLocaleString('es-DO')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
