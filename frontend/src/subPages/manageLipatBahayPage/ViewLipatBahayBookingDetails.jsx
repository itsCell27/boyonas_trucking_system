import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  MapPin,
  Calendar,
  Package,
  User,
  FileText,
  Clock,
  Weight,
  Phone,
  Loader2,
  Eye,
  SquarePen,
  Trash2,
} from "lucide-react";

import { DocumentPreview } from "@/components/DocumentPreview";
import { useNavigate } from "react-router-dom";

export default function ViewLipatBahayBookingDetails({
  open,
  onOpenChange,
  bookingId,
  axios,
  API_BASE_URL,
  toast,
}) {
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [documents, setDocuments] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (open && bookingId) loadBookingDetails();
  }, [open, bookingId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/booking_details.php`, {
        params: { booking_id: bookingId },
        withCredentials: true,
      });

      if (data?.success) {
        setBooking(data.booking);
        setAssignment(data.assignment);
        setDocuments(data.documents || []);
      } else {
        toast.error(data?.error || "Failed to load booking details.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while loading booking details.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending Assignment":
        "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",

      "Assigned":
        "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",

      "Completed":
        "bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",

      "Cancelled":
        "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    };

    // Default / Fallback
    return (
      colors[status] ||
      "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
    );
  };

  // document preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleViewDocument = (file) => {
    setSelectedDocument(`${API_BASE_URL}/${file}`);
    setPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lipat Bahay Booking Details</DialogTitle>
            <DialogDescription>
              {booking ? `DR #${booking.dr_number}` : "Loading..."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* STATUS */}
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-muted-foreground">STATUS</h3>
                  <Badge className={`${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </Badge>
                </div>
                <Separator className="mt-2" />
              </div>

              {/* BOOKING INFO */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">
                  BOOKING INFORMATION
                </h3>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  {/* DR Number */}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <FileText className="h-4 w-4" /> <span>DR Number</span>
                    </div>
                    <p className="pl-6 font-medium">{booking.dr_number}</p>
                  </div>

                  {/* Customer */}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <User className="h-4 w-4" /> <span>Customer</span>
                    </div>
                    <p className="pl-6 font-medium">{booking.customer_name || "N/A"}</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Phone className="h-4 w-4" /> <span>Phone</span>
                    </div>
                    <p className="pl-6 font-medium">{booking.phone_number || "N/A"}</p>
                  </div>

                  {/* Service Rate */}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Package className="h-4 w-4" /> <span>Service Rate</span>
                    </div>
                    <p className="pl-6 font-medium">
                      ₱
                      {booking.service_rate
                        ? Number(booking.service_rate).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "0.00"}
                    </p>
                  </div>

                  {/* Weight */}
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Weight className="h-4 w-4" /> <span>Estimated Weight</span>
                    </div>
                    <p className="pl-6 font-medium">
                      {booking.estimated_weight ? `${booking.estimated_weight} kg` : "N/A"}
                    </p>
                  </div>
                </div>

                <Separator className="mt-3" />
              </div>

              {/* ROUTE */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">ROUTE</h3>

                <div className="space-y-3 mt-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="font-medium">{booking.route_from}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="font-medium">{booking.route_to}</p>
                    </div>
                  </div>
                </div>

                <Separator className="mt-3" />
              </div>

              {/* SCHEDULE */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">SCHEDULE</h3>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="h-4 w-4" /> <span>Scheduled Start</span>
                    </div>
                    <p className="pl-6 font-medium">
                      {formatDateTime(booking.scheduled_start)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" /> <span>Deadline</span>
                    </div>
                    <p className="pl-6 font-medium">
                      {formatDateTime(booking.deadline)}
                    </p>
                  </div>
                </div>

                <Separator className="mt-3" />
              </div>

              {/* ASSIGNMENT */}
              {assignment && (
                <div>
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      ASSIGNMENT DETAILS
                    </h3>

                    {booking.status !== "Completed" &&
                      booking.status !== "Cancelled" && (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            navigate(`/app/assignment_lipatbahay/${booking.booking_id}`)
                          }
                        >
                          <SquarePen className="h-4 w-4 mr-1" /> Edit Assignment
                        </Button>
                    )}
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Truck</p>
                        <p className="font-medium">
                          {assignment.plate_number} — {assignment.truck_model}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Driver</p>
                        <p className="font-medium">{assignment.driver_name}</p>
                      </div>

                      {assignment.helper_name && (
                        <div>
                          <p className="text-xs text-muted-foreground">Helper</p>
                          <p className="font-medium">{assignment.helper_name}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-muted-foreground">Current Status</p>
                        <p className="font-medium">{assignment.current_status}</p>
                      </div>
                    </div>

                    {assignment.remarks && (
                      <div>
                        <p className="text-xs text-muted-foreground">Remarks</p>
                        <p className="text-sm">{assignment.remarks}</p>
                      </div>
                    )}
                  </div>

                  <Separator className="mt-3" />
                </div>
              )}

              {/* DOCUMENTS */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground">DOCUMENTS</h3>

                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">
                    No documents uploaded yet.
                  </p>
                ) : (
                  <div className="space-y-2 mt-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4" />
                          <div>
                            <p className="font-medium text-sm">{doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {formatDateTime(doc.date_uploaded)}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(doc.file_path)}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CLOSE BUTTON */}
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No booking data available.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DocumentPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        document={selectedDocument}
      />
    </>
  );
}
