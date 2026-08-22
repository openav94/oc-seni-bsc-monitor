import type { PerspectiveDefinition, PerspectiveCode } from '../types/kpi'

export const PERSPECTIVES: Record<PerspectiveCode, PerspectiveDefinition> = {
  COM: {
    code: 'COM',
    name: 'Comercial',
    shortName: 'Comercial',
    description:
      'Precisión, oportunidad y sostenibilidad financiera de los cálculos y transacciones económicas del mercado mayorista.',
    order: 4,
  },
  CLI: {
    code: 'CLI',
    name: 'Clientes',
    shortName: 'Clientes',
    description: 'Calidad de servicio, satisfacción y agilidad percibida por agentes del MEM y usuarios del SENI.',
    order: 3,
  },
  PRO: {
    code: 'PRO',
    name: 'Procesos Internos',
    shortName: 'Procesos',
    description: 'Eficiencia, digitalización y confiabilidad de los procesos de coordinación técnica y comercial.',
    order: 2,
  },
  APR: {
    code: 'APR',
    name: 'Aprendizaje y Crecimiento',
    shortName: 'Aprendizaje',
    description: 'Capacidades técnicas, tecnológicas y organizacionales que habilitan al resto de las perspectivas.',
    order: 1,
  },
}

/** Orden de la cadena causal del mapa estratégico (sección 4.1): de la base al resultado. */
export const PERSPECTIVE_ORDER: PerspectiveCode[] = ['APR', 'PRO', 'CLI', 'COM']
