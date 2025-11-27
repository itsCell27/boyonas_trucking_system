import { Badge } from "@/components/ui/badge"
import '../../index.css'
import { Truck, Ellipsis, User, MoreHorizontal } from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { TruckDetailsModal } from "./TruckDetailsModal"
import { useState } from "react"
import { API_BASE_URL } from "@/config"
import axios from "axios"

export default function ManageFleetOverview({ fleetData, fetchFleetData }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState(null);

    const handleViewDetails = (truck) => {
        setSelectedTruck(truck);
        setIsModalOpen(true);
    };
    
    const getTruckStatusColor = (status) => {
        switch (status) {
        case "Okay to Use":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        case "Not Okay to Use":
            return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        case "Needs Document Renewal":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        default:
            return "bg-gray-100 text-gray-800"
        }
    }

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

    const updateTruckStatus = async (truckId, newStatus) => {
        try {
            const res = await axios.post(
                `${API_BASE_URL}/update_truck_status.php`,
                { truck_id: truckId, operational_status: newStatus },
                { withCredentials: true }
            );

            if (res.data.success) {
                fetchFleetData(); // refresh parent FleetManagement
            } else {
                console.error("Failed to update truck:", res.data);
            }
        } catch (err) {
            console.error("Update error:", err);
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
                {/* Fallback if no data */}
                {!fleetData || fleetData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Truck className="h-10 w-10 mb-3 opacity-70" />
                    <p className="text-lg font-medium">No trucks available</p>
                    <p className="text-sm">Add a truck to start managing your fleet.</p>
                </div>
                ) : (
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                    {/* Fleet Overview Card Format*/}
                    {fleetData.map((vehicle, index) => {
                        const statusColor = getStatusColor(vehicle.operational_status);
                        return (
                            
                            <Card key={index} className="bg-background w-full">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                        {vehicle.image_path ? (
                                            // put the image inside the div
                                            <div className="w-12 aspect-square overflow-hidden border-2 border-primary bg-primary/10 rounded-lg flex items-center justify-center">
                                                <img className="w-full h-full object-cover" src={`${API_BASE_URL}/${vehicle.image_path}`} />
                                            </div>
                                        ) : (
                                            <div className="w-12 aspect-square bg-primary/10 rounded-lg flex items-center justify-center">
                                                <Truck className="h-6 w-6 text-primary" />
                                            </div>
                                        )}

                                        
                                        <div>
                                            <CardTitle className="text-lg">{vehicle.plate_number}</CardTitle>
                                            <CardDescription>
                                            {vehicle.model} 
                                            {/* • {vehicle.capacity} kg • {vehicle.year} */}
                                            </CardDescription>
                                        </div>
                                        </div>
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                disabled={vehicle.operational_status !== "Available"}
                                                className={
                                                    vehicle.operational_status !== "Available"
                                                        ? "opacity-40 cursor-not-allowed"
                                                        : "hover:bg-accent"
                                                }
                                                onClick={() => updateTruckStatus(vehicle.truck_id, "Maintenance")}
                                            >
                                                Set to Maintenance
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                disabled={vehicle.operational_status !== "Maintenance"}
                                                className={
                                                    vehicle.operational_status !== "Maintenance"
                                                        ? "opacity-40 cursor-not-allowed"
                                                        : "hover:bg-accent"
                                                }
                                                onClick={() => updateTruckStatus(vehicle.truck_id, "Available")}
                                            >
                                                Set to Available
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 mt-6">

                                {/* Driver and Route Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                    <div className="font-medium">Capacity</div>
                                    <div className="text-muted-foreground">{vehicle.capacity} kg</div>
                                    </div>
                                    <div>
                                    <div className="font-medium">Year</div>
                                    <div className="text-muted-foreground">{vehicle.year}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-muted-foreground flex flex-col flex-start gap-2">
                                    <span>Status</span>
                                    <Badge className={`${getTruckStatusColor(vehicle.status)} pointer-events-none w-max`}>{vehicle.status}</Badge>
                                    </div>
                                </div>

                                {/* Driver and Route Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                    <div className="font-medium">Document Status</div>
                                    <div className="text-muted-foreground">{vehicle.document_status}</div>
                                    </div>
                                    <div>
                                    <div className="font-medium">Operational Status</div>
                                    <div className="text-muted-foreground">{vehicle.operational_status}</div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-2 pt-2 w-max">
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 bg-transparent w-max"
                                    onClick={() => handleViewDetails(vehicle)}
                                    >
                                    View Details
                                    </Button>
                                </div>
                                </CardContent>
                            </Card>
                            
                        )
                    })}
                    
                </div>
                )}
            </div>
        </div>
        {selectedTruck && (
            <TruckDetailsModal
                truck={selectedTruck}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        )}
    </>
    )
}