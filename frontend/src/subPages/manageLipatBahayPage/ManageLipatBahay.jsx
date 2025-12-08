import MenuHeader from '../../components/MenuHeader'
import StatusCards from '../../components/StatusCards'
import LipatBahayBooking from './LipatBahayBooking'
import { Plus, Funnel, Download, Route, Clock, Calendar, House } from 'lucide-react'
import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/config'
import axios from 'axios'
import { toast } from 'sonner'



export default function ManageLipatBahay() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState(null);

    useEffect(() => {
        axios
        .get(`${API_BASE_URL}/manage_lipatbahay_stats.php`, {
            withCredentials: true
        })
        .then((res) => {
            setStats(res.data);
            setLoading(false);
            console.log(res.data);
        })
        .catch((err) => {
            console.error("Error fetching dashboard stats:", err);
            toast.error("Failed to load dashboard statistics.", err.message);
        });
    }, []);
    
    const headerContent = [
        {
            headerName: "Manage Lipat Bahay",
            headerDescription: "Household moving & retail deliveries",
            headerLink: "/app",
            buttons: [
                // {
                //     buttonName: "Schedule",
                //     buttonIcon: Calendar,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                // {
                //     buttonName: "Filter",
                //     buttonIcon: Funnel,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                // {
                //     buttonName: "Export",
                //     buttonIcon: Download,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                {
                    buttonName: "New Delivery",
                    buttonIcon: Plus,
                    buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-4 py-2 border border-foreground/10 bg-primary hover:bg-primary/90 text-white rounded-sm",
                    buttonLink: "create",
                }
            ]
        }
    ]

    const lipatBahayCards = [
        {
            title: "Bookings Today",
            value: stats?.routes_today?.total ?? 0,
            subtitle: `${stats?.routes_today?.completed ?? 0} completed, ${stats?.routes_today?.ongoing ?? 0} ongoing`,
            icon: Route,
            color: "text-chart-1",
        },
        {
            title: "Bookings Yesterday",
            value: stats?.routes_yesterday?.total ?? 0,
            subtitle: `${stats?.routes_yesterday?.completed ?? 0} completed`,
            icon: Clock,
            color: "text-chart-2",
        },
        {
            title: "Bookings Tomorrow",
            value: stats?.routes_tomorrow?.total ?? 0,
            subtitle:
                stats?.routes_tomorrow?.by_customer?.length > 0
                    ? `Scheduled for ${stats.routes_tomorrow.by_customer[0].customer_name}`
                    : "No scheduled bookings",
            icon: House,
            color: "text-chart-3",
        },
    ];


    return (
        <>
            <MenuHeader headerData={headerContent}/>
            <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                <StatusCards cards={lipatBahayCards}/>
            </section>
            <section className='mt-8'>
                <LipatBahayBooking />
            </section>
        </>
    )
}