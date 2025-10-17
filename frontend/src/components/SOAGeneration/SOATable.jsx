
import React from 'react';
import { Eye, Download, Send, MoreHorizontal } from 'lucide-react';

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
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Statement of Account Records</h2>
      <div className='space-y-4'>
        {soaRecords.map((record) => (
          <div key={record.id} className='border border-gray-200 rounded-lg p-4 space-y-3'>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-indigo-600">{record.id}</div>
                <div className="text-sm text-gray-600">{record.client}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${getStatusClass(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Period</div>
                <div className="font-medium text-gray-800">{record.period}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount</div>
                <div className="font-medium text-lg text-gray-800">{record.amount}</div>
              </div>
              <div>
                <div className="text-gray-500">Due Date</div>
                <div className="font-medium text-gray-800">{record.dueDate}</div>
              </div>
              <div>
                <div className="text-gray-500">Deliveries</div>
                <div className="font-medium text-gray-800">{record.deliveries}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200">
              <div className="text-sm text-gray-500">Generated: {record.generatedDate}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => onPreview(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-accent hover:text-white">
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-accent hover:text-white">
                  <Download size={14} />
                  <span>Download</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90">
                  <Send size={14} />
                  <span>Send</span>
                </button>
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
