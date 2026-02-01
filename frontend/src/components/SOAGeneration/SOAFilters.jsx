import React from "react";
import { Funnel, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOAFilters = ({
  searchQuery,
  onSearchChange,
  serviceFilter,
  onServiceFilterChange,
  clientFilter,
  onClientFilterChange,
  clientOptions
}) => {
  return (
    <div className="bg-card rounded-xl border p-6 shadow-sm mb-6 flex flex-col gap-6">
      <div className="flex items-center gap-2 font-semibold">
        <Funnel /> Filters
      </div>

      <div className="grid grid-cols-6 gap-4 h-10">
        {/* SEARCH BAR */}
        <div className="relative col-span-5">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client or soa code..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-full border rounded-md bg-background"
          />
        </div>

        {/* FILTER DROPDOWNS */}
        <div className="grid grid-cols-1 gap-4">
          {/* Client Filter */}
          {/* <Select value={clientFilter} onValueChange={onClientFilterChange}>
            <SelectTrigger className="h-full">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent> */}

              {/* Always show All Clients first */}
              {/* <SelectItem value="all">All Clients</SelectItem> */}

              {/* Dynamic Party Names */}
              {/* {clientOptions
                .filter(c => c !== "all")
                .map(client => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))
              } */}
            {/* </SelectContent>
          </Select> */}


          {/* Service Filter */}
          <Select value={serviceFilter} onValueChange={onServiceFilterChange}>
            <SelectTrigger className="h-full">
              <SelectValue placeholder="Service Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              <SelectItem value="partnership">Partnership Deliveries</SelectItem>
              <SelectItem value="lipat">Lipat Bahay</SelectItem>
            </SelectContent>
          </Select>
      </div>
      </div>
      
    </div>
  );
};

export default SOAFilters;
