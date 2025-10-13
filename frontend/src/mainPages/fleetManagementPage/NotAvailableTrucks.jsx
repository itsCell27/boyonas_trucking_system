import '../../index.css'
import { Wrench, Calendar, TriangleAlert } from 'lucide-react'

const notAvailableTrucksContent = [
    {
        icon: Calendar,
        iconColor: "green",
        vehiclePlate: "ABC-1234",
        status: "Medium",
        statusColor: "yellow",
        maintenanceType: "Regular Service",
        maintenanceDescription: "Oil change, filter replacement",
        dueDate: "Jan 25, 2024",
        estimatedCost: "₱3,500",
        daysRemaining: "15 days remaining"
    },
    {
        icon: TriangleAlert,
        iconColor: "orange",
        vehiclePlate: "DEF-5678",
        status: "High",
        statusColor: "orange",
        maintenanceType: "Tire Replacement",
        maintenanceDescription: "Front tires showing wear",
        dueDate: "Jan 20, 2024",
        estimatedCost: "₱8,000",
        daysRemaining: "10 days remaining"
    },
    {
        icon: Wrench,
        iconColor: "red",
        vehiclePlate: "GHI-9012",
        status: "Critical",
        statusColor: "red",
        maintenanceType: "Engine Repair",
        maintenanceDescription: "Engine overheating issue",
        dueDate: "In Progress",
        estimatedCost: "₱15,000",
        daysRemaining: ""
    }
]

export default function NotAvailableTrucks() {
    return (
        <div className='space-y-6'>
            <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
                <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'>
                    <div className='leading-none font-semibold flex items-center space-x-2'>
                        <Wrench className='w-5 h-5'/>
                        <span>Not Available Trucks</span>
                    </div>
                    <div data-slot="card-description" class="text-muted-foreground text-sm">Upcoming and ongoing maintenance tasks</div>
                </header>
                <div className='px-6'>
                    <div className='space-y-4'>
                        {notAvailableTrucksContent.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="border border-foreground/10 rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Icon className={`h-4 w-4 text-${item.iconColor}-600`}/>
                                            <span className="font-semibold">{item.vehiclePlate}</span>
                                        </div>
                                        <span data-slot="badge" className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden border-transparent bg-${item.statusColor}-100 text-${item.statusColor}-800 dark:bg-${item.statusColor}-900 dark:text-${item.statusColor}-300`}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="font-medium text-sm">{item.maintenanceType}</div>
                                        <div className="text-xs text-muted-foreground">{item.maintenanceDescription}</div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Due:</span>
                                            <span className="font-medium">{item.dueDate}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Est. Cost:</span>
                                            <span className="font-medium">{item.estimatedCost}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">{item.daysRemaining}</div>
                                </div>
                            )
                        })}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}