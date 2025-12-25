import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { StepHeader } from './StepHeader';
import { 
  CheckCircle, 
  AlertCircle,
  Clock,
  Package,
  Layers,
  Calendar
} from 'lucide-react';

interface ProductionFeasibilityConfirmationProps {
  order: any;
  onConfirmFeasibility: (data: ProductionFeasibilityData) => Promise<void>;
  onRequestChanges: (notes: string) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ProductionFeasibilityData {
  estimatedLeadTimeDays: number;
  moqAchievable: boolean;
  moqNote?: string;
  fabricSourcing: 'designer_provided' | 'manufacturer_sourcing';
  fabricNote?: string;
  capacityAvailable: boolean;
  capacityNote?: string;
  samplingRequired: boolean;
  sampleType?: string;
  additionalNotes?: string;
}

export const ProductionFeasibilityConfirmation = ({
  order,
  onConfirmFeasibility,
  onRequestChanges,
  isSubmitting = false
}: ProductionFeasibilityConfirmationProps) => {
  const [formData, setFormData] = useState<ProductionFeasibilityData>({
    estimatedLeadTimeDays: order.lead_time_days || 21,
    moqAchievable: true,
    fabricSourcing: 'manufacturer_sourcing',
    capacityAvailable: true,
    samplingRequired: true,
    sampleType: 'fit'
  });

  const [notes, setNotes] = useState({
    moq: '',
    fabric: '',
    capacity: ''
  });

  const hasIssues = !formData.moqAchievable || !formData.capacityAvailable;
  const allFieldsFilled = formData.estimatedLeadTimeDays > 0;
  const requiresExplanation = hasIssues && (!notes.moq && !formData.moqAchievable) || (!notes.capacity && !formData.capacityAvailable);

  const canProceed = allFieldsFilled && !requiresExplanation;

  const getStepStatus = () => {
    if (order.production_params_approved === true) return 'approved';
    if (order.production_params_submitted_at && !order.production_params_approved) return 'awaiting_review';
    if (hasIssues) return 'blocked';
    return 'awaiting_review';
  };

  const handleSubmit = async () => {
    await onConfirmFeasibility({
      ...formData,
      moqNote: notes.moq,
      fabricNote: notes.fabric,
      capacityNote: notes.capacity
    });
  };

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={2}
        stepTitle="Production Feasibility Confirmation"
        owner="Manufacturer"
        requiredAction="Confirm production capability and commitment"
        status={getStepStatus()}
      />

      {/* Lead Time */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Estimated Lead Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="lead-time">Days from order confirmation to delivery</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="lead-time"
                  type="number"
                  min="1"
                  max="180"
                  value={formData.estimatedLeadTimeDays}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedLeadTimeDays: parseInt(e.target.value) || 0 
                  }))}
                  className="w-24"
                />
                <span className="text-muted-foreground">days</span>
              </div>
            </div>
            {order.lead_time_days && (
              <div className="text-sm text-muted-foreground">
                Designer requested: {order.lead_time_days} days
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MOQ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Minimum Order Quantity (MOQ)</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Order quantity: {order.quantity || 'Not specified'} units
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.moqAchievable ? 'yes' : 'no'}
            onValueChange={(value) => setFormData(prev => ({ 
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

          {!formData.moqAchievable && (
            <div className="mt-3">
              <Label className="text-destructive">Explanation required *</Label>
              <Textarea
                placeholder="Explain the MOQ issue and suggest alternatives..."
                value={notes.moq}
                onChange={(e) => setNotes(prev => ({ ...prev, moq: e.target.value }))}
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
            <CardTitle className="text-lg">Fabric Sourcing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.fabricSourcing}
            onValueChange={(value: 'designer_provided' | 'manufacturer_sourcing') => 
              setFormData(prev => ({ ...prev, fabricSourcing: value }))
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

          {formData.fabricSourcing === 'manufacturer_sourcing' && (
            <div className="mt-3">
              <Label>Fabric sourcing notes (optional)</Label>
              <Textarea
                placeholder="Notes about fabric availability, alternatives, or lead time impact..."
                value={notes.fabric}
                onChange={(e) => setNotes(prev => ({ ...prev, fabric: e.target.value }))}
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
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Production Capacity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.capacityAvailable ? 'yes' : 'no'}
            onValueChange={(value) => setFormData(prev => ({ 
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

          {!formData.capacityAvailable && (
            <div className="mt-3">
              <Label className="text-destructive">Explanation required *</Label>
              <Textarea
                placeholder="Explain capacity constraints and earliest availability..."
                value={notes.capacity}
                onChange={(e) => setNotes(prev => ({ ...prev, capacity: e.target.value }))}
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
          <CardTitle className="text-lg">Sampling Required?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.samplingRequired ? 'yes' : 'no'}
            onValueChange={(value) => setFormData(prev => ({ 
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

          {formData.samplingRequired && (
            <div className="mt-3">
              <Label>Sample type</Label>
              <RadioGroup
                value={formData.sampleType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, sampleType: value }))}
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

      {/* Action Section */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6">
          {hasIssues && requiresExplanation ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Issues Require Explanation</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please provide explanations for all "No" answers before proceeding.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
                <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Ready to Confirm</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This is your commitment step. Confirming feasibility means you are committing to produce this order.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Additional notes (optional)</Label>
                <Textarea
                  placeholder="Any additional conditions, notes, or questions..."
                  value={formData.additionalNotes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button 
                size="lg"
                className="w-full gap-2"
                onClick={handleSubmit}
                disabled={isSubmitting || !canProceed}
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Production Feasibility
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                "I confirm this order is feasible for production and commit to the stated parameters."
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
