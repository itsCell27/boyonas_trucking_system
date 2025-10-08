import '../index.css'
import SummaryCards from './SummaryCards'
import ServiceOperations from './ServiceOperations';
import RecentActivity from './RecentActivity';

function Dashboard() {
    return (
        <div className="flex flex-col w-full">
            <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>
            {/* Dashboard content goes here */}
            <SummaryCards />
            <ServiceOperations />
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <RecentActivity />
            </section>
        </div>
    )
}

export default Dashboard;