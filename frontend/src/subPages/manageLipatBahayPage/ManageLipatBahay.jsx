import MenuHeader from '../../components/MenuHeader'
import StatusCards from '../../components/StatusCards'
import LipatBahayBooking from './LipatBahayBooking'
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
        subtitle: "3 completed, 1 ongoing",
        icon: Route,
        color: "text-chart-1",
    },
    {
        title: "Bookings Yesterday",
        value: "8",
        subtitle: "All completed",
        icon: Clock,
        color: "text-chart-2",
    },
    {
        title: "Bookings Tomorrow",
        value: "6",
        subtitle: "Scheduled moves",
        icon: House,
        color: "text-chart-3",
    }
]

export default function ManageLipatBahay() {
        return (
            <>
                <MenuHeader headerData={headerContent}/>
                <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                    <StatusCards cards={partnershipCards}/>
                </section>
                <section className='mt-8'>
                    <LipatBahayBooking />
                </section>
            </>
        )
}