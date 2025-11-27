import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogTrigger, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/config";
import { Truck, Search, ChevronDown, MapPin, User, FileText, Upload, Building2, TrendingUp, Loader2 } from "lucide-react";
import { useDebounce } from "@/lib/use-debounce"; // optional small hook (show below if you don’t have one)
import { toast } from "sonner"; // you already use sonner elsewhere
import UploadDocumentBooking from "./UploadDocumentBooking"; 
import ViewBookingDetails from "./ViewBookingDetails"; 
import { format } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"

const STATUSES = ["Pending Assignment", "Assigned", "Completed", "Cancelled"];

export default function SPXExpressDelivery() {
  // list state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // search & filter
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 250);
  const [statusFilter, setStatusFilter] = useState("");

  // assign dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignBooking, setAssignBooking] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [helpers, setHelpers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedHelper, setSelectedHelper] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // ✅ Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBookingId, setUploadBookingId] = useState(null);
  const [uploadAssignmentId, setUploadAssignmentId] = useState(null);

  // ✅ View details dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBookingId, setViewBookingId] = useState(null);

  // ✅ Open upload dialog for a specific booking
  const openUploadDialog = (booking) => {
    setUploadBookingId(booking.booking_id);
    setUploadAssignmentId(booking.assignment_id || null); // If booking has assignment
    setUploadOpen(true);
  };

  // ✅ Callback after successful upload
  const handleUploadSuccess = () => {
    loadBookings(); // Refresh bookings list
  };

  // ✅ Open view details dialog
  const openViewDialog = (booking) => {
    setViewBookingId(booking.booking_id);
    setViewOpen(true);
  };

  const navigate = useNavigate();

  // alert dialog (when no resources available)
  const [noAvailDlg, setNoAvailDlg] = useState({ open: false, message: "" });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${API_BASE_URL}/get_bookings.php`,
        {
          params: { service_type: "Partnership", status: statusFilter || undefined },
          withCredentials: true,
        }
      );
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fuse = useMemo(() => {
    return new Fuse(bookings, {
      keys: [
        { name: "dr_number", weight: 0.6 },
        { name: "partner_name", weight: 0.4 },
        { name: "route_from", weight: 0.4 },
        { name: "route_to", weight: 0.4 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [bookings]);

  const filtered = useMemo(() => {
    if (!debouncedQ) return bookings;
    return fuse.search(debouncedQ).map(r => r.item);
  }, [bookings, fuse, debouncedQ]);

  const openAssign = async (booking) => {
  setAssignBooking(booking);
  setAssignOpen(true);
  setSelectedDriver("");
  setSelectedHelper("");
  setSelectedTruck("");

  try {
      const response = await axios.get(`${API_BASE_URL}/get_available_employees_and_trucks.php`, {
        withCredentials: true,
      });

      // Validate response type
      if (!response.data || typeof response.data !== "object") {
        console.error("Invalid response from get_available_employees_and_trucks.php:", response.data);
        toast.error("Server returned invalid data. Check backend response.");
        return;
      }

      const { drivers = [], helpers = [], trucks = [] } = response.data;

      setDrivers(drivers);
      setHelpers(helpers);
      setTrucks(trucks);

      // No-available check
      if (trucks.length === 0 || drivers.length === 0) {
        const message =
          trucks.length === 0 && drivers.length === 0
            ? "No available trucks and drivers. You can assign this booking later."
            : trucks.length === 0
            ? "No available trucks right now. You can assign this booking later."
            : "No available drivers right now. You can assign this booking later.";

        setNoAvailDlg({ open: true, message });
      }
    } catch (e) {
      console.error("Error loading available resources:", e);
      toast.error("Failed to load available resources. Check console for details.");
    }
  };

  const submitAssign = async () => {
    if (!assignBooking) return;
    if (!selectedTruck || !selectedDriver) {
      toast.error("Please select a truck and driver.");
      return;
    }

    setAssignLoading(true);
    try {
      const payload = {
        booking_id: assignBooking.booking_id,
        truck_id: Number(selectedTruck),
        driver_id: Number(selectedDriver),
        helper_id: selectedHelper ? Number(selectedHelper) : null,
        remarks: "",
      };
      const { data } = await axios.post(`${API_BASE_URL}/create_assignment.php`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" }
      });

      if (data?.success) {
        toast.success("Assignment created.");
        setAssignOpen(false);
        await loadBookings(); // refresh
      } else {
        toast.error(data?.error || "Failed to create assignment.");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.error || "Server error creating assignment.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Add this near submitAssign / other helper functions
  const cancelBooking = async (booking) => {
    if (!booking) return;
    // Prevent cancelling if already cancelled or completed
    if (booking.status === "Cancelled") {
      toast.info("Booking already cancelled.");
      return;
    }
    if (booking.status === "Completed") {
      toast.error("Cannot cancel a completed booking.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/cancel_booking.php`,
        { booking_id: booking.booking_id },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      if (data?.success) {
        toast.success("Booking cancelled.");
        await loadBookings(); // refresh list so Upload/Cancel become disabled
      } else {
        toast.error(data?.message || "Failed to cancel booking.");
      }
    } catch (e) {
      console.error("Cancel booking error:", e);
      toast.error(e?.response?.data?.message || "Server error cancelling booking.");
    }
  };


  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>SPX Express Delivery Operations</CardTitle>
                <CardDescription>Manage Shopee partnership delivery assignments and tracking</CardDescription>
              </div>
              {/* <Button onClick={() => toast.info("Route to /app/partnership/create or open your create form.")}>
                New Delivery
              </Button> */}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="Search by DR number, route, or partner..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val === "All" ? "" : val)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
                <Spinner className="size-6"/>
                Loading bookings...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-muted-foreground">No bookings found.</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((b) => (
                  <div key={b.booking_id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg grid place-items-center">
                          <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{b.dr_number || `BOOK-${b.booking_id}`}</span>
                            <span className="text-xs border rounded px-2 py-0.5">{b.partner_name || "SPX Express"}</span>
                            <span className="text-xs border rounded px-2 py-0.5">{b.status}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Scheduled Start: {format(new Date(b.scheduled_start), 'MMM d, yyyy, h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                      {b.status === "Pending Assignment" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/app/assignment/${b.booking_id}`)} // ✅ navigate to AssignmentPage
                          >
                            Assign
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openViewDialog(b)}
                          >
                            View
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openViewDialog(b)}
                        >
                          View
                        </Button>
                      )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Route:</span>
                          <span>{b.route_from} → {b.route_to}</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Created by User ID:</span>
                          <span>{b.created_by}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {b.documents == null ? (
                          <span className="text-sm text-muted-foreground">No documents uploaded</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{b.document_count} document(s) uploaded</span>
                        )}
                      </div>
                      {/* Upload and Cancel buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUploadDialog(b)}
                          disabled={b.status === "Cancelled"}
                          title={b.status === "Cancelled" ? "Upload disabled — booking cancelled" : "Upload documents"}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>

                        {/* Cancel Button with Confirmation Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={b.status === "Cancelled" || b.status === "Completed"}
                              className={
                                b.status === "Cancelled"
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            >
                              Cancel
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The booking will be marked as
                                <span className="font-semibold"> Cancelled</span>, and uploading
                                documents for this booking will be disabled permanently.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>Close</AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() => cancelBooking(b)} // <-- calls your function
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Yes, cancel it
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column (kept from your mock) */}
      {/* <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" /> Partner Overview
            </CardTitle>
            <CardDescription>SPX Express partnership performance</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg grid place-items-center">
                  <span className="text-sm font-bold text-primary">SPX</span>
                </div>
                <div>
                  <div className="font-medium">SPX Express (Shopee)</div>
                  <span className="text-xs border rounded px-2 py-0.5">Active</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">₱180K</div>
                <div className="text-xs text-muted-foreground">This month</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Routes Today</span><span>5</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Routes Yesterday</span><span>8</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Routes Tomorrow</span><span>6</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly Total</span><span>120</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-muted-foreground">Active Partner</span><span>SPX Express</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total Routes</span><span>19</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service Type</span><span>E-commerce</span></div>
          </CardContent>
        </Card>
      </div> */}

      {/* Assign Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Assign Resources</DialogTitle>
            <DialogDescription>
              Select an available truck and driver{assignBooking ? ` for DR ${assignBooking.dr_number || assignBooking.booking_id}` : ""}.
            </DialogDescription>
          </DialogHeader>

          {/* Truck */}
          <div className="space-y-2">
            <Label>Truck *</Label>
            <Select value={selectedTruck} onValueChange={setSelectedTruck}>
              <SelectTrigger><SelectValue placeholder="Select a truck" /></SelectTrigger>
              <SelectContent>
                {trucks.map(t => (
                  <SelectItem key={t.truck_id} value={String(t.truck_id)}>
                    {t.plate_number} — {t.model} ({t.capacity} kg)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Driver */}
          <div className="space-y-2">
            <Label>Driver *</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger><SelectValue placeholder="Select a driver" /></SelectTrigger>
              <SelectContent>
                {drivers.map(d => (
                  <SelectItem key={d.employee_id} value={String(d.employee_id)}>
                    {d.full_name} — {d.employee_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Helper */}
          <div className="space-y-2">
            <Label>Helper (optional)</Label>
            <Select value={selectedHelper} onValueChange={setSelectedHelper}>
              <SelectTrigger><SelectValue placeholder="No helper" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">No helper</SelectItem>
                {helpers.map(h => (
                  <SelectItem key={h.employee_id} value={String(h.employee_id)}>
                    {h.full_name} — {h.employee_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={submitAssign} disabled={assignLoading}>
              {assignLoading && <Spinner className="size-6"/>}
              Confirm Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No Availability Alert */}
      <AlertDialog open={noAvailDlg.open}>
        <AlertDialogContent className="backdrop-blur-md bg-background/70 border border-border/50 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Assignment Unavailable</AlertDialogTitle>
            <AlertDialogDescription>{noAvailDlg.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setNoAvailDlg({ open: false, message: "" })}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Document Dialog */}
      <UploadDocumentBooking
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        bookingId={uploadBookingId}
        assignmentId={uploadAssignmentId}
        onUploadSuccess={handleUploadSuccess}
        axios={axios}
        API_BASE_URL={API_BASE_URL}
        toast={toast}
      />

      {/* ✅ View Booking Details Dialog */}
      <ViewBookingDetails
        open={viewOpen}
        onOpenChange={setViewOpen}
        bookingId={viewBookingId}
        axios={axios}
        API_BASE_URL={API_BASE_URL}
        toast={toast}
      />
    </div>
  );
}

/** Optional tiny debounce hook if you don’t have one already (place in /src/lib/use-debounce.tsx) */
// import { useEffect, useState } from "react";
// export function useDebounce(value, delay = 300) {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const id = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(id);
//   }, [value, delay]);
//   return debounced;
