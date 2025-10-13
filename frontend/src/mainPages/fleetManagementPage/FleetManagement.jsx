import '../../index.css'
import MenuHeader from '../../components/MenuHeader'
import SummaryCards from '../../components/SummaryCards'
import ManageFleetOverview from './ManageFleetOverview'
import NotAvailableTrucks from './NotAvailableTrucks'
import { Truck, CircleCheckBig, Wrench, TriangleAlert, Filter, Plus, Download, ClockArrowUp } from 'lucide-react'

const fleetHeaderContent = [
    {
        headerName: "Fleet Management",
        headerDescription: "Manage trucks, maintenance, and assignments",
        headerLink: "/",
        buttons: [
            // {
            //     buttonName: "Maintenance",
            //     buttonIcon: Wrench,
            //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            // },
            {
                buttonName: "Filter",
                buttonIcon: Filter,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "Export",
                buttonIcon: Download,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "Add Truck",
                buttonIcon: Plus,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm"
            }
        ]
    }
]

const fleetSummaryCards = [
    {
        title: "Total Fleet", 
        value: 10, 
        iconColor: "#002445", 
        icon: Truck, 
        description: "Trucks in operation"
    },
    {
        title: "Active", 
        value: 8, 
        iconColor: "#00a63e", 
        icon: CircleCheckBig, 
        description: "Currently deployed"
    },
    {
        title: "Maintenance", 
        value: 1, 
        iconColor: "#d08700", 
        icon: Wrench, 
        description: "Under service"
    },
    {
        title: "Available", 
        value: 1, 
        iconColor: "#155dfc", 
        icon: ClockArrowUp, 
        description: "Ready for assignment"
    },
]


function FleetManagement() {
    return (
        <>
            <MenuHeader headerData={fleetHeaderContent} />
            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
                <SummaryCards cards={fleetSummaryCards} />
            </section>
            <section className='grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8'>
                <div className='lg:col-span-3'>
                    <ManageFleetOverview />
                </div>
                <div>
                    <NotAvailableTrucks />
                </div>
            </section>
        </>
    )
}

export default FleetManagement;