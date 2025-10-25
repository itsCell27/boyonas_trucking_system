import MenuHeader from '../../components/MenuHeader'
import { Plus, Funnel, Download, Route, Clock, Calendar } from 'lucide-react'
import SPXExpressDelivery from './SPXExpressDelivery'
import StatusCards from '../../components/StatusCards'
import axios from 'axios'
import { API_BASE_URL } from '../../config'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from "@/components/ui/spinner"


function ManagePartnership() {

    const [counts, setCounts] = useState({
        today_count: 0,
        yesterday_count: 0,
        tomorrow_count: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
        .get("http://localhost/react_trucking_system/backend/api/get_partnership_bookings.php", {
            withCredentials: true,
        })
        .then((response) => {
            if (response.data && response.data.counts) {
            setCounts(response.data.counts);
            } else {
            setError("No count data found.");
            }
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching booking counts:", err);
            setError("Failed to fetch booking counts.");
            setLoading(false);
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
            value: "5",
            color: "text-chart-1",
            icon: Route,
            subtitle: "3 completed, 2 ongoing"
        },
        {
            title: "Routes Yesterday",
            value: "8",
            color: "text-chart-2",
            icon: Clock,
            subtitle: "All completed"
        },
        {
            title: "Incoming Routes Tomorrow",
            value: "6",
            color: "text-chart-3",
            icon: Calendar,
            subtitle: "Scheduled for SPX Express"
        }
    ]



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