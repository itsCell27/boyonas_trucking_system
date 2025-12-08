import React, { useEffect, useMemo, useState } from "react";
import { Trash2, ArrowBigLeft } from "lucide-react";
import MenuHeader from "@/components/MenuHeader";
import { API_BASE_URL } from "@/config";
import axios from "axios";
import { toast } from "sonner";

const SOAGeneration = () => {
  const [serviceType, setServiceType] = useState("Partnership");
  const [partyOptions, setPartyOptions] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deliveries, setDeliveries] = useState([]);
  const [isLoadingParties, setIsLoadingParties] = useState(false);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const headerData = [
    {
      headerName: "Statement of Account",
      headerDescription: "Generate and manage billing statements",
      headerLink: "/app",
      buttons: [
        {
          buttonName: "Back to SOA Dashboard",
          buttonIcon: ArrowBigLeft,
          buttonLink: "/app/soa-generation",
          buttonStyle:
            "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary rounded-sm cursor-default",
        },
      ],
    },
  ];

  const partyLabel =
    serviceType === "Partnership" ? "Partner Name" : "Customer Name";

  // --- helpers ---------------------------------------------------------

  const totalAmount = useMemo(
    () =>
      deliveries.reduce(
        (sum, d) => sum + (parseFloat(d.amount || 0) || 0),
        0
      ),
    [deliveries]
  );

  // We’re treating everything as "Not Yet Paid" on generation
  const totalPaid = 0;
  const totalNotYetPaid = totalAmount - totalPaid;

  const handleAmountChange = (idx, value) => {
    const updated = [...deliveries];
    updated[idx] = {
      ...updated[idx],
      amount: value === "" ? "" : Math.max(0, Number(value)),
    };
    setDeliveries(updated);
  };

  // --- load partner/customer list whenever service type changes -------

  useEffect(() => {
    const fetchParties = async () => {
      setIsLoadingParties(true);
      setError("");
      setPartyOptions([]);
      setSelectedParty("");

      try {
        const res = await axios.get(`${API_BASE_URL}/soa_get_parties.php`, {
          params: { service_type: serviceType },
          withCredentials: true,
        });

        if (!res.data.success) throw new Error(res.data.message);

        setPartyOptions(res.data.data || []);
        if (res.data.data?.length > 0) setSelectedParty(res.data.data[0]);

      } catch (err) {
        toast.error(err.response?.data?.message || err.message || "Failed to load list");
      } finally {
        setIsLoadingParties(false);
      }
    };

    fetchParties();
    setDeliveries([]);
  }, [serviceType]);


  // --- load completed deliveries --------------------------------------

  const handleLoadDeliveries = async () => {
    setError("");
    setSuccessMsg("");

    if (!selectedParty) {
      toast.error(`Please select a ${partyLabel.toLowerCase()}.`);
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error("Please select both start and end dates.");
      return;
    }

    setIsLoadingDeliveries(true);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/soa_get_completed_deliveries.php`,
        {
          params: {
            service_type: serviceType,
            party_name: selectedParty,
            date_from: dateFrom,
            date_to: dateTo,
          },
          withCredentials: true,
        }
      );

      if (!res.data.success) throw new Error(res.data.message);

      const rows = (res.data.data || []).map((row) => ({
        ...row,
        amount: row.default_amount || 0,
        status: "Not Yet Paid",
      }));

      setDeliveries(rows);

      if (rows.length === 0) {
        toast.warning("No completed bookings found for the selected filters.");
      } else {
        toast.success("Completed bookings loaded successfully!");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load deliveries."
      );
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  // --- generate SOA ----------------------------------------------------

  const handleGenerateSOA = async () => {
    setError("");
    setSuccessMsg("");

    if (deliveries.length === 0) {
      toast.error("No deliveries to include. Please load completed bookings.");
      return;
    }

    const hasInvalidAmount = deliveries.some(
      (d) => d.amount === "" || isNaN(Number(d.amount))
    );

    if (hasInvalidAmount) {
      toast.error("Please enter a valid amount for all deliveries.");
      return;
    }

    setIsGenerating(true);

    try {
      const payload = {
        service_type: serviceType,
        party_name: selectedParty,
        date_from: dateFrom,
        date_to: dateTo,
        deliveries: deliveries.map((d) => ({
          assignment_id: d.assignment_id,
          dr_number: d.dr_number,
          route: d.route,
          plate_number: d.plate_number,
          delivery_date: d.delivery_date,
          amount: Number(d.amount),
        })),
      };

      const res = await axios.post(
        `${API_BASE_URL}/soa_generate.php`,
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.data.success) throw new Error(res.data.message);

      toast.success(
        `SOA #${res.data.soa_id} generated successfully! Total: ₱${res.data.total_amount.toLocaleString()}`
      );

      setDeliveries([]);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to generate SOA."
      );
    } finally {
      setIsGenerating(false);
    }
  };


  // --- remove row ------------------------------------------------------

  const handleRemoveRow = (idx) => {
    const updated = deliveries.filter((_, i) => i !== idx);
    setDeliveries(updated);
  };

  // --------------------------------------------------------------------

  return (
    <div className="flex-1 pt-10 md:pt-0">
      <MenuHeader headerData={headerData} />

      <div className="mt-6 space-y-6">
        {/* Filters */}
        <div className="rounded-xl border bg-card p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Step 1: Select Filters</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose service type, {partyLabel.toLowerCase()}, and date range.
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            {/* Service type */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Service Type</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="Partnership">Partnership</option>
                <option value="LipatBahay">Lipat Bahay</option>
              </select>
            </div>

            {/* Partner/Customer */}
            <div className="space-y-1">
              <label className="text-sm font-medium">{partyLabel}</label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                disabled={isLoadingParties || partyOptions.length === 0}
              >
                {partyOptions.length === 0 && (
                  <option value="">
                    {isLoadingParties ? "Loading..." : "No records"}
                  </option>
                )}
                {partyOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date to */}
            <div className="space-y-1">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleLoadDeliveries}
              disabled={isLoadingDeliveries}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
            >
              {isLoadingDeliveries ? "Loading..." : "Load Completed Bookings"}
            </button>
          </div>
        </div>

        {/* Step 3 table (your screenshot) */}
        <div className="rounded-xl border bg-card p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">
            Step 3: Review and Edit Amounts
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adjust delivery amounts as needed before generating the SOA.
          </p>

          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left">No.</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Route</th>
                  <th className="px-4 py-2 text-left">Plate Number</th>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      No deliveries loaded. Use the filters above to load
                      completed bookings.
                    </td>
                  </tr>
                )}

                {deliveries.map((row, idx) => (
                  <tr key={row.assignment_id} className="border-t">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.delivery_date}
                    </td>
                    <td className="px-4 py-2">{row.route}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {row.plate_number}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        className="w-28 rounded-md border px-2 py-1 text-right"
                        value={row.amount}
                        onChange={(e) =>
                          handleAmountChange(idx, e.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-2">Not Yet Paid</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        className="inline-flex items-center rounded-md border px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-semibold">
                ₱{totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground mb-1">Paid</p>
              <p className="text-2xl font-semibold text-green-600">₱0</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground mb-1">
                Not Yet Paid
              </p>
              <p className="text-2xl font-semibold text-red-600">
                ₱{totalNotYetPaid.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {error && (
              <div className="text-sm text-red-600 font-medium">{error}</div>
            )}
            {successMsg && !error && (
              <div className="text-sm text-emerald-600 font-medium">
                {successMsg}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 md:ml-auto">
              <button
                type="button"
                onClick={handleGenerateSOA}
                disabled={isGenerating || deliveries.length === 0}
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-70"
              >
                {isGenerating ? "Generating..." : "Generate SOA Document"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOAGeneration;
