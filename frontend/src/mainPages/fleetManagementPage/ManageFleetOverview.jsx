import '../../index.css'
import { Truck, Ellipsis, User } from 'lucide-react'

const fleetOverviewData = [
    {
        plateNumber: "ABC-1234",
        model: "Isuzu Forward",
        capacity: "6 tons",
        year: "2020",
        truckStatus: "Active",
        statusColor: "green",
        driver: "Juan Santos",
        currentAssignment: "DEL-001 - Flash Express"
    },
    {
        plateNumber: "GHI-9012",
        model: "Isuzu Elf",
        capacity: "3 tons",
        year: "2021",
        truckStatus: "Active",
        statusColor: "green",
        driver: "Pedro Reyes",
        currentAssignment: "DEL-002 - LBC"
    },
    {
        plateNumber: "JKL-3456",
        model: "Hyundai Mighty",
        capacity: "5 tons",
        year: "2018",
        truckStatus: "Available",
        statusColor: "blue",
        driver: "Ana Garcia",
        currentAssignment: "LB-048 - Lipat Bahay"
    },
    {
        plateNumber: "DEF-5678",
        model: "Mitsubishi Canter",
        capacity: "4 tons",
        year: "2019",
        truckStatus: "Available",
        statusColor: "blue",
        driver: "Maria Cruz",
        currentAssignment: "None"
    }
]

export default function ManageFleetOverview() {
    return (
    <>
        <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
            <div className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'>
                <div className='leading-none font-semibold'>Fleet Overview</div>
                <div data-slot="card-description" className="text-muted-foreground text-sm">Monitor all trucks, their status, and assignments</div>
            </div>
            <div className='px-6'>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Fleet Overview Card Format*/}
                    {fleetOverviewData.map((vehicle, index) => {
                        return (
                            <div key={index} className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm hover:shadow-md transition-shadow'>
                                {/* Fleet Overview Card Header*/}
                                <header className='grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-3'>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Truck />
                                            </div>
                                            <div>
                                                <div data-slot="card-title" className="font-semibold text-lg">{vehicle.plateNumber}</div>
                                                <div data-slot="card-description" className="text-muted-foreground text-sm">{vehicle.model} • {vehicle.capacity} • {vehicle.year}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span data-slot="badge" className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 overflow-hidden border-transparent bg-${vehicle.statusColor}-100 text-${vehicle.statusColor}-800 dark:bg-${vehicle.statusColor}-900 dark:text-${vehicle.statusColor}-300`}>{vehicle.truckStatus}</span>
                                            <button data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all shrink-0 outline-none hover:bg-accent hover:text-accent-foreground size-9">
                                                <Ellipsis className='w-6 h-6'/>
                                            </button>
                                        </div>
                                    </div>
                                </header>
                                {/* Fleet Overview Card Header*/}

                                {/* Fleet Overview Card Section*/}
                                <section className='flex flex-col justify-between flex-1 px-6 space-y-4'>
                                    <div className='grid grid-cols-2 gap-4 text-sm'>
                                        <div className="flex items-center space-x-2">
                                            <User />
                                            <div>
                                                <div className="font-medium">Driver</div>
                                                <div className="text-muted-foreground">{vehicle.driver}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium">Current Assignment</div>
                                        <div className="text-muted-foreground">{vehicle.currentAssignment}</div>
                                    </div>
                                    {/* Footer Button */}
                                    <footer className='flex space-x-2 pt-2'>
                                        <button className='bg-transparent text-sm font-md whitespace-nowrap inline-flex items-center rounded-md px-6 gap-1.5 h-8 border border-foreground/20 hover:bg-accent hover:text-accent-foreground'>
                                            View Details
                                        </button>
                                    </footer>
                                </section>
                            </div>
                        )
                    })}
                    
                </div>
            </div>
        </div>
    </>
    )
}