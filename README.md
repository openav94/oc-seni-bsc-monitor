# OC-SENI · Sistema de Gestión Estratégica

Sistema de seguimiento del Balanced Scorecard del Organismo Coordinador del Sistema
Eléctrico Nacional Interconectado (OC-SENI), basado en la sección 4.2 del Plan
Estratégico Integral OC-SENI 2026-2035.

Aplicación web (React + TypeScript + Tailwind CSS) para registrar, almacenar,
calcular, visualizar y analizar los 16 KPI del Plan Estratégico, organizados en
las cuatro perspectivas del BSC: Comercial, Clientes, Procesos Internos, y
Aprendizaje y Crecimiento.

> **Nota:** los datos de desempeño mostrados en el prototipo son ficticios y se
> generan automáticamente al primer uso, exclusivamente para fines de
> demostración. Las metas y frecuencias de los 16 KPI corresponden al Plan
> Estratégico OC-SENI 2026-2035.

## Demo en vivo

Publicado automáticamente en GitHub Pages en cada push a `main`:
`https://openav94.github.io/oc-seni-bsc-monitor/`

## Ejecutar localmente

Requiere [Node.js](https://nodejs.org/) 20 o superior.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Build de producción

```bash
npm run build   # genera dist/
npm run preview # sirve dist/ localmente para verificar el build
```

## Estructura del proyecto

```
src/
├── components/       # dashboard/, forms/, charts/, database/, layout/, shared/
├── pages/             # DataEntry, Database, Dashboard, Summary
├── data/              # kpiDefinitions.ts (config central de los 16 KPI), demoData.ts
├── services/          # calculationService, insightsService, storageService
├── context/           # DataContext (registros), NavigationContext (navegación)
├── types/              # modelo de datos (KpiDefinition, KpiRecord, ...)
└── utils/              # fechas, validación, formato, exportación CSV
```

El motor de cálculo (`services/calculationService.ts`) está desacoplado de la
interfaz: cada KPI define su propia fórmula en `data/kpiDefinitions.ts`, documentada
como oficial o como "fórmula propuesta para fines de implementación del sistema"
cuando el Plan Estratégico no especifica el cálculo exacto.

Persistencia sobre `localStorage` mediante una interfaz (`RecordStore`) pensada
para sustituirse por una API REST, PostgreSQL, Supabase o Firebase sin cambios
en el resto de la aplicación.
