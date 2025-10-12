import '../index.css'

// This component is reusable
// Use this format to pass values to the cards prop
// const cards = [
//     { 
//         title: "Active Trucks", 
//         value: 8, 
//         iconColor: "#002445", 
//         icon: Truck, 
//         description: "out of 10 total" 
//     },
//     { 
//         title: "Employees", 
//         value: 24, 
//         iconColor: "#f14d4c", 
//         icon: Users, 
//         description: "drivers & helpers" 
//     }
// ]

function SummaryCards({ cards }) {

    return (
        <>
            {/* This dynamically generates the cards from the cards array */}
            {cards.map((card, index) => {
                const Icon = card.icon;

                return (
                    <div key={index} className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="@container/card-header auto-rows-min grid-rows-[auto_auto] gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
                            <Icon className="w-5 h-5 mr-3" color={card.iconColor} />      
                        </div>
                        <div className="px-6">
                            <div className="text-2xl font-bold text-foreground">{card.value}</div>
                            <div className="text-xs text-muted-foreground mt-1">{card.description}</div>
                        </div>
                    </div> 
                ) 
            })}
        </>
    )
}

export default SummaryCards;