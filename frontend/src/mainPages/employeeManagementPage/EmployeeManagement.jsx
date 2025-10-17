import '../../index.css'
import MenuHeader from '../../components/MenuHeader'
import SummaryCards from '../../components/SummaryCards'
import OnLeave from './OnLeave'
import { TrendingDown, Users, Filter, Plus, UserCheck, MapPin, Phone, User, Search, ChevronDown, Ellipsis, Truck } from 'lucide-react'
import React, { useState } from 'react'

const employeeHeaderContent = [
    {
        headerName: "Employee Management",
        headerDescription: "Manage drivers, helpers, and staff",
        headerLink: "/app",
        buttons: [
            {
                buttonName: "Filter",
                buttonIcon: Filter,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
            },
            {
                buttonName: "Add Employee",
                buttonIcon: Plus,
                buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary hover:bg-primary/90 hover:text-white rounded-sm"
            }
        ]
    }
]

const employeeSummaryCards = [
    {
        title: "Total Employees", 
        value: 24, 
        iconColor: "#002445", 
        icon: Users, 
        description: "Active workforce"
    },
    {
        title: "Deployed Personnel", 
        value: 8, 
        iconColor: "#00a63e", 
        icon: UserCheck, 
        description: "Currently working"
    },
    {
        title: "On Leave", 
        value: 3, 
        iconColor: "#f14d4c", 
        icon: TrendingDown, 
        description: "Employees currently on leave"
    }
]

const employeesData = [
    {
        name: "Juan Santos",
        shortName: "JS",
        id: "EMP-001",
        phone: "+63 917 123 4567",
        email: "juan.santos@boyonas.com",
        status: "On Duty",
        statusColor: "green",
        job: "Driver",
        jobColor: "primary",
        jobIcon: Truck,
        currentAssignment: "DEL-001 - Flash Express",
        license: "N01-12-345678",
        licenseExpiration: "Dec 2025",
        vehicle: "ABC-1234",
        dateStarted: "Jan 1, 2016",
        yearsOnTeam: "9 years",
        emergencyContact: "Maria Santos - +63 918 987 6543"
    },
    {
        name: "Pedro Cruz",
        shortName: "PC",
        id: "EMP-006",
        phone: "+63 922 678 9012",
        email: "pedro.cruz@boyonas.com",
        status: "On Duty",
        statusColor: "green",
        job: "Helper",
        jobColor: "red",
        jobIcon: User,
        currentAssignment: "LB-046 - Lipat Bahay",
        license: "",
        licenseExpiration: "",
        vehicle: "JKL-7890",
        dateStarted: "Jan 1, 2017",
        yearsOnTeam: "8 years",
        emergencyContact: "Carmen Cruz - +63 923 432 1098"
    }
]

// Filter by Roles
const roles = [
    {label: "All Roles", value: "all"},
    {label: "Driver", value: "driver"},
    {label: "Helper", value: "helper"}
]

// Filter by Status
const status = [
    {label: "All Status", value: "all"},
    {label: "On Duty", value: "on_duty"},
    {label: "Available", value: "available"},
    {label: "Off Duty", value: "off_duty"}
]


function EmployeeManagement() {

    const [openFilter, setOpenFilter] = useState(null);

    const [selectedRole, setSelectedRole] = useState("All Roles");
    const [selectedStatus, setSelectedStatus] = useState("All Status");

    const toggleFilter = (filterName) => {
        setOpenFilter(openFilter === filterName ? null : filterName);
    };

    const handleSelect = (filterName, value, setter) => {
        setter(value);
        setOpenFilter(null);
    };

    // To check if the employee is a driver
    function isDriver(job) {
        if (job.toLowerCase().includes("driver")) {
            return true;
        } else {
            return false;
        }
    }

    return (
        <>
            <MenuHeader headerData={employeeHeaderContent} />
            <section className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8'>
                    <SummaryCards cards={employeeSummaryCards}/>
            </section>
            <main className='grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8'>
                {/* Employee Directory */}
                <section className='lg:col-span-3'>
                    <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
                        <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'>
                            <div data-slot="card-title" className="leading-none font-semibold">Employee Directory</div>
                            <div data-slot="card-description" className="text-muted-foreground text-sm">
                                Manage employee information, assignments, and performance
                            </div>
                            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                                {/* Search Bar*/}
                                <div className='relative flex-1'>
                                    <Search className='h-4 w-4 absolute left-3 top-2.5'/>
                                    <input data-slot="input" className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-10" placeholder="Search by name, ID, or phone..."></input>
                                </div>
                                {/* Filter by Roles */}
                                <div className="relative">
                                    <button onClick={() => toggleFilter('role')} className="flex justify-between items-center bg-white border border-foreground/10 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:transparent focus:transparent w-full sm:w-auto sm:min-w-[150px]">
                                        <span className='mr-8'>{selectedRole}</span>
                                        <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${openFilter === 'role' ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {openFilter === 'role' && (
                                        <ul className="absolute top-10 left-0 mt-1 w-full bg-white border border-foreground/10 rounded-md shadow-md z-10 p-1">
                                        {roles.map((role, index) => (
                                            <li key={index} onClick={() => handleSelect('role', role.label, setSelectedRole)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent hover:text-white cursor-pointer rounded-md">
                                                {role.label}
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                                </div>

                                {/* Filter by Status */}
                                <div className="relative">
                                    <button onClick={() => toggleFilter('status')} className="flex justify-between items-center bg-white border border-foreground/10 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:transparent focus:transparent w-full sm:w-auto sm:min-w-[150px]">
                                        <span className='mr-8'>{selectedStatus}</span>
                                        <ChevronDown
                                        className={`w-4 h-4 transition-transform duration-200 ${openFilter === 'status' ? "rotate-180" : ""}`}
                                        />
                                    </button>
                                    {openFilter === 'status' && (
                                        <ul className="absolute top-10 left-0 mt-1 w-full bg-white border border-foreground/10 rounded-md shadow-md z-10 p-1">
                                        {status.map((item, index) => (
                                            <li key={index} onClick={() => handleSelect('status', item.label, setSelectedStatus)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent hover:text-white cursor-pointer rounded-md">
                                                {item.label}
                                            </li>
                                        ))}
                                        </ul>
                                    )}
                                </div>

                            </div>
                        </header>
                        <main className='px-6'>
                            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                {/* Employee Status Card Format */}
                                {employeesData.map((employee, index) => {
                                    const Icon = employee.jobIcon;
                                    return (
                                        <section key={index} className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm hover:shadow-md transition-shadow'>
                                            <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-3'>
                                                <div className='flex items-center justify-between'>
                                                    <div className="flex items-center space-x-3">
                                                        <span data-slot="avatar" className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-12 w-12">
                                                            <span data-slot="avatar-fallback" className="flex size-full items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{employee.shortName}</span>
                                                        </span>
                                                        <div>
                                                            <div data-slot="card-title" className="font-semibold text-lg">{employee.name}</div>
                                                            <div data-slot="card-description" className="text-muted-foreground text-sm">{employee.id}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span data-slot="badge" className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 bg-primary/10 text-primary">
                                                            <Icon className='h-4 w-4'/>
                                                            <span className="ml-1">{employee.job}</span>
                                                        </span>
                                                        <button data-slot="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9">
                                                            <Ellipsis className='w-4 h-4'/>
                                                        </button>
                                                    </div>
                                                </div>
                                            </header>
                                            <div className='flex flex-col justify-between px-6 space-y-4 flex-1'>
                                                <div className="flex items-center justify-between">
                                                    <span data-slot="badge" className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                                    {employee.status}</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Phone className='h-4 w-4 text-muted-foreground'/>
                                                        <span>{employee.phone}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className='h-4 w-4 text-muted-foreground'/>
                                                        <span className="truncate">{employee.email}</span>
                                                    </div>
                                                </div>
                                                <div className="text-sm">
                                                    <div className="font-medium">Current Assignment</div>
                                                    <div className="text-muted-foreground">{employee.currentAssignment}</div>
                                                    <div className="text-muted-foreground">{employee.vehicle}</div>
                                                </div>
                                                {/* Check if the employee is a driver */}
                                                {isDriver(employee.job) && (
                                                    <div className="text-sm">
                                                        <div className="font-medium">License</div>
                                                        <div className="text-muted-foreground">{employee.license} • Expires: {employee.licenseExpiration}</div>
                                                    </div>
                                                )}
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <div className="font-medium">Date Started</div>
                                                        <div className="text-muted-foreground">{employee.dateStarted}</div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">Years on Team</div>
                                                        <div className="text-muted-foreground">{employee.yearsOnTeam}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    <div className="font-medium">Emergency Contact</div>
                                                    <div>{employee.emergencyContact}</div>
                                                </div>
                                                {/* Footer Button */}
                                                <footer className='flex space-x-2 pt-2'>
                                                    <button className='bg-transparent text-sm font-md whitespace-nowrap inline-flex items-center rounded-md px-6 gap-1.5 h-8 border border-foreground/20 hover:bg-accent hover:text-accent-foreground'>
                                                        View Profile
                                                    </button>
                                                </footer>
                                            </div>
                                        </section>
                                    )
                                })}
                            </div>
                        </main>
                    </div>
                </section>

                {/* On Leave */}
                <OnLeave />
            </main>
        </>
    )
}

export default EmployeeManagement;