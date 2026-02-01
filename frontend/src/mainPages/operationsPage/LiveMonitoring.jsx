import '@/index.css'
import StatusCards from '@/components/StatusCards'
import { Truck, User, Clock, ArrowRight, Phone, Package } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import axios from "axios";
import { API_BASE_URL } from '@/config';
import { useEffect, useState } from "react";

const operationsSummaryCards = [
    { title: "Total Deliveries Today", value: 24, icon: Package, color: "text-chart-1" },
    { title: "Total Trucks Deployed", value: "8/10", icon: Truck, color: "text-chart-2" },
    { title: "Completed Deliveries Today", value: 12, icon: User, color: "text-chart-3" },
    { title: "Pending Deliveries", value: "2", icon: Clock, color: "text-chart-4" },
];

export default function LiveMonitoring() {
    const [liveTrackingData, setLiveTrackingData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [operationsSummaryCards, setOperationsSummaryCards] = useState([
        { title: "Total Deliveries Today", value: 0, icon: Package, color: "text-chart-1" },
        { title: "Total Trucks Deployed", value: "0/0", icon: Truck, color: "text-chart-2" },
        { title: "Completed Deliveries Today", value: 0, icon: User, color: "text-chart-3" },
        { title: "Pending Deliveries", value: 0, icon: Clock, color: "text-chart-4" },
    ]);


    useEffect(() => {
        fetchData(); // first load

        const interval = setInterval(() => {
            fetchData();
        }, 30000); // refresh every 30 seconds

        return () => clearInterval(interval); // cleanup
    }, []);


    const fetchData = async () => {
        try {
            // Live tracking logs
            const res = await axios.get(`${API_BASE_URL}/get_live_tracking_data.php`, { withCredentials: true });

            // Summary statistics
            const summaryRes = await axios.get(`${API_BASE_URL}/get_operations_summary.php`, { withCredentials: true });

            if (res.data.success) {
                setLiveTrackingData(res.data.logs);
            }

            if (summaryRes.data.success) {
                const s = summaryRes.data.summary;

                setOperationsSummaryCards([
                    { title: "Total Deliveries Today", value: s.total_deliveries_today, icon: Package, color: "text-chart-1" },
                    { title: "Total Trucks Deployed", value: `${s.trucks_deployed}/${s.total_trucks}`, icon: Truck, color: "text-chart-2" },
                    { title: "Completed Deliveries Today", value: s.completed_today, icon: User, color: "text-chart-3" },
                    { title: "Pending Deliveries", value: s.pending_deliveries, icon: Clock, color: "text-chart-4" },
                ]);
            }

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                <StatusCards cards={operationsSummaryCards} />
            </section>

            <main className="grid grid-cols-1 gap-8 mt-8">
                <section>
                    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm">
                        <header className="px-6 font-semibold">Live Tracking</header>

                        <div className="grid grid-cols-1 gap-6 px-6">

                            {loading && <div className="text-sm text-muted-foreground">Loading...</div>}

                            {!loading && liveTrackingData.length === 0 && (
                                <div className="text-sm text-muted-foreground">No live tracking data available.</div>
                            )}

                            {liveTrackingData.map((item) => {

                                let statusColor = "";
                                const status = item.status.toLowerCase();

                                if (status.includes("otw to soc")) {
                                    statusColor = "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300";

                                } else if (status.includes("otw to pickup")) {
                                    statusColor = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";

                                } else if (status.includes("otw to destination")) {
                                    statusColor = "bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-300";

                                } else if (status.includes("loading")) {
                                    statusColor = "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";

                                } else if (status.includes("unloading")) {
                                    statusColor = "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";

                                } else if (status.includes("completed")) {
                                    statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";

                                } else if (status.includes("incomplete")) {
                                    statusColor = "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300";

                                } else if (status.includes("scheduled")) {
                                    statusColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

                                } else if (status.includes("assigned")) {  
                                    statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";

                                } else if (status.includes("pending")) {  
                                    statusColor = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";

                                } else if (status.includes("cancelled")) {
                                    statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

                                } else {
                                    // fallback
                                    statusColor = "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                                }

                                return (
                                    <div key={item.status_log_id} className="bg-card border p-4 rounded-lg flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-semibold">{item.id}</div>
                                                <div className="text-sm text-muted-foreground">Client: {item.customer}</div>
                                            </div>

                                            <div className='flex flex-col gap-2 items-end'>
                                                <Badge className={`text-xs font-medium ${statusColor} pointer-events-none`}>
                                                    {item.status}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground">{item.timeAgo}</div>
                                            </div>
                                        </div>

                                        <div className='flex gap-1 sm:flex-row flex-col'>
                                            <div>Route:</div>
                                            <div className="text-sm font-medium flex items-center">
                                                {item.origin} <ArrowRight className="w-4 h-4 mx-2" /> {item.destination}
                                            </div>
                                        </div>
                                        

                                        <div className="text-sm grid sm:grid-cols-2 grid-cols-1 w-full text-muted-foreground">
                                            <div><span className='text-muted-foreground'>Driver:</span> {item.driver || "None"}</div>
                                            <div><span className='text-muted-foreground'>Truck Plate Number:</span> {item.plateNumber || "None"}</div>
                                        </div>

                                        <div>
                                            {item.contact ? (
                                                <a className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
                                                    <Phone className="w-4 h-4" /> {item.contact}
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">No contact</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}