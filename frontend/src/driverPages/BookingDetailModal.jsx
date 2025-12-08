// src/driverPages/BookingDetailModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Package, Truck, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import DeliveryProgressTracker from "./DeliveryProgressTracker";
import ProofOfDeliveryUpload from "./ProofOfDeliveryUpload";

export default function BookingDetailModal({
  open,
  onOpenChange,
  assignmentId,
  onStatusChange,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // =====================================================
  // FETCH BOOKING + ASSIGNMENT DETAILS
  // =====================================================
  const fetchData = async () => {
    if (!assignmentId) return;

    setLoading(true);
    try {
      const resp = await axios.get(
        `${API_BASE_URL}/driver/get_booking_with_assignment.php?assignment_id=${assignmentId}`,
        { withCredentials: true }
      );

      if (resp.data.success) {
        setData(resp.data);
        setSelectedStatus(resp.data.assignment.current_status);
      } else {
        toast.error(resp.data.message || "Failed to load assignment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open, assignmentId]);

  if (!open) return null;

  if (loading || !data)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="p-6">Loading…</div>
        </DialogContent>
      </Dialog>
    );

  // Extract data
  const assignment = data.assignment;
  const booking = data.booking || {};
  const docs = data.documents || [];

  // ✅ FIX 5: Corrected service type detection
  const serviceType = (booking.service_type || "").toLowerCase();
  const initialStep = serviceType === "lipatbahay" 
    ? "OTW to Pickup" 
    : "OTW to SOC";

  const steps = [
    initialStep,
    "Loading",
    "OTW to Destination",
    "Unloading",
    "Completed",
  ];

  const currentIndex = steps.indexOf(selectedStatus);
  const nextStep =
    currentIndex !== -1 && currentIndex < steps.length - 1
      ? steps[currentIndex + 1]
      : null;

  const isFinalStatus = ["Completed", "Incomplete", "Cancelled"].includes(
    selectedStatus
  );

  const hasProof = docs.length > 0;

  // =====================================================
  // HANDLE STATUS CHANGE
  // =====================================================
  const handleRequestStatusChange = async (newStatus) => {
    const confirmUpdate = window.confirm(
      `Change status to "${newStatus}"? This action cannot be undone.`
    );
    if (!confirmUpdate) return;

    // ✅ FIX 6: Only require proof for non-initial status changes
    if (selectedStatus !== "Pending" && !hasProof) {
      toast.warning("Please upload proof before updating status.");
      return;
    }

    if (newStatus === "Completed" && !hasProof) {
      toast.warning("Please upload proof before completing delivery.");
      return;
    }

    try {
      await onStatusChange(newStatus);
      await fetchData();
      setSelectedStatus(newStatus);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  // =====================================================
  // RENDER DIALOG
  // =====================================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Assignment #{assignment.assignment_id}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {booking.dr_number || booking.partner_name || "No DR number"}
          </p>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className={`grid w-full ${!isFinalStatus ? `grid-cols-3` : `grid-cols-2`}`}>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            {!isFinalStatus && <TabsTrigger value="proof">Proof</TabsTrigger>}
          </TabsList>

          {/* DETAILS TAB */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Card */}
            <Card className="shadow-sm border rounded-xl">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Package className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  Booking Details
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* ORIGIN */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Origin</p>
                      <p className="font-medium text-sm md:text-base">{booking.route_from}</p>
                    </div>
                  </div>

                  {/* DESTINATION */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Destination</p>
                      <p className="font-medium text-sm md:text-base">{booking.route_to}</p>
                    </div>
                  </div>

                  {/* CARGO */}
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cargo</p>
                      <p className="font-medium text-sm md:text-base">{booking.category || "N/A"}</p>
                    </div>
                  </div>

                  {/* WEIGHT */}
                  <div className="flex items-start gap-3">
                    <Package className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Weight</p>
                      <p className="font-medium text-sm md:text-base">{booking.estimated_weight} kg</p>
                    </div>
                  </div>

                  {/* TRUCK */}
                  <div className="flex items-start gap-3">
                    <Truck className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Truck</p>
                      <p className="font-medium text-sm md:text-base">{data.truck?.plate_number}</p>
                    </div>
                  </div>

                  {/* SCHEDULE */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Scheduled</p>
                      <p className="font-medium text-sm md:text-base">
                        {booking.scheduled_start
                          ? new Date(booking.scheduled_start).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                </div>

                {/* REMARKS */}
                {(assignment.remarks && assignment.remarks !== "") && (
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Remarks/Notes</p>
                    <p className="text-sm md:text-base bg-muted p-3 rounded">
                      {assignment.remarks}
                    </p>
                  </div>
                )}

                {/* HELPER */}
                {data.helper && (
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Helper</p>
                    <p className="font-medium text-sm md:text-base">
                      {data.helper.full_name}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            
            {/* STATUS ACTIONS */}
            <div className="space-y-3">
              {selectedStatus === "Pending" && (
                <Button
                  className="w-full"
                  onClick={() => handleRequestStatusChange(initialStep)}
                >
                  Start Delivery
                </Button>
              )}

              {!isFinalStatus &&
                selectedStatus !== "Pending" &&
                nextStep && (
                  <>
                    <div>Update Status</div>
                    <Button
                      className="w-full"
                      onClick={() => handleRequestStatusChange(nextStep)}
                      disabled={!hasProof}
                    >
                      {nextStep}
                    </Button>
                    {!hasProof && (
                      <div className="text-sm text-destructive">Please upload a proof of delivery to continue.</div>
                    )}
                  </>
                  
                )}
            </div>
          </TabsContent>

          {/* PROGRESS TAB */}
          <TabsContent value="progress" className="mt-4">
            <DeliveryProgressTracker
              currentStatus={selectedStatus}
              initialStep={initialStep}
            />
          </TabsContent>

          {/* PROOF TAB */}
          {!isFinalStatus && (
            <TabsContent value="proof" className="mt-4">
              <ProofOfDeliveryUpload
                assignmentId={assignment.assignment_id}
                onUploaded={fetchData}
              />

              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Uploaded files</p>
                <ul>
                  {docs.length === 0 && <li className="text-sm">No files uploaded yet</li>}
                  {docs.map((d) => (
                    <li key={d.document_id} className="text-sm">
                      {d.document_type} — {d.file_path.split('/').pop()}
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}