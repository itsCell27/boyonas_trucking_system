import '../../index.css'
import SummaryCards from '../../components/SummaryCards'
import { Truck, User, Clock, ArrowRight, Phone, Package } from 'lucide-react'

const operationsSummaryCards = [
    {
        title: "Total Deliveries Today",
        value: 24,
        iconColor: "#002445",
        icon: Package,
        description: "+12% from yesterday"
    },
    {
        title: "Total Trucks Deployed",
        value: "8/10",
        iconColor: "#155dfc",
        icon: Truck,
        description: "80% from yesterday"
    },
    {
        title: "Completed Deliveries Today",
        value: 12,
        iconColor: "#00a63e",
        icon: User,
        description: "+2 from yesterday"
    },
    {
        title: "Pending Deliveries",
        value: "2",
        iconColor: "#f14d4c",
        icon: Clock,
        description: "-1 from yesterday"
    },
]

const liveTrackingData = [
    {
        id: "DEL-001",
        customer: "Flash Express Hub",
        serviceType: "Partnership",
        status: "in transit",
        origin: "Manila",
        destination: "Quezon City",
        driver: "Juan Santos",
        plateNumber: "BOY-001",
    },
    {
        id: "LB-045",
        customer: "Rodriguez Family",
        serviceType: "Lipat Bahay",
        status: "loading",
        origin: "Makati",
        destination: "Pasig",
        driver: "Maria Cruz",
        plateNumber: "BOY-003",
    },
    {
        id: "DEL-002",
        customer: "LBC Branch",
        serviceType: "Partnership",
        status: "delivered",
        origin: "Taguig",
        destination: "Mandaluyong",
        driver: "Pedro Reyes",
        plateNumber: "BOY-005",
    },
    {
        id: "LB-046",
        customer: "Dela Cruz Family",
        serviceType: "Lipat Bahay",
        status: "in transit",
        origin: "Paranaque",
        destination: "Las Pinas",
        driver: "Ana Garcia",
        plateNumber: "BOY-007",
    }
]

const statusColorMap = {
    "in transit": "blue",
    "loading": "yellow",
    "delivered": "green",
};

export default function LiveMonitoring() {

    return (
        <>
            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
                <SummaryCards cards={operationsSummaryCards} />
            </section>
            <main className='grid grid-cols-1 gap-8 mt-8'>
                {/* Live Tracking */}
                <section>
                    <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
                        <header className='px-6'>
                            <div className="leading-none font-semibold">Live Tracking</div>
                        </header>
                        <div className='grid grid-cols-1 gap-6 px-6'>
                            {liveTrackingData.map((delivery, index) => {
                                const color = statusColorMap[delivery.status] || "gray";
                                return (
                                    <div key={index} className='bg-card text-card-foreground flex flex-col gap-4 rounded-lg border border-foreground/10 p-4'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <div className='font-semibold'>{delivery.id}</div>
                                                <div className='text-muted-foreground text-sm'>{delivery.customer}</div>
                                            </div>
                                            <div className={`text-xs font-medium capitalize px-2 py-1 rounded-full bg-${color}-100 text-${color}-800`}>{delivery.status}</div>
                                        </div>
                                        <div className='text-sm font-medium flex items-center'>
                                            {delivery.origin} <ArrowRight className='w-4 h-4 mx-2' /> {delivery.destination}
                                        </div>
                                        <div className='text-sm'>Driver: {delivery.driver} • {delivery.plateNumber}</div>
                                        <div className='flex items-center justify-between'>
                                            <button className='inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline'>
                                                <Phone className='w-4 h-4' />
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}