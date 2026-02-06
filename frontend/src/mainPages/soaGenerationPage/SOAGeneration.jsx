// --- imports unchanged ---
import React, { useEffect, useMemo, useState } from "react";
import { Trash2, ArrowBigLeft, CalendarIcon } from "lucide-react";
import MenuHeader from "@/components/MenuHeader";
import { API_BASE_URL } from "@/config";
import axios from "axios";
import { toast } from "sonner";
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"

const SOAGeneration = () => {
  const [serviceType, setServiceType] = useState("Partnership");
  const [partyOptions, setPartyOptions] = useState([]);
  const [selectedParty, setSelectedParty] = useState("");
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  const [deliveries, setDeliveries] = useState([]);
  const [isLoadingParties, setIsLoadingParties] = useState(false);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // NEW: Tax percentage
  const [taxPercentage, setTaxPercentage] = useState(0);

  const partyLabel =
    serviceType === "Partnership" ? "Partner Name" : "Customer Name";

  // --- restore headerData used by MenuHeader (prevents headerData undefined error) ---
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
            "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all shrink-0 px-3 py-2 text-white bg-primary rounded-sm",
        },
      ],
    },
  ];

  // -------------------------------------------------------------------------
  // SUBTOTAL / TAX / TOTAL (client preview)
  // -------------------------------------------------------------------------
  const subtotal = useMemo(
    () => deliveries.reduce((sum, d) => sum + (parseFloat(d.amount || 0) || 0), 0),
    [deliveries]
  );

  const taxAmount = useMemo(
    () => +(subtotal * (taxPercentage / 100)).toFixed(2),
    [subtotal, taxPercentage]
  );

  const totalAmount = useMemo(
    () => +(subtotal + taxAmount).toFixed(2),
    [subtotal, taxAmount]
  );

  // -------------------------------------------------------------------------
  const handleAmountChange = (idx, value) => {
    const updated = [...deliveries];
    updated[idx] = { ...updated[idx], amount: value === "" ? "" : Math.max(0, Number(value)) };
    setDeliveries(updated);
  };

  const handleRemoveRow = (idx) => {
    setDeliveries((prev) => prev.filter((_, i) => i !== idx));
  };

  // -------------------------------------------------------------------------
  // LOAD PARTNERS/CUSTOMERS
  // -------------------------------------------------------------------------
  useEffect(() => {
    const fetchParties = async () => {
      setIsLoadingParties(true);
      setPartyOptions([]);
      setSelectedParty("");

      try {
        const res = await axios.get(`${API_BASE_URL}/soa_get_parties.php`, {
          params: { service_type: serviceType },
          withCredentials: true,
        });

        if (!res.data.success) throw new Error(res.data.message);

        const list = res.data.data || [];
        setPartyOptions(list);

        if (list.length > 0) setSelectedParty(list[0]);
      } catch (err) {
        toast.error(err.response?.data?.message || err.message);
      } finally {
        setIsLoadingParties(false);
      }
    };

    fetchParties();
    setDeliveries([]);
  }, [serviceType]);

  // -------------------------------------------------------------------------
  // LOAD COMPLETED DELIVERIES
  // -------------------------------------------------------------------------
  const handleLoadDeliveries = async () => {
    if (!selectedParty) return toast.error(`Please select a ${partyLabel}.`);
    if (!dateFrom || !dateTo) return toast.error("Please select a date range.");

    setIsLoadingDeliveries(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/soa_get_completed_deliveries.php`, {
        params: {
          service_type: serviceType,
          party_name: selectedParty,
          date_from: dateFrom.toISOString().split("T")[0],
          date_to: dateTo.toISOString().split("T")[0],
        },
        withCredentials: true,
      });

      if (!res.data.success) throw new Error(res.data.message);

      const rows = (res.data.data || []).map((row) => ({
        ...row,
        amount: row.default_amount || 0,
        status: "Not Yet Paid",
      }));

      setDeliveries(rows);

      if (rows.length === 0) toast.warning("No completed bookings found.");
      else toast.success("Completed bookings loaded!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  // -------------------------------------------------------------------------
  // GENERATE SOA
  // -------------------------------------------------------------------------
  const handleGenerateSOA = async () => {
    if (deliveries.length === 0) return toast.error("No deliveries loaded.");

    const invalidAmount = deliveries.some(
      (d) => d.amount === "" || isNaN(Number(d.amount)) || Number(d.amount) <= 0
    );

    if (invalidAmount) return toast.error("Each amount must be greater than 0.");

    const missing = deliveries.some((d) => !d.booking_id);
    if (missing) return toast.error("Missing booking_id on some deliveries.");

    setIsGenerating(true);

    try {
      const payload = {
        service_type: serviceType,
        party_name: selectedParty,
        date_from: dateFrom.toISOString().split("T")[0],
        date_to: dateTo.toISOString().split("T")[0],
        tax_percentage: Number(taxPercentage), // NEW
        deliveries: deliveries.map((d) => ({
          booking_id: d.booking_id,
          dr_number: d.dr_number,
          route: d.route,
          plate_number: d.plate_number,
          delivery_date: d.delivery_date,
          amount: Number(d.amount),
        })),
        remarks: "",
      };

      const res = await axios.post(`${API_BASE_URL}/soa_generate.php`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (!res.data.success) throw new Error(res.data.message);

      toast.success(
        `SOA #${res.data.soa_id} created! Total: ₱${res.data.total_amount.toLocaleString()}`
      );

      setDeliveries([]);
      setTaxPercentage(0);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------------------
  const DatePicker = ({ label, value, onChange }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? value.toLocaleDateString("en-CA") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            captionLayout="dropdown"
            initialFocus
            className="w-full rounded-xl"
          />
        </PopoverContent>
      </Popover>
    </div>
  );

  // -------------------------------------------------------------------------
  return (
    <div className="flex-1 pt-10 md:pt-0">
      <MenuHeader headerData={headerData} />

      <div className="mt-6 space-y-6">

        {/* FILTER PANEL */}
        <div className="rounded-xl border bg-card p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Step 1: Select Filters</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose service type, {partyLabel.toLowerCase()}, and date range.
          </p>

          <div className="grid gap-4 md:grid-cols-4">

            <div className="space-y-1">
              <label className="text-sm font-medium">Service Type</label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="LipatBahay">Lipat Bahay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">{partyLabel}</label>
              <Select
                value={selectedParty}
                onValueChange={setSelectedParty}
                disabled={isLoadingParties || partyOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingParties ? "Loading..." : "Select party"} />
                </SelectTrigger>
                <SelectContent>
                  {partyOptions.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DatePicker label="Start Date" value={dateFrom} onChange={setDateFrom} />
            <DatePicker label="End Date" value={dateTo} onChange={setDateTo} />
          </div>

          {/* TAX INPUT */}
          <div className="mt-4">
            <label className="text-sm font-medium">Tax Percentage (%)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(e.target.value)}
              className="w-32 mt-1"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleLoadDeliveries} disabled={isLoadingDeliveries}>
              {isLoadingDeliveries ? "Loading..." : "Load Completed Bookings"}
            </Button>
          </div>
        </div>

        {/* STEP 3 TABLE */}
        <div className="rounded-xl border bg-card p-4 md:p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Step 3: Review and Edit Amounts</h2>

          <div className="overflow-x-auto rounded-lg border mt-4">
            <table className="min-w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2">No.</th>
                  <th className="px-4 py-2">DR Number</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Route</th>
                  <th className="px-4 py-2">Plate Number</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-muted-foreground">
                      No deliveries loaded. Use the filters above.
                    </td>
                  </tr>
                )}

                {deliveries.map((row, idx) => (
                  <tr key={`${row.booking_id}-${idx}`} className="border-t">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{row.dr_number}</td>
                    <td className="px-4 py-2">{row.delivery_date}</td>
                    <td className="px-4 py-2">{row.route}</td>
                    <td className="px-4 py-2">{row.plate_number}</td>

                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        className="w-24"
                        value={row.amount}
                        onChange={(e) => handleAmountChange(idx, e.target.value)}
                      />
                    </td>

                    <td className="px-4 py-2">{row.status || "Not Yet Paid"}</td>

                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="inline-flex items-center border rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1 h-3 w-3" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTAL PREVIEW */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Subtotal</p>
              <p className="text-xl font-semibold">₱{subtotal.toLocaleString()}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Tax ({taxPercentage}%)</p>
              <p className="text-xl font-semibold">₱{taxAmount.toLocaleString()}</p>
            </div>

            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-xl font-semibold text-primary">
                ₱{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  Generate SOA Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
                <DialogHeader className="flex flex-col gap-4">
                  <DialogTitle>Ready to Generate SOA?</DialogTitle>
                  <DialogDescription>
                    This will finalize the selected successful deliveries and create the Statement of Account.
                    Changes to delivery details won’t be allowed after this step.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-3 sm:gap-1">
                  <DialogClose asChild>
                    <Button variant="outline">Go Back</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleGenerateSOA} disabled={isGenerating || deliveries.length === 0}>
                      {isGenerating ? "Generating..." : "Confirm & Generate"}
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOAGeneration;
