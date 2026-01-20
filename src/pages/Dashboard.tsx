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
import { Plus, Lock, Search, Download, Shirt, Calendar, Check, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        {/* Left side - Order info */}
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
        
        {/* Center - Progress Stepper */}
        <div className="flex-1 flex justify-center">
          <OrderProgressStepper currentStep={getStepFromStatus(order.status)} />
        </div>
        
        {/* Right side - Status badge and arrow */}
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

  // Get unique manufacturers for filter
  const manufacturers = [...new Set(orders.filter(o => o.manufacturers?.name).map(o => o.manufacturers?.name))];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.designs?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesManufacturer = manufacturerFilter === "all" || order.manufacturers?.name === manufacturerFilter;
    return matchesSearch && matchesStatus && matchesManufacturer;
  });

  if (isAuthenticated === null || roleLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-8 mt-20 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-muted rounded w-48" />
            <div className="h-6 bg-muted rounded w-72" />
            <div className="space-y-4 mt-8">
              {[1, 2, 3].map(i => <div key={i} className="h-28 bg-muted rounded-lg" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show sign-up prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F6]">
        <Navbar />
        <main className="container mx-auto px-4 sm:px-6 py-8 mt-20 max-w-6xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md w-full border-border">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#344C3D]/10 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-[#344C3D]" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-3">Sign up to access your dashboard</h2>
                <p className="text-muted-foreground mb-8">You need to create an account or sign in to view your production dashboard and manage your designs.</p>
                <Link to="/auth">
                  <Button size="lg" className="w-full bg-[#344C3D] hover:bg-[#344C3D]/90">Sign up or Sign in</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 py-8 mt-20 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#344C3D] mb-1">Dashboard</h1>
            <p className="text-muted-foreground">Track your designs from concept to delivery</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search orders..." 
                className="pl-9 w-48 sm:w-64 bg-white border-gray-200" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <Button 
              onClick={() => navigate("/new-design")} 
              className="bg-[#344C3D] hover:bg-[#344C3D]/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Manufacturing Orders Section */}
        <div>
          <h2 className="text-xl font-serif font-semibold text-[#344C3D] mb-4">Manufacturing Orders</h2>
          
          {filteredOrders.length === 0 ? (
            <Card className="p-12 text-center bg-white border-gray-100">
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <Button 
                onClick={() => navigate("/new-design")}
                className="bg-[#344C3D] hover:bg-[#344C3D]/90"
              >
                Create your first design
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onClick={() => navigate({ pathname: '/workflow', search: `?designId=${order.design_id}` })} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
