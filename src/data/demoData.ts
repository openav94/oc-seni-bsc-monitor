/**
 * Datos ficticios de demostración del prototipo (Fase 4).
 *
 * IMPORTANTE: estos valores son exclusivamente simulados para demostrar el
 * funcionamiento del sistema. Las metas provienen del Plan Estratégico OC-SENI
 * (sección 4.2); los RESULTADOS de desempeño aquí mostrados NO son datos reales
 * del Organismo Coordinador.
 *
 * Se generan intencionalmente indicadores en meta, fuera de meta, mejorando,
 * deteriorándose y estables, para poder demostrar las capacidades analíticas
 * del dashboard (sección 13 del prompt maestro).
 */
import { KPI_BY_CODE } from './kpiDefinitions'
import { buildRecord } from '../services/calculationService'
import type { KpiDefinition, KpiRecord } from '../types/kpi'
import { addBusinessDays, addCalendarDays, parseIsoDate, periodKeyFor, quarterOf, semesterOf } from '../utils/dateUtils'

function mkRecord(
  kpi: KpiDefinition,
  dateIso: string,
  inputs: Record<string, string | number>,
  notes?: string,
): KpiRecord {
  const parsed = parseIsoDate(dateIso)
  if (!parsed) throw new Error(`Fecha inválida en datos de demostración: ${dateIso}`)
  const { y: year, m: month } = parsed
  const quarter = quarterOf(month)
  const semester = semesterOf(month)
  const { periodKey, periodLabel } = periodKeyFor(kpi.frequency, year, month)
  return buildRecord(kpi, inputs, { date: dateIso, year, month, quarter, semester, periodKey, periodLabel, notes })
}

function generate(): KpiRecord[] {
  const records: KpiRecord[] = []
  const push = (r: KpiRecord) => records.push(r)

  // ---------------------------------------------------------------- C-01
  {
    const kpi = KPI_BY_CODE['C-01']
    const plan: [string, number, number][] = [
      ['2026-01-28', 1450, 1418],
      ['2026-02-28', 1390, 1362],
      ['2026-03-28', 1510, 1482],
      ['2026-04-28', 1465, 1439],
      ['2026-05-28', 1500, 1474],
      ['2026-06-28', 1520, 1495],
      ['2026-07-28', 1480, 1458],
      ['2026-08-28', 1495, 1475],
    ]
    for (const [date, total, sinObs] of plan) {
      push(mkRecord(kpi, date, { totalTEE: total, teeSinObs: sinObs, teeConObs: total - sinObs }))
    }
  }

  // ---------------------------------------------------------------- C-02
  {
    const kpi = KPI_BY_CODE['C-02']
    const cierres = [
      ['2026-01-31', 20],
      ['2026-02-28', 19],
      ['2026-03-31', 18],
      ['2026-04-30', 18],
      ['2026-05-31', 17],
      ['2026-06-30', 17],
      ['2026-07-31', 16],
      ['2026-08-31', 17],
    ] as const
    for (const [cierre, dias] of cierres) {
      const aprobacion = addBusinessDays(cierre, dias)
      push(mkRecord(kpi, aprobacion, { fechaCierre: cierre, fechaAprobacion: aprobacion }))
    }
  }

  // ---------------------------------------------------------------- C-03 (anual, con historia 2024-2026)
  {
    const kpi = KPI_BY_CODE['C-03']
    const base = 120
    push(mkRecord(kpi, '2024-12-15', { reliqAñoBase: base, reliqAñoActual: 115, causa: 'recoleccion' }))
    push(mkRecord(kpi, '2025-12-15', { reliqAñoBase: base, reliqAñoActual: 98, causa: 'recoleccion' }))
    push(mkRecord(kpi, '2026-08-15', { reliqAñoBase: base, reliqAñoActual: 93.6, causa: 'asignacion' }))
  }

  // ---------------------------------------------------------------- C-04 (trimestral)
  {
    const kpi = KPI_BY_CODE['C-04']
    const plan: [string, number, number][] = [
      ['2026-03-31', 42_500_000, 41_905_000],
      ['2026-06-30', 44_100_000, 43_659_000],
      ['2026-08-31', 45_300_000, 44_986_000],
    ]
    for (const [date, facturado, cobrado] of plan) {
      push(mkRecord(kpi, date, { montoFacturado: facturado, montoCobrado: cobrado }))
    }
  }

  // ---------------------------------------------------------------- CL-01 (trimestral)
  {
    const kpi = KPI_BY_CODE['CL-01']
    const horasBase = 420
    const ensBase = 850
    const plan: [string, string, number, number][] = [
      ['2026-03-31', 'SVLL-EDESUR 138kV', 390, 790],
      ['2026-06-30', 'SVLL-EDESUR 138kV', 372, 762],
      ['2026-08-31', 'Bonao-La Vega 138kV', 345, 715],
    ]
    for (const [date, enlace, horas, ens] of plan) {
      push(
        mkRecord(kpi, date, {
          enlaceCritico: enlace,
          horasCongestion: horas,
          ensMWh: ens,
          horasCongestionBase: horasBase,
          ensMWhBase: ensBase,
        }),
      )
    }
  }

  // ---------------------------------------------------------------- CL-02 (anual, historia 2024-2026)
  {
    const kpi = KPI_BY_CODE['CL-02']
    push(mkRecord(kpi, '2024-11-20', { agentesEncuestados: 200, respuestasRecibidas: 170, agentesSatisfechos: 134 }))
    push(mkRecord(kpi, '2025-11-18', { agentesEncuestados: 205, respuestasRecibidas: 180, agentesSatisfechos: 155 }))
    push(
      mkRecord(kpi, '2026-08-10', {
        agentesEncuestados: 210,
        respuestasRecibidas: 185,
        agentesSatisfechos: 161,
        comentarios: 'Mejora sostenida en oportunidad de publicación de resultados del mercado.',
      }),
    )
  }

  // ---------------------------------------------------------------- CL-03 (semestral, por proyecto)
  {
    const kpi = KPI_BY_CODE['CL-03']
    const lineaBase = 210
    const proyectos: [string, string, string, number][] = [
      ['Parque Solar Yaguate II', 'solar', '2025-08-01', 190],
      ['Eólica Larimar', 'eolica', '2025-09-15', 185],
      ['BESS Higüamo 50MW', 'bess', '2026-01-10', 183],
      ['Parque Solar Cambita III', 'solar', '2026-02-15', 179],
    ]
    for (const [nombre, tecnologia, inicio, duracion] of proyectos) {
      const fin = addCalendarDays(inicio, duracion)
      push(
        mkRecord(kpi, fin, {
          proyecto: nombre,
          tecnologia,
          capacidadMW: 45,
          fechaInicioEstudio: inicio,
          fechaPuestaServicio: fin,
          duracionLineaBase: lineaBase,
        }),
      )
    }
  }

  // ---------------------------------------------------------------- PI-01 (diaria/semanal)
  {
    const kpi = KPI_BY_CODE['PI-01']
    const missDays = new Set(['2026-06-10', '2026-07-08', '2026-07-22', '2026-08-05'])
    for (const [monthStart, monthDays] of [
      ['2026-06', 20],
      ['2026-07', 20],
      ['2026-08', 15],
    ] as const) {
      for (let i = 1; i <= monthDays; i += 1) {
        const day = String(i).padStart(2, '0')
        const date = `${monthStart}-${day}`
        const parsed = parseIsoDate(date)
        if (!parsed) continue
        const weekday = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).getUTCDay()
        if (weekday === 0 || weekday === 6) continue
        const plazo = 4
        const usado = missDays.has(date) ? 4.6 : 3.6 + ((i % 3) * 0.1)
        push(
          mkRecord(kpi, date, {
            fecha: date,
            tipoProgramacion: 'diaria',
            horaInicio: '05:30',
            horaFin: '09:00',
            tiempoUtilizadoHoras: Number(usado.toFixed(1)),
            plazoMaximoHoras: plazo,
          }),
        )
      }
    }
  }

  // ---------------------------------------------------------------- PI-02 (mensual)
  {
    const kpi = KPI_BY_CODE['PI-02']
    const plan: [string, number, number][] = [
      ['2026-01-28', 3200, 2992],
      ['2026-02-28', 3210, 3017],
      ['2026-03-28', 3215, 3048],
      ['2026-04-28', 3220, 3065],
      ['2026-05-28', 3225, 3083],
      ['2026-06-28', 3230, 3101],
      ['2026-07-28', 3235, 3114],
      ['2026-08-28', 3240, 3123],
    ]
    for (const [date, total, auto] of plan) {
      push(mkRecord(kpi, date, { totalPuntos: total, puntosTelemedidos: total, puntosValidadosAuto: auto }))
    }
  }

  // ---------------------------------------------------------------- PI-03 (trimestral)
  {
    const kpi = KPI_BY_CODE['PI-03']
    const plan: [string, number, number][] = [
      ['2026-03-31', 22, 19],
      ['2026-06-30', 26, 23],
      ['2026-08-31', 20, 18],
    ]
    for (const [date, total, enPlazo] of plan) {
      push(mkRecord(kpi, date, { totalEstudios: total, estudiosDentroPlazo: enPlazo, estudiosFueraPlazo: total - enPlazo }))
    }
  }

  // ---------------------------------------------------------------- PI-04 (anual, historia 2024-2026)
  {
    const kpi = KPI_BY_CODE['PI-04']
    push(mkRecord(kpi, '2024-12-20', { totalProcesos: 40, procesosDocumentados: 26, procesosAuditados: 22, procesosConformes: 22 }))
    push(mkRecord(kpi, '2025-12-20', { totalProcesos: 40, procesosDocumentados: 31, procesosAuditados: 26, procesosConformes: 26 }))
    push(mkRecord(kpi, '2026-08-20', { totalProcesos: 40, procesosDocumentados: 34, procesosAuditados: 29, procesosConformes: 29 }))
  }

  // ---------------------------------------------------------------- PI-05 (mensual)
  {
    const kpi = KPI_BY_CODE['PI-05']
    const plan: [string, number, number, number][] = [
      ['2026-01-28', 744, 2.1, 1.2],
      ['2026-02-28', 672, 1.6, 1.1],
      ['2026-03-28', 744, 1.5, 1.0],
      ['2026-04-28', 720, 1.3, 1.0],
      ['2026-05-28', 744, 1.2, 0.9],
      ['2026-06-28', 720, 1.1, 0.9],
      ['2026-07-28', 744, 1.0, 1.0],
      ['2026-08-28', 744, 1.1, 1.0],
    ]
    for (const [date, totales, prog, noProg] of plan) {
      push(mkRecord(kpi, date, { horasTotales: totales, indispProgramada: prog, indispNoProgramada: noProg }))
    }
  }

  // ---------------------------------------------------------------- AC-01 (anual, group_avg_sum, 2025 y 2026)
  {
    const kpi = KPI_BY_CODE['AC-01']
    const colaboradores2025: [string, number][] = [
      ['Ing. R. Fernández', 34], ['Ing. M. Ortiz', 38], ['Ing. L. Pérez', 30], ['Ing. J. Reyes', 40],
      ['Ing. C. Peña', 36], ['Ing. D. Martínez', 33], ['Ing. A. Sánchez', 41], ['Ing. Y. Castillo', 40],
    ]
    colaboradores2025.forEach(([nombre, horas], idx) => {
      push(
        mkRecord(kpi, `2025-0${(idx % 9) + 1}-15`, {
          colaborador: nombre,
          departamento: 'Operación en Tiempo Real',
          curso: 'Fundamentos de Gemelos Digitales',
          tema: 'Gemelos digitales',
          fecha: `2025-0${(idx % 9) + 1}-15`,
          numeroHoras: horas,
        }),
      )
    })

    const colaboradores2026: [string, number, number][] = [
      ['Ing. R. Fernández', 24, 22], ['Ing. M. Ortiz', 26, 20], ['Ing. L. Pérez', 22, 18], ['Ing. J. Reyes', 28, 20],
      ['Ing. C. Peña', 20, 24], ['Ing. D. Martínez', 24, 20], ['Ing. A. Sánchez', 26, 22], ['Ing. Y. Castillo', 24, 24],
    ]
    colaboradores2026.forEach(([nombre, h1, h2], idx) => {
      const m1 = String((idx % 5) + 1).padStart(2, '0')
      const m2 = String((idx % 3) + 6).padStart(2, '0')
      push(
        mkRecord(kpi, `2026-${m1}-10`, {
          colaborador: nombre,
          departamento: 'Operación en Tiempo Real',
          curso: 'Gemelos Digitales Aplicados al Despacho',
          tema: 'Gemelos digitales',
          fecha: `2026-${m1}-10`,
          numeroHoras: h1,
        }),
      )
      push(
        mkRecord(kpi, `2026-${m2}-10`, {
          colaborador: nombre,
          departamento: 'Analítica de Datos de Mercado',
          curso: 'IA Aplicada al Pronóstico de Demanda',
          tema: 'Inteligencia artificial',
          fecha: `2026-${m2}-10`,
          numeroHoras: h2,
        }),
      )
    })
  }

  // ---------------------------------------------------------------- AC-02 (anual, sum)
  {
    const kpi = KPI_BY_CODE['AC-02']
    push(
      mkRecord(kpi, '2024-10-01', {
        nombreCaso: 'Pronóstico básico de demanda',
        area: 'Programación del SENI',
        descripcion: 'Modelo estadístico simple de pronóstico de demanda horaria.',
        fechaImplementacion: '2024-10-01',
        estado: 'implementado',
        beneficioObtenido: 'Reducción de error de pronóstico en 3%.',
      }),
    )
    push(
      mkRecord(kpi, '2025-09-15', {
        nombreCaso: 'Detección de anomalías SCADA',
        area: 'Centro de Control de Energía',
        descripcion: 'Modelo de detección de anomalías en señales de telemedición.',
        fechaImplementacion: '2025-09-15',
        estado: 'implementado',
        beneficioObtenido: 'Detección temprana de fallas de comunicación.',
      }),
    )
    push(
      mkRecord(kpi, '2026-02-10', {
        nombreCaso: 'Pronóstico de generación solar variable',
        area: 'Programación del SENI',
        descripcion: 'Modelo de machine learning para pronóstico de generación solar a 24h.',
        fechaImplementacion: '2026-02-10',
        estado: 'implementado',
        beneficioObtenido: 'Mejora en la precisión del despacho de reservas.',
      }),
    )
    push(
      mkRecord(kpi, '2026-05-22', {
        nombreCaso: 'Pronóstico de generación eólica',
        area: 'Programación del SENI',
        descripcion: 'Modelo de pronóstico de generación eólica variable.',
        fechaImplementacion: '2026-05-22',
        estado: 'implementado',
        beneficioObtenido: 'Reducción de reservas de contingencia asignadas en exceso.',
      }),
    )
    push(
      mkRecord(kpi, '2026-07-30', {
        nombreCaso: 'Asistente de análisis de contingencias N-1',
        area: 'Centro de Control de Energía',
        descripcion: 'Modelo de apoyo a la evaluación de contingencias en tiempo real.',
        fechaImplementacion: '2026-07-30',
        estado: 'implementado',
        beneficioObtenido: 'Reducción del tiempo de análisis de contingencias.',
      }),
    )
    push(
      mkRecord(kpi, '2026-08-05', {
        nombreCaso: 'Optimizador de mantenimiento predictivo',
        area: 'Análisis Operativo',
        descripcion: 'Modelo en piloto para priorizar mantenimiento de activos críticos.',
        fechaImplementacion: '2026-08-05',
        estado: 'piloto',
        beneficioObtenido: 'Pendiente de evaluación de resultados.',
      }),
    )
  }

  // ---------------------------------------------------------------- AC-03 (anual, historia 2025-2026)
  {
    const kpi = KPI_BY_CODE['AC-03']
    push(mkRecord(kpi, '2025-12-01', { totalPersonalClave: 50, personalCertificado: 39 }))
    push(mkRecord(kpi, '2026-08-01', { totalPersonalClave: 50, personalCertificado: 47 }))
  }

  // ---------------------------------------------------------------- AC-04 (anual, historia 2024-2026)
  {
    const kpi = KPI_BY_CODE['AC-04']
    push(mkRecord(kpi, '2024-12-31', { personalInicio: 48, personalFin: 45, salidas: 5, contrataciones: 2, indiceClimaLaboral: 72 }))
    push(mkRecord(kpi, '2025-12-31', { personalInicio: 48, personalFin: 52, salidas: 3, contrataciones: 7, indiceClimaLaboral: 76 }))
    push(mkRecord(kpi, '2026-08-01', { personalInicio: 47, personalFin: 49, salidas: 2, contrataciones: 4, indiceClimaLaboral: 81 }))
  }

  return records
}

export const DEMO_RECORDS: KpiRecord[] = generate()
