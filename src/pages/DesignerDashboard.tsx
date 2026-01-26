import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, SlidersHorizontal, Shirt } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardPreviewOverlay from "@/components/dashboard/DashboardPreviewOverlay";
import StatCard from "@/components/dashboard/StatCard";
import OrderCard from "@/components/dashboard/OrderCard";
import { useDesignerDashboard, getStepFromStatus } from "@/hooks/useDesignerDashboard";

const DesignerDashboard = () => {
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const { designs, orders, isLoading, isAuthenticated, stats, navigate } = useDesignerDashboard(isPreviewMode);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [manufacturerFilter, setManufacturerFilter] = useState("all");
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);

  // Handle click on preview content to show sign-up overlay
  const handlePreviewClick = () => {
    if (isPreviewMode && isAuthenticated === false) {
      setShowSignUpOverlay(true);
    }
  };

  // Get unique manufacturers for filter
  const manufacturers = [...new Set(orders.filter(o => o.manufacturers?.name).map(o => o.manufacturers?.name))];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.designs?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesManufacturer = manufacturerFilter === "all" || order.manufacturers?.name === manufacturerFilter;
    return matchesSearch && matchesStatus && matchesManufacturer;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setManufacturerFilter("all");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-muted rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Preview Mode Badge */}
      {isPreviewMode && !isAuthenticated && (
        <div className="flex justify-center">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
            PREVIEW MODE
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            {isPreviewMode && !isAuthenticated 
              ? "Previewing active workspace" 
              : "Track your designs from concept to delivery"
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isPreviewMode && !isAuthenticated}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          title="Orders Placed" 
          value={stats.ordersPlaced} 
          change="+12%" 
          color="blue" 
        />
        <StatCard 
          title="In Sampling" 
          value={stats.inSampling} 
          change="+2" 
          color="purple" 
        />
        <StatCard 
          title="In Production" 
          value={stats.inProduction} 
          change="+4" 
          color="orange" 
        />
        <StatCard 
          title="Delivered" 
          value={stats.delivered} 
          change="+8%" 
          color="green" 
        />
      </div>

      {/* Manufacturing Orders Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Manufacturing Orders</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button onClick={() => navigate("/new-design")} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => navigate("/new-design")}>
              Create your first design
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                orderId={order.id}
                designName={order.designs?.name || "Untitled"}
                manufacturerName={order.manufacturers?.name || null}
                status={order.status}
                currentStep={getStepFromStatus(order.status)}
                onClick={() => navigate({
                  pathname: '/workflow',
                  search: `?designId=${order.design_id}`
                })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your manufacturing orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate("/new-design")} size="sm">
            New Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="tech_pack_pending">Design Submitted</SelectItem>
            <SelectItem value="sent_to_manufacturer">Finding Manufacturer</SelectItem>
            <SelectItem value="sample_development">Sampling</SelectItem>
            <SelectItem value="quality_check">Quality Check</SelectItem>
            <SelectItem value="shipping">In Production</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Manufacturers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map(m => m && (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="link" size="sm" onClick={clearFilters}>
          Clear filters
        </Button>
      </div>

      {/* Orders Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Showing {filteredOrders.length} orders
        </p>
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No orders match your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              orderId={order.id}
              designName={order.designs?.name || "Untitled"}
              manufacturerName={order.manufacturers?.name || null}
              status={order.status}
              currentStep={getStepFromStatus(order.status)}
              onClick={() => navigate({
                pathname: '/workflow',
                search: `?designId=${order.design_id}`
              })}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderProductionContent = () => {
    // Group orders by status for kanban view
    const designSubmitted = orders.filter(o => 
      o.status === "draft" || o.status === "tech_pack_pending" || o.status === "sent_to_manufacturer" || o.status === "manufacturer_review"
    );
    const sampling = orders.filter(o => 
      o.status === "production_approval" || o.status === "sample_development"
    );
    const inProduction = orders.filter(o => 
      o.status === "quality_check" || o.status === "shipping"
    );
    const delivered = orders.filter(o => o.status === "delivered");

    const KanbanColumn = ({ title, orders: columnOrders, dotColor }: { title: string; orders: typeof orders; dotColor: string }) => (
      <div className="flex-1 min-w-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="ml-1">{columnOrders.length}</Badge>
        </div>
        <div className="space-y-3">
          {columnOrders.map(order => (
            <Card 
              key={order.id} 
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate({
                pathname: '/workflow',
                search: `?designId=${order.design_id}`
              })}
            >
              <p className="text-xs text-muted-foreground font-mono mb-1">
                ORD-{order.id.slice(0, 8).toUpperCase()}
              </p>
              <h4 className="font-semibold mb-2">{order.designs?.name || "Untitled"}</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <Shirt className="w-3 h-3" />
                  {order.manufacturers?.name || "No manufacturer"}
                </p>
              </div>
              <div className={`h-1 rounded-full mt-3 ${dotColor.replace('bg-', 'bg-')}`} />
            </Card>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">Production Status</h1>
            <p className="text-muted-foreground">Kanban view of your manufacturing pipeline</p>
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button variant="secondary" size="sm">Board</Button>
            <Button variant="ghost" size="sm">Timeline</Button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn title="Design Submitted" orders={designSubmitted} dotColor="bg-blue-500" />
          <KanbanColumn title="Sampling" orders={sampling} dotColor="bg-purple-500" />
          <KanbanColumn title="In Production" orders={inProduction} dotColor="bg-orange-500" />
          <KanbanColumn title="Delivered" orders={delivered} dotColor="bg-green-500" />
        </div>
      </div>
    );
  };

  const renderMessagesContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Messages</h1>
        <p className="text-muted-foreground">Communication with manufacturers</p>
      </div>
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Select an order to view messages</p>
      </Card>
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Settings coming soon</p>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboardContent();
      case "orders":
        return renderOrdersContent();
      case "production":
        return renderProductionContent();
      case "messages":
        return renderMessagesContent();
      case "settings":
        return renderSettingsContent();
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />
      <div className="flex">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main 
          className="flex-1 p-8 overflow-auto"
          onClick={handlePreviewClick}
        >
          {renderContent()}
        </main>
      </div>
      
      {/* Preview mode overlay - only shows when user clicks on content */}
      {showSignUpOverlay && <DashboardPreviewOverlay onClose={() => setShowSignUpOverlay(false)} />}
    </div>
  );
};

export default DesignerDashboard;
