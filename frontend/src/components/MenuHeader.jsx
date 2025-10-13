import '../index.css'
import { ArrowLeft, Calendar, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

// This component is reusable
// Use this format to pass values to the headerData prop
// const headerData = [
//     {
//         headerName: "Fleet Management",
//         headerDescription: "Manage trucks, maintenance, and assignments",
//         headerLink: "/",
//         buttons: [
//             {
//                 buttonName: "Schedule",
//                 buttonIcon: Calendar,
//                 buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
//             },
//             {
//                 buttonName: "Add Truck",
//                 buttonIcon: Plus,
//                 buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm"
//             }
//         ]
//     }
// ]

// Buttons Styles
// Default Button Style
{/* <button data-slot="button" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm">
    <Calendar className='h-4 w-4 mr-2'/>Schedule
</button> */}
                                
// For the last button style
{/* <button data-slot="button" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm">
    <Plus className='h-4 w-4 mr-2'/>Add Truck
</button> */}

function MenuHeader({ headerData }) {
    return (
        <header className='border-b bg-card border-foreground/10 rounded-xl'>
            <div className='container mx-auto px-6 py-4'>
                {headerData.map((header, index) => {
                    return (
                        <div key={index} className='flex items-center justify-between'>
                            <div className="flex items-center space-x-4">
                                <Link to={header.headerLink} data-slot="button" className='p-2 mr-6 rounded-md hover:bg-primary/90 hover:text-white shrink-0'>
                                    <ArrowLeft className='h-5 w-5'/>
                                </Link>
                                <div>
                                <h1 className="text-2xl font-bold text-foreground">{header.headerName}</h1>
                                <p className="text-sm text-muted-foreground">{header.headerDescription}</p>
                                </div>
                            </div>
                            <div className='flex items-center space-x-3'>
                                {/* Check if the header has buttons*/}
                                {Array.isArray(header.buttons) && header.buttons.length > 0 && (
                                    <>
                                    {header.buttons.map((button, index) =>{
                                        const Icon = button.buttonIcon
                                        return (
                                            <button key={index} data-slot="button" className={button.buttonStyle}>
                                                <Icon className='h-4 w-4 mr-2'/>{button.buttonName}
                                            </button>
                                        )
                                    })}
                                    </>
                                )}
                                
                            </div>
                        </div>
                    )
                })}
                
            </div>
        </header>
    )
}

export default MenuHeader;