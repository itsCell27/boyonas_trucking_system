import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  MapPin,
  Calendar,
  Package,
  User,
  FileText,
  Clock,
  Weight,
  Building2,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { DocumentPreview } from "@/components/DocumentPreview"; 

export default function ViewBookingDetails({
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

  useEffect(() => {
    if (open && bookingId) {
      loadBookingDetails();
    }
  }, [open, bookingId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/booking_details.php`,
        {
          params: { booking_id: bookingId },
          withCredentials: true,
        }
      );

      if (data?.success) {
        setBooking(data.booking);
        setAssignment(data.assignment);
        setDocuments(data.documents || []);
      } else {
        toast.error(data?.error || "Failed to load booking details.");
      }
    } catch (error) {
      console.error("Error loading booking details:", error);
      toast.error(
        error?.response?.data?.error || "Server error loading booking details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Pending Assignment": "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
      "Assigned": "bg-blue-500/10 text-blue-700 border-blue-500/20",
      "Completed": "bg-green-500/10 text-green-700 border-green-500/20",
      "Cancelled": "bg-red-500/10 text-red-700 border-red-500/20",
    };
    return colors[status] || "bg-gray-500/10 text-gray-700 border-gray-500/20";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleViewDocument = (filePath) => {
    const url = `${API_BASE_URL}/${filePath}`;
    setSelectedDocument(url);
    setPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              {booking ? `DR #${booking.dr_number || booking.booking_id}` : "Loading..."}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : booking ? (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">STATUS</h3>
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                <Separator />
              </div>

              {/* Booking Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">BOOKING INFORMATION</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>DR Number</span>
                    </div>
                    <p className="text-sm font-medium pl-6">{booking.dr_number || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <span>Partner</span>
                    </div>
                    <p className="text-sm font-medium pl-6">{booking.partner_name || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>Category</span>
                    </div>
                    <p className="text-sm font-medium pl-6">{booking.category || "N/A"}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Weight className="h-4 w-4" />
                      <span>Estimated Weight</span>
                    </div>
                    <p className="text-sm font-medium pl-6">
                      {booking.estimated_weight ? `${booking.estimated_weight} kg` : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Route Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">ROUTE INFORMATION</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-sm font-medium">{booking.route_from || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">To</p>
                      <p className="text-sm font-medium">{booking.route_to || "N/A"}</p>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Schedule Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">SCHEDULE</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Scheduled Start</span>
                    </div>
                    <p className="text-sm font-medium pl-6">
                      {formatDateTime(booking.scheduled_start)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Deadline</span>
                    </div>
                    <p className="text-sm font-medium pl-6">
                      {formatDateTime(booking.deadline)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Date Created</span>
                    </div>
                    <p className="text-sm font-medium pl-6">
                      {formatDateTime(booking.date_created)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Created By</span>
                    </div>
                    <p className="text-sm font-medium pl-6">User #{booking.created_by}</p>
                  </div>
                </div>
                <Separator />
              </div>

              {/* Assignment Information */}
              {assignment && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">ASSIGNMENT DETAILS</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="h-4 w-4" />
                          <span>Truck</span>
                        </div>
                        <p className="text-sm font-medium">
                          {assignment.plate_number} - {assignment.truck_model}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Driver</span>
                        </div>
                        <p className="text-sm font-medium">{assignment.driver_name}</p>
                      </div>

                      {assignment.helper_name && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>Helper</span>
                          </div>
                          <p className="text-sm font-medium">{assignment.helper_name}</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Current Status</span>
                        </div>
                        <p className="text-sm font-medium">{assignment.current_status || "N/A"}</p>
                      </div>
                    </div>

                    {assignment.remarks && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Remarks</p>
                        <p className="text-sm">{assignment.remarks}</p>
                      </div>
                    )}
                  </div>
                  <Separator />
                </div>
              )}

              {/* Documents */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">DOCUMENTS</h3>
                {documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{doc.document_type}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {formatDateTime(doc.date_uploaded)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDocument(doc.file_path)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No booking data available.
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
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