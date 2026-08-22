const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

export function monthName(month: number): string {
  return MONTH_NAMES[(month - 1 + 12) % 12]
}

export function quarterOf(month: number): number {
  return Math.ceil(month / 3)
}

export function semesterOf(month: number): number {
  return month <= 6 ? 1 : 2
}

/** Parsea una fecha "YYYY-MM-DD" a un objeto {y,m,d} sin conversión de zona horaria. */
export function parseIsoDate(iso: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) }
}

/**
 * Todas las funciones de fecha operan en UTC deliberadamente: los campos de formulario
 * son fechas "puras" (YYYY-MM-DD) sin hora, y usar Date local aquí desplazaría el día
 * en zonas horarias negativas (ej. República Dominicana, UTC-4).
 */
function toUtcDate(iso: string): Date | null {
  const parsed = parseIsoDate(iso)
  if (!parsed) return null
  return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d))
}

/** Días hábiles (lunes-viernes) entre dos fechas ISO, contando desde el día siguiente al inicio hasta el fin inclusive. */
export function businessDaysBetween(startIso: string, endIso: string): number {
  const start = toUtcDate(startIso)
  const end = toUtcDate(endIso)
  if (!start || !end) return NaN
  let count = 0
  const cursor = new Date(start)
  cursor.setUTCDate(cursor.getUTCDate() + 1)
  while (cursor <= end) {
    const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6) count += 1
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return count
}

/** Suma N días hábiles a una fecha ISO (usado para construir datos de demostración consistentes). */
export function addBusinessDays(startIso: string, businessDays: number): string {
  const cursor = toUtcDate(startIso)
  if (!cursor) return startIso
  let remaining = businessDays
  while (remaining > 0) {
    cursor.setUTCDate(cursor.getUTCDate() + 1)
    const day = cursor.getUTCDay()
    if (day !== 0 && day !== 6) remaining -= 1
  }
  return cursor.toISOString().slice(0, 10)
}

export function addCalendarDays(startIso: string, days: number): string {
  const cursor = toUtcDate(startIso)
  if (!cursor) return startIso
  cursor.setUTCDate(cursor.getUTCDate() + days)
  return cursor.toISOString().slice(0, 10)
}

export function calendarDaysBetween(startIso: string, endIso: string): number {
  const start = toUtcDate(startIso)
  const end = toUtcDate(endIso)
  if (!start || !end) return NaN
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function periodKeyFor(
  frequency: 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'diaria_semanal',
  year: number,
  month?: number,
): { periodKey: string; periodLabel: string } {
  switch (frequency) {
    case 'anual':
      return { periodKey: `${year}`, periodLabel: `${year}` }
    case 'semestral': {
      const s = month ? semesterOf(month) : 1
      return { periodKey: `${year}-S${s}`, periodLabel: `${year} S${s}` }
    }
    case 'trimestral': {
      const q = month ? quarterOf(month) : 1
      return { periodKey: `${year}-Q${q}`, periodLabel: `${year} Q${q}` }
    }
    case 'mensual':
    case 'diaria_semanal':
    default: {
      const m = month ?? 1
      return { periodKey: `${year}-${String(m).padStart(2, '0')}`, periodLabel: `${monthName(m)} ${year}` }
    }
  }
}

export function comparePeriodKeys(a: string, b: string): number {
  return a.localeCompare(b)
}
