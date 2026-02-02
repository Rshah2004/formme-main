import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { StepHeader } from './StepHeader';
import { 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Clock,
  Upload,
  ClipboardCheck,
  MessageCircle
} from 'lucide-react';
import { ExpandedChatOverlay } from '@/components/chat/ExpandedChatOverlay';
import { StageResolutionBanner } from '@/components/chat/StageResolutionBanner';

interface QualityCheckStageProps {
  order: any;
  onApproveQC: (data: QCData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface QCData {
  photos: {
    s?: string;
    m?: string;
    l?: string;
    xl?: string;
  };
  checklist: QCChecklistItem[];
  result: 'pass' | 'conditional_pass' | 'fail';
  notes?: string;
  failReason?: string;
  reworkPath?: string;
}

interface QCChecklistItem {
  id: string;
  label: string;
  passed: boolean;
}

export const QualityCheckStage = ({
  order,
  onApproveQC,
  isSubmitting = false
}: QualityCheckStageProps) => {
  const [checklist, setChecklist] = useState<QCChecklistItem[]>([
    { id: 'stitching', label: 'Stitching quality meets standards', passed: false },
    { id: 'measurements', label: 'Measurements within tolerance', passed: false },
    { id: 'color', label: 'Color matches approved sample', passed: false },
    { id: 'defects', label: 'No visible defects or imperfections', passed: false },
    { id: 'labeling', label: 'Labels and tags correctly placed', passed: false },
    { id: 'packaging', label: 'Packaging meets requirements', passed: false }
  ]);

  const [result, setResult] = useState<'pass' | 'conditional_pass' | 'fail' | ''>('');
  const [notes, setNotes] = useState('');
  const [failReason, setFailReason] = useState('');
  const [reworkPath, setReworkPath] = useState('');
  const [photos, setPhotos] = useState({
    s: order.qc_photos_s || '',
    m: order.qc_photos_m || '',
    l: order.qc_photos_l || '',
    xl: order.qc_photos_xl || ''
  });
  const [chatOpen, setChatOpen] = useState(false);

  const isWaitingApproval = order.qc_submitted_at && order.qc_approved === null;
  const isApproved = order.qc_approved === true;
  const isRejected = order.qc_approved === false;

  const allChecklistPassed = checklist.every(item => item.passed);
  const canSubmit = result !== '' && (result !== 'fail' || (failReason && reworkPath));

  const getStepStatus = () => {
    if (isApproved) return 'approved';
    if (isWaitingApproval) return 'awaiting_review';
    if (isRejected) return 'changes_requested';
    return 'in_progress';
  };

  const handleChecklistChange = (id: string, passed: boolean) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, passed } : item
    ));
  };

  const handleSubmit = async () => {
    if (result === '') return;
    
    await onApproveQC({
      photos,
      checklist,
      result,
      notes,
      failReason: result === 'fail' ? failReason : undefined,
      reworkPath: result === 'fail' ? reworkPath : undefined
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={4}
        stepTitle="Quality Check (QC Gate)"
        owner="Manufacturer"
        requiredAction="Complete QC checklist and approve"
        status={getStepStatus()}
      />

      {/* Resolution Banner - Show when designer has requested changes */}
      {isRejected && (
        <StageResolutionBanner
          stageName="Quality Check"
          isChangesRequested={true}
          onOpenChat={() => setChatOpen(true)}
          message={order?.qc_notes || "Designer has reported quality issues. Open the chat to discuss and submit fixes."}
        />
      )}

      {/* Status Cards */}
      {isWaitingApproval && (
        <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Waiting for Designer Review
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  QC submitted on {new Date(order.qc_submitted_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Quality Check Approved
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Proceed to Shipping & Logistics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues Reported Card - Show when rejected */}
      {isRejected && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-destructive">
                    Quality Issues Reported
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setChatOpen(true)}
                    className="gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open Chat to Resolve
                  </Button>
                </div>
                {order?.qc_notes && (
                  <div className="mt-2 p-3 bg-background/50 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">{order.qc_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QC Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">QC Checklist</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checklist.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                item.passed 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                  : 'bg-muted/30 border-border'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={item.passed}
                onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                disabled={isWaitingApproval || isApproved}
              />
              <Label htmlFor={item.id} className="cursor-pointer flex-1">
                {item.label}
              </Label>
              {item.passed && <CheckCircle className="w-4 h-4 text-green-600" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* QC Photos by Size */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">QC Photos by Size</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload photos of each size for quality verification
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['S', 'M', 'L', 'XL'] as const).map((size) => (
              <div key={size} className="space-y-2">
                <Label className="text-sm font-medium">Size {size}</Label>
                <div className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 hover:border-primary/50 transition-colors">
                  {photos[size.toLowerCase() as keyof typeof photos] ? (
                    <img 
                      src={photos[size.toLowerCase() as keyof typeof photos]}
                      alt={`Size ${size}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xs text-muted-foreground">Upload</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* QC Result */}
      {!isWaitingApproval && !isApproved && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">QC Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={result}
              onValueChange={(value: 'pass' | 'conditional_pass' | 'fail') => setResult(value)}
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-green-50/50 border-green-200">
                <RadioGroupItem value="pass" id="result-pass" />
                <Label htmlFor="result-pass" className="cursor-pointer flex-1">
                  <span className="font-medium text-green-700">Pass</span>
                  <p className="text-sm text-muted-foreground">All items meet quality standards</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-amber-50/50 border-amber-200">
                <RadioGroupItem value="conditional_pass" id="result-conditional" />
                <Label htmlFor="result-conditional" className="cursor-pointer flex-1">
                  <span className="font-medium text-amber-700">Conditional Pass</span>
                  <p className="text-sm text-muted-foreground">Minor issues noted but acceptable</p>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-red-50/50 border-red-200">
                <RadioGroupItem value="fail" id="result-fail" />
                <Label htmlFor="result-fail" className="cursor-pointer flex-1">
                  <span className="font-medium text-red-700">Fail</span>
                  <p className="text-sm text-muted-foreground">Critical issues require rework</p>
                </Label>
              </div>
            </RadioGroup>

            {result === 'fail' && (
              <div className="space-y-4 mt-4 p-4 bg-destructive/5 rounded-lg">
                <div>
                  <Label className="text-destructive">Failure Reason *</Label>
                  <Textarea
                    placeholder="Describe the quality issues found..."
                    value={failReason}
                    onChange={(e) => setFailReason(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-destructive">Rework Path *</Label>
                  <Textarea
                    placeholder="Describe the corrective action plan..."
                    value={reworkPath}
                    onChange={(e) => setReworkPath(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Additional Notes (optional)</Label>
              <Textarea
                placeholder="Any additional observations or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action */}
      {!isWaitingApproval && !isApproved && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
            >
              <CheckCircle className="w-5 h-5" />
              Approve Quality Check
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              QC results will be sent to designer for final review.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resolution Chat Overlay */}
      {order?.id && (
        <ExpandedChatOverlay
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          orderId={order.id}
          stage="quality_check"
          stageName="Quality Check"
          isDesigner={false}
          onStageApproved={() => {
            setChatOpen(false);
            window.location.reload();
          }}
          onChangesRequested={() => {}}
        />
      )}
    </div>
  );
};
