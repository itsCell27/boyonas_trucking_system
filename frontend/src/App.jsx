import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'

// menu
import Sidebar from './Sidebar'

// main pages
import Dashboard from './mainPages/dashboardPage/Dashboard'
import Services from './mainPages/servicesPage/Services'
import Fleet from './mainPages/fleetManagementPage/FleetManagement'
import Employees from './mainPages/employeeManagementPage/EmployeeManagement'
import Operations from './mainPages/operationsPage/Operations'
import SOAGeneration from './mainPages/soaGenerationPage/SOAGeneration'
import Settings from './mainPages/settingsPage/Settings'

// sub pages
import ManageLipatBahay from './subPages/manageLipatBahayPage/ManageLipatBahay'
import ManagePartnership from './subPages/managePartnershipPage/ManagePartnership'


function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/fleet-management" element={<Fleet />} />
            <Route path="/employee-management" element={<Employees />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/soa-generation" element={<SOAGeneration />} />
            <Route path="/settings" element={<Settings />} />

            {/* Sub Pages */}
            <Route path="/partnership" element={<ManagePartnership />} />
            <Route path="/lipat-bahay" element={<ManageLipatBahay />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
