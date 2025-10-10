import '../index.css';
import { Clock, Truck, MapPin } from 'lucide-react';

const activityData = [
    {
        deliveryID: "DEL-001",
        serviceType: "Partnership",
        route: "Pasig → Laguna",
        vehiclePlate: "ABC-1234",
        driver: "Juan Santos",
        client: "Flash Express",
        status: "In Transit",
        time: "2 hours ago"
    },
    {
        deliveryID: "LB-045",
        serviceType: "Lipat Bahay",
        route: "Makati → Quezón City",
        vehiclePlate: "XYZ-5678",
        driver: "Maria Cruz",
        client: "Direct Customer",
        status: "Completed",
        time: "4 hours ago"
    },
    {
        deliveryID: "DEL-002",
        serviceType: "Partnership",
        route: "Manila → Cavite",
        vehiclePlate: "DEF-9012",
        driver: "Pedro Reyes",
        client: "LBC",
        status: "Loading",
        time: "1 hours ago"
    },
    {
        deliveryID: "LB-046",
        serviceType: "Lipat Bahay",
        route: "Taguig → Antipolo",
        vehiclePlate: "GHI-3456",
        driver: "Ana Garcia",
        client: "Direct Customer",
        status: "Scheduled",
        time: "30 minutes ago"
    }
]

function RecentActivity() {
    return (
        <div className="lg:col-span-2">
            <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl  py-6 shadow-sm border border-foreground/10">
                {/* Recent Activity Title*/}
                <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
                    <div className="leading-none font-semibold flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Recent Activity</span>
                    </div>
                    <div className="text-muted-foreground text-sm">Latest delivery operations and updates</div>
                </div>
                {/* Recent Activity Content */}
                <div className="px-6">
                    <div className="space-y-4">
                        {/* Activity Item Format */}
                        {activityData.map((item, index) => {
                            
                            let statusColor = "";
                            if (item.status.toLowerCase().includes("in transit")) {
                                statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                            } else if (item.status.toLowerCase().includes("completed")) {
                                statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
                            } else if (item.status.toLowerCase().includes("loading")) {
                                statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
                            } else if (item.status.toLowerCase().includes("scheduled")) {
                                statusColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
                            } else {
                                statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
                            }


                            return (
                                <div key={index} className="flex items-center justify-between p-4 border border-foreground/10 rounded-lg hover:bg-muted/50 transition-colors">
                                    {/* Item Info */}
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <Truck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">{item.deliveryID}</span>
                                                <span data-slot="badge" className="inline-flex items-center justify-center rounded-md border border-foreground/10 px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-foreground [a&amp;]:hover:bg-accent [a&amp;]:hover:text-accent-foreground text-xs">
                                                    {item.serviceType}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                <span>{item.route}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">{item.vehiclePlate} • {item.driver} • {item.client}</div>
                                        </div>
                                    </div>
                                    {/* Item Status */}
                                    <div className="text-right space-y-1">
                                        <span data-slot="badge" className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 ${statusColor}`}>
                                            {item.status}
                                        </span>
                                        <div className="text-xs text-muted-foreground">{item.time}</div>
                                    </div>
                                </div>
                            )
                        })}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RecentActivity;