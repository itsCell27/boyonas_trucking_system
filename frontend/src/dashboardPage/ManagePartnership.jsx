import React, { useState } from 'react';
import { PlusCircle, Search, ListFilter, File, MoreHorizontal } from 'lucide-react';

// Mock data based on the provided page
const deliveries = [
    {
        id: 'TRK-001',
        customer: { name: 'SPX Express', email: 'liam.johnson@spx.com' },
        status: 'Delivered',
        totalAmount: 250.00,
        date: '2023-06-23',
    },
    {
        id: 'TRK-002',
        customer: { name: 'J&T Express', email: 'olivia.smith@jnt.com' },
        status: 'Delivered',
        totalAmount: 150.00,
        date: '2023-06-24',
    },
    {
        id: 'TRK-003',
        customer: { name: 'Flash Express', email: 'noah.williams@flash.com' },
        status: 'Pending',
        totalAmount: 350.00,
        date: '2023-06-25',
    },
    {
        id: 'TRK-004',
        customer: { name: 'LBC Express', email: 'emma.brown@lbc.com' },
        status: 'Delivered',
        totalAmount: 450.00,
        date: '2023-06-26',
    },
    {
        id: 'TRK-005',
        customer: { name: '2GO Express', email: 'ava.jones@2go.com' },
        status: 'Canceled',
        totalAmount: 550.00,
        date: '2023-06-27',
    },
    {
        id: 'TRK-006',
        customer: { name: 'XDE Logistics', email: 'sophia.davis@xde.com' },
        status: 'Delivered',
        totalAmount: 200.00,
        date: '2023-06-28',
    },
    {
        id: 'TRK-007',
        customer: { name: 'Entrego', email: 'isabella.miller@entrego.com' },
        status: 'Pending',
        totalAmount: 300.00,
        date: '2023-06-29',
    },
];

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    const statusClasses = {
        Delivered: "bg-green-100 text-green-800",
        Pending: "bg-orange-100 text-orange-800",
        Canceled: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

function ManagePartnership() {
    const [selected, setSelected] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(deliveries.map(d => d.id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    return (
        <div className="flex flex-col w-full p-4 sm:p-6 md:p-8 bg-background text-foreground">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Partnership Operations</h1>
                    <p className="text-muted-foreground mt-1">Manage all B2B deliveries and operations.</p>
                </div>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Add New Delivery
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm border">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filter deliveries..."
                                className="w-full pl-10 pr-4 py-2 border rounded-md h-9 text-sm bg-background"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2 w-full sm:w-auto">
                                <ListFilter className="w-4 h-4" />
                                Filter
                            </button>
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 gap-2 w-full sm:w-auto">
                                <File className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr className="text-muted-foreground">
                                    <th className="h-12 px-4 text-left align-middle font-medium w-12">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300"
                                            onChange={handleSelectAll}
                                            checked={selected.length === deliveries.length && deliveries.length > 0}
                                        />
                                    </th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">Delivery ID</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium">Total Amount</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium hidden md:table-cell">Date</th>
                                    <th className="h-12 px-4 text-right align-middle font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {deliveries.map((delivery) => (
                                    <tr key={delivery.id} className="border-b hover:bg-accent/50">
                                        <td className="p-4 align-middle">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={selected.includes(delivery.id)}
                                                onChange={() => handleSelectOne(delivery.id)}
                                            />
                                        </td>
                                        <td className="p-4 align-middle font-medium">{delivery.id}</td>
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">{delivery.customer.name}</div>
                                            <div className="text-muted-foreground text-xs hidden sm:block">{delivery.customer.email}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <StatusBadge status={delivery.status} />
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            ₱{delivery.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="p-4 align-middle hidden md:table-cell">
                                            {new Date(delivery.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <button className="p-1 hover:bg-gray-200 rounded-full">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-6">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-7</strong> of <strong>{deliveries.length}</strong> deliveries
                        </div>
                        <div className="flex gap-2">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                Previous
                            </button>
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ManagePartnership;