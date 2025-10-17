
import { Funnel, ChevronDown } from 'lucide-react';
import React, { useState } from 'react'

// Data for filters
const timeperiod = [
    {label: "All Time", value: "all_time"},
    {label: "Current Month", value: "current_month"},
    {label: "Last Month", value: "last_month"},
    {label: "Current Quarter", value: "current_quarter"},
    {label: "Last Quarter", value: "last_quarter"}
]

const clientTypes = [
    {label: "All Clients", value: "all_clients"},
    {label: "SPX Express", value: "spx_express"},
    {label: "Retail Customers", value: "retail_customers"}
]

const serviceTypes = [
    {label: "All Services", value: "all_services"},
    {label: "Partnership Deliveries", value: "partnership_deliveries"},
    {label: "Lipat Bahay Services", value: "lipat_bahay_services"}
]

const SOAFilters = () => {
  const [openFilter, setOpenFilter] = useState(null);

  const [selectedTimePeriod, setSelectedTimePeriod] = useState("All Time");
  const [selectedClientType, setSelectedClientType] = useState("All Clients");
  const [selectedServiceType, setSelectedServiceType] = useState("All Services");

  const toggleFilter = (filterName) => {
    setOpenFilter(openFilter === filterName ? null : filterName);
  };

  const handleSelect = (filterName, value, setter) => {
    setter(value);
    setOpenFilter(null);
  };

  return (
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-foreground/10 py-6 shadow-sm mb-6">
      <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
        <div className="leading-none font-semibold flex items-center gap-2">
          <Funnel />Filters
        </div>
      </div>
      <div className='px-6 flex flex-wrap md:flex-row md:items-center gap-4'>
        {/* Filter by Time Period */}
        <div className="relative">
          <button onClick={() => toggleFilter('time')} className="flex justify-between items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-48">
              <span>{selectedTimePeriod}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFilter === 'time' ? "rotate-180" : ""}`} />
          </button>
          {openFilter === 'time' && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 p-1">
              {timeperiod.map((time) => (
                  <li key={time.value} onClick={() => handleSelect('time', time.label, setSelectedTimePeriod)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent hover:text-white cursor-pointer rounded-md">
                      {time.label}
                  </li>
              ))}
              </ul>
          )}
        </div>

        {/* Filter by Client Type */}
        <div className="relative">
          <button onClick={() => toggleFilter('client')} className="flex justify-between items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-48">
              <span>{selectedClientType}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFilter === 'client' ? "rotate-180" : ""}`} />
          </button>
          {openFilter === 'client' && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 p-1">
              {clientTypes.map((client) => (
                  <li key={client.value} onClick={() => handleSelect('client', client.label, setSelectedClientType)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent hover:text-white cursor-pointer rounded-md">
                      {client.label}
                  </li>
              ))}
              </ul>
          )}
        </div>

        {/* Filter by Service Type */}
        <div className="relative">
          <button onClick={() => toggleFilter('service')} className="flex justify-between items-center bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-56">
              <span>{selectedServiceType}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openFilter === 'service' ? "rotate-180" : ""}`} />
          </button>
          {openFilter === 'service' && (
              <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-10 p-1">
              {serviceTypes.map((service) => (
                  <li key={service.value} onClick={() => handleSelect('service', service.label, setSelectedServiceType)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent hover:text-white cursor-pointer rounded-md">
                      {service.label}
                  </li>
              ))}
              </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOAFilters;
