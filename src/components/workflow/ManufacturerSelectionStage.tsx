import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { CheckCircle2, Clock, XCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FactoryMessaging } from './FactoryMessaging';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';

interface ManufacturerMatch {
  id: string;
  manufacturer_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  score: number | null;
  manufacturers: {
    name: string;
    location: string | null;
    price_range: string | null;
    rating: number | null;
  };
  orders: Array<{
    id: string;
    status?: string;
  }>;
  isFinalized?: boolean;
}

interface ManufacturerSelectionStageProps {
  design: {
    id: string;
    name: string;
  };
}

export const ManufacturerSelectionStage = ({ design }: ManufacturerSelectionStageProps) => {
  const [matches, setMatches] = useState<ManufacturerMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [currentChatOrderId, setCurrentChatOrderId] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [manufacturerToFinalize, setManufacturerToFinalize] = useState<ManufacturerMatch | null>(null);
  const navigate = useNavigate();
  const { markStageComplete, setCurrentStage } = useWorkflow();

  useEffect(() => {
    fetchMatches();

    // Set up real-time subscription for match updates
    const channel = supabase
      .channel(`manufacturer-matches-${design.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'manufacturer_matches',
          filter: `design_id=eq.${design.id}`
        },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [design.id]);

  const fetchMatches = async () => {
    try {
      console.log('[ManufacturerSelectionStage] Fetching matches for design:', design.id);
      
      const { data, error } = await supabase
        .from('manufacturer_matches')
        .select(`
          *,
          manufacturers (
            name,
            location,
            price_range,
            rating
          )
        `)
        .eq('design_id', design.id)
        .order('created_at', { ascending: false });

      console.log('[ManufacturerSelectionStage] Matches query result:', { data, error });

      if (error) throw error;

      // For each match, fetch the corresponding order
      const matchesWithOrders = await Promise.all(
        (data || []).map(async (match: any) => {
          const { data: order } = await supabase
            .from('orders')
            .select('id, status, manufacturer_id')
            .eq('design_id', design.id)
            .eq('manufacturer_id', match.manufacturer_id)
            .maybeSingle();
          
          // Finalized means status is manufacturer_review or beyond
          const isFinalized = order && order.status !== 'sent_to_manufacturer' && order.status !== 'draft' && order.status !== 'tech_pack_pending';
          
          return {
            ...match,
            orders: order ? [order] : [],
            isFinalized
          };
        })
      );

      console.log('[ManufacturerSelectionStage] Matches with orders:', matchesWithOrders);
      setMatches(matchesWithOrders as any);

      // Check if any manufacturer is already finalized
      const { data: finalizedOrders } = await supabase
        .from('orders')
        .select('manufacturer_id, status')
        .eq('design_id', design.id)
        .not('manufacturer_id', 'is', null)
        .in('status', ['manufacturer_review', 'production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered']);

      console.log('[ManufacturerSelectionStage] Finalized orders:', finalizedOrders);

      if (finalizedOrders && finalizedOrders.length > 0) {
        const finalizedOrder = finalizedOrders[0];
        setSelectedManufacturer(finalizedOrder.manufacturer_id);
        
        // If contract is already finalized, immediately navigate to production stage
        console.log('[ManufacturerSelectionStage] Contract already finalized, navigating to production stage');
        markStageComplete('tech-pack');
        markStageComplete('factory-match');
        markStageComplete('send-tech-pack');
        setCurrentStage('tech-pack-review');
      }
    } catch (error: any) {
      console.error('[ManufacturerSelectionStage] Error fetching matches:', error);
      toast.error('Failed to load manufacturer matches');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = (match: ManufacturerMatch) => {
    // Don't open dialog if already finalized
    if (match.isFinalized) {
      toast.info('Contract already finalized with this manufacturer');
      return;
    }
    console.log('[handleOpenConfirmDialog] Opening dialog for manufacturer:', match.manufacturers.name);
    setManufacturerToFinalize(match);
    setConfirmDialogOpen(true);
  };

  const handleConfirmFinalize = async () => {
    console.log('[handleConfirmFinalize] User confirmed, finalizing contract');
    if (!manufacturerToFinalize) return;

    try {
      const manufacturerId = manufacturerToFinalize.manufacturer_id;
      
      // Find the order for this specific manufacturer
      if (!manufacturerToFinalize.orders?.[0]?.id) {
        toast.error('No order found for this manufacturer');
        return;
      }

      const orderId = manufacturerToFinalize.orders[0].id;
      console.log('[handleConfirmFinalize] Updating order:', orderId, 'to manufacturer_review status');

      // Update the order to mark this manufacturer as finalized
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'manufacturer_review'
        })
        .eq('id', orderId);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          design_id: design.id,
          designer_id: user.id,
          manufacturer_id: manufacturerId,
          quantity: 100,
          status: 'sent_to_manufacturer',
          notes: 'Delivery date: TBD'
        })
        .select()
        .single();

      if (updateError) {
        console.error('[handleConfirmFinalize] Update error:', updateError);
        throw updateError;
      }

      console.log('[handleConfirmFinalize] Order updated successfully');
      
      setSelectedManufacturer(manufacturerId);
      setConfirmDialogOpen(false);
      setManufacturerToFinalize(null);
      
      toast.success('Contract finalized! Proceeding to production parameters.');
      
      // Immediately proceed to production parameters
      markStageComplete('tech-pack');
      markStageComplete('factory-match');
      markStageComplete('send-tech-pack');
      setCurrentStage('tech-pack-review');
    } catch (error: any) {
      console.error('Error finalizing manufacturer:', error);
      toast.error('Failed to finalize manufacturer');
    }
  };

  const handleOpenChat = async (match: ManufacturerMatch) => {
    console.log('[handleOpenChat] Match:', match);
    
    // If order exists, use it
    if (match.orders && match.orders.length > 0) {
      console.log('[handleOpenChat] Using existing order:', match.orders[0].id);
      setCurrentChatOrderId(match.orders[0].id);
      setChatDialogOpen(true);
      return;
    }

    // Create order if it doesn't exist
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('[handleOpenChat] Creating new order for manufacturer:', match.manufacturer_id);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          design_id: design.id,
          designer_id: user.id,
          manufacturer_id: match.manufacturer_id,
          quantity: 100,
          status: 'sent_to_manufacturer',
          notes: 'Delivery date: TBD'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      console.log('[handleOpenChat] Created order:', orderData.id);
      
      // Refresh matches to get the new order
      await fetchMatches();
      
      setCurrentChatOrderId(orderData.id);
      setChatDialogOpen(true);
      toast.success('Chat opened');
    } catch (error: any) {
      console.error('[handleOpenChat] Error creating order:', error);
      toast.error('Failed to open chat');
    }
  };

  const handleProceed = async () => {
    if (!selectedManufacturer) {
      toast.error('Please finalize a contract with an accepted manufacturer before proceeding');
      return false;
    }

    // Mark all previous stages as complete
    markStageComplete('tech-pack');
    markStageComplete('factory-match');
    markStageComplete('send-tech-pack');
    
    // Navigate to production parameters page
    setCurrentStage('tech-pack-review');
    
    return true;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Accepted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      <StageHeader
        icon={Clock}
        title="Waiting for Manufacturer Approval"
        description="View all manufacturers you've sent requests to, chat with them, and select your preferred manufacturer once they accept."
      />

      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading manufacturers...</p>
            ) : matches.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No manufacturer requests found</p>
                <Button onClick={() => navigate({
                  pathname: '/workflow',
                  search: `?designId=${design.id}&stage=factory-match`
                })}>
                  Find Manufacturers
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Card 
                    key={match.id} 
                    className={`${selectedManufacturer === match.manufacturer_id ? 'border-primary border-2' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => handleOpenChat(match)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{match.manufacturers.name}</h3>
                            {getStatusBadge(match.status)}
                            {selectedManufacturer === match.manufacturer_id && (
                              <Badge variant="outline" className="border-primary text-primary">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                            {match.manufacturers.location && (
                              <span>📍 {match.manufacturers.location}</span>
                            )}
                            {match.manufacturers.price_range && (
                              <span>💰 {match.manufacturers.price_range}</span>
                            )}
                            {match.manufacturers.rating && (
                              <span>⭐ {match.manufacturers.rating}/5</span>
                            )}
                            {match.score && (
                              <span>🎯 Match Score: {Math.round(match.score)}/100</span>
                            )}
                          </div>

                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {match.status === 'accepted' && !match.isFinalized && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenConfirmDialog(match)}
                                className="gap-2"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Finalize Contract
                              </Button>
                            )}

                            {match.status === 'accepted' && match.isFinalized && (
                              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                Contract Finalized
                              </div>
                            )}
                            
                            {match.status === 'pending' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Waiting for manufacturer response...
                              </div>
                            )}
                            
                            {match.status === 'rejected' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <XCircle className="w-4 h-4" />
                                Manufacturer declined this request
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card className="bg-muted/50 border-dashed">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Want to send requests to more manufacturers?
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate({
                        pathname: '/workflow',
                        search: `?designId=${design.id}&stage=factory-match`
                      })}
                      className="gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Back to Manufacturer Selection
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedManufacturer && (
          <StageNavigation
            nextLabel="Continue to Review Timeline"
            onNext={handleProceed}
            showBack={true}
          />
        )}
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle>
              {matches.find(m => m.orders?.[0]?.id === currentChatOrderId)?.manufacturers.name || 'Chat with Manufacturer'}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto">
            {currentChatOrderId && (
              <FactoryMessaging designId={design.id} orderId={currentChatOrderId} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to finalize the contract with {manufacturerToFinalize?.manufacturers.name}? 
              Once confirmed, you'll proceed to review production parameters with this manufacturer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false);
                setManufacturerToFinalize(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmFinalize}>
              Yes, Finalize Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
