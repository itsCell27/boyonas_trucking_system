// src/driverPages/Driver.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Clock, CheckCircle, AlertCircle, LogOut, CircleX, Settings } from "lucide-react";

import BookingDetailModal from "./BookingDetailModal";

export default function DriverPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [pending, setPending] = useState([]);
  const [current, setCurrent] = useState([]);
  const [history, setHistory] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Reusable fetchAssignments
  const fetchAssignments = async () => {
    try {
      const [p, c, h] = await Promise.all([
        axios.get(`${API_BASE_URL}/driver/get_assignments.php?type=pending`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/driver/get_assignments.php?type=current`, { withCredentials: true }),
        axios.get(`${API_BASE_URL}/driver/get_assignments.php?type=history`, { withCredentials: true }),
      ]);

      setPending(p.data.assignments || []);
      setCurrent(c.data.assignments || []);
      setHistory(h.data.assignments || []);
    } catch {
      toast.error("Failed to fetch assignments");
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchEmployee = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/driver/get_employee.php`, {
          withCredentials: true,
        });

        if (resp.data.success) {
          setEmployee(resp.data.employee);
        } else {
          toast.error(resp.data.message || "Cannot fetch employee");
        }
      } catch {
        toast.error("Failed to fetch employee");
      }
    };

    // Initial load
    fetchEmployee();
    fetchAssignments();

    // Auto-refresh every 1 minute
    const interval = setInterval(() => {
      fetchEmployee();
      fetchAssignments();
    }, 60000); // 1 minute = 60,000 ms

    // Cleanup interval on unmount or user change
    return () => clearInterval(interval);
  }, [user]);

  const openAssignment = (assignment) => {
    setSelectedAssignment({
      assignment_id: assignment.assignment_id,
    });
    setModalOpen(true);
  };


  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      const resp = await axios.post(
        `${API_BASE_URL}/driver/update_status.php`,
        { assignment_id: assignmentId, new_status: newStatus },
        { withCredentials: true }
      );

      if (!resp.data.success) {
        toast.error(resp.data.message || "Failed to update status");
        return;
      }

      toast.success("Status updated successfully!");
      await fetchAssignments();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (!employee) {
    return <div className="flex items-center justify-center min-h-screen">Loading…</div>;
  }

  const renderStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case "Completed":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "Cancelled":
        return <CircleX className="h-6 w-6 text-destructive" />;
      default:
        return <Clock className="h-6 w-6 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    const status_color = status.toLowerCase();

    if (status_color.includes("otw to soc")) {
        return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300";
    } else if (status_color.includes("otw to pickup")) {
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    } else if (status_color.includes("otw to destination")) {
        return "bg-blue-200 text-blue-900 dark:bg-blue-950 dark:text-blue-300";
    } else if (status_color.includes("loading")) {
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
    } else if (status_color.includes("unloading")) {
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    } else if (status_color.includes("completed")) {
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    } else if (status_color.includes("incomplete")) {
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300";
    } else if (status_color.includes("scheduled")) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    } else if (status_color.includes("assigned")) {  
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    } else if (status_color.includes("pending")) {  
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    } else if (status_color.includes("cancelled")) {
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    } else {
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-5 p-4 md:p-6">
      <div className="border bg-card shadow rounded-xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">{employee.full_name}</h1>
          <p className="text-sm sm:text-base">
            {employee.position} – {employee.employee_code}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button variant="outline" onClick={() => navigate("settings")}>
            <Settings /> <span className="hidden sm:block">Settings</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 has-[>svg]:px-3">
                <LogOut/> <span className="hidden sm:block">Logout</span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={logout}>Yes</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 md:gap-0">
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="current">Current ({current.length})</TabsTrigger>
          <TabsTrigger value="history">History ({history.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 py-4">
          {pending.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-muted-foreground">No pending bookings</CardContent></Card>
          ) : (
            pending.map((a) => (
              <Card key={a.assignment_id} className="border shadow-md rounded-xl">
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div className="flex gap-3 items-center">
                    {renderStatusIcon(a.current_status)}
                    <div>
                      <CardTitle>{a.dr_number || `ASG-${a.assignment_id}`}</CardTitle>
                      <CardDescription>{a.partner_name || a.customer_name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(a.current_status)} pointer-events-none`}>{a.current_status}</Badge>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Route</p>
                      <p className="font-medium">{a.route_from} → {a.route_to}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Truck</p>
                      <p className="font-medium">{a.plate_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-medium">{a.estimated_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Helper</p>
                      <p className="font-medium">{a.helper_name}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openAssignment(a)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="current" className="space-y-3 py-4">
          {current.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-muted-foreground">No current bookings</CardContent></Card>
          ) : (
            current.map((a) => (
              <Card key={a.assignment_id} className="border shadow-md rounded-xl">
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div className="flex gap-3 items-center">
                    {renderStatusIcon(a.current_status)}
                    <div>
                      <CardTitle>{a.dr_number || `ASG-${a.assignment_id}`}</CardTitle>
                      <CardDescription>{a.partner_name || a.customer_name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(a.current_status)} pointer-events-none`}>{a.current_status}</Badge>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Route</p>
                      <p className="font-medium">{a.route_from} → {a.route_to}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Truck</p>
                      <p className="font-medium">{a.plate_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-medium">{a.estimated_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Helper</p>
                      <p className="font-medium">{a.helper_name}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openAssignment(a)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-3 py-4">
          {history.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-muted-foreground">No completed or cancelled bookings</CardContent></Card>
          ) : (
            history.map((a) => (
              <Card key={a.assignment_id} className="border shadow-md rounded-xl">
                <CardHeader className="pb-2 flex flex-row justify-between items-start">
                  <div className="flex gap-3 items-center">
                    {renderStatusIcon(a.current_status)}
                    <div>
                      <CardTitle>{a.dr_number || `ASG-${a.assignment_id}`}</CardTitle>
                      <CardDescription>{a.partner_name || a.customer_name}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(a.current_status)} pointer-events-none`}>{a.current_status}</Badge>
                </CardHeader>

                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Route</p>
                      <p className="font-medium">{a.route_from} → {a.route_to}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Truck</p>
                      <p className="font-medium">{a.plate_number}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-medium">{a.estimated_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Helper</p>
                      <p className="font-medium">{a.helper_name}</p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => openAssignment(a)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {modalOpen && selectedAssignment && (
        <BookingDetailModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          assignmentId={selectedAssignment.assignment_id}
          onStatusChange={(newStatus) =>
            handleStatusChange(selectedAssignment.assignment_id, newStatus)
          }
        />
      )}
    </div>
  );
}
