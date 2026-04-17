import { LayoutGrid, ClipboardList, BarChart3, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "dashboard",  label: "Dashboard",        icon: LayoutGrid   },
  { id: "orders",     label: "Orders",            icon: ClipboardList },
  { id: "production", label: "Production Status", icon: BarChart3    },
  { id: "messages",   label: "Messages",          icon: MessageSquare },
  { id: "settings",   label: "Settings",          icon: Settings     },
];

const DashboardSidebar = ({ activeTab, onTabChange }: DashboardSidebarProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <aside className="w-full bg-background border-b border-border">
        <nav className="flex items-center gap-1 overflow-x-auto px-2 py-2">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                data-help-target={`sidebar-${id}`}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg min-w-[80px] text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-primary/10"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="min-h-[calc(100vh-64px)] w-60 bg-background border-r border-border p-3 shrink-0">
      <div className="px-3 pt-2 pb-4 mb-2 border-b border-border">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          Workspace
        </p>
      </div>
      <nav className="space-y-1">
        {menuItems.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              data-help-target={`sidebar-${id}`}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-primary hover:bg-primary/8"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
