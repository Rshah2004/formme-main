import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StepHeader } from './StepHeader';
import { 
  FileDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MessageSquare,
  Eye
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TechPackFeasibilityReviewProps {
  order: any;
  onConfirmFeasible: (notes?: string) => Promise<void>;
  onRequestChanges: (notes: string) => Promise<void>;
  isSubmitting?: boolean;
  onNavigateToProduction?: () => void;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  blocked: boolean;
  blockingNote: string;
}

export const TechPackFeasibilityReview = ({
  order,
  onConfirmFeasible,
  onRequestChanges,
  isSubmitting = false,
  onNavigateToProduction
}: TechPackFeasibilityReviewProps) => {
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already confirmed
    if (order?.tech_pack_feasible === true) {
      setIsAlreadyConfirmed(true);
      setConfirmedAt(order.tech_pack_feasibility_confirmed_at);
      // Auto-navigate to production feasibility if already confirmed
      if (onNavigateToProduction) {
        onNavigateToProduction();
      }
    }
    setLoading(false);
  }, [order?.tech_pack_feasible, order?.tech_pack_feasibility_confirmed_at, onNavigateToProduction]);
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
  const [confirmationNotes, setConfirmationNotes] = useState('');

  const hasBlockedItems = checklist.some(item => item.blocked);
  const allItemsReviewed = checklist.every(item => item.checked || item.blocked);
  const allItemsPassed = checklist.every(item => item.checked && !item.blocked);
  const canProceed = allItemsPassed && !hasBlockedItems;

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

  const handleRequestChanges = async () => {
    const blockedItems = checklist.filter(item => item.blocked);
    const notes = blockedItems
      .map(item => `• ${item.label}: ${item.blockingNote}`)
      .join('\n');
    await onRequestChanges(notes);
  };

  const getStepStatus = () => {
    if (isAlreadyConfirmed) return 'completed';
    if (order.status === 'manufacturer_review' && !allItemsReviewed) return 'awaiting_review';
    if (hasBlockedItems) return 'blocked';
    if (canProceed) return 'approved';
    return 'awaiting_review';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show confirmation state if already confirmed
  if (isAlreadyConfirmed) {
    return (
      <div className="space-y-6">
        <StepHeader
          stepNumber={1}
          stepTitle="Tech Pack Feasibility Review"
          owner="Manufacturer"
          requiredAction="Already Completed"
          status="completed"
        />
        
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Tech Pack Feasibility Confirmed
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Confirmed on {confirmedAt ? new Date(confirmedAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={onNavigateToProduction}
                className="gap-2"
              >
                Continue to Production Feasibility
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={1}
        stepTitle="Tech Pack Feasibility Review"
        owner="Manufacturer"
        requiredAction="Confirm producibility or request changes"
        status={getStepStatus()}
      />

      {/* Tech Pack Preview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tech Pack Document</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{order.designs?.category || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fabric</p>
              <p className="font-medium">{order.design_specs?.fabric_type || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">GSM</p>
              <p className="font-medium">{order.design_specs?.gsm || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Print Type</p>
              <p className="font-medium">{order.design_specs?.print_type || 'None'}</p>
            </div>
          </div>
          {order.design_specs?.construction_notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-muted-foreground text-sm mb-1">Construction Notes</p>
              <p className="text-sm">{order.design_specs.construction_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feasibility Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Feasibility Checklist</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review each item before confirming. Mark items as blocked if they need clarification.
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
                  
                  {/* Blocking note display */}
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

                  {/* Block button and form */}
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
                              Mark as Blocking Issue
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

      {/* Action Section */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          {hasBlockedItems ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Blocking Issues Found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {checklist.filter(i => i.blocked).length} item(s) need clarification from the designer before production can proceed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
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
          ) : canProceed ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">Ready to Confirm</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All checklist items passed. You can confirm this tech pack is feasible.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm">Additional notes (optional)</Label>
                <Textarea
                  placeholder="Any notes or conditions for the designer..."
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button 
                size="lg"
                className="w-full gap-2"
                onClick={() => onConfirmFeasible(confirmationNotes)}
                disabled={isSubmitting}
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Tech Pack Feasible
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                "I confirm this tech pack is feasible for production with the information provided."
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
