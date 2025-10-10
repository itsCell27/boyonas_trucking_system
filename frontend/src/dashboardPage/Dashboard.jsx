import '../index.css'
import SummaryCards from './SummaryCards'
import ServiceOperations from './ServiceOperations';
import RecentActivity from './RecentActivity';
import FleetOverview from './FleetOverview';
import { Truck, Package, Users, DollarSign } from "lucide-react"

// Card data where you can add more cards if needed
const dashboardCards = [
    { title: "Active Trucks", value: 8, iconColor: "#002445", icon: Truck, description: "out of 10 total" },
    { title: "Employees", value: 24, iconColor: "#f14d4c", icon: Users, description: "drivers & helpers" },
    { title: "Today's Deliveries", value: 12, iconColor: "#006757", icon: Package, description: "3 pending" },
    { title: "Monthly Revenue", value: 485, iconColor: "#677d00", icon: DollarSign, description: "+12% from last month" }
]

function Dashboard() {
    return (
        <div className="flex flex-col w-full">
            <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
            {/* Dashboard content goes here */}
            <SummaryCards cards={dashboardCards} />
            <ServiceOperations />
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RecentActivity />
                <FleetOverview />
            </section>
        </div>
    )
}

export default Dashboard;