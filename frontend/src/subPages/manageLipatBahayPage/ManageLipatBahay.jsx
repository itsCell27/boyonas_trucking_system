import MenuHeader from '../../components/MenuHeader'
import SummaryCards from '../../components/SummaryCards'
import { Plus, Funnel, Download, Route, Clock, Calendar, House } from 'lucide-react'

const headerContent = [
    {
        headerName: "Manage Lipat Bahay",
        headerDescription: "Household moving & retail deliveries",
        headerLink: "/app",
        buttons: [
            {
                buttonName: "Schedule",
                buttonIcon: Calendar,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "Filter",
                buttonIcon: Funnel,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "Export",
                buttonIcon: Download,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "New Delivery",
                buttonIcon: Plus,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-accent hover:bg-accent/90 hover:text-white rounded-sm"
            }
        ]
    }
]

const partnershipCards = [
    {
        title: "Bookings Today",
        value: "4",
        iconColor: "#002060",
        icon: Route,
        description: "3 completed, 2 ongoing"
    },
    {
        title: "Bookings Yesterday",
        value: "8",
        iconColor: "#f14d4c",
        icon: Clock,
        description: "All completed"
    },
    {
        title: "Bookings Tomorrow",
        value: "6",
        iconColor: "#006d58",
        icon: House,
        description: "Scheduled moves"
    }
]

export default function ManageLipatBahay() {
        return (
            <>
                <MenuHeader headerData={headerContent}/>
                <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                    <SummaryCards cards={partnershipCards}/>
                </section>
            </>
        )
}