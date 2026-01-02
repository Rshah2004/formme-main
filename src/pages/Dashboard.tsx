import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Lock, Search, Download, SlidersHorizontal, Shirt, Building2, Calendar, Check, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MessagesView from '@/components/dashboard/MessagesView';

interface Design {
  id: string;
  name: string;
  category: string;
  created_at: string;
  thumbnail_url: string | null;
}

interface Order {
  id: string;
  status: string;
  design_id: string;
  created_at: string;
  updated_at: string;
  designs: Design;
  manufacturers: {
    name: string;
  } | null;
}

// Map order status to step number (1-6)
const getStepFromStatus = (status: string): number => {
  switch (status) {
    case "draft":
    case "tech_pack_pending":
      return 1; // Design stage
    case "sent_to_manufacturer":
    case "manufacturer_review":
      return 2; // Finalizing Manufacturer stage
    case "production_approval":
    case "sample_development":
      return 3; // Sampling stage
    case "quality_check":
      return 5; // QC stage
    case "shipping":
      return 4; // Production stage
    case "delivered":
      return 6; // Delivery stage
    default:
      return 1;
  }
};

// Stat Card Component
const StatCard = ({ title, value, change, color }: { title: string; value: number; change?: string; color: "blue" | "purple" | "orange" | "green" }) => {
  const colorMap = {
    blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600", line: "stroke-blue-500" },
    purple: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600", line: "stroke-purple-500" },
    orange: { bg: "bg-orange-50 dark:bg-orange-950/30", text: "text-orange-600", line: "stroke-orange-500" },
    green: { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-600", line: "stroke-green-500" },
  };
  const colors = colorMap[color];
  
  return (
    <Card className={`p-5 border ${colors.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground font-medium">{title}</span>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-medium ${colors.text}`}>
            <TrendingUp className="w-3 h-3" />
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold mb-4">{value}</div>
      <div className="h-12 relative overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path
            d={`M0,35 Q25,25 50,20 T100,15 V40 H0 Z`}
            fill={`hsl(var(--${color === 'blue' ? 'primary' : color === 'purple' ? 'accent' : color === 'orange' ? 'warning' : 'success'}) / 0.2)`}
            className="opacity-30"
          />
          <path
            d={`M0,35 Q25,25 50,20 T100,15`}
            fill="none"
            className={colors.line}
            strokeWidth="2"
          />
        </svg>
      </div>
    </Card>
  );
};

// Order Progress Stepper
const OrderProgressStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "Design" },
    { id: 2, label: "Finalize" },
    { id: 3, label: "Sampling" },
    { id: 4, label: "Production" },
    { id: 5, label: "QC" },
    { id: 6, label: "Delivery" },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isPending = step.id > currentStep;
        
        return (
          <div key={step.id} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                isCompleted ? "bg-blue-500 border-blue-500 text-white" :
                isCurrent ? "border-blue-500 text-blue-600 bg-white" :
                "border-muted text-muted-foreground bg-muted/20"
              }`}
            >
              {isCompleted ? <Check className="w-3 h-3" /> : step.id}
            </div>
            <span className={`text-[10px] mt-1 whitespace-nowrap ${(isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Status config for badges
const statusConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-700 border-slate-200", dotColor: "bg-slate-500" },
  tech_pack_pending: { label: "Design Submitted", color: "bg-blue-50 text-blue-700 border-blue-200", dotColor: "bg-blue-500" },
  sent_to_manufacturer: { label: "Finalizing Manufacturer", color: "bg-cyan-50 text-cyan-700 border-cyan-200", dotColor: "bg-cyan-500" },
  manufacturer_review: { label: "Finalizing Manufacturer", color: "bg-cyan-50 text-cyan-700 border-cyan-200", dotColor: "bg-cyan-500" },
  production_approval: { label: "Sampling", color: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  sample_development: { label: "Sampling", color: "bg-purple-50 text-purple-700 border-purple-200", dotColor: "bg-purple-500" },
  quality_check: { label: "Quality Check", color: "bg-orange-50 text-orange-700 border-orange-200", dotColor: "bg-orange-500" },
  shipping: { label: "In Production", color: "bg-amber-50 text-amber-700 border-amber-200", dotColor: "bg-amber-500" },
  delivered: { label: "Delivered", color: "bg-green-50 text-green-700 border-green-200", dotColor: "bg-green-500" },
};

// Order Card Component
const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => {
  const statusInfo = statusConfig[order.status] || statusConfig.draft;
  const orderId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer border" onClick={onClick}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-mono mb-1">{orderId}</p>
          <h3 className="font-semibold text-lg truncate">{order.designs?.name || "Untitled"}</h3>
          <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>{order.manufacturers?.name || "No manufacturer yet"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <OrderProgressStepper currentStep={getStepFromStatus(order.status)} />
          
          <Badge variant="outline" className={`${statusInfo.color} flex items-center gap-1.5 px-3 py-1`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            {statusInfo.label}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, loading: roleLoading } = useUserRole();

  // Check authentication and fetch data
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);

      if (user) {
        try {
          const { data: ordersData, error } = await supabase
            .from("orders")
            .select(`*, designs(*), manufacturers(name)`)
            .eq("designer_id", user.id)
            .neq('status', 'cancelled')
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Show only ONE order card per design (prevents duplicate-looking cards)
          const statusPriority: Record<string, number> = {
            draft: 0,
            tech_pack_pending: 1,
            sent_to_manufacturer: 2,
            manufacturer_review: 3,
            production_approval: 4,
            sample_development: 5,
            quality_check: 6,
            shipping: 7,
            delivered: 8,
            cancelled: -1,
          };

          const bestByDesign = new Map<string, Order>();
          for (const order of ordersData || []) {
            const existing = bestByDesign.get(order.design_id);
            if (!existing) {
              bestByDesign.set(order.design_id, order);
              continue;
            }

            const pA = statusPriority[order.status] ?? 0;
            const pB = statusPriority[existing.status] ?? 0;

            if (pA > pB) {
              bestByDesign.set(order.design_id, order);
              continue;
            }

            if (pA === pB) {
              const aTime = new Date(order.updated_at || order.created_at).getTime();
              const bTime = new Date(existing.updated_at || existing.created_at).getTime();
              if (aTime > bTime) bestByDesign.set(order.design_id, order);
            }
          }

          setOrders(Array.from(bestByDesign.values()).sort((a, b) => (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )));
        } catch (error: any) {
          toast.error("Failed to load orders");
        }
      }
      setLoading(false);
    };
    checkAuthAndFetch();
  }, []);

  // Redirect to manufacturer dashboard if user is a manufacturer
  useEffect(() => {
    if (!roleLoading && role === 'manufacturer') {
      navigate('/manufacturer');
    }
  }, [role, roleLoading, navigate]);

  // Calculate stats
  const stats = {
    ordersPlaced: orders.length,
    inSampling: orders.filter(o => o.status === "production_approval" || o.status === "sample_development").length,
    inProduction: orders.filter(o => o.status === "quality_check" || o.status === "shipping").length,
    delivered: orders.filter(o => o.status === "delivered").length,
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

  if (isAuthenticated === null || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show sign-up prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-6 mt-20 max-w-7xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">Sign up to access your dashboard</h2>
                <p className="text-muted-foreground mb-8">You need to create an account or sign in to view your production dashboard and manage your designs.</p>
                <Link to="/auth">
                  <Button size="lg" className="w-full">Sign up or Sign in</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Track your designs from concept to delivery</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9 w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Orders Placed" value={stats.ordersPlaced} change="+12%" color="blue" />
        <StatCard title="In Sampling" value={stats.inSampling} change="+2" color="purple" />
        <StatCard title="In Production" value={stats.inProduction} change="+4" color="orange" />
        <StatCard title="Delivered" value={stats.delivered} change="+8%" color="green" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Manufacturing Orders</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><SlidersHorizontal className="w-4 h-4 mr-2" />Filter</Button>
            <Button onClick={() => navigate("/new-design")} size="sm"><Plus className="w-4 h-4 mr-2" />New Order</Button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => navigate("/new-design")}>Create your first design</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => navigate({ pathname: '/workflow', search: `?designId=${order.design_id}` })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderOrdersContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-1">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your manufacturing orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button onClick={() => navigate("/new-design")} size="sm">New Order</Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="tech_pack_pending">Design Submitted</SelectItem>
            <SelectItem value="sample_development">Sampling</SelectItem>
            <SelectItem value="quality_check">Quality Check</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
        <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Manufacturers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map(m => m && <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="link" size="sm" onClick={clearFilters}>Clear filters</Button>
      </div>

      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Showing {filteredOrders.length} orders</p>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No orders match your filters</p>
          <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} onClick={() => navigate({ pathname: '/workflow', search: `?designId=${order.design_id}` })} />
          ))}
        </div>
      )}
    </div>
  );

  const renderProductionContent = () => {
    const designSubmitted = orders.filter(o => ["draft", "tech_pack_pending", "sent_to_manufacturer", "manufacturer_review"].includes(o.status));
    const sampling = orders.filter(o => ["production_approval", "sample_development"].includes(o.status));
    const inProduction = orders.filter(o => ["quality_check", "shipping"].includes(o.status));
    const delivered = orders.filter(o => o.status === "delivered");

    const KanbanColumn = ({ title, columnOrders, dotColor }: { title: string; columnOrders: Order[]; dotColor: string }) => (
      <div className="flex-1 min-w-[300px]">
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="font-semibold">{title}</h3>
          <Badge variant="secondary" className="ml-1">{columnOrders.length}</Badge>
        </div>
        <div className="space-y-3">
          {columnOrders.map(order => (
            <Card key={order.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate({ pathname: '/workflow', search: `?designId=${order.design_id}` })}>
              <p className="text-xs text-muted-foreground font-mono mb-1">ORD-{order.id.slice(0, 8).toUpperCase()}</p>
              <h4 className="font-semibold mb-2">{order.designs?.name || "Untitled"}</h4>
              <div className="text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Shirt className="w-3 h-3" />{order.manufacturers?.name || "No manufacturer"}</p>
              </div>
              <div className={`h-1 rounded-full mt-3 ${dotColor}`} />
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
          <KanbanColumn title="Design Submitted" columnOrders={designSubmitted} dotColor="bg-blue-500" />
          <KanbanColumn title="Sampling" columnOrders={sampling} dotColor="bg-purple-500" />
          <KanbanColumn title="In Production" columnOrders={inProduction} dotColor="bg-orange-500" />
          <KanbanColumn title="Delivered" columnOrders={delivered} dotColor="bg-green-500" />
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
      
      <MessagesView orders={orders.map(o => ({
        id: o.id,
        design_id: o.design_id,
        status: o.status,
        created_at: o.created_at,
        designs: o.designs ? { id: o.designs.id, name: o.designs.name } : null,
        manufacturers: o.manufacturers
      }))} />
    </div>
  );

  const renderSettingsContent = () => (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold mb-1">Settings</h1><p className="text-muted-foreground">Manage your account preferences</p></div>
      <Card className="p-8 text-center"><p className="text-muted-foreground">Settings coming soon</p></Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboardContent();
      case "orders": return renderOrdersContent();
      case "production": return renderProductionContent();
      case "messages": return renderMessagesContent();
      case "settings": return renderSettingsContent();
      default: return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex mt-16">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8 overflow-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
