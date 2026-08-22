import { useEffect, useState } from 'react'
import type { PerspectiveCode } from '../types/kpi'
import { PERSPECTIVES, PERSPECTIVE_ORDER } from '../data/perspectives'
import { KPI_BY_CODE, kpisByPerspective } from '../data/kpiDefinitions'
import { DataEntryForm } from '../components/forms/DataEntryForm'
import { useNavigation } from '../context/NavigationContext'

const selectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-navy-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400'

export function DataEntry() {
  const { editingRecord } = useNavigation()
  const [perspective, setPerspective] = useState<PerspectiveCode>(editingRecord ? KPI_BY_CODE[editingRecord.kpiCode].perspective : 'COM')
  const [kpiCode, setKpiCode] = useState<string>(editingRecord?.kpiCode ?? kpisByPerspective('COM')[0].code)

  useEffect(() => {
    if (editingRecord) {
      const kpi = KPI_BY_CODE[editingRecord.kpiCode]
      setPerspective(kpi.perspective)
      setKpiCode(kpi.code)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingRecord])

  const kpisInPerspective = kpisByPerspective(perspective)
  const kpi = KPI_BY_CODE[kpiCode] ?? kpisInPerspective[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Entrada de Datos</h1>
        <p className="mt-1 text-sm text-slate-500">
          Seleccione la perspectiva y el KPI para desplegar el formulario correspondiente. Cada registro se valida,
          se calcula automáticamente y se almacena en la Base de Datos, alimentando el Dashboard y el Resumen ejecutivo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">1. Perspectiva</label>
          <select
            value={perspective}
            onChange={(e) => {
              const p = e.target.value as PerspectiveCode
              setPerspective(p)
              setKpiCode(kpisByPerspective(p)[0].code)
            }}
            className={selectClass}
          >
            {PERSPECTIVE_ORDER.map((code) => (
              <option key={code} value={code}>
                {PERSPECTIVES[code].name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">2. KPI</label>
          <select value={kpiCode} onChange={(e) => setKpiCode(e.target.value)} className={selectClass}>
            {kpisInPerspective.map((k) => (
              <option key={k.code} value={k.code}>
                {k.code} — {k.indicator}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataEntryForm key={kpi.code} kpi={kpi} />
    </div>
  )
}
