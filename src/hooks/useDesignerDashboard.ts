import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

// Map order status to step number (1-5)
export const getStepFromStatus = (status: string): number => {
  switch (status) {
    case "draft":
    case "tech_pack_pending":
    case "sent_to_manufacturer":
    case "manufacturer_review":
      return 1; // Design stage
    case "production_approval":
    case "sample_development":
      return 2; // Sampling stage
    case "quality_check":
      return 4; // QC stage
    case "shipping":
      return 3; // Production stage
    case "delivered":
      return 5; // Delivery stage
    default:
      return 1;
  }
};

export interface DashboardStats {
  ordersPlaced: number;
  inSampling: number;
  inProduction: number;
  delivered: number;
}

export const useDesignerDashboard = () => {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    ordersPlaced: 0,
    inSampling: 0,
    inProduction: 0,
    delivered: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "designer") {
      navigate("/manufacturer");
    }
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: designsData } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          designs(*),
          manufacturers(name)
        `)
        .eq("designer_id", user.id)
        .order("created_at", { ascending: false });

      setDesigns(designsData || []);
      setOrders(ordersData || []);

      // Calculate stats
      const ordersArray = ordersData || [];
      const statsData: DashboardStats = {
        ordersPlaced: ordersArray.length,
        inSampling: ordersArray.filter(o => 
          o.status === "production_approval" || o.status === "sample_development"
        ).length,
        inProduction: ordersArray.filter(o => 
          o.status === "quality_check" || o.status === "shipping"
        ).length,
        delivered: ordersArray.filter(o => o.status === "delivered").length,
      };
      setStats(statsData);

    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    designs,
    orders,
    isLoading,
    stats,
    navigate,
    refetch: fetchData,
  };
};
