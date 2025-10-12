import '../../index.css'
import ServicesSmallCard from './ServicesSmallCard';
import ServicesLargeCard from './ServicesLargeCard';
import { Package, Users, DollarSign, TrendingUp, Building2, House } from "lucide-react";

const smallCardData = [
    {
        title: "Total Services", 
        value: "198", 
        iconColor: "#002445", 
        icon: Package, 
        description: "from last month",
        highlight: "+12%"
    },
    {
        title: "Active Customers", 
        value: "1,247", 
        iconColor: "#002445", 
        icon: Users, 
        description: "from last month",
        highlight: "+8%"
    },
    {
        title: "Monthly Revenue", 
        value: "P2.95M", 
        iconColor: "#002445", 
        icon: DollarSign, 
        description: "from last month",
        highlight: "+18%"
    },
    {
        title: "Success Rate", 
        value: "97.2%", 
        iconColor: "#002445", 
        icon: TrendingUp, 
        description: "from last month",
        highlight: "+2.1%"
    }
]

function Services() {
    return (
        <div className="flex flex-col w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Services</h1>
                <p className="text-muted-foreground mt-1">Manage your Partnership Deliveries and Lipat Bahay Services</p>
            </div>
            {/* Services content goes here */}
            <ServicesSmallCard smallCards={smallCardData}/>
            <ServicesLargeCard  />
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>

            </div>
        </div>
    )
}

export default Services;