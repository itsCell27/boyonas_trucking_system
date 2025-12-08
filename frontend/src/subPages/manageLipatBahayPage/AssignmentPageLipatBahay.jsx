import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction
} from "@/components/ui/alert-dialog";

export default function AssignmentPageLipatBahay() {
  const navigate = useNavigate();
  const { booking_id } = useParams();
  const location = useLocation();
  const fromCreateDelivery = location.state?.fromCreateDelivery || false;

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);

  const [booking, setBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [availableTrucks, setAvailableTrucks] = useState([]);

  const [noAvailableDialog, setNoAvailableDialog] = useState({
    open: false,
    message: ""
  });

  // FETCH available trucks & employees
  const fetchAvailable = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_available_employees_and_trucks.php`, {
        withCredentials: true,
      });

      const { employees = [], trucks = [] } = res.data;

      setDrivers(employees.filter((emp) => emp.position === "Driver"));
      setHelpers(employees.filter((emp) => emp.position === "Helper"));
      setAvailableTrucks(trucks);

      if (trucks.length === 0 || employees.filter(e => e.position === "Driver").length === 0) {
        setNoAvailableDialog({
          open: true,
          message:
            trucks.length === 0
              ? "There are no available trucks right now."
              : "There are no available drivers at the moment."
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load resources.");
    }
  };

  // FETCH LipatBahay booking info
  const fetchBooking = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/get_lipatbahay_booking.php?booking_id=${booking_id}`,
        { withCredentials: true }
      );

      if (res.data && !res.data.error) {
        setBooking(res.data);
      } else {
        toast.error("Booking not found");
        navigate("/app/lipat-bahay");
      }
    } catch (err) {
      toast.error("Failed to load booking");
      navigate("/app/lipat-bahay");
    }
  };

  // Load everything
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchAvailable(), fetchBooking()]);
      setLoading(false);
    };

    if (booking_id) load();
    else {
      toast.error("Invalid booking ID");
      navigate("/app/lipat-bahay");
    }
  }, [booking_id]);

  // Weight → Truck Capacity Filtering + Validation
  useEffect(() => {
    if (!booking || availableTrucks.length === 0) return;

    const requiredWeight = Number(booking.estimated_weight || 0);

    // Filter trucks that can carry the required weight
    const trucksThatFit = availableTrucks.filter(
      (t) => Number(t.capacity) >= requiredWeight
    );

    // Update the trucks shown on the UI
    setAvailableTrucks(trucksThatFit);

    if (trucksThatFit.length === 0) {
      setNoAvailableDialog({
        open: true,
        message: `No available trucks can carry ${requiredWeight} kg.`
      });
    }
  }, [booking, availableTrucks.length]);


  // Final assignment submit
  const handleAssign = async () => {
    if (!selectedTruck || !selectedDriver) {
      toast.error("Select a truck and driver.");
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

      const res = await axios.post(
        `${API_BASE_URL}/create_assignment.php`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data?.success) {
        toast.success("Assignment created!");
        navigate("/app/lipat-bahay");
      } else {
        toast.error(res.data?.error || "Failed to assign.");
      }
    } catch (err) {
      toast.error("Assignment error.");
    } finally {
      setAssigning(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Spinner className="h-6 w-6 mb-2" />
        <p>Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p>Booking not found</p>
        <Button onClick={() => navigate("/app/lipat-bahay")} className="mt-4">
          Back to Lipat Bahay
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* ALERT DIALOG */}
      <AlertDialog open={noAvailableDialog.open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assignment Unavailable</AlertDialogTitle>
            <p>{noAvailableDialog.message}</p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setNoAvailableDialog({ open: false, message: "" });
                navigate("/app/lipat-bahay");
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MAIN CONTENT */}
      <div className="min-h-screen p-4 md:p-8 bg-background">
        <div className="max-w-2xl mx-auto">

          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Assign Driver & Truck</h1>
            <p className="text-muted-foreground">Booking #{booking_id}</p>
          </div>

          {/* BOOKING SUMMARY */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{booking.customer_name || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium">{booking.phone_number || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Route</span>
                <span className="font-medium">
                  {booking.route_from} → {booking.route_to}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{booking.estimated_weight} kg</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Rate</span>
                <span className="font-medium">₱{booking.service_rate}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">DR Number</span>
                <span className="font-medium">{booking.dr_number}</span>
              </div>
            </CardContent>
          </Card>

          {/* ASSIGNMENT FORM */}
          <Card>
            <CardHeader>
              <CardTitle>Select Resources</CardTitle>
              <CardDescription>Select truck, driver, helper</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* TRUCKS */}
              <div>
                <Label>Select Truck *</Label>
                <div className="space-y-2 mt-2">
                  {availableTrucks.map((t) => (
                    <div
                      key={t.truck_id}
                      onClick={() => setSelectedTruck(t.truck_id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        selectedTruck === t.truck_id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{t.plate_number}</p>
                          <p className="text-sm text-muted-foreground">{t.capacity} kg capacity</p>
                        </div>
                        {selectedTruck === t.truck_id && <Check />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DRIVERS */}
              <div>
                <Label>Select Driver *</Label>
                <div className="space-y-2 mt-2">
                  {drivers.map((d) => (
                    <div
                      key={d.employee_id}
                      onClick={() => setSelectedDriver(d.employee_id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        selectedDriver === d.employee_id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{d.full_name}</p>
                          <p className="text-sm text-muted-foreground">{d.employee_code}</p>
                        </div>
                        {selectedDriver === d.employee_id && <Check />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* HELPERS */}
              <div>
                <Label>Helper (Optional)</Label>
                <div className="space-y-2 mt-2">

                  <div
                    onClick={() => setSelectedHelper(null)}
                    className={`p-4 border-2 rounded-lg cursor-pointer ${
                      selectedHelper === null
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">No Helper</p>
                      {selectedHelper === null && <Check />}
                    </div>
                  </div>

                  {helpers.map((h) => (
                    <div
                      key={h.employee_id}
                      onClick={() => setSelectedHelper(h.employee_id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer ${
                        selectedHelper === h.employee_id
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{h.full_name}</p>
                          <p className="text-sm text-muted-foreground">{h.employee_code}</p>
                        </div>
                        {selectedHelper === h.employee_id && <Check />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/app/lipat-bahay")}
                >
                  <ArrowLeft className="mr-2" />
                  {fromCreateDelivery ? "Assign Later" : "Back"}
                </Button>

                <Button
                  className="flex-1"
                  disabled={!selectedTruck || !selectedDriver || assigning}
                  onClick={handleAssign}
                >
                  {assigning ? (
                    <>
                      <Spinner className="mr-2" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      Confirm Assignment <Check className="ml-2" />
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
