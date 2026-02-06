import '../../index.css'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Fuse from 'fuse.js'
import { API_BASE_URL } from '@/config.js'
import { useNavigate } from 'react-router-dom'

import { Search, User, Phone, Mail, Ellipsis, Truck, UserCheck, ArrowLeft } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import ViewProfile from './ViewProfile'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

export default function RehireEmployees() {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all_roles")
  const [statusFilter, setStatusFilter] = useState("all_status")

  const navigate = useNavigate()

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/fetch_employees.php`,
        { withCredentials: true }
      )

      // ONLY NON-ACTIVE EMPLOYEES
      const inactiveEmployees = res.data.filter(
        emp => emp.employment_status !== "Active"
      )

      setEmployees(inactiveEmployees)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  // 🔎 Search + filters
  useEffect(() => {
    //if (!employees.length) return

    const fuse = new Fuse(employees, {
      keys: ["full_name", "employee_code", "contact_number"],
      threshold: 0.3,
    })

    let results = query
      ? fuse.search(query).map(r => r.item)
      : [...employees]

    if (roleFilter !== "all_roles") {
      results = results.filter(emp =>
        emp.position.toLowerCase() === roleFilter.toLowerCase()
      )
    }

    if (statusFilter !== "all_status") {
      results = results.filter(emp =>
        emp.status === statusFilter
      )
    }

    setFilteredEmployees(results)
  }, [query, employees, roleFilter, statusFilter])

    const rehireEmployee = async (employee) => {
        try {
            await axios.patch(
            `${API_BASE_URL}/update_employment_status.php`,
            {
                employee_id: employee.employee_id,
                user_id: employee.user_id,
                employment_status: "Active"
            },
            { withCredentials: true }
            )
            toast.success("Employee rehired successfully!")
            fetchEmployees() // refresh list
        } catch (error) {
            console.error("Rehire failed:", error)
        }
    }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-6 text-primary" /> Loading
      </div>
    )
  }

  const isDriver = (job) =>
    job?.toLowerCase().includes("driver")

  return (
    <main>
      <div className='bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm'>
        <header className='px-6'>
            <div className='flex justify-between items-center'>
                <div>
                    <div className="font-semibold text-lg">Rehire Employee Directory</div>
                    <div className="text-muted-foreground text-sm">
                    Former employees available for reemployment based on company records.
                    </div>
                </div>

                <Button onClick={() => navigate(-1)}>
                    <ArrowLeft/><span className='hidden xxs:block'>Back</span>
                </Button>
            </div>
            

          <div className='flex flex-col sm:flex-row gap-4 pt-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='h-4 w-4 absolute left-3 top-2.5' />
              <input
                className="pl-10 h-9 w-full rounded-md border bg-background"
                placeholder="Search by name, ID, or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filters */}
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
          </div>
        </header>

        <section className='px-6 grid grid-cols-1 xl:grid-cols-2 gap-6'>
          {filteredEmployees.length === 0 ? (
            <div className="col-span-2 text-center text-muted-foreground p-10">
              No inactive employees found.
            </div>
          ) : (
            filteredEmployees.map((employee, index) => {
              const Icon = employee.position === "Driver" ? Truck : User
              const shortName = employee.full_name.slice(0, 2).toUpperCase()

              return (
                <div
                  key={index}
                  className="border rounded-xl p-6 flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                        {shortName}
                      </div>
                      <div>
                        <div className="font-semibold">{employee.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {employee.employee_code}
                        </div>
                      </div>
                    </div>
                    
                    
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <UserCheck className="h-4 w-4" />
                                <span className='hidden xxs:block'>Rehire Employee</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Confirm Rehire</DialogTitle>
                            <DialogDescription>
                                You are about to rehire this employee and return their employment status to active.
                            </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button onClick={() => rehireEmployee(employee)}>Confirm Rehire</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                  </div>

                  <Badge className="w-fit">
                    <Icon className="h-4 w-4 mr-1" />
                    {employee.position}
                  </Badge>

                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {employee.contact_number}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {employee.email || "No email"}
                    </div>
                  </div>

                  {isDriver(employee.position) && (
                    <div className="text-sm">
                      <div className="font-medium">License No.</div>
                      <div className="text-muted-foreground">
                        {employee.license_info}
                      </div>
                    </div>
                  )}

                  <ViewProfile employee={employee} />
                </div>
              )
            })
          )}
        </section>
      </div>
    </main>
  )
}
