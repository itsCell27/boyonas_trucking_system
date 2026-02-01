import '../index.css'
import { ArrowLeft, Calendar, Key, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react';

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
//                 buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm",
//                 onClick: handleAddTruckOpenModal
//             }
//         ]
//     }
// ]

// Buttons Styles
// Default Button Style
//<button data-slot="button" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm">
//    <Calendar className='h-4 w-4 mr-2'/>Schedule
//</button>
                                
// For the last button style
// <button data-slot="button" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-1 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm">
// <Plus className='h-4 w-4 mr-2'/>Add Truck
//</button>

function MenuHeader({ headerData }) {

    const [isMobileView, setIsMobileView] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth < 1024);
        handleResize(); // run once immediately
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    return (
        <header className='border bg-card shadow rounded-xl'>
            <div className='container mx-auto px-6 py-4'>
                {headerData.map((header, index) => {
                    return (
                        <div key={index} className='flex items-center justify-between'>
                            <div className="flex items-center space-x-4 mr-4 md:mr-0">
                                <Link to={header.headerLink}  data-slot="button" className='p-2 mr-6 rounded-md hover:bg-primary/90 hover:text-white shrink-0 hidden lg:inline-flex'>
                                    <ArrowLeft className='h-5 w-5'/>
                                </Link>
                                <div>
                                <h1 className="text-md lg:text-2xl font-bold text-foreground">{header.headerName}</h1>
                                <p className="text-xs lg:text-sm text-muted-foreground">{header.headerDescription}</p>
                                </div>
                            </div>
                            <div className='flex flex-col sm:flex-row items-center gap-3'>
                                {/* Check if the header has buttons*/}
                                {Array.isArray(header.buttons) && header.buttons.length > 0 && (
                                    <>
                                    {header.buttons.map((button, index) =>{
                                        const Icon = button.buttonIcon
                                        const DialogComponent = button.dialogName


                                        if (button.hasShadcnDialog && DialogComponent && button.onClose) {
                                            return (
                                                <DialogComponent key={index} onClose={button.onClose} />
                                            )
                                        }

                                        if (button.hasShadcnDialog && DialogComponent) {
                                            return (
                                                <DialogComponent key={index} />
                                            )
                                        }

                                        if (button.buttonLink) {
                                            return (
                                                <Link key={index} to={button.buttonLink} data-slot="button" className='p-0'>
                                                    <Button>
                                                        <Icon className='h-4 w-4 lg:mr-2'/>{!isMobileView && button.buttonName}
                                                    </Button>
                                                </Link>
                                            )
                                        }

                                        if (button.isLastButton) {
                                            return (
                                                <Button key={index} data-slot="button" onClick={button.onClick}>
                                                    <Icon className='h-4 w-4 lg:mr-2'/>{!isMobileView && button.buttonName}
                                                </Button>
                                            )
                                        }

                                        return (
                                            <Button key={index} data-slot="button" variant="outline" onClick={button.onClick}>
                                                <Icon className='h-4 w-4 lg:mr-2'/>{!isMobileView && button.buttonName}
                                            </Button>
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