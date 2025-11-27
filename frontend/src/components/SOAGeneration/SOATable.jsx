
import React from 'react';
import { Eye, Download, Send, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const soaRecords = [
  {
    id: 'SOA-2024-001',
    client: 'Flash Express',
    service: 'Partnership Deliveries',
    status: 'paid',
    period: 'January 2024',
    amount: '₱125,450.00',
    dueDate: '2024-02-15',
    deliveries: '45 items',
    generatedDate: '2024-01-31',
  },
  {
    id: 'SOA-2024-002',
    client: 'Rodriguez Family',
    service: 'Lipat Bahay Services',
    status: 'pending',
    period: 'February 2024',
    amount: '₱15,000.00',
    dueDate: '2024-03-10',
    deliveries: '1 item',
    generatedDate: '2024-02-28',
  },
  // Add more records as needed
];

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

function SOATable({ onPreview }) {
  return (
    <div className="bg-card border p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Statement of Account Records</h2>
      <div className='space-y-4'>
        {soaRecords.map((record) => (
          <div key={record.id} className='bg-background border rounded-lg p-4 space-y-3'>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{record.id}</div>
                <div className="text-sm text-muted-foreground">{record.client}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Period</div>
                <div className="font-medium">{record.period}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium text-lg">{record.amount}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Due Date</div>
                <div className="font-medium">{record.dueDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Deliveries</div>
                <div className="font-medium">{record.deliveries}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-muted-foreground">
              <div className="text-sm">Generated: {record.generatedDate}</div>
              <div className="flex items-center gap-2">
                <Button onClick={() => onPreview(record)} variant="outline">
                  <Eye size={14} />
                  <span>Preview</span>
                </Button>
                <Button variant="outline">
                  <Download size={14} />
                  <span>Download</span>
                </Button>
                <Button>
                  <Send size={14} />
                  <span>Send</span>
                </Button>
                {/* <button className="p-2 text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-accent hover:text-white">
                  <MoreHorizontal size={14} />
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SOATable;
