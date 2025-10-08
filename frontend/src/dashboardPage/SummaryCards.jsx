import '../index.css'
import { Truck, Package, Users, DollarSign } from "lucide-react"

// Card data where you can add more cards if needed
const cards = [
    { title: "Active Trucks", value: 8, iconColor: "#002445", icon: Truck, description: "out of 10 total" },
    { title: "Employees", value: 24, iconColor: "#f14d4c", icon: Users, description: "drivers & helpers" },
    { title: "Today's Deliveries", value: 12, iconColor: "#006757", icon: Package, description: "3 pending" },
    { title: "Monthly Revenue", value: 485, iconColor: "#677d00", icon: DollarSign, description: "+12% from last month" }
]

function SummaryCards() {

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* This dynamically generates the cards from the cards array */}
            {cards.map(({ title, value, icon: Icon, iconColor, description }) => {

                return (
                    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm hover:shadow-md transition-shadow ">
                        <div className="@container/card-header auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="text-sm font-medium text-muted-foreground">{title}</div>
                            <Icon className="w-5 h-5 mr-3" color={iconColor} />      
                        </div>
                        <div className="px-6">
                            <div className="text-2xl font-bold text-foreground">{value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{description}</div>
                        </div>
                    </div> 
                ) 
            })}
        </section>
    )
}

export default SummaryCards;