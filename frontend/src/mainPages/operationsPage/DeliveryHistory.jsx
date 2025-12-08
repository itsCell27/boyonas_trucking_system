import React, { useEffect, useMemo, useState } from "react";
import {
  Download,
  Filter,
  Search,
  Calendar,
  MapPin,
  Home,
  Package,
  Eye,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from "@/components/ui/select";

import axios from "axios";
import Fuse from "fuse.js";

import { API_BASE_URL } from "@/config";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import ViewBookingDetails from "@/components/ViewBookingDetailsAll";

const DeliveryHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);


  // Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Map raw API row → UI delivery object
  const mapRecordToDelivery = (r) => {
    const service =
      r.service_type === "Partnership" ? "partnership" : "lipat bahay";
    const isPartnership = r.service_type === "Partnership";

    const bookingStatus = r.booking_status || r.status || "";
    const assignmentStatus = r.assignment_status || "";

    let status = "pending";

    if (bookingStatus === "Cancelled" || assignmentStatus === "Cancelled") {
      status = "cancelled";
    } else if (bookingStatus === "Completed" || assignmentStatus === "Completed") {
      status = "completed";
    } else if (
      bookingStatus === "Assigned" &&
      assignmentStatus &&
      assignmentStatus !== "Pending"
    ) {
      status = "in-progress";
    } else if (
      bookingStatus === "Pending Assignment" ||
      assignmentStatus === "Pending"
    ) {
      status = "pending";
    }

    return {
      booking_id: r.booking_id,
      id: r.dr_number || `BK-${r.booking_id}`,
      service,
      customer: isPartnership
        ? r.partner_name || "N/A"
        : r.customer_name || "N/A",
      partner: isPartnership ? r.partner_name : null,
      description: !isPartnership ? r.category || "" : "",
      route: `${r.route_from || "N/A"} → ${r.route_to || "N/A"}`,
      driver: r.driver_name || "Unassigned",
      truck: r.plate_number || "Unassigned",
      status,
      date: formatDate(r.scheduled_start),
      time: formatTime(r.scheduled_start),
      revenue: r.service_rate ? Number(r.service_rate) : null,
      dateRaw: r.scheduled_start,
    };
  };

  // Fetch data
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(
          `${API_BASE_URL}/get_delivery_history.php`,
          { withCredentials: true }
        );

        if (res.data?.success && Array.isArray(res.data.data)) {
          const mapped = res.data.data.map(mapRecordToDelivery);
          setDeliveries(mapped);
        } else {
          setError(res.data?.error || "Failed to load delivery history.");
        }
      } catch (err) {
        console.error(err);
        setError("Server error while loading delivery history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Status badge
  const getStatusBadge = (status) => {
    const styles = {
      completed: {
        bg: "var(--color-chart-1)",
        text: "var(--color-card-foreground)",
        border: "var(--color-border)",
        label: "Completed",
      },
      "in-progress": {
        bg: "var(--color-chart-2)",
        text: "var(--color-card-foreground)",
        border: "var(--color-border)",
        label: "In Progress",
      },
      pending: {
        bg: "var(--color-chart-4)",
        text: "var(--color-card-foreground)",
        border: "var(--color-border)",
        label: "Pending",
      },
      cancelled: {
        bg: "var(--color-destructive)",
        text: "var(--color-destructive-foreground)",
        border: "var(--color-border)",
        label: "Cancelled",
      },
    };

    const s = styles[status] || styles.pending;
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.text,
          borderColor: s.border,
        }}
        className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium"
      >
        {s.label}
      </span>
    );
  };

  // Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(deliveries, {
        keys: ["id", "customer", "partner", "route", "driver", "truck"],
        threshold: 0.3,
        ignoreLocation: true,
      }),
    [deliveries]
  );

  const searchedDeliveries = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return deliveries;
    return fuse.search(q).map((r) => r.item);
  }, [deliveries, searchQuery, fuse]);

  // Filters
  const filteredDeliveries = useMemo(() => {
    let result = [...searchedDeliveries];

    if (serviceFilter !== "all") {
      result = result.filter((d) => d.service === serviceFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (driverFilter !== "all") {
      result = result.filter((d) => d.driver === driverFilter);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter((d) => {
        if (!d.dateRaw) return false;
        return new Date(d.dateRaw) >= from;
      });
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include the whole day
      result = result.filter((d) => {
        if (!d.dateRaw) return false;
        return new Date(d.dateRaw) <= to;
      });
    }

    return result;
  }, [searchedDeliveries, serviceFilter, statusFilter, driverFilter, fromDate, toDate]);

  // Status counts
  const statusCounts = useMemo(
    () => ({
      completed: filteredDeliveries.filter((d) => d.status === "completed")
        .length,
      inProgress: filteredDeliveries.filter(
        (d) => d.status === "in-progress"
      ).length,
      pending: filteredDeliveries.filter((d) => d.status === "pending").length,
    }),
    [filteredDeliveries]
  );

  const allDrivers = useMemo(
    () =>
      Array.from(new Set(deliveries.map((d) => d.driver))).filter(
        (d) => d && d !== "Unassigned"
      ),
    [deliveries]
  );

  const handleClearFilters = () => {
    setSearchQuery("");
    setServiceFilter("all");
    setStatusFilter("all");
    setDriverFilter("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <>
    <div className="flex-1 space-y-6 pt-6 pb-6 min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">
            Delivery History
          </h2>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Complete record of all deliveries across both services
          </p>
        </div>
        <Button
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-primary-foreground)",
          }}
          type="button"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* FILTER CARD */}
      <div
        className="rounded-xl border shadow-sm"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="p-6 border-b"
          style={{ borderColor: "var(--color-sidebar-border)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold text-[color:var(--color-foreground)]">
              Filters & Search
            </h3>
          </div>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">
            Filter and search through delivery records
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* SEARCH BAR */}
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search DR number, customer, truck..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>


          {/* FILTER GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* SERVICE */}
            <Select
              value={serviceFilter}
              onValueChange={setServiceFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="lipat bahay">Lipat Bahay</SelectItem>
              </SelectContent>
            </Select>


            {/* STATUS */}
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>


            {/* DRIVER */}
            <Select
              value={driverFilter}
              onValueChange={setDriverFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Drivers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {allDrivers.map((driver) => (
                  <SelectItem key={driver} value={driver}>
                    {driver}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


            {/* FROM DATE */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="h-9 w-full px-3 text-left rounded-md shadow-sm flex items-center gap-2"
                  style={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                  }}
                  type="button"
                >
                  <Calendar className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
                  {fromDate || "From Date"}
                </button>
              </DialogTrigger>
              <DialogContent
                className="p-4 max-w-[300px]"
                style={{
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  borderColor: "var(--color-border)",
                }}
              >
                <DialogHeader>
                  <DialogTitle>Select Start Date</DialogTitle>
                </DialogHeader>
                <CalendarComponent
                  mode="single"
                  selected={fromDate ? new Date(fromDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = date.toLocaleDateString("en-CA");
                      setFromDate(formatted);
                    }
                  }}
                  className="rounded-md border shadow-sm w-full"
                  captionLayout="dropdown"
                />
              </DialogContent>
            </Dialog>

            {/* TO DATE */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="h-9 w-full px-3 text-left rounded-md shadow-sm flex items-center gap-2"
                  style={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                  }}
                  type="button"
                >
                  <Calendar className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
                  {toDate || "To Date"}
                </button>
              </DialogTrigger>
              <DialogContent
                className="p-4 max-w-[300px]"
                style={{
                  backgroundColor: "var(--color-card)",
                  color: "var(--color-card-foreground)",
                  borderColor: "var(--color-border)",
                }}
              >
                <DialogHeader>
                  <DialogTitle>Select End Date</DialogTitle>
                </DialogHeader>
                <CalendarComponent
                  mode="single"
                  selected={toDate ? new Date(toDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const formatted = date.toLocaleDateString("en-CA");
                      setToDate(formatted);
                    }
                  }}
                  className="rounded-md border shadow-sm w-full"
                  captionLayout="dropdown"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="flex items-center justify-between">
        <p
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {loading
            ? "Loading delivery records..."
            : `Showing ${filteredDeliveries.length} of ${deliveries.length} delivery records`}
        </p>

        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--color-chart-1)" }}
            />
            Completed: {statusCounts.completed}
          </span>
          <span className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--color-chart-2)" }}
            />
            In Progress: {statusCounts.inProgress}
          </span>
          <span className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--color-chart-4)" }}
            />
            Pending: {statusCounts.pending}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div
        className="rounded-xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="overflow-x-auto">
          {error && (
            <div className="p-4 text-sm text-red-500 border-b border-red-300">
              {error}
            </div>
          )}

          <table className="w-full text-sm">
            <thead
              className="border-b"
              style={{ borderColor: "var(--color-sidebar-border)" }}
            >
              <tr>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>DR Number</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Service</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Customer/Partner</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Route</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Driver & Truck</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Status</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Date</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Revenue</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
                    style={{ color: "var(--color-card-foreground)" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="border-b transition-colors"
                  style={{ borderColor: "var(--color-sidebar-border)" }}
                >
                  <td className="p-2 align-middle font-medium"
                      style={{ color: "var(--color-card-foreground)" }}>
                    {delivery.id}
                  </td>

                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-2">
                      {delivery.service === "partnership" ? (
                        <Package
                          className="h-4 w-4"
                          style={{ color: "var(--color-chart-2)" }}
                        />
                      ) : (
                        <Home
                          className="h-4 w-4"
                          style={{ color: "var(--color-muted-foreground)" }}
                        />
                      )}
                      <span
                        className="capitalize"
                        style={{ color: "var(--color-card-foreground)" }}
                      >
                        {delivery.service}
                      </span>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-card-foreground)" }}
                      >
                        {delivery.customer}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {delivery.partner
                          ? `via ${delivery.partner}`
                          : delivery.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div
                      className="flex items-center gap-1"
                      style={{ color: "var(--color-popover-foreground)" }}
                    >
                      <MapPin className="h-3 w-3" />
                      <span>{delivery.route}</span>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-card-foreground)" }}
                      >
                        {delivery.driver}
                      </p>
                      <p style={{ color: "var(--color-muted-foreground)" }}>
                        {delivery.truck}
                      </p>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    {getStatusBadge(delivery.status)}
                  </td>

                  <td className="p-2 align-middle">
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-card-foreground)" }}
                      >
                        {delivery.date}
                      </p>
                      <p style={{ color: "var(--color-muted-foreground)" }}>
                        {delivery.time}
                      </p>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    {delivery.revenue != null ? (
                      <span
                        className="font-medium"
                        style={{ color: "var(--color-card-foreground)" }}
                      >
                        ₱
                        {delivery.revenue.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        N/A
                      </span>
                    )}
                  </td>

                  <td className="p-2 align-middle">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => {
                        setSelectedBookingId(delivery.booking_id);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}

              {!loading && filteredDeliveries.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-sm"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    No delivery records found for the current filters.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="p-4 text-center text-sm"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <ViewBookingDetails
      open={detailsOpen}
      onOpenChange={setDetailsOpen}
      bookingId={selectedBookingId}
      axios={axios}
      API_BASE_URL={API_BASE_URL}
      toast={{
        error: (msg) => console.error("VIEW ERROR:", msg),
      }}
    />
    </>
  );
};

export default DeliveryHistory;
