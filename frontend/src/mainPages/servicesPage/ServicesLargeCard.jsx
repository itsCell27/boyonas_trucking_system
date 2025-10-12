import '../../index.css'
import { Building2, ArrowRight, House, CircleCheckBig, Clock, TrendingUp } from "lucide-react";

const largeCardData = [
    {
      cardStyle: "hover:outline-primary/20",
      color: "primary",
      topRightIconText: "B2B",
      cardName: "Partnership Deliveries",
      cardDescription: "B2B logistics operations",
      cardIcon: Building2,
      cardIconColor: "bg-primary/10 group-hover:bg-primary/20",
      lucideIconStyle: "w-6 h-6 text-primary",
      cardButtonName: "Manage Partnership",
      cardButtonColor: "bg-primary text-primary-foreground hover:bg-primary/90 group-hover:bg-primary group-hover:text-primary-foreground",
      cardButtonLink: "/partnership",
      content: [
        { title: "Active Deliveries", value: "156", color: "primary"},
        { title: "Success Rate", value: "98%", color: "green-600"},
        { title: "Montly Revenue", value: "P2.95M", color: "blue-600"}
      ],
      categoryName: "Active Partners",
      categories: [
        { buttonName: "Flash Express", textColor: "red", backgroundColor: "red", borderColor: "red"},
        { buttonName: "LBC Express", textColor: "yellow", backgroundColor: "yellow", borderColor: "yellow"},
        { buttonName: "J&T Express", textColor: "blue", backgroundColor: "blue", borderColor: "blue"}
      ],
      activities: [
        { activityIcon: CircleCheckBig, iconColor: "green", text: "12 deliveries completed today"},
        { activityIcon: Clock, iconColor: "blue", text: "8 deliveries in progress"},
        { activityIcon: TrendingUp, iconColor: "green", text: "15% increase from last week"}
      ]
    },
    {
      cardStyle: "hover:outline-accent/20",
      color: "accent",
      topRightIconText: "Retail",
      cardName: "Lipat Bahay Services",
      cardDescription: "Household moving & retail deliveries",
      cardIcon: House,
      cardIconColor: "bg-accent/10 group-hover:bg-accent/20",
      lucideIconStyle: "w-6 h-6 text-accent",
      cardButtonName: "Manage Lipat Bahay",
      cardButtonColor: "bg-transparent text-foreground hover:bg-accent/90 group-hover:bg-accent group-hover:text-accent-foreground border border-foreground/10",
      cardButtonLink: "/lipat-bahay",
      content: [
        { title: "Active Bookings", value: "42", color: "accent"},
        { title: "Success Rate", value: "95%", color: "green-600"},
        { title: "Montly Revenue", value: "P850K", color: "blue-600"}
      ],
      categoryName: "Service Categories",
      categories: [
        { buttonName: "Small House", textColor: "orange", backgroundColor: "orange", borderColor: "orange"},
        { buttonName: "Apartment", textColor: "purple", backgroundColor: "purple", borderColor: "purple"},
        { buttonName: "Office Move", textColor: "green", backgroundColor: "green", borderColor: "green"}
      ],
      activities: [
        { activityIcon: CircleCheckBig, iconColor: "green", text: "3 moves completed today"},
        { activityIcon: Clock, iconColor: "blue", text: "5 bookings scheduled"},
        { activityIcon: TrendingUp, iconColor: "green", text: "8% increase from last week"}
      ]
    }
  ];

function ServicesLargeCard() {
    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {largeCardData.map((card, cardIndex) => {
                const cardStyle = `${card.cardStyle} bg-card text-card-foreground flex flex-col gap-6 rounded-xl p-6 shadow-sm group hover:shadow-lg transition-all duration-300 cursor-pointer outline-2 outline-transparent border border-foreground/10 relative overflow-hidden`;
                const iconStyle = `${card.cardIconColor} w-12 h-12 rounded-lg flex items-center justify-center transition-colors`;
                const spanStyle = `inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&]:hover:bg-secondary/90 bg-${card.color}/10 text-${card.color} border-${card.color}/20`;
                const buttonStyle = `${card.cardButtonColor} inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 w-full`;
                const Icon = card.cardIcon;
                return (
                    <div key={cardIndex} className={cardStyle}>
                        {/* top right cirlce design */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${card.color}/10 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:from-${card.color}/20 transition-colors`}></div>
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center space-x-4">
                                <div className={iconStyle}><Icon className={card.lucideIconStyle} /></div>
                                <div>
                                    <h3 className="font-semibold text-lg">{card.cardName}</h3>
                                    <p className="text-muted-foreground text-sm">{card.cardDescription}</p>
                                </div>
                            </div>
                            <span className={spanStyle}>{card.topRightIconText}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {card.content.map((item, index) => {
                                return (
                                    <div key={index} className="text-center">
                                        <div className={`text-2xl font-bold text-${item.color}`}>{item.value}</div>
                                        <div className="text-xs text-muted-foreground">{item.title}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className='space-y-3'>
                            <p className='text-sm font-medium text-muted-foreground'>{card.categoryName}</p>
                            <div className='flex items-center space-x-4'>
                                {card.categories.map((category, index) => {
                                return (
                                        <div key={index} className={`px-3 py-1 bg-${category.backgroundColor}-50 text-${category.textColor}-700 rounded-full text-xs font-medium border border-${category.borderColor}-200`}>
                                            {category.buttonName}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className='space-y-3'>
                            <p className='text-sm font-medium text-muted-foreground'>Recent Activity</p>
                            <div className='space-y-2'>
                                {card.activities.map((activity, index) => {
                                    const Icon = activity.activityIcon;
                                    return (
                                        <div key={index} class="flex items-center space-x-2 text-sm">
                                            <Icon className={`w-4 h-4 text-${activity.iconColor}-500`} />
                                            <span>{activity.text}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <a href={card.cardButtonLink} className="mt-auto">
                            <button className={buttonStyle}>
                                {card.cardButtonName} <ArrowRight className="w-4 h-4" />
                            </button>
                        </a>
                    </div>
                )
            })}
        </section>
    )
}

export default ServicesLargeCard;