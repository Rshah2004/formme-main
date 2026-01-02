import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Factory, Clock, Package, Scissors, CheckCircle, AlertCircle, Camera, FileText } from 'lucide-react';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProductionTrackingStageProps {
  design: any;
}

interface ProductionUpdate {
  id: string;
  order_id: string;
  status: string;
  message: string | null;
  created_at: string;
}

const productionPhases = [
  { id: 'cutting', label: 'Cutting', icon: Scissors, description: 'Fabric cutting in progress' },
  { id: 'sewing', label: 'Sewing', icon: Package, description: 'Garments being sewn' },
  { id: 'finishing', label: 'Finishing', icon: CheckCircle, description: 'Final touches and inspection' },
  { id: 'packing', label: 'Packing', icon: Package, description: 'Ready for quality check' },
];

const ProductionTrackingStage = ({ design }: ProductionTrackingStageProps) => {
  const [order, setOrder] = useState<any>(null);
  const [updates, setUpdates] = useState<ProductionUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderAndUpdates();

    // Real-time subscription for production updates
    const channel = supabase
      .channel('production-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_updates',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUpdates(prev => [payload.new as ProductionUpdate, ...prev]);
            toast.info('New production update received!');
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        (payload) => {
          setOrder((prev: any) => prev ? { ...prev, ...payload.new } : payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  const fetchOrderAndUpdates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the order in production/quality check phase (with manufacturer assigned)
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*, manufacturers(name, location)')
        .eq('design_id', design.id)
        .eq('designer_id', user.id)
        .not('manufacturer_id', 'is', null)
        .in('status', ['sample_development', 'quality_check', 'shipping', 'delivered'])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch production updates for this order
      if (orderData?.id) {
        const { data: updatesData, error: updatesError } = await supabase
          .from('production_updates')
          .select('*')
          .eq('order_id', orderData.id)
          .order('created_at', { ascending: false });

        if (updatesError) throw updatesError;
        setUpdates(updatesData || []);
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  // Get current phase from production_timeline_data instead of updates
  const getCurrentPhase = () => {
    const currentPhaseId = order?.production_timeline_data?.current_phase;
    if (currentPhaseId) {
      return productionPhases.find(p => p.id === currentPhaseId) || null;
    }
    // Fallback to updates if no current_phase set
    if (!updates.length) return null;
    const latestUpdate = updates[0];
    return productionPhases.find(p => p.id === latestUpdate.status) || null;
  };

  const getPhaseStatus = (phaseId: string) => {
    const phaseIndex = productionPhases.findIndex(p => p.id === phaseId);
    const currentPhase = getCurrentPhase();
    const currentIndex = currentPhase ? productionPhases.findIndex(p => p.id === currentPhase.id) : -1;
    
    // Check if production is completed
    if (order?.production_timeline_data?.production_completed) {
      return 'completed';
    }

    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getProgress = () => {
    // If production is completed, return 100%
    if (order?.production_timeline_data?.production_completed) {
      return 100;
    }
    const currentPhase = getCurrentPhase();
    if (!currentPhase) return 0;
    const currentIndex = productionPhases.findIndex(p => p.id === currentPhase.id);
    return ((currentIndex + 1) / productionPhases.length) * 100;
  };

  const productionData = order?.production_timeline_data || {};

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading production data...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No production data available</p>
      </div>
    );
  }

  return (
    <div>
      <StageHeader
        icon={Factory}
        title="Production Tracking"
        description="Track your order's production progress in real-time. The manufacturer updates this as production moves through each phase."
      />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Production Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Production Progress</CardTitle>
                <Badge variant={getProgress() === 100 ? 'default' : 'secondary'}>
                  {Math.round(getProgress())}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={getProgress()} className="h-2 mb-6" />

              <div className="grid grid-cols-4 gap-4">
                {productionPhases.map((phase, index) => {
                  const Icon = phase.icon;
                  const status = getPhaseStatus(phase.id);

                  return (
                    <div key={phase.id} className="text-center">
                      <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                        status === 'completed' ? 'bg-primary text-primary-foreground' :
                        status === 'current' ? 'bg-primary/20 text-primary animate-pulse' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-sm font-medium ${
                        status === 'current' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {phase.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {status === 'completed' ? 'Done' : status === 'current' ? 'In Progress' : 'Pending'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Production Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Production Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{order.manufacturers?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{order.manufacturers?.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {order.production_start_date
                      ? new Date(order.production_start_date).toLocaleDateString()
                      : 'Not started'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expected Completion</p>
                  <p className="font-medium">
                    {order.production_completion_date
                      ? new Date(order.production_completion_date).toLocaleDateString()
                      : 'TBD'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">{order.quantity || 'N/A'} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fabric Type</p>
                  <p className="font-medium">{order.fabric_type || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Updates Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {updates.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Waiting for production updates from the manufacturer...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Updates will appear here in real-time
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map((update, index) => (
                    <div key={update.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary' : 'bg-muted'
                        }`} />
                        {index < updates.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {update.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(update.created_at).toLocaleString()}
                          </span>
                        </div>
                        {update.message && (
                          <p className="text-sm text-foreground">{update.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <StageNavigation
            onNext={() => true}
            nextLabel="Continue to Quality Check"
            showBack={true}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Production Photos */}
          {productionData.production_photos && productionData.production_photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Production Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {productionData.production_photos.map((url: string, idx: number) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Production ${idx + 1}`}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sample Approved</span>
                {order.sample_approved ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Production Started</span>
                {order.production_start_date ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Production Complete</span>
                {order.production_timeline_data?.production_completed ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">QC Submitted</span>
                {order.qc_submitted_at ? (
                  <CheckCircle className="w-4 h-4 text-primary" />
                ) : (
                  <Clock className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductionTrackingStage;
