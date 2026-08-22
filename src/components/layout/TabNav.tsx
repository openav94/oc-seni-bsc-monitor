import { ClipboardList, Database, LayoutDashboard, FileBarChart } from 'lucide-react'
import { useNavigation, type TabId } from '../../context/NavigationContext'

const TABS: { id: TabId; label: string; icon: typeof ClipboardList }[] = [
  { id: 'entrada', label: 'Entrada de Datos', icon: ClipboardList },
  { id: 'basedatos', label: 'Base de Datos', icon: Database },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'resumen', label: 'Resumen', icon: FileBarChart },
]

export function TabNav() {
  const { activeTab, setActiveTab, clearDatabaseFilter } = useNavigation()

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] gap-1 overflow-x-auto px-6">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== 'basedatos') clearDatabaseFilter()
                setActiveTab(tab.id)
              }}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-navy-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
