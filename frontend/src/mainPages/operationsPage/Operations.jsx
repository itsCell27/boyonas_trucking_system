import '../../index.css'
import MenuHeader from '../../components/MenuHeader'
import LiveMonitoring from './LiveMonitoring'
import React, { useState } from 'react'
import { Truck, CircleDotDashed, CircleCheckBig, TriangleAlert, Filter, Download, Plus, Ellipsis, User, Clock, RefreshCw, ArrowRight, Phone, Package } from 'lucide-react'

const operationsHeaderContent = [
    {
        headerName: "Operations Monitoring",
        headerDescription: "Real-time oversight of all trucking operations",
        headerLink: "/",
        buttons: [
        ]
    }
]

function Operations() {

    const [activeTab, setActiveTab] = useState('Live Monitoring');

    const tabs = ['Live Monitoring', 'Delivery History', 'Performance Analysis'];

    return (
        <>
            <MenuHeader headerData={operationsHeaderContent} />

            {/* Tabs */}
            <div className="p-1 bg-muted rounded-md flex items-center space-x-2 mt-6 w-full">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === tab
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-background/50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Live Monitoring' && (
                <LiveMonitoring />
            )}

            {activeTab !== 'Live Monitoring' && (
                 <div className="flex items-center justify-center h-96 bg-card rounded-xl border border-foreground/10 mt-8">
                    <p className="text-muted-foreground">Content for {activeTab} will be available soon.</p>
                </div>
            )}
        </>
    )
}


export default Operations;