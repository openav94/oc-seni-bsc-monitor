import { DataProvider } from './context/DataContext'
import { NavigationProvider, useNavigation } from './context/NavigationContext'
import { Header } from './components/layout/Header'
import { TabNav } from './components/layout/TabNav'
import { DataEntry } from './pages/DataEntry'
import { Database } from './pages/Database'
import { Dashboard } from './pages/Dashboard'
import { Summary } from './pages/Summary'

function ActivePage() {
  const { activeTab } = useNavigation()
  switch (activeTab) {
    case 'entrada':
      return <DataEntry />
    case 'basedatos':
      return <Database />
    case 'dashboard':
      return <Dashboard />
    case 'resumen':
      return <Summary />
    default:
      return null
  }
}

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <TabNav />
      <main>
        <ActivePage />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <DataProvider>
      <NavigationProvider>
        <AppShell />
      </NavigationProvider>
    </DataProvider>
  )
}
