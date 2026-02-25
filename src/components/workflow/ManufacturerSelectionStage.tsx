import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {CheckCircle2, Clock, XCircle, MessageSquare, ArrowRight, ArrowLeft, AlertTriangle, Lock, Info, Calendar, Factory} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { orderApi } from '@/lib/api';
import { toast } from 'sonner';
import { FactoryMessaging } from './FactoryMessaging';
import { StageHeader } from './StageHeader';
import { StageNavigation } from './StageNavigation';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '@/context/WorkflowContext';
import type { Json } from '@/integrations/supabase/types';
interface ProductionTimelineData {
  lead_time_days?: number;
  moq_achievable?: boolean;
  moq_note?: string | null;
  fabric_sourcing?: string;
  fabric_note?: string | null;
  capacity_available?: boolean;
  capacity_note?: string | null;
  sampling_required?: boolean;
  sample_type?: string | null;
  additional_notes?: string | null;
  confirmed_at?: string;
  unit_cost?: number;
  shipping_cost?: number;
  taxes_and_fees?: number;
  estimated_delivery_date?: string | null;
}

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
    production_params_submitted_at?: string | null;
    fabric_type?: string | null;
    gsm?: string | null;
    shrinkage?: string | null;
    color_fastness?: string | null;
    lead_time_days?: number | null;
    production_start_date?: string | null;
    production_completion_date?: string | null;
    production_timeline_data?: ProductionTimelineData | null;
  }>;
  isFinalized?: boolean;
  techPackFeasible?: boolean;
  techPackReviewComplete?: boolean;
  feasibilityConfirmed?: boolean;
  hasIssues?: boolean;
  hasProductionParams?: boolean;
  feasibilityStatus?: 'pending' | 'tech_pack_feasible' | 'submitted' | 'blocked';
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
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [manufacturerToViewDetails, setManufacturerToViewDetails] = useState<ManufacturerMatch | null>(null);
  const navigate = useNavigate();
  const { markStageComplete, setCurrentStage } = useWorkflow();

  const formatMoney = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 'Not provided';
    return `$${value.toFixed(2)}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return 'Not provided';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not provided';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    fetchMatches();

    // Set up real-time subscription for match updates
    const matchesChannel = supabase
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
          console.log('[ManufacturerSelectionStage] Match update detected, refetching...');
          fetchMatches();
        }
      )
      .subscribe();

    // Set up real-time subscription for order updates (for feasibility changes)
    const ordersChannel = supabase
      .channel(`orders-for-design-${design.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `design_id=eq.${design.id}`
        },
        (payload) => {
          console.log('[ManufacturerSelectionStage] Order update detected:', payload);
          fetchMatches();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(ordersChannel);
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

      // For each match, fetch the most recent corresponding order with production params
      // (IMPORTANT: we order+limit to avoid maybeSingle() errors when duplicates exist)
      const matchesWithOrders = await Promise.all(
        (data || []).map(async (match: any) => {
          const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(
              'id, status, manufacturer_id, tech_pack_feasible, tech_pack_feasibility_notes, tech_pack_checklist, production_params_approved, production_params_submitted_at, fabric_type, gsm, shrinkage, color_fastness, lead_time_days, production_start_date, production_completion_date, production_timeline_data'
            )
            .eq('design_id', design.id)
            .eq('manufacturer_id', match.manufacturer_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (orderError) {
            console.warn('[ManufacturerSelectionStage] Order lookup error for match:', match?.id, orderError);
          }

          // "Finalized" means the DESIGNER explicitly selected this manufacturer
          // (we treat that as status production_approval and beyond)
          const isFinalized =
            !!order &&
            ['production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered'].includes(
              order.status || ''
            );

          // Section A complete: Check if tech_pack_checklist exists and all items are checked (not blocked)
          let techPackReviewComplete = false;
          if (order?.tech_pack_checklist) {
            const checklist =
              typeof order.tech_pack_checklist === 'string'
                ? JSON.parse(order.tech_pack_checklist)
                : order.tech_pack_checklist;
            if (Array.isArray(checklist) && checklist.length > 0) {
              techPackReviewComplete = checklist.every((item: any) => item.checked && !item.blocked);
            }
          }

          // Section B complete: production params submitted = feasibility is confirmed
          const hasProductionParams = !!order?.production_params_submitted_at;
          const techPackFeasible = order?.tech_pack_feasible === true;

          // Feasibility is confirmed when Section B (production confirmation) is submitted
          // This is the key change: once manufacturer submits Section B, designer can finalize
          const feasibilityConfirmed = hasProductionParams;

          // Has issues if tech_pack_feasible is explicitly false (manufacturer reported issues)
          const hasIssues = order?.tech_pack_feasible === false;

          // Determine feasibility status for comparison - this is what the designer sees
          // 'tech_pack_feasible' = Section A done only (checklist complete but not committed)
          // 'submitted' = Section B complete (ready for designer to finalize)
          // 'blocked' = Issues reported
          // 'pending' = Nothing submitted yet
          let feasibilityStatus: 'pending' | 'tech_pack_feasible' | 'submitted' | 'blocked' = 'pending';
          if (hasIssues) {
            feasibilityStatus = 'blocked';
          } else if (feasibilityConfirmed) {
            feasibilityStatus = 'submitted'; // Section B done = Feasibility Submitted
          } else if (techPackReviewComplete) {
            feasibilityStatus = 'tech_pack_feasible'; // Only Section A done (checklist complete)
          }

          return {
            ...match,
            orders: order ? [order] : [],
            isFinalized,
            techPackFeasible,
            techPackReviewComplete,
            feasibilityConfirmed,
            hasIssues,
            hasProductionParams,
            feasibilityStatus,
          };
        })
      );

      console.log('[ManufacturerSelectionStage] Matches with orders:', matchesWithOrders);
      setMatches(matchesWithOrders as any);

      // Check if any manufacturer is already finalized (designer clicked "Finalize Contract")
      // Only production_approval and beyond means designer has explicitly finalized
      // manufacturer_review status does NOT count as finalized - that's just the manufacturer reviewing
      const { data: finalizedOrders } = await supabase
        .from('orders')
        .select('manufacturer_id, status')
        .eq('design_id', design.id)
        .not('manufacturer_id', 'is', null)
        .in('status', ['production_approval', 'sample_development', 'quality_check', 'shipping', 'delivered']);

      console.log('[ManufacturerSelectionStage] Finalized orders:', finalizedOrders);

      // Only set selectedManufacturer if designer has explicitly finalized (status is production_approval+)
      if (finalizedOrders && finalizedOrders.length > 0) {
        const finalizedOrder = finalizedOrders[0];
        setSelectedManufacturer(finalizedOrder.manufacturer_id);
        console.log('[ManufacturerSelectionStage] Contract finalized with manufacturer:', finalizedOrder.manufacturer_id);
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

      const selectedManufacturerOrder = manufacturerToFinalize.orders?.[0];
      if (!selectedManufacturerOrder?.id) {
        toast.error('No order found for this manufacturer');
        return;
      }

      // Finalize via backend (required because designers cannot DELETE orders via RLS)
      await orderApi.finalizeManufacturer({
        design_id: design.id,
        manufacturer_id: manufacturerId,
        order_id: selectedManufacturerOrder.id,
      });

      setSelectedManufacturer(manufacturerId);
      setConfirmDialogOpen(false);
      setManufacturerToFinalize(null);

      toast.success('Contract finalized! Proceeding to payment.');

      // Immediately proceed to payment (skipping production stage)
      markStageComplete('tech-pack');
      markStageComplete('factory-match');
      markStageComplete('send-tech-pack');
      markStageComplete('factory-selection');
      markStageComplete('manufacture-selection');
      markStageComplete('waiting');
      markStageComplete('production');

      // Force navigation in context AND in URL (URL is the source of truth when present)
      setCurrentStage('payment', true);
      navigate(`/workflow?designId=${design.id}&stage=payment`, { replace: true });
    } catch (error: any) {
      console.error('Error finalizing manufacturer:', error);
      toast.error(error?.message || 'Failed to finalize manufacturer');
    }
  };

  const handleOpenChat = async (match: ManufacturerMatch) => {
    console.log('[handleOpenChat] Match:', match);

    try {
      // Always resolve the existing order from DB (prevents duplicate orders)
      const { data: existingOrder, error: existingOrderError } = await supabase
        .from('orders')
        .select('id')
        .eq('design_id', design.id)
        .eq('manufacturer_id', match.manufacturer_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingOrderError) throw existingOrderError;

      if (!existingOrder?.id) {
        toast.error('Chat is available once you have sent the tech pack to this manufacturer.');
        return;
      }

      setCurrentChatOrderId(existingOrder.id);
      setChatDialogOpen(true);
    } catch (error: any) {
      console.error('[handleOpenChat] Error opening chat:', error);
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
    markStageComplete('manufacture-selection');
    markStageComplete('production');
    
    // Navigate to payment page
    setCurrentStage('payment');
    
    return true;
  };
  
  // const formatDate = (dateString: string | null | un
  // defined) => {
  //   if (!dateString) return 'Not set';
  //   const date = new Date(dateString);
  //   return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  // };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Reviewing</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Awaiting Response</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFeasibilityBadge = (match: ManufacturerMatch) => {
    switch (match.feasibilityStatus) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Feasibility Submitted</Badge>;
      case 'tech_pack_feasible':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Tech Pack Feasible</Badge>;
      case 'blocked':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Blocked</Badge>;
      default:
        return null;
    }
  };

  // Check if any manufacturer has reported issues
  const hasAnyIssues = matches.some(m => m.hasIssues);
  const hasFeasibilityConfirmed = matches.some(m => m.feasibilityConfirmed);
  const acceptedMatches = matches.filter(m => m.status === 'accepted');

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
            <AlertDescription className="text-sm flex flex-col gap-3">
              <span>
                One or more manufacturers have reported issues with your tech pack. Please review the feedback below
                and update your specifications.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="w-fit gap-2 border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => navigate(`/workflow?designId=${design.id}&stage=design`)}
              >
                <ArrowLeft className="w-4 h-4" />
                Go to Tech Pack to Fix Issues
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Comparison Header - show when multiple manufacturers have submitted */}
        {acceptedMatches.length > 1 && (
          <Alert className="mb-6 border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
            <Info className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <AlertTitle className="text-purple-800 dark:text-purple-200">Compare Manufacturers</AlertTitle>
            <AlertDescription className="text-purple-700 dark:text-purple-300 text-sm">
              You have {acceptedMatches.length} manufacturers reviewing your design. Compare their feasibility responses below before making a decision.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Manufacturer Feasibility Reviews</CardTitle>
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
                    className={`${selectedManufacturer === match.manufacturer_id ? 'border-primary border-2' : ''} ${match.feasibilityStatus === 'submitted' ? 'border-green-200 dark:border-green-800' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => handleOpenChat(match)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{match.manufacturers.name}</h3>
                            {getStatusBadge(match.status)}
                            {getFeasibilityBadge(match)}
                            {selectedManufacturer === match.manufacturer_id && (
                              <Badge variant="outline" className="border-primary text-primary">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
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
                              <span>🎯 Match: {Math.round(match.score)}/100</span>
                            )}
                            {/* Show key comparison data inline */}
                            {match.orders?.[0]?.lead_time_days && (
                              <span className="text-primary font-medium">⏱️ {match.orders[0].lead_time_days} days lead time</span>
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

                            <div className="flex gap-2 items-center flex-wrap mt-2">
                              {match.status === 'accepted' && !match.isFinalized && (
                                <>
                                  {/* View Production Details button - show when manufacturer submitted production confirmation */}
                                  {match.hasProductionParams && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setManufacturerToViewDetails(match);
                                        setDetailsDialogOpen(true);
                                      }}
                                      className="gap-2"
                                    >
                                      <Factory className="w-4 h-4" />
                                      View Production Details
                                    </Button>
                                  )}
                                  
                                  {match.feasibilityConfirmed ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleOpenConfirmDialog(match)}
                                      className="gap-2"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                      Finalize Contract
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
                                            Finalize Contract
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Manufacturer must complete all feasibility checks first</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                  
                                  {/* Status messages based on feasibility status */}
                                  {match.feasibilityStatus === 'tech_pack_feasible' && (
                                    <span className="text-xs text-blue-600 dark:text-blue-400 self-center ml-2">
                                      Tech pack reviewed - awaiting production confirmation
                                    </span>
                                  )}
                                  {match.feasibilityStatus === 'pending' && !match.hasIssues && (
                                    <span className="text-xs text-muted-foreground self-center ml-2">
                                      Awaiting manufacturer review
                                    </span>
                                  )}
                                  {match.hasIssues && (
                                    <div className="flex items-center gap-2 ml-2">
                                      <span className="text-xs text-amber-600 dark:text-amber-400">
                                        Please resolve issues and resubmit
                                      </span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/workflow?designId=${design.id}&stage=design`);
                                        }}
                                      >
                                        <ArrowLeft className="w-3 h-3" />
                                        Edit Tech Pack
                                      </Button>
                                    </div>
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

      {/* Confirmation Dialog with Production Details */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-primary" />
              Finalize Contract with {manufacturerToFinalize?.manufacturers.name}
            </DialogTitle>
            <DialogDescription>
              Review the production details submitted by the manufacturer before finalizing. 
              Once confirmed, you'll proceed to payment.
            </DialogDescription>
          </DialogHeader>
          
          {manufacturerToFinalize?.orders?.[0] && (() => {
            const order = manufacturerToFinalize.orders[0];
            const timeline = order.production_timeline_data as ProductionTimelineData | null;
            const quantity = order?.quantity ?? null;
            const unitCost = timeline?.unit_cost ?? null;
            const shippingCost = timeline?.shipping_cost ?? null;
            const taxesAndFees = timeline?.taxes_and_fees ?? null;
            const hasPricing = unitCost !== null || shippingCost !== null || taxesAndFees !== null;
            const totalCost =
              quantity && unitCost !== null
                ? (unitCost * quantity) + (shippingCost || 0) + (taxesAndFees || 0)
                : null;
            
            return (
              <div className="space-y-4 my-4">
                {/* Pricing Summary */}
                {hasPricing && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unit Cost</span>
                      <span className="font-semibold">{formatMoney(unitCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">{formatMoney(shippingCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-semibold">{formatMoney(taxesAndFees)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-2">
                      <span className="text-muted-foreground">Estimated Total</span>
                      <span className="font-semibold">
                        {totalCost !== null ? formatMoney(totalCost) : 'Not provided'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Lead Time</p>
                    <p className="font-semibold">{timeline?.lead_time_days || order.lead_time_days || 'N/A'} days</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Fabric Sourcing</p>
                    <p className="font-semibold">
                      {timeline?.fabric_sourcing === 'manufacturer_sourcing' || timeline?.fabric_sourcing === 'manufacturer' 
                        ? 'Manufacturer sources' 
                        : timeline?.fabric_sourcing === 'designer_provided' 
                          ? 'Designer provides' 
                          : order.fabric_type || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                    <p className="font-semibold">{formatDate(timeline?.estimated_delivery_date || order.production_completion_date || null)}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Capacity Available</p>
                    <p className="font-semibold">
                      {timeline?.capacity_available !== undefined 
                        ? (timeline.capacity_available ? '✅ Yes' : '❌ No') 
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Sampling Required</p>
                    <p className="font-semibold">
                      {timeline?.sampling_required !== undefined 
                        ? (timeline.sampling_required ? `Yes (${timeline.sample_type || 'Fit sample'})` : 'No') 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {timeline?.additional_notes && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                    <p className="text-sm">{timeline.additional_notes}</p>
                  </div>
                )}
              </div>
            );
          })()}

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
            <Button onClick={handleConfirmFinalize} className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Finalize Contract & Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Production Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Factory className="w-5 h-5 text-primary" />
              Feasibility Details from {manufacturerToViewDetails?.manufacturers.name}
            </DialogTitle>
            <DialogDescription>
              Review the production feasibility details submitted by the manufacturer. This is for comparison only - no commitment is made until you finalize a contract.
            </DialogDescription>
          </DialogHeader>
          
          {manufacturerToViewDetails?.orders?.[0] && (() => {
            const order = manufacturerToViewDetails.orders[0];
            const timeline = order.production_timeline_data as ProductionTimelineData | null;
            const quantity = order?.quantity ?? null;
            const unitCost = timeline?.unit_cost ?? null;
            const shippingCost = timeline?.shipping_cost ?? null;
            const taxesAndFees = timeline?.taxes_and_fees ?? null;
            const hasPricing = unitCost !== null || shippingCost !== null || taxesAndFees !== null;
            const totalCost =
              quantity && unitCost !== null
                ? (unitCost * quantity) + (shippingCost || 0) + (taxesAndFees || 0)
                : null;
            
            return (
              <div className="space-y-6">
                {/* Pricing Summary */}
                {hasPricing && (
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold">Pricing Summary</h4>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Unit Cost</span>
                      <span className="font-semibold">{formatMoney(unitCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">{formatMoney(shippingCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Taxes & Fees</span>
                      <span className="font-semibold">{formatMoney(taxesAndFees)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm border-t pt-2">
                      <span className="text-muted-foreground">Estimated Total</span>
                      <span className="font-semibold">
                        {totalCost !== null ? formatMoney(totalCost) : 'Not provided'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Lead Time Confirmation */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Lead Time Confirmation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Days from order confirmation to delivery</p>
                  <p className="text-lg font-semibold">{timeline?.lead_time_days || order.lead_time_days || 'Not provided'} days</p>
                </div>

                {/* Estimated Delivery */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Estimated Delivery Date</h4>
                  </div>
                  <p className="text-sm">{formatDate(timeline?.estimated_delivery_date || order.production_completion_date || null)}</p>
                </div>

                {/* MOQ Confirmation */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Factory className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">MOQ Confirmation</h4>
                  </div>
                  <p className="text-sm">
                    {timeline?.capacity_available !== undefined 
                      ? (timeline.capacity_available ? '✅ Yes, this quantity is achievable' : '❌ No, quantity is below MOQ')
                      : 'Not provided'}
                  </p>
                </div>

                {/* Fabric Sourcing Responsibility */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Factory className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Fabric Sourcing Responsibility</h4>
                  </div>
                  <p className="text-sm">
                    {timeline?.fabric_sourcing 
                      ? (timeline.fabric_sourcing === 'manufacturer' ? '🏭 Manufacturer will source fabric' : '👤 Designer will provide fabric')
                      : 'Not provided'}
                  </p>
                </div>

                {/* Production Capacity */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Production Capacity Confirmation</h4>
                  </div>
                  <p className="text-sm">
                    {timeline?.capacity_available !== undefined
                      ? (timeline.capacity_available ? '✅ Capacity available in planned window' : '❌ Capacity constraints exist')
                      : 'Not provided'}
                  </p>
                </div>

                {/* Sampling Requirement */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Factory className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-semibold">Sampling Requirement</h4>
                  </div>
                  <p className="text-sm">
                    {timeline?.sampling_required !== undefined
                      ? (timeline.sampling_required 
                          ? `✅ Sampling required - ${timeline.sample_type || 'Type not specified'}`
                          : '❌ No sampling required')
                      : 'Not provided'}
                  </p>
                </div>

                {/* Additional Notes */}
                {timeline?.additional_notes && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-primary" />
                      <h4 className="text-sm font-semibold">Additional Notes</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{timeline.additional_notes}</p>
                  </div>
                )}
              </div>
            );
          })()}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setDetailsDialogOpen(false);
                setManufacturerToViewDetails(null);
              }}
            >
              Close
            </Button>
            {manufacturerToViewDetails?.feasibilityConfirmed && (
              <Button 
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleOpenConfirmDialog(manufacturerToViewDetails);
                }}
              >
                Finalize Contract
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
