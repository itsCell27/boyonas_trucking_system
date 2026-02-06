import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import { Toaster } from "sonner";

// menu
import Sidebar from '@/pages/Sidebar'

// main pages
import Dashboard from '@/mainPages/dashboardPage/Dashboard'
import Services from '@/mainPages/servicesPage/Services'
import Fleet from '@/mainPages/fleetManagementPage/FleetManagement'

import Employees from '@/mainPages/employeeManagementPage/EmployeeManagement'
// sub page of Employees
import RehireEmployees from "./mainPages/employeeManagementPage/RehireEmployees";

import Operations from '@/mainPages/operationsPage/Operations'

import SOADashboard from '@/mainPages/soaGenerationPage/SOADashboard'
// sub pages of SOA
import SOAGeneration from "@/mainPages/soaGenerationPage/SOAGeneration";

import Settings from '@/mainPages/settingsPage/Settings'


// sub pages
import ManageLipatBahay from '@/subPages/manageLipatBahayPage/ManageLipatBahay'
import CreateLipatBahayBooking from "@/subPages/manageLipatBahayPage/CreateLipatBahay";
import AssignmentPageLipatBahay from "@/subPages/manageLipatBahayPage/AssignmentPageLipatBahay";

import ManagePartnership from '@/subPages/managePartnershipPage/ManagePartnership'
import CreatePartnershipBooking from '@/subPages/managePartnershipPage/CreateDelivery'
import AssignmentPage from '@/subPages/managePartnershipPage/AssignmentPage'


function App() {
  return (
      <div className="flex min-h-screen bg-background relative">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            {/* Main Pages - relative paths since parent route is /app/* */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="fleet-management" element={<Fleet />} />

            <Route path="employee-management" element={<Employees />} />
            {/* Employee Management Sub Page */}
            <Route path="employee-management/rehire-employees" element={<RehireEmployees />} />

            <Route path="operations" element={<Operations />} />

            <Route path="soa-generation" element={<SOADashboard />} />
            {/* SOA Sub Page */}
            <Route path="/soa-generation/generate" element={<SOAGeneration />} />

            <Route path="settings" element={<Settings />} />

            {/* Sub Pages */}
            <Route path="partnership" element={<ManagePartnership />} />
            {/* Partnership Sub Page */}
            <Route path="/partnership/create" element={<CreatePartnershipBooking />} />
            <Route path="assignment/:booking_id" element={<AssignmentPage />} />


            <Route path="lipat-bahay" element={<ManageLipatBahay />} />
            {/* LipatBahay Sub Page */}
            <Route path="/lipat-bahay/create" element={<CreateLipatBahayBooking />} />
            <Route path="assignment_lipatbahay/:booking_id" element={<AssignmentPageLipatBahay />} />

          </Routes >
          <Toaster richColors position="top-center"/>
        </main>
      </div>
  )
}

export default App
