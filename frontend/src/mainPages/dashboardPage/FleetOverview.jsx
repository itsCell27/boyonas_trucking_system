import { act } from 'react';
import '../../index.css'
import { Truck, Wrench, CircleCheckBig } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

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

function FleetOverview() {

    const [trucks, setTrucks] = useState([]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/get_fleet_overview.php`)
            .then(res => setTrucks(res.data))
            .catch(err => console.error(err));
    }, []);


    const mapStatus = (status) => {
        switch (status) {
            case "On Delivery":
                return {
                    status: "Active",
                    color: "text-blue-600",
                    icon: Truck
                };
            case "Available":
                return {
                    status: "Available",
                    color: "text-green-600",
                    icon: CircleCheckBig
                };
            case "Maintenance":
                return {
                    status: "Maintenance",
                    color: "text-yellow-600",
                    icon: Wrench
                };
            default:
                return {
                    status: "Unknown",
                    color: "text-gray-500",
                    icon: Truck
                };
        }
    };

    const footerStats = {
        active: trucks.filter(t => t.operational_status === "On Delivery").length,
        available: trucks.filter(t => t.operational_status === "Available").length,
        maintenance: trucks.filter(t => t.operational_status === "Maintenance").length,
    };

    const fleetFooterData = [
        {
            trucks: footerStats.active,
            color: "text-blue-600",
            text: "Active"
        },
        {
            trucks: footerStats.available,
            color: "text-green-600",
            text: "Available"
        },
        {
            trucks: footerStats.maintenance,
            color: "text-yellow-600",
            text: "Maintenance"
        }
    ]



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
                        {trucks.map((t, index) => {
                            const mapped = mapStatus(t.operational_status);
                            const Icon = mapped.icon;

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Icon className={`${mapped.color} w-4 h-4`} />
                                            <span className="font-medium">{t.plate_number}</span>
                                        </div>
                                        <span className={`${mapped.color} text-sm`}>
                                            {mapped.status}
                                        </span>
                                    </div>
                                </div>
                            );
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