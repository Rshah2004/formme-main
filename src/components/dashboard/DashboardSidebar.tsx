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

  if (isMobile) {
    return (
      <aside className="w-full bg-[#FAF9F6] border-b border-gray-200">
        <nav className="flex items-center gap-2 overflow-x-auto px-2 py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                data-help-target={`sidebar-${item.id}`}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[84px] text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#344C3D] text-white"
                    : "text-[#344C3D] hover:bg-[#344C3D]/10"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="min-h-[calc(100vh-64px)] w-64 bg-[#FAF9F6] border-r border-gray-200 p-4 transition-all duration-300">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              data-help-target={`sidebar-${item.id}`}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                isActive
                  ? "bg-[#344C3D] text-white"
                  : "text-[#344C3D] hover:bg-[#344C3D]/10"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
