import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { StepHeader } from './StepHeader';
import { 
  CheckCircle, 
  Ship,
  Package,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface ShippingLogisticsStageProps {
  order: any;
  onConfirmReadyForShipment: (data: ShippingData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ShippingData {
  shippingResponsibility: 'fob' | 'cif' | 'exw' | 'dap' | 'ddp';
  destinationCountry: string;
  packingMethod: string;
  cartonCount: number;
  trackingNumber?: string;
  notes?: string;
}

const shippingTerms = [
  { value: 'fob', label: 'FOB (Free On Board)', description: 'Seller delivers to port, buyer handles shipping' },
  { value: 'cif', label: 'CIF (Cost, Insurance, Freight)', description: 'Seller covers shipping to destination port' },
  { value: 'exw', label: 'EXW (Ex Works)', description: 'Buyer handles all shipping from factory' },
  { value: 'dap', label: 'DAP (Delivered at Place)', description: 'Seller delivers to specified destination' },
  { value: 'ddp', label: 'DDP (Delivered Duty Paid)', description: 'Seller handles all costs including duties' }
];

export const ShippingLogisticsStage = ({
  order,
  onConfirmReadyForShipment,
  isSubmitting = false
}: ShippingLogisticsStageProps) => {
  const [formData, setFormData] = useState<ShippingData>({
    shippingResponsibility: 'fob',
    destinationCountry: order.preferred_location || '',
    packingMethod: 'standard',
    cartonCount: 1,
    trackingNumber: '',
    notes: ''
  });

  const isConfirmed = order.status === 'shipping' || order.status === 'delivered';
  const canSubmit = formData.destinationCountry && formData.cartonCount > 0;

  const getStepStatus = () => {
    if (order.status === 'delivered') return 'completed';
    if (order.status === 'shipping') return 'ready';
    return 'in_progress';
  };

  const handleSubmit = async () => {
    await onConfirmReadyForShipment(formData);
  };

  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={5}
        stepTitle="Shipping & Logistics Lock"
        owner="Manufacturer"
        requiredAction="Confirm shipment details and mark ready"
        status={getStepStatus()}
      />

      {/* Warning */}
      {!isConfirmed && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Final Step — This action is irreversible
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Once confirmed, the shipment cannot be cancelled or modified.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConfirmed && (
        <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Shipment Confirmed
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Order is {order.status === 'delivered' ? 'delivered' : 'in transit'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shipping Terms */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Shipping Responsibility</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.shippingResponsibility}
            onValueChange={(value: ShippingData['shippingResponsibility']) => 
              setFormData(prev => ({ ...prev, shippingResponsibility: value }))
            }
            disabled={isConfirmed}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shippingTerms.map((term) => (
                <SelectItem key={term.value} value={term.value}>
                  <div>
                    <span className="font-medium">{term.label}</span>
                    <p className="text-xs text-muted-foreground">{term.description}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Destination</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Destination Country *</Label>
            <Input
              value={formData.destinationCountry}
              onChange={(e) => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
              placeholder="e.g., United States"
              className="mt-1"
              disabled={isConfirmed}
            />
          </div>
          {order.shipping_address && (
            <div>
              <Label className="text-muted-foreground">Full Address</Label>
              <p className="text-sm mt-1">{order.shipping_address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Packing */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Packing Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Packing Method</Label>
              <Select
                value={formData.packingMethod}
                onValueChange={(value) => setFormData(prev => ({ ...prev, packingMethod: value }))}
                disabled={isConfirmed}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Carton</SelectItem>
                  <SelectItem value="poly_bag">Poly Bag in Carton</SelectItem>
                  <SelectItem value="hanging">Hanging (on hangers)</SelectItem>
                  <SelectItem value="flat_pack">Flat Pack</SelectItem>
                  <SelectItem value="custom">Custom Packaging</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Carton Count *</Label>
              <Input
                type="number"
                min="1"
                value={formData.cartonCount}
                onChange={(e) => setFormData(prev => ({ ...prev, cartonCount: parseInt(e.target.value) || 0 }))}
                className="mt-1"
                disabled={isConfirmed}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Tracking Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Tracking Number (optional)</Label>
            <Input
              value={formData.trackingNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, trackingNumber: e.target.value }))}
              placeholder="Enter tracking number when available"
              className="mt-1"
              disabled={isConfirmed}
            />
          </div>
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any special handling instructions or notes..."
              rows={2}
              className="mt-1"
              disabled={isConfirmed}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action */}
      {!isConfirmed && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit}
            >
              <CheckCircle className="w-5 h-5" />
              Confirm Ready for Shipment
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              This is the final irreversible step. Ensure all details are correct.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
