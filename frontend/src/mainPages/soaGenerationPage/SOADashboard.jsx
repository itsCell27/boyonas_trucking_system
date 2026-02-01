import React, { useEffect, useState } from "react";
import MenuHeader from "@/components/MenuHeader";
import SOAFilters from "@/components/SOAGeneration/SOAFilters";
import SOATable from "@/components/SOAGeneration/SOATable";
import { Plus } from "lucide-react";
import axios from "axios";
import Fuse from "fuse.js";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

const SOADashboard = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const [clientOptions, setClientOptions] = useState(["all"]);

  // Fetch records once
  const fetchRecords = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/get_soa_list.php`);
      if (resp.data.success) {
        //console.log(resp.data)
        const recs = resp.data.records;

        setRecords(recs);
        setFilteredRecords(recs);

        // Extract UNIQUE client names
        const uniqueClients = [
          "all",
          ...Array.from(new Set(recs.map(r => r.party_name))).filter(Boolean)
        ];

        setClientOptions(uniqueClients);
      } else {
        toast.error(resp.data.message);
      }
    } catch {
      toast.error("Failed to load SOA list.");
    }
  };


  useEffect(() => {
    fetchRecords();
  }, []);

  // Apply Searching + Filtering using Fuse.js
  useEffect(() => {
    let results = [...records];

    // Fuse.js Search
    if (searchQuery.trim() !== "") {
      const fuse = new Fuse(records, {
        keys: ["soa_id", "soa_number", "party_name", "service_type", "generated_by", "date_from", "date_to"],
        threshold: 0.3,
      });

      results = fuse.search(searchQuery).map((res) => res.item);
    }

    // Service Type Filter
    if (serviceFilter !== "all") {
      results = results.filter((r) =>
        serviceFilter === "partnership"
          ? r.service_type === "Partnership"
          : r.service_type === "LipatBahay"
      );
    }

    // Client Filter
    if (clientFilter !== "all") {
      results = results.filter(r => r.party_name === clientFilter);
    }


    setFilteredRecords(results);
  }, [searchQuery, serviceFilter, clientFilter, records]);

  const headerData = [
    {
      headerName: "Statement of Account",
      headerDescription: "Generate and manage billing statements",
      headerLink: "/app",
      buttons: [
        {
          buttonName: "Generate SOA",
          buttonIcon: Plus,
          buttonLink: "/app/soa-generation/generate",
          buttonStyle:
            "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary hover:bg-primary/90 rounded-sm",
        },
      ],
    },
  ];

  return (
    <div className="flex-1 pt-10 md:pt-0">
      <MenuHeader headerData={headerData} />

      <div className="mt-6 lg:grid lg:gap-6">
        <div className="lg:col-span-2">

          {/* FILTER UI */}
          <SOAFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
            clientFilter={clientFilter}
            onClientFilterChange={setClientFilter}
            clientOptions={clientOptions}
          />


          {/* TABLE WITH FILTERED DATA */}
          <SOATable records={filteredRecords} />
        </div>
      </div>
    </div>
  );
};

export default SOADashboard;
