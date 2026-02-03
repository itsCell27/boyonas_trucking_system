import { Routes, Route, Navigate } from "react-router-dom"
import DriverDashboard from "./Driver"
import DriverSettings from "./DriverSettings"

export default function DriverPortal() {
  return (
    <Routes>
      <Route index element={<DriverDashboard />} />
      <Route path="settings" element={<DriverSettings />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/driver" />} />
    </Routes>
  )
}
