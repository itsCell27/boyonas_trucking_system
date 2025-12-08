import React from 'react';
import { FileText } from 'lucide-react';

const statusClass = (s) => {
  if (s === "Paid") return "bg-green-100 text-green-800";
  if (s === "Not Yet Paid") return "bg-yellow-100 text-yellow-800";
  if (s === "Cancelled") return "bg-red-100 text-red-800";
  return "bg-gray-200 text-gray-800";
};

export default function SOAPreview({ data }) {
  if (!data) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">SOA Preview</h2>
        <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-lg">
          <p>Select an SOA to preview.</p>
        </div>
      </div>
    );
  }

  const { soa, details } = data;

  return (
    <div className="bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
      <div className="px-6 flex justify-between">
        <span className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" /> SOA Preview
        </span>
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${statusClass(soa.status)}`}>
          {soa.status}
        </span>
      </div>

      <div className="px-6 space-y-6">
        <div className="space-y-4">
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold">BOYONAS TRUCKING SERVICE</h2>
            <p className="text-sm text-muted-foreground">Statement of Account</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">SOA ID:</div>
              <div>{soa.soa_id}</div>
            </div>

            <div className="text-right">
              <div><strong>Period:</strong> {soa.date_from} → {soa.date_to}</div>
              <div><strong>Generated:</strong> {soa.date_generated}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="font-medium text-muted-foreground mb-2">Delivery Details:</div>
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-card">
              <tr>
                <th className="p-2 text-left">DR #</th>
                <th className="p-2 text-left">Route</th>
                <th className="p-2 text-center">Plate #</th>
                <th className="p-2 text-center">Date</th>
                <th className="p-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {details.map(row => (
                <tr key={row.soa_detail_id} className="border-t">
                  <td className="p-2">{row.dr_number}</td>
                  <td className="p-2">{row.route}</td>
                  <td className="p-2 text-center">{row.plate_number}</td>
                  <td className="p-2 text-center">{row.delivery_date}</td>
                  <td className="p-2 text-right font-medium">
                    ₱{Number(row.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
