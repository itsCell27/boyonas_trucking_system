import '../../index.css'
import MenuHeader from '../../components/MenuHeader'
import LiveMonitoring from './LiveMonitoring'
import DeliveryHistory from './DeliveryHistory'
import PerformanceAnalysis from './PerformanceAnalysis'
import React, { useState } from 'react'
import { Truck, CircleDotDashed, CircleCheckBig, TriangleAlert, Filter, Download, Plus, Ellipsis, User, Clock, RefreshCw, ArrowRight, Phone, Package } from 'lucide-react'

const operationsHeaderContent = [
    {
        headerName: "Operations Monitoring",
        headerDescription: "Real-time oversight of all trucking operations",
        headerLink: "/app",
        buttons: [
        ]
    }
]

function Operations() {

    const [activeTab, setActiveTab] = useState('Live Monitoring');

    const tabs = ['Live Monitoring', 'Delivery History', 'Performance Analysis'];

    // decide what to render for the active tab
    const renderTabContent = () => {
        if (activeTab === 'Live Monitoring') {
        return <LiveMonitoring />;
        } else if (activeTab === 'Delivery History') {
        return <DeliveryHistory />;
        } else if (activeTab === 'Performance Analysis') {
        return <PerformanceAnalysis />;
        }
        return <LiveMonitoring />;
    };

  const content = renderTabContent();

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

            {/* Tab content */}
            {content}
        </>
    )
}


export default Operations;