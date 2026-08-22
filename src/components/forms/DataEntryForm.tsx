import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Copy, Save, Trash2, XCircle } from 'lucide-react'
import type { KpiDefinition, KpiRecord } from '../../types/kpi'
import { FieldInput } from './FieldInput'
import { PeriodPicker, type PeriodValue } from './PeriodPicker'
import { validateInputs } from '../../utils/validation'
import { buildRecord, complianceFor, statusFor } from '../../services/calculationService'
import { formatKpiValue } from '../../utils/format'
import { StatusBadge } from '../shared/StatusBadge'
import { useData } from '../../context/DataContext'
import { useNavigation } from '../../context/NavigationContext'
import { parseIsoDate, periodKeyFor, todayIso } from '../../utils/dateUtils'

interface DataEntryFormProps {
  kpi: KpiDefinition
}

function defaultPeriod(): PeriodValue {
  const today = parseIsoDate(todayIso())!
  return { year: today.y, month: today.m, quarter: Math.ceil(today.m / 3), semester: today.m <= 6 ? 1 : 2 }
}

export function DataEntryForm({ kpi }: DataEntryFormProps) {
  const { addOrUpdateRecord, deleteRecord } = useData()
  const { editingRecord, duplicating, clearEditing, startEdit } = useNavigation()

  const isEditingThisKpi = editingRecord?.kpiCode === kpi.code

  const [inputs, setInputs] = useState<Record<string, string | number>>({})
  const [notes, setNotes] = useState('')
  const [period, setPeriod] = useState<PeriodValue>(defaultPeriod())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirming, setConfirming] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [recordId, setRecordId] = useState<string | undefined>(undefined)

  useEffect(() => {
    setSuccessMessage(null)
    setConfirming(false)
    setErrors({})
    if (isEditingThisKpi && editingRecord) {
      setInputs(editingRecord.rawInputs)
      setNotes(editingRecord.notes ?? '')
      setPeriod({
        year: editingRecord.year,
        month: editingRecord.month,
        quarter: editingRecord.quarter,
        semester: editingRecord.semester,
      })
      setRecordId(duplicating ? undefined : editingRecord.id)
    } else {
      setInputs({})
      setNotes('')
      setPeriod(defaultPeriod())
      setRecordId(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi.code, editingRecord, duplicating])

  const computeResult = useMemo(() => kpi.compute(inputs), [kpi, inputs])
  const previewStatus = statusFor(kpi, computeResult.value)
  const previewCompliance = complianceFor(kpi, computeResult.value)

  const handleFieldChange = (key: string, value: string) => {
    setSuccessMessage(null)
    setConfirming(false)
    setInputs((prev) => ({ ...prev, [key]: value }))
  }

  const resolveDateAndMeta = (): { date: string; year: number; month?: number; quarter?: number; semester?: number } => {
    if (kpi.primaryDateField) {
      const date = String(inputs[kpi.primaryDateField] ?? '')
      const parsed = parseIsoDate(date)
      if (!parsed) return { date: '', year: period.year }
      return { date, year: parsed.y, month: parsed.m, quarter: Math.ceil(parsed.m / 3), semester: parsed.m <= 6 ? 1 : 2 }
    }
    const month = period.month ?? 1
    const day = kpi.frequency === 'anual' ? '12-31' : `${String(month).padStart(2, '0')}-01`
    return {
      date: kpi.frequency === 'anual' ? `${period.year}-12-31` : `${period.year}-${day}`,
      year: period.year,
      month: kpi.frequency === 'mensual' || kpi.frequency === 'diaria_semanal' ? month : undefined,
      quarter: kpi.frequency === 'trimestral' ? period.quarter : undefined,
      semester: kpi.frequency === 'semestral' ? period.semester : undefined,
    }
  }

  const handleClear = () => {
    setInputs({})
    setNotes('')
    setPeriod(defaultPeriod())
    setErrors({})
    setConfirming(false)
    setSuccessMessage(null)
    setRecordId(undefined)
    clearEditing()
  }

  const handleSubmit = () => {
    const fieldErrors = validateInputs(kpi, inputs)
    const meta = resolveDateAndMeta()
    if (!meta.date) fieldErrors._date = 'Debe completar la fecha o el período del registro.'
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) {
      setConfirming(false)
      return
    }
    if (!confirming) {
      setConfirming(true)
      return
    }

    const { periodKey, periodLabel } = periodKeyFor(kpi.frequency, meta.year, meta.month)
    const record: KpiRecord = buildRecord(
      kpi,
      inputs,
      { date: meta.date, year: meta.year, month: meta.month, quarter: meta.quarter, semester: meta.semester, periodKey, periodLabel, notes },
      recordId,
    )
    addOrUpdateRecord(record)
    setSuccessMessage('Registro almacenado correctamente.')
    setConfirming(false)
    clearEditing()
    setRecordId(undefined)
  }

  const handleDeleteExisting = () => {
    if (editingRecord && isEditingThisKpi && !duplicating) {
      deleteRecord(editingRecord.id)
      handleClear()
      setSuccessMessage('Registro eliminado.')
    }
  }

  const warnings = computeResult.warnings ?? []

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{kpi.code}</p>
          <h3 className="text-lg font-bold text-navy-900">{kpi.indicator}</h3>
          <p className="mt-1 text-sm text-slate-500">{kpi.description}</p>
        </div>
        {recordId && (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Editando registro existente</span>
        )}
      </div>

      {!kpi.primaryDateField && (
        <div className="mb-5">
          <p className="mb-1 text-sm font-medium text-slate-700">Período del registro</p>
          <PeriodPicker frequency={kpi.frequency} value={period} onChange={setPeriod} />
          {errors._date && <p className="mt-1 text-xs font-medium text-status-bad">{errors._date}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {kpi.fields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <FieldInput field={field} value={inputs[field.key]} error={errors[field.key]} onChange={(v) => handleFieldChange(field.key, v)} />
          </div>
        ))}

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            placeholder="Observaciones opcionales sobre este registro"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Valor calculado</p>
          <p className="text-xl font-bold text-navy-900">{formatKpiValue(kpi, computeResult.value)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Meta</p>
          <p className="text-sm font-semibold text-slate-700">{kpi.targetLabel}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cumplimiento</p>
          <p className="text-sm font-semibold text-slate-700">{Number.isFinite(computeResult.value) ? `${Math.round(previewCompliance)}%` : '—'}</p>
        </div>
        <StatusBadge status={previewStatus} />
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-status-watch/40 bg-status-watch/10 p-3 text-sm text-status-watch">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <ul className="list-disc space-y-0.5 pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-good/40 bg-status-good/10 p-3 text-sm font-medium text-status-good">
          <CheckCircle2 size={16} /> {successMessage}
        </div>
      )}

      {confirming && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 p-3 text-sm text-brand-700">
          <AlertTriangle size={16} /> Confirme para guardar este registro con los valores mostrados arriba.
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
        >
          <Save size={16} /> {confirming ? 'Confirmar y guardar' : recordId ? 'Guardar cambios' : 'Guardar registro'}
        </button>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <XCircle size={16} /> Limpiar formulario
        </button>
        {editingRecord && isEditingThisKpi && !duplicating && (
          <>
            <button
              onClick={() => startEdit(editingRecord, 'duplicate')}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Copy size={16} /> Duplicar registro
            </button>
            <button
              onClick={handleDeleteExisting}
              className="flex items-center gap-2 rounded-lg border border-status-bad/40 px-4 py-2.5 text-sm font-semibold text-status-bad hover:bg-status-bad/10"
            >
              <Trash2 size={16} /> Eliminar registro
            </button>
          </>
        )}
        {editingRecord && (
          <button
            onClick={() => {
              clearEditing()
              handleClear()
            }}
            className="ml-auto text-sm font-medium text-slate-400 hover:text-slate-600"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </div>
  )
}
