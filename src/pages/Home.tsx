const UASD_LOGO = `${import.meta.env.BASE_URL}logos/logo_uasd.webp`
const FACULTAD_LOGO = `${import.meta.env.BASE_URL}logos/logo_facultad_ingenieria.png`

const MAESTRANTES = ['Héctor de la Rosa', 'Carlos Castillo', 'Oscar Peña']

export function Home() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-panel sm:p-14">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <img src={UASD_LOGO} alt="Escudo Universidad Autónoma de Santo Domingo" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
          <div className="flex-1">
            <p className="font-serif text-center font-bold leading-tight text-navy-900 sm:text-2xl">
              Universidad Autónoma de Santo Domingo
            </p>
            <p className="mt-1 text-center font-semibold text-brand-700 sm:text-base">
              Facultad de Ingeniería y Arquitectura Ing. Amín Abel Hasbún
            </p>
            <p className="text-center font-semibold text-brand-700 sm:text-base">División de Postgrado y Educación Permanente</p>
            <p className="mt-1 text-center italic text-slate-500">Maestría en Mercados Eléctricos 2025-2027</p>
          </div>
          <img src={FACULTAD_LOGO} alt="Escudo Facultad de Ingeniería y Arquitectura" className="h-20 w-20 object-contain sm:h-24 sm:w-24" />
        </div>

        <div className="my-10 h-px bg-slate-200" />

        <div className="text-center">
          <h1 className="text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
            BALANCE SCORECARD - PLAN ESTRATÉGICO INTEGRAL
          </h1>
          <h2 className="mt-4 text-lg font-bold text-brand-700 sm:text-xl">
            ORGANISMO COORDINADOR DEL SISTEMA ELÉCTRICO NACIONAL INTERCONECTADO (OC-SENI)
          </h2>
          <p className="mt-6 text-base italic text-slate-500">Horizonte estratégico 2026 – 2035</p>
        </div>

        <div className="mt-10 space-y-2 text-center text-sm text-slate-700 sm:text-base">
          <p>
            <span className="font-bold text-navy-900">Asignatura:</span> Gestión de Indicadores en un Mercado
            Competitivo (IEM-8640)
          </p>
          <p>
            <span className="font-bold text-navy-900">Grupo:</span> No. 6
          </p>
          <p className="font-bold text-navy-900">Maestrantes:</p>
          <div>
            {MAESTRANTES.map((name) => (
              <p key={name}>{name}</p>
            ))}
          </div>
          <p>
            <span className="font-bold text-navy-900">Docente:</span> Ing. Miguel Rosario. MSc.
          </p>
          <p className="pt-2 text-slate-500">Santo Domingo, República Dominicana — 2026</p>
        </div>

        <div className="mt-10 flex justify-end">
          <span className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Trabajo Final
          </span>
        </div>
      </div>
    </div>
  )
}
