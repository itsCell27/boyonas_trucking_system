import '../../index.css'
import { Building2, ArrowRight, House } from "lucide-react";
import { Link } from 'react-router-dom';

// Card data where you can add more cards if needed
const cardsData = [
  {
    cardStyle: "hover:outline-primary/20",
    cardName: "Partnership Deliveries",
    cardDescription: "B2B logistics operations",
    cardIcon: Building2,
    cardIconColor: "bg-primary/10 group-hover:bg-primary/20",
    lucideIconStyle: "w-6 h-6 text-primary",
    content: [
      { label: "Active Partner", value: "SPX" },
      { label: "Today's Routes", value: "8 deliveries" },
    ],
    cardButtonName: "Manage Partnership Operations",
    cardButtonColor: "bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-primary group-hover:text-primary-foreground",
    cardButtonLink: "/app/partnership"
  },
  {
    cardStyle: "hover:outline-accent/20",
    cardName: "Lipat Bahay Services",
    cardDescription: "Household moving & retail deliveries",
    cardIcon: House,
    cardIconColor: "bg-accent/10 group-hover:bg-accent/20",
    lucideIconStyle: "w-6 h-6 text-accent",
    content: [
      { label: "Bookings Today", value: "4 scheduled" },
      { label: "Average Rate", value: "₱3,500/job" },
    ],
    cardButtonName: "Manage Lipat Bahay Services",
    cardButtonColor: "bg-transparent text-foreground hover:bg-accent/90 group-hover:bg-accent group-hover:text-accent-foreground border border-foreground/10",
    cardButtonLink: "/app/lipat-bahay"
  }
];


function ServiceOperations() {
    
    return (
        <div className="space-y-6">
            <section className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Service Operations</h2>
                <p className="text-muted-foreground">Select a service type to manage deliveries and operations</p>
            </section>
            {/* Service types*/}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Service type card */}
                {/* This dynamically generates the cards from the cardsData array*/}
                {cardsData.map((card, cardIndex) => {
                    const cardStyle = `${card.cardStyle} bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 shadow-sm group hover:shadow-lg transition-all duration-300 cursor-pointer outline-2 outline-transparent border border-foreground/10`;
                    const iconStyle = `${card.cardIconColor} w-12 h-12 rounded-lg flex items-center justify-center  transition-colors`;
                    const buttonStyle = `${card.cardButtonColor} inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive  shadow-xs h-9 px-4 py-2 has-[&gt;svg]:px-3 w-full`;
                    const Icon = card.cardIcon;
                    const cardIconStyle = card.lucideIconStyle;
                    return (
                        <div key={cardIndex} className={`${cardStyle}`}>
                            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-4">
                                <div className="flex items-center space-x-3">
                                    {/* Card Icon */}
                                    <div className={`${iconStyle}`}>
                                        <Icon className={`${cardIconStyle}`}/>
                                    </div>
                                    {/* Card Title & Description */}
                                    <div>
                                        <div data-slot="card-title" className="font-semibold text-xl">{card.cardName}</div>
                                        <div data-slot="card-description" className="text-muted-foreground text-sm">{card.cardDescription}</div>
                                    </div>
                                </div>
                            </div>
                            {/* Card Content*/}
                            <div data-slot="card-content" className="px-6 space-y-4">
                                <div className="space-y-2">
                                    {card.content.map((item, itemIndex) =>(
                                        <div key={itemIndex} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{item.label}</span>
                                            <span className="font-medium">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link to={card.cardButtonLink} data-slot="button" className={`${buttonStyle}`}>{card.cardButtonName}
                                    <ArrowRight className="w-4 h-4"/>
                                </Link>
                            </div>
                        </div>
                    )
                })}     
            </section>
        </div>
    )
}

export default ServiceOperations;