import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import { Plus, Lock, Search, Download, Shirt, Calendar, Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import MessagesView from '@/components/dashboard/MessagesView';
import DashboardPreviewOverlay from '@/components/dashboard/DashboardPreviewOverlay';
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
      return 1;
    case "sent_to_manufacturer":
    case "manufacturer_review":
      return 2;
    case "production_approval":
    case "sample_development":
      return 3;
    case "quality_check":
      return 5;
    case "shipping":
      return 4;
    case "delivered":
      return 6;
    default:
      return 1;
  }
};

// Order Progress Stepper - Horizontal with connecting lines
const OrderProgressStepper = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: "DESIGN" },
    { id: 2, label: "FINALIZE" },
    { id: 3, label: "SAMPLING" },
    { id: 4, label: "PRODUCTION" },
    { id: 5, label: "QC" },
    { id: 6, label: "DELIVERY" },
  ];

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  isCompleted 
                    ? "bg-[#96421f] text-white" 
                    : isCurrent 
                      ? "border-2 border-[#96421f] text-[#96421f] bg-white" 
                      : "border border-gray-300 text-gray-400 bg-white"
                }`}
              >
                {isCompleted ? <Check className="w-3 h-3" /> : step.id}
              </div>
              <span className={`text-[9px] mt-1 whitespace-nowrap font-medium ${
                isCompleted || isCurrent ? "text-[#96421f]" : "text-gray-400"
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`w-8 h-0.5 mx-0.5 mt-[-12px] ${
                  step.id < currentStep ? "bg-[#96421f]" : "bg-gray-200"
                }`} 
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Status config for badges
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "text-gray-600" },
  tech_pack_pending: { label: "Design Submitted", color: "text-[#344C3D]" },
  sent_to_manufacturer: { label: "Finalizing Manufacturer", color: "text-[#96421f]" },
  manufacturer_review: { label: "Finalizing Manufacturer", color: "text-[#96421f]" },
  production_approval: { label: "Sampling", color: "text-[#96421f]" },
  sample_development: { label: "Sampling", color: "text-[#96421f]" },
  quality_check: { label: "Quality Check", color: "text-[#96421f]" },
  shipping: { label: "In Production", color: "text-[#96421f]" },
  delivered: { label: "Delivered", color: "text-[#344C3D]" },
};

// Order Card Component
const OrderCard = ({ order, onClick }: { order: Order; onClick: () => void }) => {
  const statusInfo = statusConfig[order.status] || statusConfig.draft;
  const orderId = `ORD-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <Card 
      className="p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-100 bg-white" 
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex-shrink-0 min-w-[200px]">
          <p className="text-xs text-muted-foreground font-mono mb-1">{orderId}</p>
          <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
            {order.designs?.name || "Untitled"}
          </h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#344C3D] flex items-center justify-center">
                <span className="text-white text-[10px] font-medium">M</span>
              </div>
              <span>{order.manufacturers?.name || "No manufacturer yet"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex justify-center">
          <OrderProgressStepper currentStep={getStepFromStatus(order.status)} />
        </div>
        
        <div className="flex items-center gap-4 flex-shrink-0">
          <Badge 
            variant="outline" 
            className={`${statusInfo.color} border-current bg-transparent px-3 py-1.5 text-sm font-medium`}
          >
            {statusInfo.label}
          </Badge>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignUpOverlay, setShowSignUpOverlay] = useState(false);
  const { role, loading: roleLoading } = useUserRole();

  // Mock preview data for unauthenticated users
  const previewOrders: Order[] = [
    {
      id: 'preview-1',
      status: 'sample_development',
      design_id: 'design-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      designs: { id: 'design-1', name: 'Sustainable Linen Jacket', category: 'Outerwear', created_at: new Date().toISOString(), thumbnail_url: null },
      manufacturers: { name: 'Textiles Porto, Portugal' }
    },
    {
      id: 'preview-2',
      status: 'production_approval',
      design_id: 'design-2',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      designs: { id: 'design-2', name: 'Organic Cotton Dress', category: 'Dresses', created_at: new Date().toISOString(), thumbnail_url: null },
      manufacturers: { name: 'EcoFab India' }
    },
    {
      id: 'preview-3',
      status: 'quality_check',
      design_id: 'design-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      designs: { id: 'design-3', name: 'Recycled Denim Jeans', category: 'Bottoms', created_at: new Date().toISOString(), thumbnail_url: null },
      manufacturers: { name: 'GreenStitch Turkey' }
    }
  ];

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

          const statusPriority: Record<string, number> = {
            draft: 0, tech_pack_pending: 1, sent_to_manufacturer: 2, manufacturer_review: 3,
            production_approval: 4, sample_development: 5, quality_check: 6, shipping: 7, delivered: 8, cancelled: -1,
          };

          const bestByDesign = new Map<string, Order>();
          for (const order of ordersData || []) {
            const existing = bestByDesign.get(order.design_id);
            if (!existing) { bestByDesign.set(order.design_id, order); continue; }
            const pA = statusPriority[order.status] ?? 0;
            const pB = statusPriority[existing.status] ?? 0;
            if (pA > pB) { bestByDesign.set(order.design_id, order); continue; }
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
      } else {
        // Unauthenticated: load preview data
        setOrders(previewOrders);
      }
      setLoading(false);
    };
    checkAuthAndFetch();
  }, []);

  useEffect(() => {
    if (!roleLoading && role === 'manufacturer') {
      navigate('/manufacturer');
    }
  }, [role, roleLoading, navigate]);

  const manufacturers = [...new Set(orders.filter(o => o.manufacturers?.name).map(o => o.manufacturers?.name))];

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
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <div className="flex mt-16">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="flex-1 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-muted rounded w-48" />
              <div className="h-6 bg-muted rounded w-72" />
              <div className="space-y-4 mt-8">
                {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-lg" />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle click on preview content to show sign-up overlay
  const handlePreviewClick = () => {
    if (!isAuthenticated) {
      setShowSignUpOverlay(true);
    }
  };


  const renderDashboardContent = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#344C3D] mb-1">Dashboard</h1>
          <p className="text-muted-foreground">Track your designs from concept to delivery</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9 w-48 sm:w-64 bg-white border-gray-200" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-semibold text-[#344C3D]">Manufacturing Orders</h2>
          <Button onClick={() => navigate("/new-design")} className="bg-[#344C3D] hover:bg-[#344C3D]/90">
            <Plus className="w-4 h-4 mr-2" />New Order
          </Button>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center bg-white border-gray-100">
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button onClick={() => navigate("/new-design")} className="bg-[#344C3D] hover:bg-[#344C3D]/90">Create your first design</Button>
          </Card>
        ) : (
          <div className="space-y-4">
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#344C3D] mb-1">Orders</h1>
          <p className="text-muted-foreground">Manage and track all your manufacturing orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-[#344C3D] text-[#344C3D]"><Download className="w-4 h-4 mr-2" />Export</Button>
          <Button onClick={() => navigate("/new-design")} size="sm" className="bg-[#344C3D] hover:bg-[#344C3D]/90">New Order</Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white"><SelectValue placeholder="All Statuses" /></SelectTrigger>
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
          <SelectTrigger className="w-48 bg-white"><SelectValue placeholder="All Manufacturers" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Manufacturers</SelectItem>
            {manufacturers.map(m => m && <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="link" size="sm" onClick={clearFilters} className="text-[#344C3D]">Clear filters</Button>
      </div>

      <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Showing {filteredOrders.length} orders</p>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center bg-white">
          <p className="text-muted-foreground mb-4">No orders match your filters</p>
          <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
        </Card>
      ) : (
        <div className="space-y-4">
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
      <div className="flex-1 min-w-[280px]">
        <div className="flex items-center gap-2 mb-4">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <h3 className="font-serif font-semibold text-[#344C3D]">{title}</h3>
          <Badge variant="secondary" className="ml-1 bg-[#344C3D]/10 text-[#344C3D]">{columnOrders.length}</Badge>
        </div>
        <div className="space-y-3">
          {columnOrders.map(order => (
            <Card key={order.id} className="p-4 cursor-pointer hover:shadow-md transition-shadow bg-white" onClick={() => navigate({ pathname: '/workflow', search: `?designId=${order.design_id}` })}>
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#344C3D] mb-1">Production Status</h1>
            <p className="text-muted-foreground">Kanban view of your manufacturing pipeline</p>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 border">
            <Button variant="secondary" size="sm" className="bg-[#344C3D] text-white hover:bg-[#344C3D]/90">Board</Button>
            <Button variant="ghost" size="sm">Timeline</Button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4">
          <KanbanColumn title="Design Submitted" columnOrders={designSubmitted} dotColor="bg-[#344C3D]" />
          <KanbanColumn title="Sampling" columnOrders={sampling} dotColor="bg-[#96421f]" />
          <KanbanColumn title="In Production" columnOrders={inProduction} dotColor="bg-[#B58C6A]" />
          <KanbanColumn title="Delivered" columnOrders={delivered} dotColor="bg-[#344C3D]" />
        </div>
      </div>
    );
  };

  const renderMessagesContent = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#344C3D] mb-1">Messages</h1>
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
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#344C3D] mb-1">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>
      <Card className="p-8 text-center bg-white"><p className="text-muted-foreground">Settings coming soon</p></Card>
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
    <div className="min-h-screen bg-[#FAF9F6] relative">
      <Navbar />
      <div className="flex mt-16">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main 
          className="flex-1 p-8 overflow-auto"
          onClick={!isAuthenticated ? handlePreviewClick : undefined}
        >
          {!isAuthenticated && (
            <div className="flex justify-center mb-4">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-medium">
                PREVIEW MODE
              </Badge>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
      {showSignUpOverlay && <DashboardPreviewOverlay onClose={() => setShowSignUpOverlay(false)} />}
    </div>
  );
};

export default Dashboard;
