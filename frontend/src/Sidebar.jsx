import { ChevronLeft, Truck, LayoutDashboard, Wrench, Users, BarChart3, FileText, Settings } from "lucide-react"
import './index.css'

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, },
  { name: "Services", icon: Wrench, },
  { name: "Fleet Management", icon: Truck, },
  { name: "Employee Management", icon: Users, },
  { name: "Operations", icon: BarChart3, },
  { name: "SOA Generation", icon: FileText, },
  { name: "Settings", icon: Settings, },
]

function Sidebar({ setSelected, menu }) {

    return (
        <nav className="flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 w-64">
            {/* Profile */}
            <section className="flex items-center justify-between p-4 border-b border-sidebar-border">
                <div className="flex items-center justify-center space-x-3">
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
                <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-sidebar-accent transition">
                    <ChevronLeft className="w-4 h4"/>
                </button>
            </section>
            {/* Menus */}
            <menu className="flex-1 px-3 py-4 flex flex-col">
                {navigation.map(({name, icon: Icon}) => {
                        const active = menu === name;
                        const baseClass = "w-full flex items-center justify-start px-4 py-2 rounded-md font-medium text-sm mb-1"
                        const activeClass = active
                            ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                            : "text-sidebar-foreground hover:bg-sidebar-accent";
                        return (
                            <button onClick={() => setSelected(name)} className={`${baseClass} ${activeClass}`}>
                                <Icon className="w-4 h-4 mr-3"/>
                                <span className="text-sm">{name}</span>
                            </button>
                        )  
                    })
                }
            </menu>
        </nav>
    )
}

export default Sidebar;