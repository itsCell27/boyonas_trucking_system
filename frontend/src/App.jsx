import { useState } from "react"
import Sidebar from './Sidebar'
import Dashboard from './dashboardPage/Dashboard'
import Services from './servicesPage/Services'
import Fleet from './fleetManagementPage/FleetManagement'
import Employees from './employeeManagementPage/EmployeeManagement'
import Operations from './operationsPage/Operations'
import SOAGeneration from './soaGenerationPage/SOAGeneration'
import Settings from './settingsPage/Settings'
import './App.css'

function App() {

  const [selected, setSelected] = useState("Dashboard");

  function renderPage() {
    switch (selected) {
      case "Dashboard":
        return <Dashboard />;
        break;
      case "Services":
        return <Services />;
        break;
      case "Fleet Management":
        return <Fleet />;
        break;
      case "Employee Management":
        return <Employees />;
        break;
      case "Operations":
        return <Operations />;
        break;
      case "SOA Generation":
        return <SOAGeneration />;
        break;
      case "Settings":
        return <Settings />;
        break;
      default:
        return <Dashboard />;
    }
  }
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar setSelected={setSelected} menu={selected}/>
      <main className="flex-1 p-6">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
