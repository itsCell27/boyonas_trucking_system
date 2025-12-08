import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

function SOATable({ onPreview }) {
  const [records, setRecords] = useState([]);

  const fetchRecords = async () => {
    try {
      const resp = await axios.get(`${API_BASE_URL}/get_soa_list.php`);
      if (resp.data.success) {
        setRecords(resp.data.records);
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

  const statusClass = (status) => {
    if (status === "Paid") return "bg-green-100 text-green-800";
    if (status === "Not Yet Paid") return "bg-yellow-100 text-yellow-800";
    if (status === "Cancelled") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-card border p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Statement of Account Records</h2>

      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.soa_id} className="bg-background border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">SOA-{record.soa_id}</div>
                <div className="text-sm text-muted-foreground">{record.service_type}</div>
              </div>

              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusClass(record.status)}`}>
                {record.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Period</div>
                <div>{record.date_from} → {record.date_to}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium text-lg">₱{Number(record.total_amount).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Generated</div>
                <div>{record.date_generated}</div>
              </div>
              <div>
                <div className="text-muted-foreground">By</div>
                <div>{record.generated_by}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-muted-foreground">
              <div className="text-sm"></div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => onPreview(record.soa_id)}>
                  <Eye size={14} /> Preview
                </Button>
                <Button variant="outline">
                  <Download size={14} /> Download
                </Button>
                <Button>
                  <Send size={14} /> Send
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SOATable;
