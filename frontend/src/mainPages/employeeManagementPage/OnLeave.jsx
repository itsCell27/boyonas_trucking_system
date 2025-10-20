import '../../index.css'
import { UserRoundX } from 'lucide-react'

const onLeaveEmployees = [
    {
        name: "Maria Cruz",
        position: "Driver",
        contact: "+63 923 432 1098"
    },
    {
        name: "Pedro Cruz",
        position: "Helper",
        contact: "+63 923 432 1098"
    },
    {
        name: "Juan Santos",
        position: "Driver",
        contact: "+63 923 432 1098"
    }
]

export default function OnLeave({ employees }) {

    const onLeaveEmployees = employees.filter(employee => employee.status === 'On Leave');


    return (
        <div className='space-y-6'>
            <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
                <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'>
                    <div className='leading-none font-semibold flex items-center space-x-2'>
                        <UserRoundX className='w-6 h-6'/>
                        <span>On Leave</span>
                    </div>
                </header>
                <main className='px-6'>
                    <div className='space-y-4'>
                        {onLeaveEmployees.length === 0 ? (
                            <div className="text-sm text-muted-foreground w-full text-center p-2 border border-dashed border-foreground/20 rounded-md">
                                No employees are currently on leave.
                            </div>
                        ) : (
                            <>
                                {onLeaveEmployees.map((employee, index) => {
                                    return (
                                        <div key={index} className='flex items-center justify-between border border-foreground/10 rounded-md p-3'>
                                            <div className="space-y-1">
                                                <div className="font-medium text-sm">Name: {employee.full_name}</div>
                                                <div className="text-xs text-muted-foreground">Position: {employee.position}</div>
                                                <div className="text-xs text-muted-foreground">Contact: {employee.contact_number}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        )}
                        
                    </div>
                </main>
            </div>
        </div>
    )
}