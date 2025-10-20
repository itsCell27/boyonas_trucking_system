import '../../index.css'
import StatusCards from '../../components/StatusCards';
import ServiceOperations from './ServiceOperations';
import RecentActivity from './RecentActivity';
import FleetOverview from './FleetOverview';
import { Truck, Package, Users, DollarSign } from "lucide-react"

// Card data where you can add more cards if needed
const dashboardCards = [
    {
      title: "Active Trucks",
      value: "8",
      subtitle: "out of 10 total",
      icon: Truck,
      color: "text-chart-1",
    },
    {
      title: "Employees",
      value: "24",
      subtitle: "drivers & helpers",
      icon: Users,
      color: "text-chart-2",
    },
    {
      title: "Today's Deliveries",
      value: "12",
      subtitle: "3 pending",
      icon: Package,
      color: "text-chart-3",
    },
    {
      title: "Monthly Revenue",
      value: "₱485K",
      subtitle: "+12% from last month",
      icon: DollarSign,
      color: "text-chart-4",
    },
]

function Dashboard() {
    return (
        <div className="flex flex-col w-full">
            <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
            {/* Dashboard content goes here */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatusCards cards={dashboardCards} />
            </section>
            <ServiceOperations />
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RecentActivity />
                <FleetOverview />
            </section>
        </div>
    )
}

export default Dashboard;