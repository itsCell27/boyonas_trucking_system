import '../../index.css'
import MenuHeader from '../../components/MenuHeader'
import StatusCards from '../../components/StatusCards'
import OnLeave from './OnLeave'
import { TrendingDown, Users, Mail, Plus, UserCheck, Phone, User, Search, Moon, Ellipsis, Truck, RotateCcw } from 'lucide-react'
import React, { useState, useEffect } from 'react';
import axios, { Axios } from 'axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddEmployeeDialog } from './AddEmployeeDialog'
import ViewProfile from './ViewProfile'
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Fuse from "fuse.js"
import { API_BASE_URL } from '@/config.js'
import { useNavigate } from 'react-router-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


// Filter by Roles
const roles = [
    {label: "All Roles", value: "all"},
    {label: "Driver", value: "driver"},
    {label: "Helper", value: "helper"}
]

// Filter by Status
const statuses = [
    {label: "All Status", value: "all"},
    {label: "On Duty", value: "on_duty"},
    {label: "Available", value: "available"},
    {label: "Off Duty", value: "off_duty"}
]


function EmployeeManagement() {

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredEmployees, setFilteredEmployees] = useState([])
    const [query, setQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all_roles")
    const [statusFilter, setStatusFilter] = useState("all_status")

    // count deployed employees
    const deployedCount = employees.filter(employee => employee.status === 'Deployed').length;

    // count on leave employees
    const onLeaveCount = employees.filter(employee => employee.status === 'On Leave').length;

    // count idle employees
    const idleCount = employees.filter(employee => employee.status === 'Idle').length;

    const navigate = useNavigate();

    const fetchEmployees = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/fetch_employees.php`,
                { withCredentials: true }
            );

            const activeEmployees = response.data.filter(
                (emp) => emp.employment_status === "Active"
            );

            setEmployees(activeEmployees);
            console.log('Fetched employees:', response.data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEmployees();
    }, []);

    const updateEmployeeStatus = async (employeeId, newStatus) => {
        try {
            const response = await axios.post(
            `${API_BASE_URL}/update_employee_status.php`,
            { employee_id: employeeId, status: newStatus },
            { withCredentials: true }
            );

            if (response.data.success) {
            await fetchEmployees(); // refresh
            } else {
            console.error("Failed to update:", response.data);
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    };


    // Create Fuse instance when employees data changes
    useEffect(() => {
        const fuse = new Fuse(employees, {
            keys: ["full_name", "employee_code", "contact_number"], // searchable fields
            threshold: 0.3, // lower = stricter, higher = fuzzier
        })

        let results = query ? fuse.search(query).map((r) => r.item) : [...employees]

        // Apply role filter
        if (roleFilter !== "all_roles") {
        results = results.filter((emp) =>
            emp.position.toLowerCase() === roleFilter.toLowerCase()
        )
        }

        // Apply status filter
        if (statusFilter !== "all_status") {
        results = results.filter((emp) =>
            emp.status.toLowerCase() === statusFilter.toLowerCase()
        )
        }

        setFilteredEmployees(results)
    }, [query, employees, roleFilter, statusFilter]) // run whenever query or employees change

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner className="size-6 text-primary" /> Loading
            </div>
        )
    }


    // To check if the employee is a driver
    function isDriver(job) {
        if (job.toLowerCase().includes("driver")) {
            return true;
        } else {
                return false;
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
        case "Deployed":
            return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
        case "Idle":
            return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
        case "On Leave":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
        }
    };

    const employeeSummaryCards = [
        {
            title: "Total Employees", 
            value: employees.length, 
            subtitle: "Active workforce", 
            icon: Users, 
            color: "text-chart-1"
        },
        {
            title: "Deployed Personnel", 
            value: deployedCount, 
            subtitle: "Currently working", 
            icon: UserCheck, 
            color: "text-chart-2"
        },
        {
            title: "On Idle", 
            value: idleCount, 
            subtitle: "Waiting to be assigned", 
            icon: Moon, 
            color: "text-chart-3"
        },
        {
            title: "On Leave", 
            value: onLeaveCount, 
            subtitle: "Employees currently on leave", 
            icon: TrendingDown, 
            color: "text-chart-4"
        }
    ]

    const employeeHeaderContent = [
        {
            headerName: "Employee Management",
            headerDescription: "Manage drivers, helpers, and staff",
            headerLink: "/app",
            buttons: [
                // {
                //     buttonName: "Filter",
                //     buttonIcon: Filter,
                //     buttonStyle: "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 border border-foreground/10 bg-background hover:bg-accent hover:text-white rounded-sm"
                // },
                {
                    buttonName: "Rehire Employees",
                    buttonIcon: RotateCcw,
                    onClick: () => navigate('rehire-employees'),
                },
                {
                    hasShadcnDialog: true,
                    dialogName: AddEmployeeDialog,
                    buttonName: "Add Employee",
                    buttonIcon: Plus,
                    onClose: fetchEmployees,
                },
            ]
        }
    ]

    return (
        <>
            <MenuHeader headerData={employeeHeaderContent} />
            <section className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8'>
                    <StatusCards cards={employeeSummaryCards}/>
            </section>
            <main className='grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8'>
                {/* Employee Directory */}
                <section className='lg:col-span-3'>
                    <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm'>
                        <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6'>
                            <div data-slot="card-title" className="leading-none font-semibold">Employee Directory</div>
                            <div data-slot="card-description" className="text-muted-foreground text-sm">
                                Manage employee information and performance
                            </div>
                            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
                                {/* Search Bar*/}
                                <div className='relative flex-1 bg-background'>
                                    <Search className='h-4 w-4 absolute left-3 top-2.5'/>
                                    <input 
                                        data-slot="input" 
                                        className="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive pl-10" 
                                        placeholder="Search by name, ID, or phone..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    ></input>
                                </div>
                                {/* Filters */}
                                <div className='flex gap-4'>
                                    {/* Filter by Roles */}
                                        <Select onValueChange={setRoleFilter}>
                                            <SelectTrigger className="w-max gap-6 bg-background">
                                                <SelectValue placeholder="All Roles" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_roles">All Roles</SelectItem>
                                                <SelectItem value="driver">Driver</SelectItem>
                                                <SelectItem value="helper">Helper</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Filter by Status */}
                                        <Select onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-max gap-6 bg-background">
                                                <SelectValue placeholder="All status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_status">All Status</SelectItem>
                                                <SelectItem value="Deployed">Deployed</SelectItem>
                                                <SelectItem value="Idle">Idle</SelectItem>
                                                <SelectItem value="On Leave">On Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                </div>
                            </div>
                        </header>
                        <main className='px-6'>
                            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                                {/* Employee Status Card Format */}
                                {filteredEmployees.length === 0 ? (
                                    <div className='col-span-2 text-center text-lg text-muted-foreground p-10'>
                                        No employees found.
                                    </div>
                                ) : (
                                    <>
                                        {filteredEmployees.map((employee, index) => {
                                    
                                            let Icon = User;
                                            if (employee.position === "Driver") {
                                                Icon = Truck
                                            }

                                            const shortName = employee.full_name.slice(0, 2).toUpperCase();

                                            return (
                                                <section key={index} className='bg-background text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm hover:shadow-md transition-shadow'>
                                                    <header className='@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 pb-3'>
                                                        <div className='flex items-center justify-between'>
                                                            <div className="flex items-center space-x-3">
                                                                <span data-slot="avatar" className="relative flex size-8 shrink-0 overflow-hidden rounded-full h-12 w-12">
                                                                    <span data-slot="avatar-fallback" className="flex size-full items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">{shortName}</span>
                                                                </span>
                                                                <div>
                                                                    <div data-slot="card-title" className="font-semibold text-lg">{employee.full_name}</div>
                                                                    <div data-slot="card-description" className="text-muted-foreground text-sm">{employee.employee_code}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Badge data-slot="badge">
                                                                    <Icon className='h-4 w-4'/>
                                                                    <span className="ml-1">{employee.position}</span>
                                                                </Badge>
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <button
                                                                        className="
                                                                            h-9 w-9 flex items-center justify-center
                                                                            bg-background border rounded-lg
                                                                            hover:bg-accent hover:text-accent-foreground
                                                                        "
                                                                        >
                                                                        <Ellipsis className="w-5 h-5" />
                                                                        </button>
                                                                    </PopoverTrigger>

                                                                    <PopoverContent
                                                                        align="end"
                                                                        className="w-40 p-2 rounded-lg border bg-background shadow-md"
                                                                    >
                                                                        <div className="flex flex-col space-y-1">

                                                                        {/* Set to Idle */}
                                                                        <button
                                                                            className={`
                                                                            px-3 py-2 text-left rounded-md text-sm
                                                                            ${employee.status !== "On Leave"
                                                                                ? "text-muted-foreground cursor-not-allowed opacity-40"
                                                                                : "hover:bg-accent"}
                                                                            `}
                                                                            disabled={employee.status !== "On Leave"}
                                                                            onClick={() => updateEmployeeStatus(employee.employee_id, "Idle")}
                                                                        >
                                                                            Set to Idle
                                                                        </button>

                                                                        {/* Set to On Leave */}
                                                                        <button
                                                                            className={`
                                                                            px-3 py-2 text-left rounded-md text-sm
                                                                            ${employee.status !== "Idle"
                                                                                ? "text-muted-foreground cursor-not-allowed opacity-40"
                                                                                : "hover:bg-accent"}
                                                                            `}
                                                                            disabled={employee.status !== "Idle"}
                                                                            onClick={() => updateEmployeeStatus(employee.employee_id, "On Leave")}
                                                                        >
                                                                            Set to On Leave
                                                                        </button>

                                                                        </div>
                                                                    </PopoverContent>
                                                                </Popover>

                                                            </div>
                                                        </div>
                                                    </header>
                                                    <div className='flex flex-col justify-between px-6 space-y-4 flex-1'>
                                                        <div className="flex items-center justify-between">
                                                            <span data-slot="badge" className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 ${getStatusColor(employee.status)}`}>
                                                            {employee.status}</span>
                                                            <span data-slot="badge" className="inline-flex sm:hidden items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden border-transparent [a&amp;]:hover:bg-primary/90 bg-primary/10 text-primary">
                                                                <Icon className='h-4 w-4'/>
                                                                <span className="ml-1">{employee.position}</span>
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                                            <div className="flex items-center space-x-2">
                                                                <Phone className='h-4 w-4 text-muted-foreground'/>
                                                                <span>{employee.contact_number}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Mail className='h-4 w-4 text-muted-foreground'/>
                                                                {employee.email ? (
                                                                    <span>{employee.email}</span>
                                                                ) : (
                                                                    <span>No email provided</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm">
                                                            <div className="font-medium">Current Assignment</div>
                                                            <div className="text-muted-foreground">
                                                                {employee.latest_assignment && employee.latest_assignment.dr_number ? (
                                                                    <span>{employee.latest_assignment.dr_number}</span>
                                                                ) : (
                                                                    <span>No current assignment</span>
                                                                )}
                                                            </div>
                                                            <div className="text-muted-foreground">
                                                                {employee.latest_assignment && employee.latest_assignment.plate_number ? (
                                                                    <span>Vehicle: {employee.latest_assignment.plate_number}</span>
                                                                ) : (
                                                                    <span>No vehicle assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {/* Check if the employee is a driver */}
                                                        {isDriver(employee.position) && (
                                                            <div className="text-sm">
                                                                <div className="font-medium">License No.</div>
                                                                <div className="text-muted-foreground">
                                                                    {employee.license_info}
                                                                    {/* <br/>
                                                                    Expires: 
                                                                    <br/> */}
                                                                    {/* {employee.license_expiration ? (
                                                                        <span> {employee.license_expiration}</span>
                                                                    ) : (
                                                                        <span> No expiration date provided</span>
                                                                    )} */}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <div className="font-medium">Date Started</div>
                                                                <div className="text-muted-foreground">{employee.date_started}</div>
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">Years on Team</div>
                                                                <div className="text-muted-foreground">{employee.years_on_team}</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <div className="font-medium">Emergency Contact</div>
                                                            <div>{employee.emergency_contact_number}</div>
                                                        </div>
                                                        {/* Footer Button */}
                                                        <footer className='flex space-x-2 pt-2'>
                                                            <ViewProfile employee={employee} refreshList={fetchEmployees}/>
                                                        </footer>
                                                    </div>
                                                </section>
                                            )
                                        })}
                                    </>
                                )}
                                
                            </div>
                        </main>
                    </div>
                </section>

                {/* On Leave */}
                <OnLeave employees={employees}/>
            </main>
        </>
    )
}

export default EmployeeManagement;