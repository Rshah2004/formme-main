import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as DatePickerCalendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { 
  FileDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Eye,
  Clock,
  Package,
  Layers,
  Calendar,
  CalendarIcon,
  Lock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';
import { cn } from '@/lib/utils';

interface ManufacturerReviewFeasibilityProps {
  order: any;
  onTechPackConfirmed: () => void;
  onProductionConfirmed: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  blocked: boolean;
  blockingNote: string;
}

interface ProductionFeasibilityData {
  estimatedLeadTimeDays: number;
  estimatedSampleDate: Date | null;
  estimatedDeliveryDate: Date | null;
  moqAchievable: boolean;
  moqNote?: string;
  fabricSourcing: 'designer_provided' | 'manufacturer_sourcing';
  fabricNote?: string;
  capacityAvailable: boolean;
  capacityNote?: string;
  samplingRequired: boolean;
  sampleType?: string;
  additionalNotes?: string;
  productionCommitmentConfirmed: boolean;
  // Pricing fields
  unitCost: number;
  shippingCost: number;
  taxesAndFees: number;
  commissionCost: number;
}

export const ManufacturerReviewFeasibility = ({
  order,
  onTechPackConfirmed,
  onProductionConfirmed
}: ManufacturerReviewFeasibilityProps) => {
  const [activeSection, setActiveSection] = useState<'tech-pack' | 'production'>('tech-pack');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingIssueMessage, setPendingIssueMessage] = useState<string | undefined>(undefined);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Tech Pack Review State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'measurements',
      label: 'Measurements & tolerances reviewed',
      description: 'All size specs, grading rules, and tolerance limits are clear',
      checked: false,
      blocked: false,
      blockingNote: ''
    },
    {
      id: 'construction',
      label: 'Construction details clear',
      description: 'Seams, stitching, finishing, and assembly order are specified',
      checked: false,
      blocked: false,
      blockingNote: ''
    },
    {
      id: 'artwork',
      label: 'Artwork / print / embroidery specs clear',
      description: 'All decorations have placement, color codes, and technique specs',
      checked: false,
      blocked: false,
      blockingNote: ''
    },
    {
      id: 'fabric',
      label: 'Fabric info present OR marked "Manufacturer to source"',
      description: 'Fabric type, GSM, composition, or sourcing responsibility is defined',
      checked: false,
      blocked: false,
      blockingNote: ''
    },
    {
      id: 'no_ambiguities',
      label: 'No blocking ambiguities',
      description: 'No unclear specs that would prevent production from starting',
      checked: false,
      blocked: false,
      blockingNote: ''
    }
  ]);
  const [showBlockingForm, setShowBlockingForm] = useState<string | null>(null);
  const [blockingNote, setBlockingNote] = useState('');
  const [techPackNotes, setTechPackNotes] = useState('');
  
  // Production Feasibility State
  // Parse existing pricing from production_timeline_data if available
  const existingPricing = order?.production_timeline_data ? (
    typeof order.production_timeline_data === 'string' 
      ? JSON.parse(order.production_timeline_data) 
      : order.production_timeline_data
  ) : null;

  const [productionData, setProductionData] = useState<ProductionFeasibilityData>({
    estimatedLeadTimeDays: order?.lead_time_days || 21,
    estimatedSampleDate: existingPricing?.estimated_sample_date
      ? new Date(existingPricing.estimated_sample_date)
      : null,
    estimatedDeliveryDate: order?.production_completion_date ? new Date(order.production_completion_date) : null,
    moqAchievable: true,
    fabricSourcing: 'manufacturer_sourcing',
    capacityAvailable: true,
    samplingRequired: true,
    sampleType: 'fit',
    productionCommitmentConfirmed: false,
    // Pricing - load from existing data or defaults
    unitCost: existingPricing?.unit_cost || order?.price || 0,
    shippingCost: existingPricing?.shipping_cost || 0,
    taxesAndFees: existingPricing?.taxes_and_fees || 0,
    commissionCost: existingPricing?.commission_cost || 0
  });
  const [productionNotes, setProductionNotes] = useState({
    moq: '',
    fabric: '',
    capacity: ''
  });

  // Load saved checklist from order
  useEffect(() => {
    if (order?.tech_pack_checklist) {
      try {
        const savedChecklist = typeof order.tech_pack_checklist === 'string' 
          ? JSON.parse(order.tech_pack_checklist) 
          : order.tech_pack_checklist;
        if (Array.isArray(savedChecklist)) {
          setChecklist(savedChecklist);
        }
      } catch (e) {
        console.error('Error parsing checklist:', e);
      }
    }
  }, [order?.tech_pack_checklist]);

  // Tech Pack Review Logic
  const hasBlockedItems = checklist.some(item => item.blocked);
  const allItemsReviewed = checklist.every(item => item.checked || item.blocked);
  const allItemsPassed = checklist.every(item => item.checked && !item.blocked);
  const techPackReviewComplete = allItemsPassed && !hasBlockedItems;
  const isTechPackAlreadyConfirmed = order?.tech_pack_feasible === true;
  const isResubmittedForReview = order?.tech_pack_feasible === null && order?.tech_pack_feasibility_notes;

  // Production Feasibility Logic
  const hasProductionIssues = !productionData.moqAchievable || !productionData.capacityAvailable;
  const allProductionFieldsFilled = productionData.estimatedLeadTimeDays > 0;
  const requiresExplanation = (hasProductionIssues && !productionNotes.moq && !productionData.moqAchievable) || 
    (!productionNotes.capacity && !productionData.capacityAvailable);
  const canConfirmProduction = allProductionFieldsFilled && !requiresExplanation && 
    productionData.productionCommitmentConfirmed && techPackReviewComplete;

  const handleCheckItem = (id: string, checked: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { ...item, checked, blocked: checked ? false : item.blocked }
        : item
    ));
  };

  const handleBlockItem = (id: string) => {
    if (!blockingNote.trim()) return;
    
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { ...item, blocked: true, checked: false, blockingNote: blockingNote.trim() }
        : item
    ));
    setBlockingNote('');
    setShowBlockingForm(null);
  };

  const handleUnblockItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { ...item, blocked: false, blockingNote: '' }
        : item
    ));
  };

  const handleSaveChecklist = async () => {
    try {
      await supabase
        .from('orders')
        .update({ tech_pack_checklist: JSON.parse(JSON.stringify(checklist)) })
        .eq('id', order.id);
      toast.success('Checklist progress saved');
    } catch (error) {
      toast.error('Failed to save checklist');
    }
  };

  const handleRequestChanges = async () => {
    setIsSubmitting(true);
    try {
      const blockedItems = checklist.filter(item => item.blocked);
      const notes = blockedItems
        .map(item => `• ${item.label}: ${item.blockingNote}`)
        .join('\n');
      
      await supabase
        .from('orders')
        .update({ 
          tech_pack_feasible: false,
          tech_pack_feasibility_notes: notes,
          tech_pack_checklist: JSON.parse(JSON.stringify(checklist)),
          status: 'tech_pack_pending'
        })
        .eq('id', order.id);
      
      // Set the pending issue message to auto-populate the chat
      setPendingIssueMessage(notes);
      
      // Open chat with the issue message
      setChatOpen(true);
      toast.info('Opening chat to discuss changes with designer');
    } catch (error) {
      toast.error('Failed to send change request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmTechPack = async () => {
    setIsSubmitting(true);
    try {
      await supabase
        .from('orders')
        .update({ 
          tech_pack_checklist: JSON.parse(JSON.stringify(checklist)),
          tech_pack_feasibility_notes: techPackNotes || null
        })
        .eq('id', order.id);
      
      toast.success('Tech pack review complete. Proceed to Production Confirmation.');
      setActiveSection('production');
      onTechPackConfirmed();
    } catch (error) {
      toast.error('Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmProduction = async () => {
    if (!productionData.productionCommitmentConfirmed) {
      toast.error('Please confirm your production commitment');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save complete production details to production_timeline_data for designer review
      const productionTimelineData = {
        lead_time_days: productionData.estimatedLeadTimeDays,
        estimated_sample_date: productionData.estimatedSampleDate?.toISOString() || null,
        estimated_delivery_date: productionData.estimatedDeliveryDate?.toISOString() || null,
        moq_achievable: productionData.moqAchievable,
        moq_note: productionNotes.moq || null,
        fabric_sourcing: productionData.fabricSourcing,
        fabric_note: productionNotes.fabric || null,
        capacity_available: productionData.capacityAvailable,
        capacity_note: productionNotes.capacity || null,
        sampling_required: productionData.samplingRequired,
        sample_type: productionData.sampleType || null,
        additional_notes: productionData.additionalNotes || null,
        confirmed_at: new Date().toISOString(),
        // Pricing data
        unit_cost: productionData.unitCost,
        shipping_cost: productionData.shippingCost,
        taxes_and_fees: productionData.taxesAndFees
        ,
        commission_cost: productionData.commissionCost
      };

      await supabase
        .from('orders')
        .update({
          tech_pack_feasible: true,
          tech_pack_feasibility_confirmed_at: new Date().toISOString(),
          tech_pack_feasibility_notes: techPackNotes || null,
          tech_pack_checklist: JSON.parse(JSON.stringify(checklist)),
          production_start_date: new Date().toISOString(),
          production_completion_date: productionData.estimatedDeliveryDate?.toISOString().split('T')[0] || null,
          lead_time_days: productionData.estimatedLeadTimeDays,
          fabric_type: productionData.fabricSourcing === 'manufacturer_sourcing' ? 'Manufacturer sourcing' : 'Designer provided',
          production_params_submitted_at: new Date().toISOString(),
          production_timeline_data: productionTimelineData,
          // Save the unit price to the order for payment calculation
          price: productionData.unitCost,
          // IMPORTANT: Do NOT set order status here.
          // The designer must explicitly click "Finalize Contract" to select a manufacturer.
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', order.id);
      
      toast.success('Production feasibility confirmed. Awaiting designer approval.');
      onProductionConfirmed();
    } catch (error) {
      toast.error('Failed to confirm production feasibility');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resubmission Alert - Designer has updated and resubmitted */}
      {isResubmittedForReview && (
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 border-2">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                  Designer Has Resubmitted Tech Pack for Review
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  The designer has updated their tech pack based on your previous feedback. Please review the updated specifications and checklist items again.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manufacturer Review & Feasibility</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete both sections to confirm production feasibility
          </p>
        </div>
        <Badge variant={isTechPackAlreadyConfirmed ? 'default' : isResubmittedForReview ? 'outline' : 'secondary'} 
               className={isResubmittedForReview ? 'border-amber-500 text-amber-700 dark:text-amber-300' : ''}>
          {isTechPackAlreadyConfirmed ? 'Production Confirmed' : isResubmittedForReview ? 'Resubmitted - Needs Review' : 'In Review'}
        </Badge>
      </div>

      {/* Section Tabs */}
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as 'tech-pack' | 'production')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tech-pack" className="gap-2">
            <Eye className="w-4 h-4" />
            Section A: Tech Pack Review
            {techPackReviewComplete && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
          <TabsTrigger 
            value="production" 
            disabled={!techPackReviewComplete && !isTechPackAlreadyConfirmed}
            className="gap-2"
          >
            {!techPackReviewComplete && !isTechPackAlreadyConfirmed && <Lock className="w-4 h-4" />}
            Section B: Production Confirmation
            {isTechPackAlreadyConfirmed && <CheckCircle className="w-4 h-4 text-green-600" />}
          </TabsTrigger>
        </TabsList>

        {/* Section A: Tech Pack Review */}
        <TabsContent value="tech-pack" className="space-y-6 mt-6">
          {/* Info Banner */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Non-binding Review
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This section is for reviewing the tech pack. Completing this does NOT commit you to production.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Pack Preview Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tech Pack Document</CardTitle>
                <div className="flex gap-2">
                  {order?.techpacks?.pdf_url ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => window.open(order.techpacks.pdf_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" asChild>
                        <a href={order.techpacks.pdf_url} download target="_blank" rel="noopener noreferrer">
                          <FileDown className="w-4 h-4" />
                          Download PDF
                        </a>
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No PDF uploaded</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <p className="font-medium">{order?.designs?.category || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fabric</p>
                  <p className="font-medium">{order?.design_specs?.fabric_type || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">GSM</p>
                  <p className="font-medium">{order?.design_specs?.gsm || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Print Type</p>
                  <p className="font-medium">{order?.design_specs?.print_type || 'None'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feasibility Checklist */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tech Pack Checklist</CardTitle>
              <p className="text-sm text-muted-foreground">
                Review each item. Mark as checked if clear, or report issues for clarification.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-lg border transition-colors ${
                    item.blocked 
                      ? 'bg-destructive/5 border-destructive/30' 
                      : item.checked 
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex items-center pt-0.5">
                      {item.blocked ? (
                        <div className="w-5 h-5 rounded bg-destructive/20 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-destructive" />
                        </div>
                      ) : (
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <Label 
                        htmlFor={item.id} 
                        className={`font-medium cursor-pointer ${item.blocked ? 'text-destructive' : ''}`}
                      >
                        {item.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                      
                      {item.blocked && item.blockingNote && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm">
                          <span className="font-medium text-destructive">Issue: </span>
                          <span className="text-destructive/80">{item.blockingNote}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-2 h-6 text-xs"
                            onClick={() => handleUnblockItem(item.id)}
                          >
                            Clear
                          </Button>
                        </div>
                      )}

                      {!item.checked && !item.blocked && (
                        <>
                          {showBlockingForm === item.id ? (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                placeholder="Describe the issue or missing information..."
                                value={blockingNote}
                                onChange={(e) => setBlockingNote(e.target.value)}
                                className="text-sm"
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleBlockItem(item.id)}
                                  disabled={!blockingNote.trim()}
                                >
                                  Mark as Issue
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setShowBlockingForm(null);
                                    setBlockingNote('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
                              onClick={() => setShowBlockingForm(item.id)}
                            >
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Report Issue
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tech Pack Action Section */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              {hasBlockedItems ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-medium text-destructive">Issues Found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {checklist.filter(i => i.blocked).length} item(s) need clarification from the designer.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={handleSaveChecklist}
                      disabled={isSubmitting}
                    >
                      Save Progress
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={handleRequestChanges}
                      disabled={isSubmitting}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Request Changes from Designer
                    </Button>
                  </div>
                </div>
              ) : techPackReviewComplete ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">Tech Pack Review Complete</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        All items reviewed. Proceed to Production Confirmation to commit.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Review notes (optional)</Label>
                    <Textarea
                      placeholder="Any notes for the designer..."
                      value={techPackNotes}
                      onChange={(e) => setTechPackNotes(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button 
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={isSubmitting}
                  >
                    Proceed to Production Confirmation
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    This does not commit you to production yet.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">
                    Review all checklist items to proceed
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {checklist.filter(i => !i.checked && !i.blocked).length} items remaining
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleSaveChecklist}
                    className="mt-4"
                    disabled={isSubmitting}
                  >
                    Save Progress
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section B: Production Confirmation */}
        <TabsContent value="production" className="space-y-6 mt-6">
          {!techPackReviewComplete && !isTechPackAlreadyConfirmed ? (
            <Card className="bg-muted/50">
              <CardContent className="py-12 text-center">
                <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Section Locked</h3>
                <p className="text-muted-foreground">
                  Complete all items in Tech Pack Review before confirming production feasibility.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Warning Banner */}
              <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Binding Commitment
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Submitting this section commits you to produce this order under the stated parameters.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Time */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Sampling & Delivery Dates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Expected Sample Date</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select the date when the sample should be ready for review
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !productionData.estimatedSampleDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {productionData.estimatedSampleDate ? (
                              format(productionData.estimatedSampleDate, "PPP")
                            ) : (
                              <span>Pick a sample date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePickerCalendar
                            mode="single"
                            selected={productionData.estimatedSampleDate || undefined}
                            onSelect={(date) => {
                              setProductionData(prev => ({
                                ...prev,
                                estimatedSampleDate: date || null,
                              }));
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Expected Delivery Date</Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Select the date when you expect to deliver the completed order
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !productionData.estimatedDeliveryDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {productionData.estimatedDeliveryDate ? (
                              format(productionData.estimatedDeliveryDate, "PPP")
                            ) : (
                              <span>Pick a delivery date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePickerCalendar
                            mode="single"
                            selected={productionData.estimatedDeliveryDate || undefined}
                            onSelect={(date) => {
                              setProductionData(prev => ({
                                ...prev,
                                estimatedDeliveryDate: date || null,
                                estimatedLeadTimeDays: date
                                  ? Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                  : prev.estimatedLeadTimeDays
                              }));
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    {productionData.estimatedDeliveryDate && (
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <span className="text-muted-foreground">Estimated lead time: </span>
                        <span className="font-medium">
                          {Math.ceil((productionData.estimatedDeliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    )}
                    {order?.lead_time_days && (
                      <div className="text-sm text-muted-foreground">
                        Designer requested: {order.lead_time_days} days
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Section */}
              <Card className="border-2 border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                      <path d="M12 18V6" />
                    </svg>
                    <CardTitle className="text-lg">Pricing Quote</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set your pricing for this order. This will be shown to the designer in the payment stage.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Unit Cost */}
                    <div>
                      <Label htmlFor="unit-cost" className="text-sm font-medium">
                        Unit Cost (per item) <span className="text-destructive">*</span>
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="unit-cost"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productionData.unitCost || ''}
                          onChange={(e) => setProductionData(prev => ({ 
                            ...prev, 
                            unitCost: parseFloat(e.target.value) || 0 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Shipping Cost */}
                    <div>
                      <Label htmlFor="shipping-cost" className="text-sm font-medium">
                        Shipping & Handling
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="shipping-cost"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productionData.shippingCost || ''}
                          onChange={(e) => setProductionData(prev => ({ 
                            ...prev, 
                            shippingCost: parseFloat(e.target.value) || 0 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Taxes & Fees */}
                    <div>
                      <Label htmlFor="taxes-fees" className="text-sm font-medium">
                        Taxes & Fees
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="taxes-fees"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productionData.taxesAndFees || ''}
                          onChange={(e) => setProductionData(prev => ({ 
                            ...prev, 
                            taxesAndFees: parseFloat(e.target.value) || 0 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    {/* Commission Cost */}
                    <div>
                      <Label htmlFor="commission-cost" className="text-sm font-medium">
                        Commission Cost
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          id="commission-cost"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={productionData.commissionCost || ''}
                          onChange={(e) => setProductionData(prev => ({ 
                            ...prev, 
                            commissionCost: parseFloat(e.target.value) || 0 
                          }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit Cost × {order?.quantity}</span>
                        <span>${((productionData.unitCost || 0) * (order?.quantity)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping & Handling</span>
                        <span>${(productionData.shippingCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span>${(productionData.taxesAndFees || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Commission</span>
                        <span>${(productionData.commissionCost || 0).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-border my-2" />
                      <div className="flex justify-between font-semibold text-base">
                        <span>Total Quote</span>
                        <span className="text-primary">
                          ${(((productionData.unitCost || 0) * (order?.quantity)) + (productionData.shippingCost || 0) + (productionData.taxesAndFees || 0) + (productionData.commissionCost || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* MOQ */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">MOQ Confirmation</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Order quantity: {order?.quantity || 'Not specified'} units
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={productionData.moqAchievable ? 'yes' : 'no'}
                    onValueChange={(value) => setProductionData(prev => ({ 
                      ...prev, 
                      moqAchievable: value === 'yes' 
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="moq-yes" />
                      <Label htmlFor="moq-yes" className="cursor-pointer">
                        Yes, this quantity is achievable
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="moq-no" />
                      <Label htmlFor="moq-no" className="cursor-pointer">
                        No, quantity is below our MOQ
                      </Label>
                    </div>
                  </RadioGroup>

                  {!productionData.moqAchievable && (
                    <div className="mt-3">
                      <Label className="text-destructive">Explanation required *</Label>
                      <Textarea
                        placeholder="Explain the MOQ issue and suggest alternatives..."
                        value={productionNotes.moq}
                        onChange={(e) => setProductionNotes(prev => ({ ...prev, moq: e.target.value }))}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fabric Sourcing */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Fabric Sourcing Responsibility</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={productionData.fabricSourcing}
                    onValueChange={(value: 'designer_provided' | 'manufacturer_sourcing') => 
                      setProductionData(prev => ({ ...prev, fabricSourcing: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="designer_provided" id="fabric-designer" />
                      <Label htmlFor="fabric-designer" className="cursor-pointer">
                        Designer will provide fabric
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="manufacturer_sourcing" id="fabric-mfr" />
                      <Label htmlFor="fabric-mfr" className="cursor-pointer">
                        Manufacturer will source fabric
                      </Label>
                    </div>
                  </RadioGroup>

                  {productionData.fabricSourcing === 'manufacturer_sourcing' && (
                    <div className="mt-3">
                      <Label>Fabric sourcing notes (optional)</Label>
                      <Textarea
                        placeholder="Notes about fabric availability, alternatives, or lead time impact..."
                        value={productionNotes.fabric}
                        onChange={(e) => setProductionNotes(prev => ({ ...prev, fabric: e.target.value }))}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Capacity */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Production Capacity Confirmation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={productionData.capacityAvailable ? 'yes' : 'no'}
                    onValueChange={(value) => setProductionData(prev => ({ 
                      ...prev, 
                      capacityAvailable: value === 'yes' 
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="capacity-yes" />
                      <Label htmlFor="capacity-yes" className="cursor-pointer">
                        Yes, capacity available in planned window
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="capacity-no" />
                      <Label htmlFor="capacity-no" className="cursor-pointer">
                        No, capacity constraints exist
                      </Label>
                    </div>
                  </RadioGroup>

                  {!productionData.capacityAvailable && (
                    <div className="mt-3">
                      <Label className="text-destructive">Explanation required *</Label>
                      <Textarea
                        placeholder="Explain capacity constraints and earliest availability..."
                        value={productionNotes.capacity}
                        onChange={(e) => setProductionNotes(prev => ({ ...prev, capacity: e.target.value }))}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Sampling */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Sampling Requirement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={productionData.samplingRequired ? 'yes' : 'no'}
                    onValueChange={(value) => setProductionData(prev => ({ 
                      ...prev, 
                      samplingRequired: value === 'yes' 
                    }))}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="sampling-yes" />
                      <Label htmlFor="sampling-yes" className="cursor-pointer">
                        Yes, sampling required before production
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="sampling-no" />
                      <Label htmlFor="sampling-no" className="cursor-pointer">
                        No, can proceed directly to production
                      </Label>
                    </div>
                  </RadioGroup>

                  {productionData.samplingRequired && (
                    <div className="mt-3">
                      <Label>Sample type</Label>
                      <RadioGroup
                        value={productionData.sampleType}
                        onValueChange={(value) => setProductionData(prev => ({ ...prev, sampleType: value }))}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fit" id="sample-fit" />
                          <Label htmlFor="sample-fit" className="cursor-pointer text-sm">Fit sample</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="size_set" id="sample-size" />
                          <Label htmlFor="sample-size" className="cursor-pointer text-sm">Size set sample</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pre_production" id="sample-pre" />
                          <Label htmlFor="sample-pre" className="cursor-pointer text-sm">Pre-production sample</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>
              </Card>

          {/* Production Commitment Action Section */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6 space-y-4">
                  {/* Show awaiting approval status if already submitted */}
                  {order?.production_params_submitted_at && !order?.production_params_approved && order?.production_params_approved !== false && (
                    <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Awaiting Designer Approval</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                          Production feasibility submitted on {new Date(order.production_params_submitted_at).toLocaleDateString()}. Waiting for designer to approve.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show approved status with Next button */}
                  {order?.production_params_approved === true && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-200">Designer Approved!</p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                          Production parameters approved. You can now proceed to sample development.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Show form only if not yet submitted */}
                  {!order?.production_params_submitted_at && (
                    <>
                      {/* Final Confirmation Checkbox */}
                      <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <Checkbox
                          id="production-commitment"
                          checked={productionData.productionCommitmentConfirmed}
                          onCheckedChange={(checked) => setProductionData(prev => ({
                            ...prev,
                            productionCommitmentConfirmed: checked as boolean
                          }))}
                        />
                        <div>
                          <Label htmlFor="production-commitment" className="font-medium cursor-pointer">
                            I confirm production commitment
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            By checking this box, I confirm that I can produce this order under the stated parameters 
                            and commit to delivering on time.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Additional notes (optional)</Label>
                        <Textarea
                          placeholder="Any additional conditions, notes, or questions..."
                          value={productionData.additionalNotes || ''}
                          onChange={(e) => setProductionData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                          rows={2}
                        />
                      </div>

                      <Button 
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleConfirmProduction}
                        disabled={isSubmitting || !canConfirmProduction}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Confirm Production Feasibility
                      </Button>
                      
                      <p className="text-xs text-center text-muted-foreground">
                        This is a binding commitment. The designer will be notified to approve production.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Resolution Chat Overlay */}
      {order?.id && (
        <ExpandedChatOverlay
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setPendingIssueMessage(undefined);
          }}
          orderId={order.id}
          stage="tech_pack_review"
          stageName="Tech Pack Review"
          isDesigner={false}
          initialIssueMessage={pendingIssueMessage}
          onStageApproved={() => {
            setChatOpen(false);
            setPendingIssueMessage(undefined);
            onTechPackConfirmed();
          }}
          onChangesRequested={() => {
            // Already handled
          }}
        />
      )}

      {/* Confirmation Dialog for Proceed to Production Confirmation */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Proceed to Production Confirmation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to proceed? This will save your tech pack review and move you to the production confirmation section where you'll need to provide binding production parameters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleConfirmTechPack();
              }}
            >
              Yes, Proceed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
