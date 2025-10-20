
import { Funnel, ChevronDown } from 'lucide-react';
import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SOAFilters = () => {

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm mb-6">
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
        <div className="leading-none font-semibold flex items-center gap-2">
          <Funnel />Filters
        </div>
      </div>
      <div className='px-6 flex flex-wrap md:flex-row md:items-center gap-4'>
        {/* Filter by Time Period */}
        <Select>
            <SelectTrigger className="w-max gap-6">
                <SelectValue placeholder="Current Month" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="current_quarter">Current Quarter</SelectItem>
                <SelectItem value="last_quarter">Last Quarter</SelectItem>
            </SelectContent>
        </Select>

        {/* Filter by Client Type */}
        <Select>
            <SelectTrigger className="w-max gap-6">
                <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="flash_express">Flash Express</SelectItem>
                <SelectItem value="spx_express">SPX Express</SelectItem>
                <SelectItem value="retail_customers">Retail Customers</SelectItem>
            </SelectContent>
        </Select>

        {/* Filter by Service Type */}
        <Select>
            <SelectTrigger className="w-max gap-6">
                <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all_services">All Services</SelectItem>
                <SelectItem value="partnership_deliveries">Partnership Deliveries</SelectItem>
                <SelectItem value="lipat_bahay_services">Lipat Bahay Services</SelectItem>
            </SelectContent>
        </Select>

      </div>
    </div>
  );
};

export default SOAFilters;
