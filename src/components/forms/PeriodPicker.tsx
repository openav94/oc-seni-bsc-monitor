import type { FrequencyCode } from '../../types/kpi'
import { monthName } from '../../utils/dateUtils'

export interface PeriodValue {
  year: number
  month?: number
  quarter?: number
  semester?: number
}

interface PeriodPickerProps {
  frequency: FrequencyCode
  value: PeriodValue
  onChange: (value: PeriodValue) => void
}

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

/** Selector explícito de período para KPI cuya fecha no se deriva de un campo propio del formulario. */
export function PeriodPicker({ frequency, value, onChange }: PeriodPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Año</label>
        <input
          type="number"
          value={value.year}
          onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
          className={selectClass}
        />
      </div>

      {frequency === 'mensual' || frequency === 'diaria_semanal' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Mes</label>
          <select
            value={value.month ?? 1}
            onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
            className={selectClass}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {monthName(m)}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {frequency === 'trimestral' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Trimestre</label>
          <select
            value={value.quarter ?? 1}
            onChange={(e) => onChange({ ...value, quarter: Number(e.target.value), month: Number(e.target.value) * 3 })}
            className={selectClass}
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>
                Q{q}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {frequency === 'semestral' ? (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Semestre</label>
          <select
            value={value.semester ?? 1}
            onChange={(e) => onChange({ ...value, semester: Number(e.target.value), month: Number(e.target.value) === 1 ? 6 : 12 })}
            className={selectClass}
          >
            <option value={1}>S1</option>
            <option value={2}>S2</option>
          </select>
        </div>
      ) : null}
    </div>
  )
}
