import MenuHeader from '../../components/MenuHeader'
import { Plus, Funnel, Download, Route, Clock, Calendar } from 'lucide-react'
import SPXExpressDelivery from './SPXExpressDelivery'
import StatusCards from '../../components/StatusCards'
import axios from 'axios'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from "@/components/ui/spinner"
import { API_BASE_URL } from '@/config'


function ManagePartnership() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState(null);

    useEffect(() => {
        axios
        .get(`${API_BASE_URL}/manage_partnership_stats.php`, {
            withCredentials: true
        })
        .then((res) => {
            setStats(res.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching dashboard stats:", err);
            toast.error("Failed to load dashboard statistics.", err.message);
        });
    }, []);

    

    const headerContent = [
        {
            headerName: "Partnership Deliveries",
            headerDescription: "Manage B2B logistics operations",
            headerLink: "/app",
            buttons: [
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

    const partnershipCards = [
        {
            title: "Routes Today",
            value: stats?.routes_today?.total ?? 0,
            color: "text-chart-1",
            icon: Route,
            subtitle: `${stats?.routes_today?.completed ?? 0} completed, ${stats?.routes_today?.ongoing ?? 0} ongoing`
        },
        {
            title: "Routes Yesterday",
            value: stats?.routes_yesterday?.total ?? 0,
            color: "text-chart-2",
            icon: Clock,
            subtitle: `${stats?.routes_yesterday?.completed ?? 0} completed`
        },
        {
            title: "Incoming Routes Tomorrow",
            value: stats?.routes_tomorrow?.total ?? 0,
            color: "text-chart-3",
            icon: Calendar,
            subtitle:
            stats?.routes_tomorrow?.by_partner?.[0]?.partner_name
                ? `Scheduled for ${stats.routes_tomorrow.by_partner[0].partner_name}`
                : "No scheduled routes"
        }
    ];


    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <Spinner className="w-10 h-10 text-primary" />
            </div>
        );
    }

    return (
        <>
            <MenuHeader headerData={headerContent}/>
            <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                <StatusCards cards={partnershipCards}/>
            </section>
            <section className='mt-8'>
                <SPXExpressDelivery />
            </section>
        </>
    )
}

export default ManagePartnership;