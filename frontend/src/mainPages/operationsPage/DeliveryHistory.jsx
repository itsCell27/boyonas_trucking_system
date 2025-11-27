import React, { useState } from 'react';
import { Download, Filter, Search, Calendar, MapPin, Clock, Eye, Package, Home } from 'lucide-react';

// 👉 shadcn components
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

const DeliveryHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const deliveries = [
    {
      id: 'DR-2024-001',
      service: 'partnership',
      customer: 'Flash Express Hub',
      partner: 'Flash Express',
      route: 'Quezon City → Makati City',
      driver: 'Juan Dela Cruz',
      truck: 'ABC-123',
      status: 'completed',
      date: 'Jan 15, 2024',
      time: '00:00',
      revenue: 2500
    },
    {
      id: 'DR-2024-002',
      service: 'lipat bahay',
      customer: 'Maria Santos',
      description: '3-bedroom house',
      route: 'Pasig City → Taguig City',
      driver: 'Pedro Garcia',
      truck: 'XYZ-456',
      status: 'completed',
      date: 'Jan 14, 2024',
      time: '00:00',
      revenue: 8500
    },
    {
      id: 'DR-2024-003',
      service: 'partnership',
      customer: 'LBC Express Center',
      partner: 'LBC Express',
      route: 'Manila → Caloocan',
      driver: 'Carlos Reyes',
      truck: 'DEF-789',
      status: 'in-progress',
      date: 'Jan 16, 2024',
      revenue: 1800
    },
    {
      id: 'DR-2024-004',
      service: 'lipat bahay',
      customer: 'John Smith',
      description: 'Office relocation',
      route: 'Mandaluyong → Ortigas',
      driver: 'Miguel Torres',
      truck: 'GHI-012',
      status: 'pending',
      date: 'Jan 17, 2024',
      revenue: 12000
    },
    {
      id: 'DR-2024-005',
      service: 'partnership',
      customer: 'J&T Express Hub',
      partner: 'J&T Express',
      route: 'Antipolo → Marikina',
      driver: 'Roberto Cruz',
      truck: 'JKL-345',
      status: 'cancelled',
      date: 'Jan 13, 2024',
      revenue: null
    }
  ];

  // Map statuses to theme chart/destructive variables so badges match shadcn palette
  const getStatusBadge = (status) => {
    const styles = {
      completed: {
        bg: 'var(--color-chart-1)',
        text: 'var(--color-card-foreground)',
        border: 'var(--color-border)'
      },
      'in-progress': {
        bg: 'var(--color-chart-2)',
        text: 'var(--color-card-foreground)',
        border: 'var(--color-border)'
      },
      pending: {
        bg: 'var(--color-chart-4)',
        text: 'var(--color-card-foreground)',
        border: 'var(--color-border)'
      },
      cancelled: {
        bg: 'var(--color-destructive)',
        text: 'var(--color-destructive-foreground)',
        border: 'var(--color-border)'
      }
    };

    const labels = {
      completed: 'Completed',
      'in-progress': 'In Progress',
      pending: 'Pending',
      cancelled: 'Cancelled'
    };

    const s = styles[status] || styles.pending;
    return (
      <span
        style={{
          backgroundColor: s.bg,
          color: s.text,
          borderColor: s.border
        }}
        className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium"
      >
        {labels[status]}
      </span>
    );
  };

  const statusCounts = {
    completed: deliveries.filter(d => d.status === 'completed').length,
    inProgress: deliveries.filter(d => d.status === 'in-progress').length,
    pending: deliveries.filter(d => d.status === 'pending').length
  };

  return (
    <div className="flex-1 space-y-6 p-6 min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[color:var(--color-foreground)]">Delivery History</h2>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Complete record of all deliveries across both services</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-primary-foreground)'
          }}
        >
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      {/* FILTERS CARD */}
      <div className="rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold text-[color:var(--color-foreground)]">Filters & Search</h3>
          </div>
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Filter and search through delivery records</p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* SEARCH BAR */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[color:var(--color-muted-foreground)]" />
              <input
                type="text"
                className="w-full h-9 pl-10 pr-3 py-1 rounded-md shadow-sm focus:outline-none"
                placeholder="Search by DR number, customer, destination, or truck..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-popover)',
                  color: 'var(--color-popover-foreground)',
                }}
              />
            </div>

            <button
              className="h-9 px-4 py-2 rounded-md shadow-sm transition-colors"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-foreground)' }}
            >
              Search
            </button>

            <button
              className="h-9 px-4 py-2 rounded-md shadow-sm transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)'
              }}
            >
              Clear
            </button>
          </div>

          {/* FILTERS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

            {/* SERVICE FILTER */}
            <select
              className="h-9 px-3 py-2 rounded-md shadow-sm focus:outline-none"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)'
              }}
            >
              <option value="all">All Services</option>
              <option value="partnership">Partnership</option>
              <option value="lipat bahay">Lipat Bahay</option>
            </select>

            {/* STATUS FILTER */}
            <select
              className="h-9 px-3 py-2 rounded-md shadow-sm focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)'
              }}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* DRIVER FILTER */}
            <select
              className="h-9 px-3 py-2 rounded-md shadow-sm focus:outline-none"
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-popover)',
                color: 'var(--color-popover-foreground)'
              }}
            >
              <option value="all">All Drivers</option>
              {[...new Set(deliveries.map(d => d.driver))].map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>

            {/* FROM DATE — NOW USING DIALOG + CALENDAR */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="h-9 w-full px-3 text-left rounded-md shadow-sm flex items-center gap-2"
                  style={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                  }}
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
                  onSelect={(date) => date && setFromDate(date.toISOString().split("T")[0])}
                  className="rounded-md border shadow-sm w-full"
                  captionLayout="dropdown"
                />
              </DialogContent>
            </Dialog>


            {/* TO DATE — NOW USING DIALOG + CALENDAR */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="h-9 w-full px-3 text-left rounded-md shadow-sm flex items-center gap-2"
                  style={{
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-popover)",
                    color: "var(--color-popover-foreground)",
                  }}
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
                      const formatted = date.toISOString().split("T")[0];
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

      {/* BOTTOM SUMMARY */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Showing {deliveries.length} of {deliveries.length} delivery records
        </p>

        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-1)' }}></div>
            Completed: {statusCounts.completed}
          </span>

          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-2)' }}></div>
            In Progress: {statusCounts.inProgress}
          </span>

          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-chart-4)' }}></div>
            Pending: {statusCounts.pending}
          </span>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b" style={{ borderColor: 'var(--color-sidebar-border)' }}>
              <tr>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>DR Number</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Service</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Customer/Partner</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Route</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Driver & Truck</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Status</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Date</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Revenue</th>
                <th className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap" style={{ color: 'var(--color-card-foreground)' }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b transition-colors" style={{ borderColor: 'var(--color-sidebar-border)' }}>
                  <td className="p-2 align-middle font-medium" style={{ color: 'var(--color-card-foreground)' }}>{delivery.id}</td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-2">
                      {delivery.service === 'partnership' ? (
                        <Package className="h-4 w-4" style={{ color: 'var(--color-chart-2)' }} />
                      ) : (
                        <Home className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
                      )}
                      <span className="capitalize" style={{ color: 'var(--color-card-foreground)' }}>{delivery.service}</span>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-card-foreground)' }}>{delivery.customer}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                        {delivery.partner ? `via ${delivery.partner}` : delivery.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-1" style={{ color: 'var(--color-popover-foreground)' }}>
                      <MapPin className="h-3 w-3" />
                      <span>{delivery.route}</span>
                    </div>
                  </td>

                  <td className="p-2 align-middle">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--color-card-foreground)' }}>{delivery.driver}</p>
                      <p style={{ color: 'var(--color-muted-foreground)' }}>{delivery.truck}</p>
                    </div>
                  </td>

                  <td className="p-2 align-middle">{getStatusBadge(delivery.status)}</td>

                  <td className="p-2 align-middle">
                    <div>
                      <p style={{ color: 'var(--color-card-foreground)' }}>{delivery.date}</p>
                      {delivery.time && (
                        <p className="flex items-center gap-1" style={{ color: 'var(--color-muted-foreground)' }}>
                          <Clock className="h-3 w-3" />
                          {delivery.time}
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="p-2 align-middle font-medium" style={{ color: 'var(--color-card-foreground)' }}>
                    {delivery.revenue ? `₱${delivery.revenue.toLocaleString()}` : '-'}
                  </td>

                  <td className="p-2 align-middle">
                    <button
                      className="h-8 px-3 rounded-md transition-colors"
                      style={{
                        backgroundColor: 'transparent',
                        color: 'var(--color-popover-foreground)'
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default DeliveryHistory;
