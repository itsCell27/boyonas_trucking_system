import { useState, useEffect } from 'react';
import '@/index.css'
import MenuHeader from '@/components/MenuHeader'
import StatusCards from '@/components/StatusCards'
import ManageFleetOverview from './ManageFleetOverview'
import NotAvailableTrucks from './NotAvailableTrucks'
import AddTruckDialog from './AddTruckDialog';
import { Truck, CircleCheckBig, Wrench, Plus, ClockArrowUp } from 'lucide-react'
import { API_BASE_URL } from '@/config';


function FleetManagement() {
    const [fleetData, setFleetData] = useState([]);

    // count available trucks
    const availableCount = fleetData.filter(truck => truck.operational_status === 'Available').length;

    // count active trucks
    const activeCount = fleetData.filter(truck => truck.operational_status === 'On Delivery').length;

    // count maintenance trucks
    const maintenanceCount = fleetData.filter(truck => truck.operational_status === 'Maintenance').length;


    const fetchFleetData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/manage_fleet_overview.php`);
            const data = await response.json();
            if (data.success) {
                setFleetData(data.data);
            } else {
                console.error('Error fetching fleet data:', data.error);
            }
        } catch (error) {
            console.error('Error fetching fleet data:', error);
        }
    };

    useEffect(() => {
        fetchFleetData();
    }, []);

    const fleetHeaderContent = [
        {
            headerName: "Fleet Management",
            headerDescription: "Manage trucks, maintenance, and assignments",
            headerLink: "/app",
            buttons: [
                // {
                //     hasShadcnDialog: false,
                //     buttonName: "Filter",
                //     buttonIcon: Filter,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                // {
                //     hasShadcnDialog: false,
                //     buttonName: "Export",
                //     buttonIcon: Download,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                {
                    hasShadcnDialog: true,
                    dialogName: AddTruckDialog,
                    buttonName: "Add Truck",
                    buttonIcon: Plus,
                    onClose: fetchFleetData,
                }
            ]
        }
    ]
    
    const fleetSummaryCards = [
        {
            title: "Total Fleet", 
            value: fleetData.length, 
            subtitle: "Total number of trucks", 
            icon: Truck, 
            color: "text-chart-1"
        },
        {
            title: "Active", 
            value: activeCount, 
            subtitle: "Currently deployed", 
            icon: CircleCheckBig, 
            color: "text-chart-2"
        },
        {
            title: "Maintenance", 
            value: maintenanceCount, 
            subtitle: "Under maintenance", 
            icon: Wrench, 
            color: "text-chart-3"
        },
        {
            title: "Available", 
            value: availableCount, 
            subtitle: "Ready for assignment", 
            icon: ClockArrowUp, 
            color: "text-chart-4"
        },
    ]

    return (
        <>
            <MenuHeader headerData={fleetHeaderContent} />
            <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
                <StatusCards cards={fleetSummaryCards} />
            </section>
            <section className='grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8'>
                <div className='xl:col-span-3 lg:col-span-2'>
                    <ManageFleetOverview fleetData={fleetData} fetchFleetData={fetchFleetData} />
                </div>
                <NotAvailableTrucks trucks={fleetData}/>
            </section>
        </>
    )
}

export default FleetManagement;