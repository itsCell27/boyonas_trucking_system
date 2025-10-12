import { ChevronLeft, ChevronRight, Truck, LayoutDashboard, Wrench, Users, BarChart3, FileText, Settings } from "lucide-react"
import './index.css'
import React, { useState } from "react"
import { Link, useLocation } from "react-router-dom"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Services", icon: Wrench, path: "/services" },
  { name: "Fleet Management", icon: Truck, path: "/fleet-management" },
  { name: "Employee Management", icon: Users, path: "/employee-management" },
  { name: "Operations", icon: BarChart3, path: "/operations" },
  { name: "SOA Generation", icon: FileText, path: "/soa-generation" },
  { name: "Settings", icon: Settings, path: "/settings" },
]

function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const location = useLocation();
    
    const toggleSidebar = () => {
        setIsCollapsed((previous) => !previous);
    };

    return (
        <nav className={`relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300
            ${isCollapsed ? "w-16" : "w-64"}`}>
            <div className="sticky top-0 left-0">
                {/* Profile */}
                <section className="flex items-center justify-between p-4 border-b border-sidebar-border">
                    <div className={`${isCollapsed ? "hidden " : "flex items-center justify-center space-x-3"}`}>
                        {/* Profile Picture */}
                        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                            <span className="text-sidebar-primary-foreground font-bold text-sm-noline-heaight">B</span>
                        </div>
                        {/* Username */}
                        <div>
                            <h1 className="text-sm font-bold text-[var(--sidebar-foreground)]">Boyonas Trucking</h1>
                            <p className="text-xs text-sidebar-foreground/60">Service Management</p>
                        </div>
                    </div> 
                    {/* Navbar toggle button */}
                    <button onClick={toggleSidebar} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sidebar-accent transition">
                        {isCollapsed ? <ChevronRight className="w-4 h4"/> : <ChevronLeft className="w-4 h4"/>}
                    </button>
                </section>
                {/* Menus */}
                <menu className="flex-1 px-3 py-4 flex flex-col">
                    {navigation.map((navigate, index) => {
                            const Icon = navigate.icon;
                            const active = location.pathname === navigate.path || (location.pathname === "/" && navigate.path === "/dashboard");
                            const baseClass = "w-full h-10 inline-flex items-center justify-start px-3 py-2 rounded-md font-medium text-sm mb-1 gap-3"
                            const activeClass = active
                                ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                                : "text-sidebar-foreground hover:bg-sidebar-accent";
                            return (
                                <Link key={index} to={navigate.path} className={`${baseClass} ${activeClass}`}>
                                    <Icon className="w-4 h-4 flex-shrink-0"/>
                                    <span className={`${isCollapsed ? "hidden" : "text-sm"}`}>{navigate.name}</span>
                                </Link>
                            )  
                        })
                    }
                </menu>
            </div>
        </nav>
    )
}

export default Sidebar;