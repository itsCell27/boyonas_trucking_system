import React, { useState } from 'react';
import { Download, Filter, Search, Calendar, MapPin, Clock, Eye, Package, Home } from 'lucide-react';

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

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      completed: 'Completed',
      'in-progress': 'In Progress',
      pending: 'Pending',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
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
    <div className="flex-1 space-y-6 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Delivery History</h2>
          <p className="text-slate-600">Complete record of all deliveries across both services</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold">Filters & Search</h3>
          </div>
          <p className="text-sm text-slate-600">Filter and search through delivery records</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="w-full h-9 pl-10 pr-3 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by DR number, customer, destination, or truck..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="h-9 px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors">
              Search
            </button>
            <button className="h-9 px-4 py-2 border border-slate-300 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors">
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select
              className="h-9 px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="all">All Services</option>
              <option value="partnership">Partnership</option>
              <option value="lipat bahay">Lipat Bahay</option>
            </select>

            <select
              className="h-9 px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="h-9 px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
            >
              <option value="all">All Drivers</option>
              {[...new Set(deliveries.map(d => d.driver))].map(driver => (
                <option key={driver} value={driver}>{driver}</option>
              ))}
            </select>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="date"
                className="h-9 w-full pl-10 pr-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit-fields-wrapper]:opacity-0"
                style={{ colorScheme: 'light' }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onFocus={(e) => e.target.showPicker?.()}
              />
              <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-slate-600 pointer-events-none">
                {fromDate || 'From Date'}
              </span>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <input
                type="date"
                className="h-9 w-full pl-10 pr-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-datetime-edit]:opacity-0 [&::-webkit-datetime-edit-fields-wrapper]:opacity-0"
                style={{ colorScheme: 'light' }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onFocus={(e) => e.target.showPicker?.()}
              />
              <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-slate-600 pointer-events-none">
                {toDate || 'To Date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">Showing {deliveries.length} of {deliveries.length} delivery records</p>
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Completed: {statusCounts.completed}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            In Progress: {statusCounts.inProgress}
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            Pending: {statusCounts.pending}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">DR Number</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Service</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Customer/Partner</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Route</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Driver & Truck</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Status</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Date</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Revenue</th>
                <th className="h-10 px-2 text-left align-middle font-medium text-slate-900 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-2 align-middle font-medium">{delivery.id}</td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-2">
                      {delivery.service === 'partnership' ? (
                        <Package className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Home className="h-4 w-4 text-slate-600" />
                      )}
                      <span className="capitalize">{delivery.service}</span>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    <div>
                      <p className="font-medium">{delivery.customer}</p>
                      <p className="text-xs text-slate-600">
                        {delivery.partner ? `via ${delivery.partner}` : delivery.description}
                      </p>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{delivery.route}</span>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    <div>
                      <p className="font-medium">{delivery.driver}</p>
                      <p className="text-slate-600">{delivery.truck}</p>
                    </div>
                  </td>
                  <td className="p-2 align-middle">
                    {getStatusBadge(delivery.status)}
                  </td>
                  <td className="p-2 align-middle">
                    <div>
                      <p>{delivery.date}</p>
                      {delivery.time && (
                        <p className="text-slate-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {delivery.time}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-2 align-middle font-medium">
                    {delivery.revenue ? `₱${delivery.revenue.toLocaleString()}` : '-'}
                  </td>
                  <td className="p-2 align-middle">
                    <button className="h-8 px-3 rounded-md hover:bg-slate-100 transition-colors">
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