import { Badge } from "@/components/ui/badge";
import "../../index.css";
import { Truck, MoreHorizontal } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Fuse from "fuse.js";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { useState, useMemo, useEffect } from "react";
import { TruckDetailsModal } from "./TruckDetailsModal";
import { ReusableFormDialog } from "@/components/ReusableFormDialog";

export default function ManageFleetOverview({ fleetData, fetchFleetData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [maintenanceTruckId, setMaintenanceTruckId] = useState(null);

  // Search + Filter states
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Build Fuse engine
  const fuse = useMemo(() => {
    if (!fleetData) return null;
    return new Fuse(fleetData, {
      keys: [
        "plate_number",
        "model",
        "capacity",
        "year",
        "operational_status",
        "document_status",
        "status",
        "remarks",
      ],
      threshold: 0.35,
      ignoreLocation: true,
    });
  }, [fleetData]);

  // Derived filtered results
  const filteredFleet = useMemo(() => {
    if (!fleetData) return [];

    let results = query && fuse ? fuse.search(query).map((r) => r.item) : [...fleetData];

    if (statusFilter !== "all") {
      results = results.filter(
        (t) =>
          t.operational_status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    return results;
  }, [query, statusFilter, fuse, fleetData]);

  const handleViewDetails = (truck) => {
    setSelectedTruck(truck);
    setIsModalOpen(true);
  };

  const getTruckStatusColor = (status) => {
    switch (status) {
      case "Okay to Use":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Not Okay to Use":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Needs Document Renewal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOperationalColor = (status) => {
    switch (status) {
      case "Available":
        return "text-green-600";
      case "On Delivery":
        return "text-blue-600";
      case "Maintenance":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const updateTruckStatus = async (truckId, newStatus, remarks = "") => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/update_truck_status.php`,
        { truck_id: truckId, operational_status: newStatus, remarks },
        { withCredentials: true }
      );

      if (res.data.success) {
        fetchFleetData();
      }
    } catch (err) {
      console.error("Update truck error:", err);
    }
  };

  return (
    <>
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm">
        {/* ---------- Header ---------- */}
        <div className="@container/card-header grid auto-rows-min items-start gap-1.5 px-6 pb-2">
          <div className="font-semibold leading-none">Fleet Overview</div>
          <div className="text-muted-foreground text-sm">
            Monitor all trucks, their status, and assignments
          </div>
        </div>

        {/* ---------- Search + Filter (Option B Style) ---------- */}
        <div className="px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* SEARCH INPUT */}
            <div className="relative flex-1 bg-background">
              <input
                className="file:text-foreground placeholder:text-muted-foreground border-input selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm pl-10 focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] outline-none"
                placeholder="Search truck, plate number, model..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg
                className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* STATUS FILTER */}
            <Select onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="On Delivery">On Delivery</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ---------- Fleet Grid ---------- */}
        <div className="px-6">
          {filteredFleet.length === 0 ? (
            <div className="text-center text-muted-foreground p-10">
              No trucks found.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredFleet.map((vehicle, index) => (
                <Card key={index} className="bg-background w-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Truck Image */}
                        {vehicle.image_path ? (
                          <div className="w-12 h-12 border bg-primary/10 rounded-lg overflow-hidden">
                            <img
                              src={`${API_BASE_URL}/${vehicle.image_path}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                        )}

                        <div>
                          <CardTitle>{vehicle.plate_number}</CardTitle>
                          <CardDescription>{vehicle.model}</CardDescription>
                        </div>
                      </div>

                      {/* Ellipsis menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    disabled={vehicle.operational_status !== "Available"}
                                    className={
                                        vehicle.operational_status !== "Available"
                                            ? "opacity-40 cursor-not-allowed"
                                            : "hover:bg-accent"
                                    }
                                    onClick={() => {
                                        setMaintenanceTruckId(vehicle.truck_id);
                                        setIsMaintenanceDialogOpen(true);
                                    }}
                                >
                                    Set to Maintenance
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    disabled={vehicle.operational_status !== "Maintenance" || vehicle.document_status === "Expired"}
                                    className={
                                        vehicle.operational_status !== "Maintenance"
                                            ? "opacity-40 cursor-not-allowed"
                                            : "hover:bg-accent"
                                    }
                                    onClick={() => updateTruckStatus(vehicle.truck_id, "Available")}
                                >
                                    Set to Available
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Capacity</div>
                        <div className="text-muted-foreground">
                          {vehicle.capacity} kg
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Year</div>
                        <div className="text-muted-foreground">
                          {vehicle.year}
                        </div>
                      </div>
                    </div>

                    {/* <div>
                      <div className="font-medium text-sm">Status</div>
                      <Badge className={`${getTruckStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </Badge>
                    </div> */}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Document Status</div>
                        <div className="text-muted-foreground">
                          {vehicle.document_status}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium">Operational Status</div>
                        <div
                          className={`font-semibold ${getOperationalColor(
                            vehicle.operational_status
                          )}`}
                        >
                          {vehicle.operational_status}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleViewDetails(vehicle)}
                    >
                      View Details
                    </Button>

                    {/* Remarks Dialog Field when setting a truck status to maintenance */}
                    <ReusableFormDialog
                        open={isMaintenanceDialogOpen}
                        onOpenChange={setIsMaintenanceDialogOpen}
                        title="Set Truck to Maintenance"
                        description="Add remarks for setting this truck to maintenance."
                        submitLabel="Set to Maintenance"
                        fields={[
                            { id: "remarks", label: "Remarks (optional)", placeholder: "Enter reason for maintenance..." },
                        ]}
                        onSubmit={async (values) => {
                            await updateTruckStatus(
                                maintenanceTruckId,
                                "Maintenance",
                                values.remarks
                            )
                        }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Truck Details Modal */}
      {selectedTruck && (
        <TruckDetailsModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          truck={selectedTruck}
        />
      )}
    </>
  );
}
