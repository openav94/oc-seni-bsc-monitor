/**
 * Archivo central de configuración de los 16 KPI del Balanced Scorecard OC-SENI.
 *
 * Fuente oficial de objetivo, indicador, meta y frecuencia: Plan Estratégico Integral
 * OC-SENI 2026-2035, sección 4.2 "Objetivos e indicadores por perspectiva" (Tablas 5-8).
 * Estos valores NO deben modificarse.
 *
 * Toda fórmula, umbral de "atención" (watchBand) y estrategia de agregación que no esté
 * escrita explícitamente en el documento se marca con formulaIsAssumption: true y se
 * documenta como "Fórmula propuesta para fines de implementación del sistema."
 */
import type { KpiDefinition } from '../types/kpi'
import { businessDaysBetween, calendarDaysBetween } from '../utils/dateUtils'

const num = (v: string | number | undefined): number => {
  if (v === undefined || v === '') return NaN
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : NaN
}

export const KPI_DEFINITIONS: KpiDefinition[] = [
  // ---------------------------------------------------------------- COMERCIAL
  {
    code: 'C-01',
    perspective: 'COM',
    objective: 'Mejorar la precisión de los cálculos comerciales del mercado (energía, potencia, RPF/RSF)',
    indicator: '% de Transacciones Económicas (TEE) emitidas sin observaciones de los agentes en el plazo reglamentario',
    description:
      'Mide la proporción de Transacciones Económicas mensuales que los agentes aceptan sin observaciones dentro del plazo reglamentario.',
    unit: '%',
    target: 98,
    targetLabel: '≥ 98%',
    targetOperator: '>=',
    frequency: 'mensual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'TEE sin observaciones / Total TEE emitidas × 100',
    formulaIsAssumption: true,
    source: 'Gerencia Comercial — Administración del Mercado Mayorista',
    visualizationHint: 'Gauge / barra de cumplimiento',
    alerts: 'Alerta si el % cae por debajo de 97% (banda de atención) o de 98% de forma sostenida.',
    watchBand: 1,
    aggregation: 'mean',
    fields: [
      { key: 'totalTEE', label: 'Total de TEE emitidas', type: 'number', required: true, min: 0 },
      { key: 'teeSinObs', label: 'TEE sin observaciones', type: 'number', required: true, min: 0 },
      { key: 'teeConObs', label: 'TEE con observaciones', type: 'number', min: 0, helpText: 'Informativo; se valida contra el total.' },
    ],
    compute: (inputs) => {
      const total = num(inputs.totalTEE)
      const sinObs = num(inputs.teeSinObs)
      const warnings: string[] = []
      if (Number.isFinite(total) && Number.isFinite(sinObs) && sinObs > total) {
        warnings.push('TEE sin observaciones no puede superar el total de TEE emitidas.')
      }
      const value = total > 0 ? (sinObs / total) * 100 : NaN
      return { value, warnings }
    },
  },
  {
    code: 'C-02',
    perspective: 'COM',
    objective: 'Reducir el tiempo del ciclo de facturación y conciliación',
    indicator: 'Días hábiles promedio desde el cierre del mes operativo hasta la aprobación de las TTEE por el Consejo de Coordinación',
    description: 'Mide la duración del ciclo de facturación y conciliación del mercado, en días hábiles.',
    unit: 'días hábiles',
    target: 18,
    targetLabel: '≤ 18 días hábiles',
    targetOperator: '<=',
    frequency: 'mensual',
    favorableDirection: 'lower',
    weight: 1,
    formulaText: 'Días hábiles entre la fecha de cierre del mes operativo y la fecha de aprobación de las TTEE',
    formulaIsAssumption: true,
    source: 'Gerencia Comercial — Cálculos Comerciales',
    visualizationHint: 'Línea de tendencia mensual',
    alerts: 'Alerta si el ciclo supera 18 días hábiles o se acerca de forma sostenida al límite.',
    watchBand: 2,
    aggregation: 'mean',
    primaryDateField: 'fechaAprobacion',
    fields: [
      { key: 'fechaCierre', label: 'Fecha de cierre del mes operativo', type: 'date', required: true },
      { key: 'fechaAprobacion', label: 'Fecha de aprobación de las TTEE', type: 'date', required: true },
    ],
    compute: (inputs) => {
      const start = String(inputs.fechaCierre ?? '')
      const end = String(inputs.fechaAprobacion ?? '')
      const warnings: string[] = []
      if (start && end && end < start) warnings.push('La fecha de aprobación es anterior a la fecha de cierre.')
      const value = start && end ? businessDaysBetween(start, end) : NaN
      return { value, warnings }
    },
  },
  {
    code: 'C-03',
    perspective: 'COM',
    objective: 'Minimizar reliquidaciones por error atribuible al proceso',
    indicator: 'Número de reliquidaciones anuales por causas 1 (errores de recolección/asignación)',
    description: 'Mide la reducción porcentual de reliquidaciones por causas atribuibles al proceso, respecto al año base.',
    unit: '% reducción',
    target: 20,
    targetLabel: 'Reducción del 20% anual respecto al año base',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Reducción (%) = (Reliquidaciones año base − Reliquidaciones año actual) / Reliquidaciones año base × 100',
    formulaIsAssumption: true,
    source: 'Gerencia Comercial — Cálculos Comerciales',
    visualizationHint: 'Gráfico comparativo año base vs. año actual',
    alerts: 'Alerta si la reducción lograda es menor al 20% respecto al año base.',
    watchBand: 5,
    aggregation: 'mean',
    fields: [
      { key: 'reliqAñoBase', label: 'Reliquidaciones año base', type: 'number', required: true, min: 0 },
      { key: 'reliqAñoActual', label: 'Reliquidaciones año evaluado', type: 'number', required: true, min: 0 },
      {
        key: 'causa',
        label: 'Causa principal',
        type: 'select',
        options: [
          { value: 'recoleccion', label: 'Error de recolección' },
          { value: 'asignacion', label: 'Error de asignación' },
          { value: 'otra', label: 'Otra' },
        ],
      },
    ],
    compute: (inputs) => {
      const base = num(inputs.reliqAñoBase)
      const actual = num(inputs.reliqAñoActual)
      const value = base > 0 ? ((base - actual) / base) * 100 : NaN
      return { value, secondary: { reliqAñoBase: base, reliqAñoActual: actual } }
    },
  },
  {
    code: 'C-04',
    perspective: 'COM',
    objective: 'Garantizar la sostenibilidad financiera institucional',
    indicator: 'Efectividad de cobro de cuotas y transacciones a agentes (%)',
    description: 'Mide la proporción del monto facturado que efectivamente fue cobrado a los agentes en el trimestre.',
    unit: '%',
    target: 99,
    targetLabel: '≥ 99%',
    targetOperator: '>=',
    frequency: 'trimestral',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Efectividad de cobro = Monto cobrado / Monto facturado × 100',
    formulaIsAssumption: true,
    source: 'Gerencia General — Administración y Finanzas',
    visualizationHint: 'Gauge / progress bar',
    alerts: 'Alerta si la efectividad de cobro cae por debajo del 98%.',
    watchBand: 1,
    aggregation: 'mean',
    fields: [
      { key: 'montoFacturado', label: 'Monto facturado (RD$)', type: 'number', required: true, min: 0 },
      { key: 'montoCobrado', label: 'Monto cobrado (RD$)', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const facturado = num(inputs.montoFacturado)
      const cobrado = num(inputs.montoCobrado)
      const warnings: string[] = []
      if (Number.isFinite(cobrado) && Number.isFinite(facturado) && cobrado > facturado) {
        warnings.push('El monto cobrado no puede superar el monto facturado.')
      }
      const value = facturado > 0 ? (cobrado / facturado) * 100 : NaN
      return { value, secondary: { saldoPendiente: facturado - cobrado } }
    },
  },

  // ---------------------------------------------------------------- CLIENTES
  {
    code: 'CL-01',
    perspective: 'CLI',
    objective: 'Reducir las restricciones y congestiones de la red de transmisión',
    indicator: 'Horas-año de congestión en enlaces críticos del SENI / Energía no suministrada por restricción de red (MWh)',
    description:
      'Mide la reducción combinada de horas de congestión y energía no suministrada por restricción de red, frente al año base.',
    unit: '% reducción',
    target: 15,
    targetLabel: 'Reducción del 15% en 5 años',
    targetOperator: '>=',
    frequency: 'trimestral',
    favorableDirection: 'higher',
    weight: 1,
    formulaText:
      '% reducción = promedio( (horas base − horas actuales)/horas base , (ENS base − ENS actual)/ENS base ) × 100',
    formulaIsAssumption: true,
    source: 'Gerencia de Operaciones — Centro de Control de Energía',
    visualizationHint: 'Gráfico temporal con ambos componentes',
    alerts: 'Alerta si el avance hacia la meta de reducción del 15% en 5 años se estanca o retrocede.',
    watchBand: 3,
    aggregation: 'mean',
    fields: [
      { key: 'enlaceCritico', label: 'Enlace crítico', type: 'text', required: true, placeholder: 'Ej. SVLL-EDESUR 138kV' },
      { key: 'horasCongestion', label: 'Horas de congestión (trimestre)', type: 'number', required: true, min: 0 },
      { key: 'ensMWh', label: 'Energía no suministrada por restricción (MWh)', type: 'number', required: true, min: 0 },
      { key: 'horasCongestionBase', label: 'Horas de congestión — año base', type: 'number', required: true, min: 0 },
      { key: 'ensMWhBase', label: 'ENS por restricción — año base (MWh)', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const horas = num(inputs.horasCongestion)
      const ens = num(inputs.ensMWh)
      const horasBase = num(inputs.horasCongestionBase)
      const ensBase = num(inputs.ensMWhBase)
      const redHoras = horasBase > 0 ? ((horasBase - horas) / horasBase) * 100 : NaN
      const redEns = ensBase > 0 ? ((ensBase - ens) / ensBase) * 100 : NaN
      const parts = [redHoras, redEns].filter((v) => Number.isFinite(v))
      const value = parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : NaN
      return { value, secondary: { horasCongestion: horas, ensMWh: ens } }
    },
  },
  {
    code: 'CL-02',
    perspective: 'CLI',
    objective: 'Aumentar la satisfacción de los agentes del MEM',
    indicator: 'Índice de satisfacción de agentes (encuesta anual)',
    description: 'Mide el porcentaje de agentes del MEM satisfechos con el desempeño del OC, según encuesta anual.',
    unit: '%',
    target: 85,
    targetLabel: '≥ 85% de satisfacción',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Índice de satisfacción = Agentes satisfechos / Respuestas recibidas × 100',
    formulaIsAssumption: true,
    source: 'Gerencia General — Encuesta anual de satisfacción de agentes',
    visualizationHint: 'Gauge',
    alerts: 'Alerta si el índice cae por debajo de 82%.',
    watchBand: 3,
    aggregation: 'mean',
    fields: [
      { key: 'agentesEncuestados', label: 'Agentes encuestados', type: 'number', required: true, min: 0 },
      { key: 'respuestasRecibidas', label: 'Respuestas recibidas', type: 'number', required: true, min: 0 },
      { key: 'agentesSatisfechos', label: 'Agentes satisfechos', type: 'number', required: true, min: 0 },
      { key: 'comentarios', label: 'Comentarios relevantes', type: 'textarea' },
    ],
    compute: (inputs) => {
      const respuestas = num(inputs.respuestasRecibidas)
      const satisfechos = num(inputs.agentesSatisfechos)
      const warnings: string[] = []
      if (Number.isFinite(satisfechos) && Number.isFinite(respuestas) && satisfechos > respuestas) {
        warnings.push('Los agentes satisfechos no pueden superar las respuestas recibidas.')
      }
      const value = respuestas > 0 ? (satisfechos / respuestas) * 100 : NaN
      return { value, warnings }
    },
  },
  {
    code: 'CL-03',
    perspective: 'CLI',
    objective: 'Agilizar la incorporación de nuevos proyectos al SENI',
    indicator: 'Tiempo promedio del proceso de interconexión (estudio de conexión a puesta en servicio)',
    description: 'Mide la reducción del tiempo del proceso de interconexión frente a la línea base histórica.',
    unit: '% reducción',
    target: 20,
    targetLabel: 'Reducción del 20% respecto a la línea base',
    targetOperator: '>=',
    frequency: 'semestral',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: '% reducción = (Duración línea base − Duración real) / Duración línea base × 100',
    formulaIsAssumption: true,
    source: 'Gerencia de Operaciones — Interconexión de nuevos proyectos',
    visualizationHint: 'Barras comparativas (real vs. línea base)',
    alerts: 'Alerta si la duración real se acerca o supera la línea base.',
    watchBand: 5,
    aggregation: 'mean',
    primaryDateField: 'fechaPuestaServicio',
    fields: [
      { key: 'proyecto', label: 'Proyecto', type: 'text', required: true },
      {
        key: 'tecnologia',
        label: 'Tecnología',
        type: 'select',
        options: [
          { value: 'solar', label: 'Solar fotovoltaica' },
          { value: 'eolica', label: 'Eólica' },
          { value: 'termica', label: 'Térmica' },
          { value: 'bess', label: 'Almacenamiento (BESS)' },
          { value: 'hidro', label: 'Hidroeléctrica' },
        ],
      },
      { key: 'capacidadMW', label: 'Capacidad (MW)', type: 'number', min: 0 },
      { key: 'fechaInicioEstudio', label: 'Fecha de inicio del estudio', type: 'date', required: true },
      { key: 'fechaPuestaServicio', label: 'Fecha de puesta en servicio', type: 'date', required: true },
      { key: 'duracionLineaBase', label: 'Duración de línea base (días)', type: 'number', required: true, min: 1 },
    ],
    compute: (inputs) => {
      const inicio = String(inputs.fechaInicioEstudio ?? '')
      const fin = String(inputs.fechaPuestaServicio ?? '')
      const lineaBase = num(inputs.duracionLineaBase)
      const duracionReal = inicio && fin ? calendarDaysBetween(inicio, fin) : NaN
      const value = lineaBase > 0 && Number.isFinite(duracionReal) ? ((lineaBase - duracionReal) / lineaBase) * 100 : NaN
      return { value, secondary: { duracionReal, duracionLineaBase: lineaBase } }
    },
  },

  // ---------------------------------------------------------- PROCESOS INTERNOS
  {
    code: 'PI-01',
    perspective: 'PRO',
    objective: 'Optimizar los tiempos de programación y despacho del SENI',
    indicator: 'Tiempo de elaboración de la programación diaria/semanal (horas)',
    description: 'Mide el porcentaje de programaciones diarias/semanales elaboradas dentro del plazo interno establecido.',
    unit: '% cumplimiento',
    target: 100,
    targetLabel: '100% dentro del plazo interno establecido',
    targetOperator: '>=',
    frequency: 'diaria_semanal',
    favorableDirection: 'higher',
    weight: 1,
    formulaText:
      'Por registro: Cumple = 100 si Tiempo utilizado ≤ Plazo máximo establecido, de lo contrario 0. El KPI mensual promedia los registros del período.',
    formulaIsAssumption: true,
    source: 'Gerencia de Operaciones — Análisis Operativo y Programación del SENI',
    visualizationHint: 'Barras de cumplimiento por período + detalle diario',
    alerts: 'Alerta ante cualquier incumplimiento individual y ante un % mensual por debajo de 98%.',
    watchBand: 5,
    aggregation: 'mean',
    primaryDateField: 'fecha',
    fields: [
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      {
        key: 'tipoProgramacion',
        label: 'Tipo de programación',
        type: 'select',
        required: true,
        options: [
          { value: 'diaria', label: 'Diaria' },
          { value: 'semanal', label: 'Semanal' },
        ],
      },
      { key: 'horaInicio', label: 'Hora de inicio', type: 'text', placeholder: 'HH:MM' },
      { key: 'horaFin', label: 'Hora de finalización', type: 'text', placeholder: 'HH:MM' },
      { key: 'tiempoUtilizadoHoras', label: 'Tiempo utilizado (horas)', type: 'number', required: true, min: 0 },
      { key: 'plazoMaximoHoras', label: 'Plazo máximo establecido (horas)', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const usado = num(inputs.tiempoUtilizadoHoras)
      const plazo = num(inputs.plazoMaximoHoras)
      if (!Number.isFinite(usado) || !Number.isFinite(plazo)) return { value: NaN }
      const value = usado <= plazo ? 100 : 0
      return { value, secondary: { tiempoUtilizadoHoras: usado, plazoMaximoHoras: plazo } }
    },
  },
  {
    code: 'PI-02',
    perspective: 'PRO',
    objective: 'Mejorar el procesamiento de la información de medición comercial',
    indicator: '% de puntos de medición telemedidos y validados automáticamente',
    description: 'Mide la proporción de puntos de medición comercial validados automáticamente sin intervención manual.',
    unit: '%',
    target: 95,
    targetLabel: '≥ 95%',
    targetOperator: '>=',
    frequency: 'mensual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Puntos validados automáticamente / Total de puntos de medición × 100',
    formulaIsAssumption: false,
    source: 'Sistema de Medición Comercial',
    visualizationHint: 'Línea de tendencia mensual + donut de composición',
    alerts: 'Alerta si el % de validación automática cae por debajo de 93%.',
    watchBand: 2,
    aggregation: 'mean',
    fields: [
      { key: 'totalPuntos', label: 'Total de puntos de medición', type: 'number', required: true, min: 0 },
      { key: 'puntosTelemedidos', label: 'Puntos telemedidos', type: 'number', min: 0 },
      { key: 'puntosValidadosAuto', label: 'Puntos validados automáticamente', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const total = num(inputs.totalPuntos)
      const validados = num(inputs.puntosValidadosAuto)
      const value = total > 0 ? (validados / total) * 100 : NaN
      return { value }
    },
  },
  {
    code: 'PI-03',
    perspective: 'PRO',
    objective: 'Fortalecer el análisis de estudios de casos de conexión e interconexión',
    indicator: 'Número de estudios de interconexión completados dentro del plazo normativo / total de estudios',
    description: 'Mide el porcentaje de estudios de interconexión completados dentro del plazo normativo.',
    unit: '%',
    target: 90,
    targetLabel: '≥ 90%',
    targetOperator: '>=',
    frequency: 'trimestral',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Cumplimiento = Estudios dentro del plazo / Total de estudios × 100',
    formulaIsAssumption: true,
    source: 'Gerencia de Operaciones — Estudios de interconexión',
    visualizationHint: 'Barra de cumplimiento trimestral',
    alerts: 'Alerta si el cumplimiento cae por debajo de 87%.',
    watchBand: 3,
    aggregation: 'mean',
    fields: [
      { key: 'totalEstudios', label: 'Total de estudios', type: 'number', required: true, min: 0 },
      { key: 'estudiosDentroPlazo', label: 'Estudios dentro del plazo', type: 'number', required: true, min: 0 },
      { key: 'estudiosFueraPlazo', label: 'Estudios fuera del plazo', type: 'number', min: 0 },
    ],
    compute: (inputs) => {
      const total = num(inputs.totalEstudios)
      const enPlazo = num(inputs.estudiosDentroPlazo)
      const value = total > 0 ? (enPlazo / total) * 100 : NaN
      return { value }
    },
  },
  {
    code: 'PI-04',
    perspective: 'PRO',
    objective: 'Digitalizar y estandarizar los procesos de coordinación',
    indicator: '% de procesos críticos documentados y auditados bajo el Sistema de Gestión Integrado',
    description: 'Mide el avance de digitalización, documentación y auditoría de los procesos críticos de coordinación.',
    unit: '%',
    target: 100,
    targetLabel: '100% en tres años',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Procesos completamente conformes (documentados y auditados) / Total de procesos críticos × 100',
    formulaIsAssumption: true,
    source: 'Sistema de Gestión Integrado',
    visualizationHint: 'Donut de avance',
    alerts: 'Alerta si el avance anual no está en línea con la trayectoria hacia el 100% en 3 años.',
    watchBand: 10,
    aggregation: 'mean',
    fields: [
      { key: 'totalProcesos', label: 'Total de procesos críticos', type: 'number', required: true, min: 0 },
      { key: 'procesosDocumentados', label: 'Procesos documentados', type: 'number', min: 0 },
      { key: 'procesosAuditados', label: 'Procesos auditados', type: 'number', min: 0 },
      { key: 'procesosConformes', label: 'Procesos completamente conformes', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const total = num(inputs.totalProcesos)
      const conformes = num(inputs.procesosConformes)
      const value = total > 0 ? (conformes / total) * 100 : NaN
      return { value }
    },
  },
  {
    code: 'PI-05',
    perspective: 'PRO',
    objective: 'Mejorar la disponibilidad del sistema SCADA/EMS',
    indicator: 'Disponibilidad del sistema de información en tiempo real (%)',
    description: 'Mide la disponibilidad del sistema SCADA/EMS que soporta el despacho y la supervisión del SENI.',
    unit: '%',
    target: 99.5,
    targetLabel: '≥ 99.5%',
    targetOperator: '>=',
    frequency: 'mensual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Disponibilidad (%) = Horas disponibles / Horas totales × 100, donde Horas disponibles = Horas totales − indisponibilidad programada − indisponibilidad no programada',
    formulaIsAssumption: true,
    source: 'Centro de Control de Energía — SCADA/EMS',
    visualizationHint: 'Línea de tendencia mensual con foco visual destacado',
    alerts: 'Alerta crítica si la disponibilidad cae por debajo de 99.3%; distinguir causa programada vs. no programada.',
    watchBand: 0.2,
    aggregation: 'mean',
    fields: [
      { key: 'horasTotales', label: 'Horas totales del período', type: 'number', required: true, min: 0 },
      { key: 'indispProgramada', label: 'Horas de indisponibilidad programada', type: 'number', required: true, min: 0 },
      { key: 'indispNoProgramada', label: 'Horas de indisponibilidad no programada', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const totales = num(inputs.horasTotales)
      const prog = num(inputs.indispProgramada)
      const noProg = num(inputs.indispNoProgramada)
      const warnings: string[] = []
      const disponibles = totales - prog - noProg
      if (disponibles < 0) warnings.push('La indisponibilidad total supera las horas totales del período.')
      const value = totales > 0 ? (disponibles / totales) * 100 : NaN
      return { value, secondary: { horasDisponibles: disponibles, indispProgramada: prog, indispNoProgramada: noProg }, warnings }
    },
  },

  // ------------------------------------------------------- APRENDIZAJE Y CRECIMIENTO
  {
    code: 'AC-01',
    perspective: 'APR',
    objective: 'Desarrollar competencias en gemelos digitales aplicados a la operación del SENI',
    indicator: 'Horas de capacitación especializada por colaborador técnico / año',
    description: 'Mide el promedio anual de horas de capacitación especializada acumuladas por colaborador técnico.',
    unit: 'horas/año',
    target: 40,
    targetLabel: '≥ 40 horas/año',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Promedio( Σ horas de capacitación por colaborador en el año )',
    formulaIsAssumption: true,
    source: 'Recursos Humanos — Programa de capacitación técnica',
    visualizationHint: 'Barras por colaborador + promedio institucional',
    alerts: 'Alerta si el promedio institucional cae por debajo de 36 horas/año.',
    watchBand: 4,
    aggregation: 'group_avg_sum',
    groupByField: 'colaborador',
    primaryDateField: 'fecha',
    fields: [
      { key: 'colaborador', label: 'Colaborador', type: 'text', required: true },
      { key: 'departamento', label: 'Departamento', type: 'text' },
      { key: 'curso', label: 'Curso', type: 'text', required: true },
      { key: 'tema', label: 'Tema', type: 'text' },
      { key: 'fecha', label: 'Fecha', type: 'date', required: true },
      { key: 'numeroHoras', label: 'Número de horas', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const value = num(inputs.numeroHoras)
      return { value }
    },
  },
  {
    code: 'AC-02',
    perspective: 'APR',
    objective: 'Incorporar inteligencia artificial aplicada al despacho y pronóstico de demanda/generación variable',
    indicator: 'Número de casos de uso de IA implementados en programación y análisis operativo',
    description: 'Cuenta los casos de uso de inteligencia artificial efectivamente implementados durante el año.',
    unit: 'casos/año',
    target: 2,
    targetLabel: 'Al menos 2 nuevos casos de uso por año',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Conteo de casos de uso con estado "Implementado" durante el año',
    formulaIsAssumption: true,
    source: 'Gerencia de Operaciones — Innovación y Analítica',
    visualizationHint: 'Contador + línea de tiempo de implementaciones',
    alerts: 'Alerta si al cierre del año se han implementado menos de 2 casos de uso.',
    watchBand: 1,
    aggregation: 'sum',
    primaryDateField: 'fechaImplementacion',
    fields: [
      { key: 'nombreCaso', label: 'Nombre del caso de uso', type: 'text', required: true },
      { key: 'area', label: 'Área', type: 'text' },
      { key: 'descripcion', label: 'Descripción', type: 'textarea' },
      { key: 'fechaImplementacion', label: 'Fecha de implementación', type: 'date', required: true },
      {
        key: 'estado',
        label: 'Estado',
        type: 'select',
        required: true,
        options: [
          { value: 'implementado', label: 'Implementado' },
          { value: 'piloto', label: 'En piloto' },
          { value: 'progreso', label: 'En progreso' },
        ],
      },
      { key: 'beneficioObtenido', label: 'Beneficio obtenido', type: 'text' },
    ],
    compute: (inputs) => {
      const value = inputs.estado === 'implementado' ? 1 : 0
      return { value }
    },
  },
  {
    code: 'AC-03',
    perspective: 'APR',
    objective: 'Fortalecer la cultura de gestión de riesgos y mejora continua',
    indicator: '% de personal certificado en el Sistema de Gestión Integrado',
    description: 'Mide el avance de certificación del personal clave en el Sistema de Gestión Integrado.',
    unit: '%',
    target: 100,
    targetLabel: '100% del personal clave en dos años',
    targetOperator: '>=',
    frequency: 'anual',
    favorableDirection: 'higher',
    weight: 1,
    formulaText: 'Personal certificado / Personal clave × 100',
    formulaIsAssumption: false,
    source: 'Recursos Humanos — Sistema de Gestión Integrado',
    visualizationHint: 'Donut de avance',
    alerts: 'Alerta si el avance anual no está en línea con la meta de 100% en 2 años.',
    watchBand: 10,
    aggregation: 'mean',
    fields: [
      { key: 'totalPersonalClave', label: 'Total de personal clave', type: 'number', required: true, min: 0 },
      { key: 'personalCertificado', label: 'Personal certificado', type: 'number', required: true, min: 0 },
    ],
    compute: (inputs) => {
      const total = num(inputs.totalPersonalClave)
      const certificado = num(inputs.personalCertificado)
      const value = total > 0 ? (certificado / total) * 100 : NaN
      return { value, secondary: { personalPendiente: total - certificado } }
    },
  },
  {
    code: 'AC-04',
    perspective: 'APR',
    objective: 'Mejorar el clima organizacional y la retención de talento técnico especializado',
    indicator: 'Índice de clima laboral / tasa de rotación de personal técnico crítico',
    description: 'Mide la rotación anual del personal técnico crítico; complementa con el índice de clima laboral cuando existe encuesta.',
    unit: '% rotación',
    target: 5,
    targetLabel: 'Rotación ≤ 5% anual',
    targetOperator: '<=',
    frequency: 'anual',
    favorableDirection: 'lower',
    weight: 1,
    formulaText: 'Rotación (%) = Salidas de personal técnico crítico / Promedio(Personal al inicio, Personal al final) × 100',
    formulaIsAssumption: true,
    source: 'Recursos Humanos — Clima organizacional',
    visualizationHint: 'Barra + gauge de rotación; índice de clima laboral como indicador complementario',
    alerts: 'Alerta si la rotación supera el 5% anual.',
    watchBand: 1,
    aggregation: 'mean',
    fields: [
      { key: 'personalInicio', label: 'Personal técnico al inicio del año', type: 'number', required: true, min: 0 },
      { key: 'personalFin', label: 'Personal técnico al final del año', type: 'number', required: true, min: 0 },
      { key: 'salidas', label: 'Salidas de personal técnico crítico', type: 'number', required: true, min: 0 },
      { key: 'contrataciones', label: 'Contrataciones', type: 'number', min: 0 },
      { key: 'indiceClimaLaboral', label: 'Índice de clima laboral (%)', type: 'number', min: 0, max: 100 },
    ],
    compute: (inputs) => {
      const inicio = num(inputs.personalInicio)
      const fin = num(inputs.personalFin)
      const salidas = num(inputs.salidas)
      const promedio = (inicio + fin) / 2
      const value = promedio > 0 ? (salidas / promedio) * 100 : NaN
      const clima = num(inputs.indiceClimaLaboral)
      return { value, secondary: Number.isFinite(clima) ? { indiceClimaLaboral: clima } : undefined }
    },
  },
]

export const KPI_BY_CODE: Record<string, KpiDefinition> = Object.fromEntries(
  KPI_DEFINITIONS.map((k) => [k.code, k]),
)

export function kpisByPerspective(perspective: string): KpiDefinition[] {
  return KPI_DEFINITIONS.filter((k) => k.perspective === perspective)
}
