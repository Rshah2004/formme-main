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
import {CheckCircle2, Clock, XCircle, MessageSquare, ArrowRight, ArrowLeft, AlertTriangle, Lock, Info} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    tech_pack_feasible?: boolean | null;
    tech_pack_feasibility_notes?: string | null;
    production_params_approved?: boolean | null;
  }>;
  isFinalized?: boolean;
  feasibilityConfirmed?: boolean;
  hasIssues?: boolean;
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
            .select('id, status, manufacturer_id, tech_pack_feasible, tech_pack_feasibility_notes, production_params_approved')
            .eq('design_id', design.id)
            .eq('manufacturer_id', match.manufacturer_id)
            .maybeSingle();
          
          // Finalized means status is manufacturer_review or beyond
          const isFinalized = order && order.status !== 'sent_to_manufacturer' && order.status !== 'draft' && order.status !== 'tech_pack_pending';
          
          // Feasibility is confirmed when tech_pack_feasible is true AND production_params_approved is true
          const feasibilityConfirmed = order?.tech_pack_feasible === true && order?.production_params_approved === true;
          
          // Has issues if tech_pack_feasible is explicitly false (manufacturer reported issues)
          const hasIssues = order?.tech_pack_feasible === false;
          
          return {
            ...match,
            orders: order ? [order] : [],
            isFinalized,
            feasibilityConfirmed,
            hasIssues
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
        markStageComplete('manufacture-selection');
        setCurrentStage('tech-pack-feasibility');
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
      markStageComplete('factory-selection');
      markStageComplete('manufacture-selection');
      markStageComplete('waiting');
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
      toast.error('Please finalize a contract with a manufacturer who agreed to review before proceeding');
      return false;
    }

    // Mark all previous stages as complete
    markStageComplete('tech-pack');
    markStageComplete('factory-match');
    markStageComplete('send-tech-pack');
    
    // Navigate to production parameters page
    setCurrentStage('tech-pack-feasibility');
    
    return true;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Reviewing Tech Pack</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Awaiting Response</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if any manufacturer has reported issues
  const hasAnyIssues = matches.some(m => m.hasIssues);
  const hasFeasibilityConfirmed = matches.some(m => m.feasibilityConfirmed);

  return (
    <div>
      <StageHeader
        icon={Clock}
        title="Manufacturer Review Status"
        description="Track manufacturer responses and feasibility reviews. Production agreements can only be finalized after a manufacturer confirms feasibility."
      />

      <div className="max-w-4xl mx-auto mt-8">
        {/* Info banner about feasibility process */}
        <Alert className="mb-6 border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Feasibility Review Required</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
            Before you can finalize a production agreement, the manufacturer must complete their feasibility review. 
            This includes reviewing your tech pack and confirming production capacity. Production steps remain locked until feasibility is confirmed.
          </AlertDescription>
        </Alert>

        {/* Issues alert if any manufacturer reported problems */}
        {hasAnyIssues && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Issues Need Resolution</AlertTitle>
            <AlertDescription className="text-sm">
              One or more manufacturers have reported issues with your tech pack. Please review the feedback below, 
              update your specifications, and the tech pack will be automatically resubmitted for review.
            </AlertDescription>
          </Alert>
        )}

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

                          <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Show issues if manufacturer reported problems */}
                            {match.hasIssues && match.orders?.[0]?.tech_pack_feasibility_notes && (
                              <Alert variant="destructive" className="mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Issues Reported</AlertTitle>
                                <AlertDescription className="text-sm">
                                  {match.orders[0].tech_pack_feasibility_notes}
                                </AlertDescription>
                              </Alert>
                            )}
                            
                            {/* Show feasibility status */}
                            {match.feasibilityConfirmed && (
                              <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                <CheckCircle2 className="w-4 h-4" />
                                Feasibility Confirmed - Ready to Finalize
                              </div>
                            )}

                            <div className="flex gap-2 items-center">
                              {match.status === 'accepted' && !match.isFinalized && (
                                <>
                                  {match.feasibilityConfirmed ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenConfirmDialog(match)}
                                      className="gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Finalize Production Agreement
                                    </Button>
                                  ) : (
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            disabled
                                            className="gap-2 opacity-50 cursor-not-allowed"
                                          >
                                            <Lock className="w-4 h-4" />
                                            Finalize Production Agreement
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Manufacturer must complete feasibility review first</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  {!match.feasibilityConfirmed && !match.hasIssues && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 self-center ml-2">
                                      Awaiting feasibility confirmation
                                    </span>
                                  )}
                                  {match.hasIssues && (
                                    <span className="text-xs text-amber-600 dark:text-amber-400 self-center ml-2">
                                      Please resolve issues and resubmit
                                    </span>
                                  )}
                                </>
                              )}

                              {match.status === 'accepted' && match.isFinalized && !match.feasibilityConfirmed && (
                                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                                  <Clock className="w-4 h-4" />
                                  Under Feasibility Review
                                </div>
                              )}
                              
                              {match.status === 'pending' && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  Awaiting manufacturer response...
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
            <div className="flex justify-between pt-4">
              {/*<Button variant="outline" onClick={handleBack} className="gap-2">*/}
              {/*  <ArrowLeft className="w-4 h-4"/>*/}
              {/*  Back to Tech Pack*/}
              {/*</Button>*/}
              <Button onClick={handleProceed} className="gap-2">
                Go to review techpack
                <ArrowRight className="w-4 h-4"/>
              </Button>
            </div>
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
