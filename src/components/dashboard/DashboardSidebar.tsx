import { LayoutGrid, ClipboardList, BarChart3, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "production", label: "Production Status", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <aside 
      className={cn(
        "min-h-[calc(100vh-64px)] bg-[#FAF9F6] border-r border-gray-200 p-2 md:p-4 transition-all duration-300",
        isMobile ? "w-16" : "w-64"
      )}
    >
      <nav className="space-y-1 md:space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isMobile ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 md:px-4 py-3 rounded-lg text-left transition-colors",
                isMobile && "justify-center px-2",
                isActive
                  ? "bg-[#344C3D] text-white"
                  : "text-[#344C3D] hover:bg-[#344C3D]/10"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isMobile && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
