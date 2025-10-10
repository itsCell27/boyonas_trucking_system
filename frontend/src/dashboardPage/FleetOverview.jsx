import { act } from 'react';
import '../index.css';
import { Truck, Wrench, CircleCheckBig } from 'lucide-react';

const fleetData = [
    {
        icon: Truck,
        vehiclePlate: "ABC-1234",
        status: "Active",
        statusColor: "text-blue-600",
        location: "Laguna",
        routeProgress: "50"
    },
    {
        icon: CircleCheckBig,
        vehiclePlate: "XYZ-5678",
        status: "Available",
        statusColor: "text-green-600",
        location: "Depot",
        routeProgress: ""
    },
    {
        icon: Truck,
        vehiclePlate: "DEF-9012",
        status: "Active",
        statusColor: "text-blue-600",
        location: "Cavite",
        routeProgress: "45"
    },
    {
        icon: Wrench,
        vehiclePlate: "GHI-3456",
        status: "Maintenance",
        statusColor: "text-yellow-600",
        location: "Workshop",
        routeProgress: ""
    },
    {
        icon: Truck,
        vehiclePlate: "JKL-7890",
        status: "Active",
        statusColor: "text-blue-600",
        location: "Manila",
        routeProgress: "90"
    }
]

const fleetFooterData = [
    {
        trucks: 8,
        color: "text-green-600",
        text: "Active"
    },
    {
        trucks: 2,
        color: "text-blue-600",
        text: "Available"
    },
    {
        trucks: 1,
        color: "text-yellow-600",
        text: "Maintenance"
    }
]

function FleetOverview() {
    return (
        <section>
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm">
                {/* Fleet Overview Title */}
                <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                    <div data-slot="card-title" className="leading-none font-semibold">Fleet Overview</div>
                    <div data-slot="card-description" className="text-muted-foreground text-sm">
                        Current status of all trucks
                    </div>
                </div>
                {/* Fleet Overview Content*/}
                <div className="px-6">
                    <div className='space-y-4'>
                        {/* Fleet Overview Card Format*/}
                        {fleetData.map((vehicle, index) => {

                            const hasRouteProgress = vehicle.routeProgress.trim() !== "";

                            const Icon = vehicle.icon;
                            const iconColor = `${vehicle.statusColor} w-4 h-4`;
                            const statusColor = `${vehicle.statusColor} text-sm`;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Icon className={`${iconColor}`} />
                                            <span className="font-medium">{vehicle.vehiclePlate}</span>
                                        </div>
                                        <span className={`${statusColor}`}>{vehicle.status}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground mb-2">Location: {vehicle.location}</div>
                                    {/* Route Progress*/}
                                    {hasRouteProgress && // if this is true, show the progress bar
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span>Route Progress</span>
                                                <span>{vehicle.routeProgress}%</span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div aria-valuemax="100" aria-valuemin="0" role="progressbar" data-state="indeterminate" data-max="100" data-slot="progress" className="w-full h-2 bg-primary/20 rounded-full overflow-hidden">
                                                <div data-state="indeterminate" data-max="100" data-slot="progress-indicator" className="h-full bg-primary rounded-full transition-all duration-500"
                                                style={{ width: `${vehicle.routeProgress}%` }}></div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            )
                        })}
                        
                    </div>
                    {/* Fleet Overview Footer*/}
                    <div className="mt-6 pt-4 border-t border-foreground/10">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {fleetFooterData.map((data, index) => {

                                const statusColor = `${data.color}`;

                                return (
                                    <div key={index}>
                                        <div className={`text-2xl font-bold ${statusColor}`}>{data.trucks}</div>
                                        <div className="text-xs text-muted-foreground">{data.text}</div>
                                    </div>
                                )
                            })}
                            
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default FleetOverview;