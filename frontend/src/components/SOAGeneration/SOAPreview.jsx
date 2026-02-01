// SOAPreview.jsx  (replace your current file)
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { FileText, Edit3, Save, X } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"

/* Note: This file started from your original SOAPreview.jsx. See the original for layout. :contentReference[oaicite:2]{index=2} */

const statusClass = (s) => {
  if (s === "Paid") return "bg-green-100 text-green-800";
  if (s === "Not Yet Paid") return "bg-yellow-100 text-yellow-800";
  if (s === "Cancelled") return "bg-red-100 text-red-800";
  return "bg-gray-200 text-gray-800";
};

export default function SOAPreview({ open, onOpenChange, data }) {
  if (!data) return null;

  const { soa, details } = data;

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editedTax, setEditedTax] = useState(Number(soa.tax_percentage || 0));
  const [editedDetails, setEditedDetails] = useState([]);
  const [subtot, setSubtot] = useState(Number(soa.subtotal_amount || 0));
  const [taxAmount, setTaxAmount] = useState(Number(soa.tax_amount || 0));
  const [totalAmount, setTotalAmount] = useState(Number(soa.total_amount || 0));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // reset edit fields when dialog opens or data changes
    setEditMode(false);
    setEditedTax(Number(soa.tax_percentage || 0));
    setEditedDetails(details.map((d) => ({ ...d, amount: Number(d.amount) })));
    setSubtot(Number(soa.subtotal_amount || 0));
    setTaxAmount(Number(soa.tax_amount || 0));
    setTotalAmount(Number(soa.total_amount || 0));
  }, [open, soa, details]);

  const formatMoney = (n) =>
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Recompute totals from edited details + tax whenever editedDetails or editedTax changes
  useEffect(() => {
    const subtotal = editedDetails.reduce((acc, r) => {
      const v = Number(r.amount);
      return acc + (isNaN(v) ? 0 : v);
    }, 0);
    const tax = Math.round((subtotal * (Number(editedTax || 0) / 100)) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    setSubtot(subtotal);
    setTaxAmount(tax);
    setTotalAmount(total);
  }, [editedDetails, editedTax]);

  const onChangeDetailAmount = (soa_detail_id, newVal) => {
    setEditedDetails((prev) =>
      prev.map((r) =>
        r.soa_detail_id === soa_detail_id
          ? { ...r, amount: newVal === "" ? "" : Number(newVal) }
          : r
      )
    );
  };

  const validateBeforeSave = () => {
    if (!Array.isArray(editedDetails)) return "Invalid details";
    for (const r of editedDetails) {
      if (r.amount === "" || r.amount === null || isNaN(r.amount)) {
        return "All amounts must be numeric (enter 0 for zero).";
      }
      if (Number(r.amount) < 0) return "Amounts cannot be negative.";
    }
    if (isNaN(Number(editedTax)) || Number(editedTax) < 0) return "Tax percentage must be a non-negative number.";
    return null;
  };

  const handleSave = async () => {
    const invalid = validateBeforeSave();
    if (invalid) {
      toast.error(invalid);
      return;
    }

    // Only allow saving when SOA is not Paid (server also enforces)
    if (soa.status === "Paid") {
      toast.error("Cannot edit a Paid SOA.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        soa_id: soa.soa_id,
        tax_percentage: Number(editedTax),
        details: editedDetails.map((d) => ({
          soa_detail_id: d.soa_detail_id,
          amount: Number(d.amount),
        })),
      };

      const resp = await axios.post(
        `${API_BASE_URL}/update_soa_full.php`,
        payload,
        { withCredentials: true }
      );

      if (!resp.data.success) {
        toast.error(resp.data.message || "Failed to save changes.");
        setSaving(false);
        return;
      }

      toast.success("SOA updated successfully.");

      // Close dialog and refresh page (or you can trigger a parent refresh)
      onOpenChange(false);

      // simplest: refresh to show updated data across UI
      setTimeout(() => {
        window.location.reload();
      }, 400);

    } catch (err) {
      console.error(err);
      toast.error("Server error while saving changes.");
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // reset state and exit edit mode
    setEditedTax(Number(soa.tax_percentage || 0));
    setEditedDetails(details.map((d) => ({ ...d, amount: Number(d.amount) })));
    setEditMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-6 rounded-xl">
        <DialogHeader className="flex flex-row justify-between items-center mt-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" /> SOA Preview
          </DialogTitle>

          <div className="flex items-center gap-3">
            {/* Hide Edit button if Paid */}
            {soa.status !== "Paid" && (
              <>
                {!editMode ? (
                  <Button
                    variant="ghost"
                    onClick={() => setEditMode(true)}
                    title="Edit SOA (amounts and tax)"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </Button>
                ) : (
                  <>
                    <Button
                    
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={saving}
                    >
                      <X className="w-4 h-4" /> Cancel
                    </Button>
                  </>
                )}
              </>
            )}

            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusClass(soa.status)}`}>
              {soa.status}
            </span>
          </div>
        </DialogHeader>

        {/* Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-2xl font-bold">BOYONAS TRUCKING SERVICE</h2>
          <p className="text-sm text-muted-foreground">Statement of Account</p>
        </div>

        {/* Bill To + SOA Info */}
        <div className="grid grid-cols-2 gap-6 text-sm mt-4">
          <div>
            <p className="font-semibold">Bill To:</p>
            <p className="text-lg">{soa.party_name}</p>
          </div>

          <div>
            <p><strong>SOA #:</strong> {soa.soa_number}</p>
            <p><strong>Period:</strong> {soa.date_from} → {soa.date_to}</p>
            <p><strong>Generated:</strong> {soa.date_generated}</p>
          </div>
        </div>

        {/* SERVICE DETAILS TABLE */}
        <div className="mt-6">
          <p className="font-semibold mb-2">Service Details:</p>

          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-muted">
              <tr>
                <th className="p-2 text-left">DR #</th>
                <th className="p-2 text-left">Route</th>
                <th className="p-2 text-left">Plate #</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              { (editMode ? editedDetails : details).map((row) => (
                <tr key={row.soa_detail_id} className="border-t">
                  <td className="p-2">{row.dr_number}</td>
                  <td className="p-2">{row.route}</td>
                  <td className="p-2">{row.plate_number}</td>
                  <td className="p-2">{row.delivery_date}</td>
                  <td className="p-2 text-right font-medium">
                    {editMode ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.amount === "" ? "" : Number(row.amount)}
                        onChange={(e) => onChangeDetailAmount(row.soa_detail_id, e.target.value)}
                        className="w-28 text-right px-2 py-1 border rounded"
                      />
                    ) : (
                      `₱${Number(row.amount).toLocaleString()}`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL SECTION */}
        <div className="mt-6 border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between items-center">
            <div>
              <p>Subtotal:</p>
              <p className="font-medium">₱{formatMoney(subtot)}</p>
            </div>

            <div>
              <p>Tax ({editMode ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editedTax}
                  onChange={(e) => setEditedTax(e.target.value)}
                  className="w-20 px-2 py-1 border rounded text-right"
                />
              ) : (
                `${soa.tax_percentage}%`
              )}):</p>

              <p className="font-medium">₱{formatMoney(taxAmount)}</p>
            </div>
          </div>

          <div className="flex justify-between mt-4 border-t pt-1">
            <p className="text-xl font-bold mt-2">
              Total Amount:
            </p>
            <p className="text-xl font-bold mt-2">₱{formatMoney(totalAmount)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
