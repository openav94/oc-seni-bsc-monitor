import type { KpiFieldDef } from '../../types/kpi'

interface FieldInputProps {
  field: KpiFieldDef
  value: string | number | undefined
  error?: string
  onChange: (value: string) => void
}

const baseInputClass =
  'w-full rounded-lg border px-3 py-2 text-sm text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export function FieldInput({ field, value, error, onChange }: FieldInputProps) {
  const borderClass = error ? 'border-status-bad' : 'border-slate-300'

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {field.label}
        {field.required && <span className="ml-0.5 text-status-bad">*</span>}
        {field.unit && <span className="ml-1 text-xs font-normal text-slate-400">({field.unit})</span>}
      </label>

      {field.type === 'select' ? (
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} ${borderClass} bg-white`}
        >
          <option value="">Seleccione…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${baseInputClass} ${borderClass}`}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
          value={value ?? ''}
          min={field.type === 'number' ? field.min ?? 0 : undefined}
          max={field.type === 'number' ? field.max : undefined}
          step={field.step ?? (field.type === 'number' ? 'any' : undefined)}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInputClass} ${borderClass}`}
        />
      )}

      {field.helpText && !error && <p className="mt-1 text-xs text-slate-400">{field.helpText}</p>}
      {error && <p className="mt-1 text-xs font-medium text-status-bad">{error}</p>}
    </div>
  )
}
