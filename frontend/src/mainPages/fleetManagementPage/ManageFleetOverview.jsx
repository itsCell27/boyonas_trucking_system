import { useState, useEffect } from 'react';
import '../../index.css'
import { Truck, Ellipsis, User } from 'lucide-react'

export default function ManageFleetOverview() {
    const [fleetData, setFleetData] = useState([]);

    useEffect(() => {
        fetch('http://localhost/react_trucking_system/backend/api/fleet_management.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setFleetData(data.data);
                } else {
                    console.error('Error fetching fleet data:', data.error);
                }
            })
            .catch(error => console.error('Error fetching fleet data:', error));
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available':
                return 'blue';
            case 'On Delivery':
                return 'green';
            case 'Maintenance':
                return 'yellow';
            default:
                return 'gray';
        }
    };

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
                    {fleetData.map((vehicle, index) => {
                        const statusColor = getStatusColor(vehicle.operational_status);
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
                                                <div data-slot="card-title" className="font-semibold text-lg">{vehicle.plate_number}</div>
                                                <div data-slot="card-description" className="text-muted-foreground text-sm">{vehicle.model} • {vehicle.capacity} • {vehicle.year}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span data-slot="badge" className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 overflow-hidden border-transparent bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-900 dark:text-${statusColor}-300`}>{vehicle.operational_status}</span>
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
                                                <div className="text-muted-foreground">{vehicle.driver || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-medium">Current Assignment</div>
                                        <div className="text-muted-foreground">{vehicle.currentAssignment || 'None'}</div>
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