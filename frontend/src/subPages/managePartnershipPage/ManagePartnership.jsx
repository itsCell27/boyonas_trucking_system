import MenuHeader from '../../components/MenuHeader'
import SummaryCards from '../../components/SummaryCards'
import { Plus, Funnel, Download, Route, Clock, Calendar } from 'lucide-react'
import SPXExpressDelivery from './SPXExpressDelivery'

const headerContent = [
    {
        headerName: "Partnership Deliveries",
        headerDescription: "Manage B2B logistics operations",
        headerLink: "/app",
        buttons: [
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
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm"
            }
        ]
    }
]

const partnershipCards = [
    {
        title: "Routes Today",
        value: "5",
        iconColor: "#002060",
        icon: Route,
        description: "3 completed, 2 ongoing"
    },
    {
        title: "Routes Yesterday",
        value: "8",
        iconColor: "#f14d4c",
        icon: Clock,
        description: "All completed"
    },
    {
        title: "Incoming Routes Tomorrow",
        value: "6",
        iconColor: "#006d58",
        icon: Calendar,
        description: "Scheduled for SPX Express"
    }
]



function ManagePartnership() {
    return (
        <>
            <MenuHeader headerData={headerContent}/>
            <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                <SummaryCards cards={partnershipCards}/>
            </section>
            <section className='mt-8'>
                <SPXExpressDelivery />
            </section>
        </>
    )
}

export default ManagePartnership;