import { Zap } from 'lucide-react'
import { useData, useEvaluations } from '../../context/DataContext'
import { globalStatusLabel } from '../../services/calculationService'
import { STATUS_META } from '../../utils/format'

function formatUpdatedAt(iso: string | null): string {
  if (!iso) return 'Sin registros'
  const date = new Date(iso)
  return date.toLocaleString('es-DO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function Header() {
  const { lastUpdated } = useData()
  const { globalIndex } = useEvaluations()
  const { label, status } = globalStatusLabel(globalIndex)
  const meta = STATUS_META[status]

  return (
    <header className="border-b border-slate-200 bg-navy-950 text-white">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight tracking-wide">OC-SENI · Sistema de Gestión Estratégica</p>
            <p className="text-xs text-slate-300">Seguimiento del Balanced Scorecard — Plan Estratégico 2026-2035</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Última actualización</p>
            <p className="text-sm font-medium">{formatUpdatedAt(lastUpdated)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Estado general del BSC</p>
            <p className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-semibold ${meta.className}`}>
              {meta.icon} {Math.round(globalIndex)}% · {label}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
