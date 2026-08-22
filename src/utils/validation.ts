import type { KpiDefinition, KpiFieldDef } from '../types/kpi'

export function validateField(field: KpiFieldDef, rawValue: string | number | undefined): string | null {
  const value = rawValue === undefined ? '' : String(rawValue).trim()

  if (field.required && value === '') {
    return `${field.label} es obligatorio.`
  }
  if (value === '') return null

  if (field.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return `${field.label} debe ser un valor numérico.`
    const min = field.min ?? 0
    if (n < min) return `${field.label} no puede ser menor que ${min}.`
    if (field.max !== undefined && n > field.max) return `${field.label} no puede ser mayor que ${field.max}.`
  }

  if (field.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${field.label} debe ser una fecha válida.`
  }

  return null
}

export function validateInputs(kpi: KpiDefinition, inputs: Record<string, string | number>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of kpi.fields) {
    const error = validateField(field, inputs[field.key])
    if (error) errors[field.key] = error
  }
  return errors
}
