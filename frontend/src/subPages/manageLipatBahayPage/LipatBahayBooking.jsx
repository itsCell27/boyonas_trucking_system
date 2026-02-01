import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/config";
import {
  House,
  Search,
  MapPin,
  User,
  FileText,
  Upload,
  Phone,
  Package,
} from "lucide-react";
import { useDebounce } from "@/lib/use-debounce";
import { toast } from "sonner";
import UploadDocumentLipatBahay from "./UploadDocumentLipatBahay";
import ViewLipatBahayBookingDetails from "./ViewLipatBahayBookingDetails";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

const STATUSES = ["Pending Assignment", "Assigned", "Completed", "Cancelled"];

export default function LipatBahayBooking() {
  // list state
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // search & filter
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 250);
  const [statusFilter, setStatusFilter] = useState("");

  // Upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBookingId, setUploadBookingId] = useState(null);
  const [uploadAssignmentId, setUploadAssignmentId] = useState(null);

  // View details dialog state
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBookingId, setViewBookingId] = useState(null);

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    const colors = {
      "Pending Assignment":
        "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",

      Assigned:
        "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",

      Ongoing:
        "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",

      Completed:
        "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",

      Cancelled:
        "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    };

    return (
      colors[status] ||
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
    );
  };

  // alert dialog (when no resources available – reused for messages if needed)
  const [noAvailDlg, setNoAvailDlg] = useState({ open: false, message: "" });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE_URL}/get_bookings.php`, {
        params: {
          service_type: "LipatBahay",
          status: statusFilter || undefined,
        },
        withCredentials: true,
      });
      setBookings(Array.isArray(data) ? data : []);
      
    } catch (e) {
      console.error(e);
      toast.error("Failed to load Lipat Bahay bookings.");
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
        { name: "dr_number", weight: 0.5 },
        { name: "customer_name", weight: 0.4 },
        { name: "phone_number", weight: 0.3 },
        { name: "route_from", weight: 0.3 },
        { name: "route_to", weight: 0.3 },
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [bookings]);

  const filtered = useMemo(() => {
    if (!debouncedQ) return bookings;
    return fuse.search(debouncedQ).map((r) => r.item);
  }, [bookings, fuse, debouncedQ]);

  // Upload dialog
  const openUploadDialog = (booking) => {
    setUploadBookingId(booking.booking_id);
    setUploadAssignmentId(booking.assignment_id || null);
    setUploadOpen(true);
  };

  const handleUploadSuccess = () => {
    loadBookings();
  };

  // View details dialog
  const openViewDialog = (booking) => {
    setViewBookingId(booking.booking_id);
    setViewOpen(true);
  };

  // Cancel booking
  const cancelBooking = async (booking) => {
    if (!booking) return;

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
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (data?.success) {
        toast.success("Booking cancelled.");
        await loadBookings();
      } else {
        toast.error(data?.message || "Failed to cancel booking.");
      }
    } catch (e) {
      console.error("Cancel booking error:", e);
      toast.error(
        e?.response?.data?.message || "Server error cancelling booking."
      );
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <CardTitle>Lipat Bahay Operations</CardTitle>
                  <CardDescription>
                    Manage household moving bookings, assignments, and documents
                  </CardDescription>
                </div>
                {/* Optional: New Booking button */}
                {/* <Button onClick={() => navigate("/app/lipatbahay/create")}>
                  New Booking
                </Button> */}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search by DR number, customer, phone, or route..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={(val) =>
                    setStatusFilter(val === "All" ? "" : val)
                  }
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
                  <Spinner className="size-6" />
                  Loading Lipat Bahay bookings...
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-muted-foreground">
                  No Lipat Bahay bookings found.
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((b) => (
                    <div
                      key={b.booking_id}
                      className="border rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-3"
                    >
                      {/* Top row: icon + DR + status + basic info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg grid place-items-center">
                            <House className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                {b.dr_number || `LB-${b.booking_id}`}
                              </span>
                              <span className="text-xs border rounded px-2 py-0.5">
                                {b.service_type || "Lipat Bahay"}
                              </span>
                              <span
                                className={`text-xs border rounded px-2 py-0.5 ${getStatusColor(
                                  b.status
                                )}`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Scheduled Start:{" "}
                              {b.scheduled_start
                                ? format(
                                    new Date(b.scheduled_start),
                                    "MMM d, yyyy, h:mm a"
                                  )
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {b.status === "Pending Assignment" ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(`/app/assignment_lipatbahay/${b.booking_id}`)
                                }
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

                      {/* Middle grid: route, service rate, customer + phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Route:</span>
                            <span>
                              {b.route_from} → {b.route_to}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Weight:</span>
                            <span>{b.estimated_weight} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Service Rate:</span>
                            <span>
                              ₱
                              {b.service_rate !== undefined &&
                              b.service_rate !== null
                                ? Number(b.service_rate).toLocaleString(
                                    "en-PH",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )
                                : "0.00"}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Customer:</span>
                            <span>{b.customer_name || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{b.phone_number || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Created by:</span>
                            <span>{b.created_by}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom row: documents + upload/cancel */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {b.documents == null ? (
                            <span className="text-sm text-muted-foreground">
                              No documents uploaded
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {b.document_count} document
                              {b.document_count === 1 ? "" : "s"} uploaded
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openUploadDialog(b)}
                            disabled={b.status === "Cancelled"}
                            title={
                              b.status === "Cancelled"
                                ? "Upload disabled — booking cancelled"
                                : "Upload documents"
                            }
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={
                                  b.status === "Cancelled" ||
                                  b.status === "Completed"
                                }
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
                                <AlertDialogTitle>
                                  Cancel this booking?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The booking will
                                  be marked as{" "}
                                  <span className="font-semibold">
                                    Cancelled
                                  </span>
                                  , and uploading documents for this booking
                                  will be disabled permanently.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Close</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => cancelBooking(b)}
                                  className="bg-destructive text-white hover:bg-destructive/80"
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
      </div>

      {/* Upload Document Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Attach delivery, proof of service, or billing documents to this
              booking.
            </DialogDescription>
          </DialogHeader>
          {uploadBookingId && (
            <UploadDocumentLipatBahay
              open={uploadOpen}
              onOpenChange={setUploadOpen}
              bookingId={uploadBookingId}
              assignmentId={uploadAssignmentId}
              axios={axios}
              API_BASE_URL={API_BASE_URL}
              toast={toast}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ⭐ VIEW DETAILS DIALOG — LIPAT BAHAY VERSION */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {viewBookingId && (
            <ViewLipatBahayBookingDetails
              open={viewOpen}
              onOpenChange={setViewOpen}
              bookingId={viewBookingId}
              axios={axios}
              API_BASE_URL={API_BASE_URL}
              toast={toast}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Generic info dialog (kept from SPX pattern, optional to use) */}
      <AlertDialog
        open={noAvailDlg.open}
        onOpenChange={(open) =>
          !open && setNoAvailDlg({ open: false, message: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notice</AlertDialogTitle>
            <AlertDialogDescription>
              {noAvailDlg.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setNoAvailDlg({ open: false, message: "" })}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
