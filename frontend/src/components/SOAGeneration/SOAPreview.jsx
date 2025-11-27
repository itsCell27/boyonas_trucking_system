
import React from 'react';
import { FileText, Download, Send, SquarePen } from 'lucide-react';

const getStatusClass = (status) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SOAPreview = ({ record }) => {
  if (!record) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">SOA Preview</h2>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-foreground/10 rounded-lg">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12" />
            <h3 className="mt-2 text-sm font-medium text-muted-foreground">Select an SOA to preview</h3>
            <p className="mt-1 text-sm">The document preview will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Dummy data for service details table, as this wasn't in the main record object
  const serviceDetails = [
    { description: 'Metro Manila Deliveries', qty: 25, rate: '₱450.00', amount: '₱11,250.00' },
    { description: 'Provincial Deliveries', qty: 15, rate: '₱650.00', amount: '₱9,750.00' },
    { description: 'Express Deliveries', qty: 5, rate: '₱850.00', amount: '₱4,250.00' },
  ];
  const subtotal = 25250;
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  return (
    <div className="bg-card flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
      <div className="px-6">
        <div className="leading-none font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SOA Preview
          </span>
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(record.status)}`}>
            {record.status}
          </span>
        </div>
      </div>
      <div className="px-6 space-y-6">
        <div className="space-y-4">
          <div className="text-center border-b border-foreground/10 pb-4">
            <h2 className="text-xl font-bold">BOYONAS TRUCKING SERVICE</h2>
            <p className="text-sm text-muted-foreground">Statement of Account</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-muted-foreground">Bill To:</div>
              <div>{record.client}</div>
              <div>123 Business Ave, Makati City</div>
            </div>
            <div className="text-right">
              <div><span className="font-medium">SOA #:</span> {record.id}</div>
              <div><span className="font-medium">Period:</span> {record.period}</div>
              <div><span className="font-medium">Generated:</span> {record.generatedDate}</div>
              <div><span className="font-medium">Due Date:</span> {record.dueDate}</div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="font-medium text-muted-foreground">Service Details:</div>
          <div className="border border-foreground/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-card">
                <tr>
                  <th className="text-left p-2 font-medium text-muted-foreground">Description</th>
                  <th className="text-center p-2 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right p-2 font-medium text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {serviceDetails.map((item, index) => (
                  <tr key={index} className="border-t border-foreground/10">
                    <td className="p-2">{item.description}</td>
                    <td className="text-center p-2">{item.qty}</td>
                    <td className="text-right p-2">{item.rate}</td>
                    <td className="text-right p-2 font-medium">{item.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-2 border-t border-foreground/10 pt-4">
          <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal:</span><span>{`₱${subtotal.toFixed(2)}`}</span></div>
          <div className="flex justify-between text-sm text-muted-foreground"><span>Tax (10%):</span><span>{`₱${tax.toFixed(2)}`}</span></div>
          <div className="flex justify-between font-bold text-lg border-t border-foreground/10 pt-2"><span>Total Amount:</span><span>{`₱${total.toFixed(2)}`}</span></div>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-white h-9 px-4 py-2 w-full hover:bg-primary/90">
            <Download className="h-4 w-4 mr-2" />Download PDF
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-foreground/10 h-9 px-4 py-2 w-full bg-transparent hover:bg-accent hover:text-white">
            <Send className="h-4 w-4 mr-2" />Send to Client
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border border-gray-300 h-9 px-4 py-2 w-full bg-transparent hover:bg-accent hover:text-white">
            <SquarePen className="h-4 w-4 mr-2" />Edit SOA
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOAPreview;
