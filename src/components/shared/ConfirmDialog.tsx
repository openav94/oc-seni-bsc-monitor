import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-status-bad">
          <AlertTriangle size={20} />
          <h3 className="text-base font-bold text-navy-900">{title}</h3>
        </div>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancelar
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-status-bad px-3.5 py-2 text-sm font-semibold text-white hover:opacity-90">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
