import '../index.css'
import SummaryCards from './SummaryCards'
import ServiceOperations from './ServiceOperations';

function Dashboard() {
    return (
        <div className="flex flex-col w-full">
            <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
            {/* Dashboard content goes here */}
            <SummaryCards />
            <ServiceOperations />
        </div>
    )
}

export default Dashboard;