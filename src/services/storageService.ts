/**
 * Capa de persistencia. Implementada sobre localStorage para el prototipo, pero
 * expuesta detrás de una interfaz (RecordStore) para poder sustituirla más adelante
 * por PostgreSQL, MySQL, Supabase, Firebase o una API REST sin tocar el resto de la app.
 */
import type { KpiRecord } from '../types/kpi'

const STORAGE_KEY = 'oc-seni-bsc:records:v1'
const SEED_FLAG_KEY = 'oc-seni-bsc:seeded:v1'

export interface RecordStore {
  getAll(): KpiRecord[]
  upsert(record: KpiRecord): void
  remove(id: string): void
  bulkLoad(records: KpiRecord[]): void
  clearAll(): void
  isSeeded(): boolean
  markSeeded(): void
}

class LocalStorageRecordStore implements RecordStore {
  getAll(): KpiRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      return JSON.parse(raw) as KpiRecord[]
    } catch {
      return []
    }
  }

  private save(records: KpiRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }

  upsert(record: KpiRecord): void {
    const all = this.getAll()
    const idx = all.findIndex((r) => r.id === record.id)
    if (idx >= 0) all[idx] = record
    else all.push(record)
    this.save(all)
  }

  remove(id: string): void {
    this.save(this.getAll().filter((r) => r.id !== id))
  }

  bulkLoad(records: KpiRecord[]): void {
    this.save(records)
  }

  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  isSeeded(): boolean {
    return localStorage.getItem(SEED_FLAG_KEY) === 'true'
  }

  markSeeded(): void {
    localStorage.setItem(SEED_FLAG_KEY, 'true')
  }
}

export const recordStore: RecordStore = new LocalStorageRecordStore()
