import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, Fuel, DollarSign, MapPin } from 'lucide-react';

const PerformanceAnalysis = () => {
  // Data (unchanged)
  const dailyVolumeData = [
    { date: 'Jan 1', Partnership: 12, 'Lipat Bahay': 8, Total: 20 },
    { date: 'Jan 2', Partnership: 15, 'Lipat Bahay': 6, Total: 21 },
    { date: 'Jan 3', Partnership: 18, 'Lipat Bahay': 10, Total: 28 },
    { date: 'Jan 4', Partnership: 14, 'Lipat Bahay': 7, Total: 21 },
    { date: 'Jan 5', Partnership: 20, 'Lipat Bahay': 12, Total: 32 },
    { date: 'Jan 6', Partnership: 16, 'Lipat Bahay': 15, Total: 31 },
    { date: 'Jan 7', Partnership: 10, 'Lipat Bahay': 9, Total: 19 },
    { date: 'Jan 8', Partnership: 22, 'Lipat Bahay': 11, Total: 33 },
    { date: 'Jan 9', Partnership: 19, 'Lipat Bahay': 13, Total: 32 },
    { date: 'Jan 10', Partnership: 17, 'Lipat Bahay': 8, Total: 25 },
  ];

  const revenueData = [
    { date: 'Jan 1', Partnership: 55000, 'Lipat Bahay': 70000 },
    { date: 'Jan 2', Partnership: 60000, 'Lipat Bahay': 52000 },
    { date: 'Jan 3', Partnership: 65000, 'Lipat Bahay': 95000 },
    { date: 'Jan 4', Partnership: 58000, 'Lipat Bahay': 78000 },
    { date: 'Jan 5', Partnership: 75000, 'Lipat Bahay': 125000 },
    { date: 'Jan 6', Partnership: 62000, 'Lipat Bahay': 135000 },
    { date: 'Jan 7', Partnership: 48000, 'Lipat Bahay': 88000 },
    { date: 'Jan 8', Partnership: 72000, 'Lipat Bahay': 112000 },
    { date: 'Jan 9', Partnership: 68000, 'Lipat Bahay': 105000 },
    { date: 'Jan 10', Partnership: 62000, 'Lipat Bahay': 82000 },
  ];

  const peakHoursData = [
    { hour: '6AM', Deliveries: 5, 'Efficiency %': 82 },
    { hour: '7AM', Deliveries: 8, 'Efficiency %': 85 },
    { hour: '8AM', Deliveries: 12, 'Efficiency %': 88 },
    { hour: '9AM', Deliveries: 18, 'Efficiency %': 92 },
    { hour: '10AM', Deliveries: 25, 'Efficiency %': 95 },
    { hour: '11AM', Deliveries: 22, 'Efficiency %': 94 },
    { hour: '12PM', Deliveries: 15, 'Efficiency %': 90 },
    { hour: '1PM', Deliveries: 18, 'Efficiency %': 91 },
    { hour: '2PM', Deliveries: 26, 'Efficiency %': 96 },
    { hour: '3PM', Deliveries: 28, 'Efficiency %': 97 },
    { hour: '4PM', Deliveries: 27, 'Efficiency %': 96 },
    { hour: '5PM', Deliveries: 20, 'Efficiency %': 90 },
    { hour: '6PM', Deliveries: 12, 'Efficiency %': 84 },
  ];

  // Stat Card
  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div
      className="rounded-xl p-6 shadow-sm border"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-card-foreground)',
      }}
    >
      <div className="flex flex-row items-center justify-between pb-2">
        <div className="text-sm font-medium" style={{ color: 'var(--color-muted-foreground)' }}>
          {title}
        </div>
        <Icon className="h-4 w-4" style={{ color: 'var(--color-muted-foreground)' }} />
      </div>

      <div className="mt-2">
        <div className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          {value}
        </div>
        <p className="text-xs mt-1" style={{ color: 'var(--color-muted-foreground)' }}>
          <span
            style={{
              color: trend === 'up'
                ? 'var(--color-chart-2)'
                : 'var(--color-destructive)',
            }}
          >
            {change}
          </span>{' '}
          from last month
        </p>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-foreground)',
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              Performance Analytics
            </h2>
            <p style={{ color: 'var(--color-muted-foreground)' }}>
              Comprehensive statistical analysis of delivery operations
            </p>
          </div>

          <select
            className="rounded-md px-3 py-2 text-sm shadow-sm border"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-card-foreground)',
            }}
          >
            <option>30 Days</option>
            <option>60 Days</option>
            <option>90 Days</option>
          </select>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Avg Delivery Time" value="2.4 hrs" change="-8%" icon={Clock} trend="up" />
          <StatCard title="Fleet Utilization" value="84.5%" change="+5%" icon={Fuel} trend="up" />
          <StatCard title="Revenue per Delivery" value="₱4,850" change="+12%" icon={DollarSign} trend="up" />
          <StatCard title="Coverage Areas" value="8 Cities" change="Metro Manila" icon={MapPin} trend="up" />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Delivery Volume */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="mb-4">
              <div className="font-semibold" style={{ color: 'var(--color-card-foreground)' }}>
                Daily Delivery Volume
              </div>
              <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                Number of deliveries completed per day
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailyVolumeData}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-popover-foreground)',
                  }}
                />

                <Legend wrapperStyle={{ color: 'var(--color-card-foreground)' }} />

                <Bar dataKey="Partnership" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lipat Bahay" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="Total"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-card)', strokeWidth: 2, r: 3 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trends */}
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{
              backgroundColor: 'var(--color-card)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="mb-4">
              <div className="font-semibold" style={{ color: 'var(--color-card-foreground)' }}>
                Revenue Trends
              </div>
              <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                Daily revenue by service type
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-popover-foreground)',
                  }}
                  formatter={(value) => `₱${value.toLocaleString()}`}
                />

                <Legend wrapperStyle={{ color: 'var(--color-card-foreground)' }} />

                <Line type="monotone" dataKey="Partnership" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Lipat Bahay" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div
          className="rounded-xl border p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="mb-4">
            <div className="font-semibold" style={{ color: 'var(--color-card-foreground)' }}>
              Peak Hours Analysis
            </div>
            <div className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Delivery volume and efficiency by hour
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" />
              <YAxis yAxisId="left" stroke="var(--color-muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" stroke="var(--color-muted-foreground)" />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-popover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-popover-foreground)',
                }}
              />

              <Legend wrapperStyle={{ color: 'var(--color-card-foreground)' }} />

              <Bar yAxisId="left" dataKey="Deliveries" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="Efficiency %"
                stroke="var(--color-chart-3)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-card)', strokeWidth: 2, r: 3 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalysis;