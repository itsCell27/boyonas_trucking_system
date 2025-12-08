import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/config"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

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
} from "@/components/ui/alert-dialog"
import { useLocation } from "react-router-dom";

export default function AssignmentPage() {
  const navigate = useNavigate()
  const { booking_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [selectedTruck, setSelectedTruck] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedHelper, setSelectedHelper] = useState(null)
  const [booking, setBooking] = useState(null)

  const [noAvailableDialog, setNoAvailableDialog] = useState({ open: false, message: "" })

  // to check if navigated from create delivery page
  const location = useLocation();
  const fromCreateDelivery = location.state?.fromCreateDelivery || false;

  // fetch available trucks and employees
  const [drivers, setDrivers] = useState([])
  const [helpers, setHelpers] = useState([])
  const [availableTrucks, setAvailableTrucks] = useState([])

  const fetchAvailable = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_available_employees_and_trucks.php`, {
        withCredentials: true,
      });

      const { employees = [], trucks = [] } = response.data;

      const fetchedDrivers = employees.filter((emp) => emp.position === "Driver");
      const fetchedHelpers = employees.filter((emp) => emp.position === "Helper");

      setDrivers(fetchedDrivers);
      setHelpers(fetchedHelpers);
      setAvailableTrucks(trucks);

      // Check availability and show dialog if needed
      if (trucks.length === 0 || fetchedDrivers.length === 0) {
        const message =
          trucks.length === 0 && fetchedDrivers.length === 0
            ? "There are no available trucks and drivers at the moment. You can assign this booking later."
            : trucks.length === 0
            ? "There are no available trucks right now. You can assign this booking later."
            : "There are no available drivers right now. You can assign this booking later.";

        setNoAvailableDialog({ open: true, message });
      }
    } catch (error) {
      console.error("Error fetching available employees/trucks:", error);
      toast.error("Failed to load available resources.");
    }
  };

  // fetch specific booking
  const fetchBooking = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/get_partnership_bookings.php?booking_id=${booking_id}`,
        { withCredentials: true }
      );
      
      if (response.data && !response.data.error) {
        setBooking(response.data);
        console.log("Loaded booking:", response.data);
      } else {
        toast.error("Booking not found!");
        navigate("/app/partnership");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      toast.error("Error fetching booking details.");
      navigate("/app/partnership");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchAvailable(), fetchBooking()]);
        // Optional smooth delay
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (booking_id) {
      loadData();
    } else {
      toast.error("Invalid booking ID");
      navigate("/app/partnership");
    }
  }, [booking_id]);

  // Filter trucks by weight capacity + show dialog if none fit
  useEffect(() => {
    if (!booking || availableTrucks.length === 0) return;

    const requiredWeight = Number(booking.estimated_weight || 0);

    // Filter only trucks that can carry the load
    const trucksThatFit = availableTrucks.filter(
      (t) => Number(t.capacity) >= requiredWeight
    );

    // Update UI to only show filtered trucks
    setAvailableTrucks(trucksThatFit);

    if (trucksThatFit.length === 0) {
      setNoAvailableDialog({
        open: true,
        message: `No available trucks can carry the required weight of ${requiredWeight} kg.`
      });
    }
  }, [booking, availableTrucks.length]);



  const handleAssign = async () => {
    if (!selectedTruck || !selectedDriver) {
      toast.error("Please select a truck and driver");
      return;
    }

    setAssigning(true);
    try {
      const payload = {
        booking_id: Number(booking_id),
        truck_id: Number(selectedTruck),
        driver_id: Number(selectedDriver),
        helper_id: selectedHelper ? Number(selectedHelper) : null,
        remarks: "",
      };

      const { data } = await axios.post(
        `${API_BASE_URL}/create_assignment.php`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        }
      );

      if (data?.success) {
        toast.success("Assignment created successfully!");
        navigate("/app/partnership");
      } else {
        toast.error(data?.error || "Failed to create assignment.");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast.error(error?.response?.data?.error || "Server error creating assignment.");
    } finally {
      setAssigning(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Spinner className="h-6 w-6 mb-2" />
        <p>Loading booking details...</p>
      </div>
    );
  }

  // Show error state if booking not loaded
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p>Booking not found</p>
        <Button onClick={() => navigate("/app/partnership")} className="mt-4">
          Back to Partnership
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Alert Dialog */}
      <AlertDialog open={noAvailableDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assignment Unavailable</AlertDialogTitle>
            <AlertDialogDescription>{noAvailableDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setNoAvailableDialog({ open: false, message: "" })
                navigate("/app/partnership")
              }}
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Assign Driver & Truck</h1>
            <p className="text-muted-foreground">Booking #{booking_id}</p>
          </div>

          {/* Booking Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partner</span>
                <span className="font-medium">{booking.partner_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">
                  {booking.route_from || "?"} → {booking.route_to || "?"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{booking.estimated_weight || 0} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">DR Number</span>
                <span className="font-medium">{booking.dr_number || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled Start</span>
                <span className="font-medium">
                  {booking.scheduled_start ? new Date(booking.scheduled_start).toLocaleString() : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Assignment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Select Resources</CardTitle>
              <CardDescription>Assign a truck and driver to this booking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Truck Selection */}
              <div className="space-y-3">
                <Label>Select Truck *</Label>
                <div className="space-y-2">
                  {availableTrucks.length > 0 ? (
                    availableTrucks.map((truck) => (
                      <div
                        key={truck.truck_id}
                        onClick={() => setSelectedTruck(truck.truck_id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTruck === truck.truck_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{truck.plate_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {truck.model} • {truck.capacity} kg capacity
                            </p>
                          </div>
                          {selectedTruck === truck.truck_id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No available trucks</p>
                  )}
                </div>
              </div>

              {/* Driver Selection */}
              <div className="space-y-3">
                <Label>Select Driver *</Label>
                <div className="space-y-2">
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div
                        key={driver.employee_id}
                        onClick={() => setSelectedDriver(driver.employee_id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedDriver === driver.employee_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{driver.full_name}</p>
                            <p className="text-sm text-muted-foreground">{driver.employee_code}</p>
                          </div>
                          {selectedDriver === driver.employee_id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No drivers available</p>
                  )}
                </div>
              </div>

              {/* Helper Selection (Optional) */}
              <div className="space-y-3">
                <Label>Select Helper (Optional)</Label>
                <div className="space-y-2">
                  <div
                    onClick={() => setSelectedHelper(null)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedHelper === null ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">No Helper</p>
                      {selectedHelper === null && <Check className="h-5 w-5 text-primary" />}
                    </div>
                  </div>
                  {helpers.length > 0 &&
                    helpers.map((helper) => (
                      <div
                        key={helper.employee_id}
                        onClick={() => setSelectedHelper(helper.employee_id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedHelper === helper.employee_id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{helper.full_name}</p>
                            <p className="text-sm text-muted-foreground">{helper.employee_code}</p>
                          </div>
                          {selectedHelper === helper.employee_id && <Check className="h-5 w-5 text-primary" />}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-transparent" 
                  onClick={() => navigate("/app/partnership")}
                  disabled={assigning}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {fromCreateDelivery ? "Assign Later" : "Back"}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleAssign}
                  disabled={assigning || !selectedTruck || !selectedDriver}
                >
                  {assigning ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      Confirm Assignment
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}