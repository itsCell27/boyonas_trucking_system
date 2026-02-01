import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

const PerformanceAnalysis = () => {
  const [dailyVolumeData, setDailyVolumeData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [paidOnly, setPaidOnly] = useState(true); // TRUE = Paid Only

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/get_performance_data.php`, {
        params: { paidOnly },
        withCredentials: true
      })
      .then((res) => {
        if (res.data.success) {
          setDailyVolumeData(
            res.data.dailyVolume.map((d) => ({
              ...d,
              date: formatDate(d.date),
            }))
          );

          setRevenueData(
            res.data.dailyRevenue.map((d) => ({
              ...d,
              date: formatDate(d.date),
            }))
          );
        }
      });
  }, [paidOnly]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER WITH TITLE + REVENUE MODE SELECT */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Performance Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive statistical analysis of delivery operations
            </p>
          </div>

          {/* Revenue Mode Selector */}
          <div className="w-48">
            <Select value={paidOnly ? "paid" : "all"} onValueChange={(v) => setPaidOnly(v === "paid")}>
              <SelectTrigger>
                <SelectValue placeholder="Revenue Mode" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="all">All SOA Revenue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ---- CHARTS BELOW ---- */}
        <div className="space-y-6">
          {/* DAILY DELIVERY VOLUME */}
          <div className="rounded-xl border p-6 shadow-sm w-full">
            <div className="mb-4">
              <h3 className="font-semibold">Daily Delivery Volume</h3>
              <p className="text-sm text-muted-foreground">
                Number of completed deliveries
              </p>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={dailyVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="Partnership" fill="var(--color-chart-1)" />
                <Bar dataKey="LipatBahay" fill="var(--color-chart-2)" />
                <Line type="monotone" dataKey="Total" stroke="var(--color-chart-3)" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* REVENUE TRENDS */}
          <div className="rounded-xl border p-6 shadow-sm w-full">
            <div className="mb-4">
              <h3 className="font-semibold">
                Revenue Trends ({paidOnly ? "Paid Only" : "All SOAs"})
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                <Legend />

                <Line type="monotone" dataKey="Partnership" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="LipatBahay" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceAnalysis;
