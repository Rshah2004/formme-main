import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { StepHeader } from './StepHeader';
import { useRef } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  Ship,
  Package,
  MapPin,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useEffect } from 'react';

interface ShippingLogisticsStageProps {
  order: any;
onSubmitShipping: (data: ShippingData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface ShippingData {
  shipping_tracking_url: string;
  shipping_carrier: string;
  shipped_at: string;
  shipping_notes?: string;
  shipping_package_images?: string[];
}

export const ShippingLogisticsStage = ({
  order,
  onSubmitShipping,
  isSubmitting = false
}: ShippingLogisticsStageProps) => {
  // Initialize from order data if shipping was already confirmed
  const [formData, setFormData] = useState<ShippingData>({
    shipping_tracking_url: order.shipping_tracking_url || '',
    shipping_carrier: order.shipping_carrier || '',
    shipped_at: order.shipped_at || '',
    shipping_notes: order.shipping_notes || '',
    shipping_package_images: order.shipping_package_images || []
  });
const [showValidationDialog, setShowValidationDialog] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const [uploadingCount, setUploadingCount] = useState(0);

const uploadImage = async (file: File) => {
  setUploadingCount(c => c + 1);
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const safeName = `shipping-${Date.now()}.${ext}`;
    const path = `${order.designer_id}/shipping/${safeName}`;

    const {error: uploadError} = await supabase
        .storage
        .from('design-files')
        .upload(path, file);

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const {data} = supabase.storage
        .from('design-files')
        .getPublicUrl(path);

    const updatedImages = [
      ...formData.shipping_package_images,
      data.publicUrl
    ];

    const {error: dbError} = await supabase
        .from('orders')
        .update({shipping_package_images: updatedImages} as any)
        .eq('id', order.id);

    if (dbError) {
      console.error(dbError);
      return;
    }

    setFormData(prev => ({
      ...prev,
      shipping_package_images: updatedImages
    }));
  }catch (err) {
    console.error(err);
  }finally {
    setUploadingCount(c => c - 1);
  }
};


const removeImage = async (urlToRemove: string) => {
  const updatedImages = formData.shipping_package_images.filter(
    url => url !== urlToRemove
  );

  const { error } = await supabase
    .from('orders')
    .update({ shipping_package_images: updatedImages } as any)
    .eq('id', order.id);

  if (error) {
    console.error(error);
    return;
  }

  setFormData(prev => ({
    ...prev,
    shipping_package_images: updatedImages
  }));
};


useEffect(() => {
  if (!order) return;

  setFormData({
    shipping_tracking_url: order.shipping_tracking_url || '',
    shipping_carrier: order.shipping_carrier || '',
    shipped_at: order.shipped_at || '',
    shipping_notes: order.shipping_notes || '',
    shipping_package_images: order.shipping_package_images || []
  });
}, [order]);

const isValid =
  formData.shipping_tracking_url.trim().length > 0 &&
  formData.shipping_carrier.trim().length > 0 &&
  formData.shipped_at.trim().length > 0;

const isConfirmed = !!order.shipping_confirmed_at;

  const handleSubmit = async () => {
    if (!isValid) {
      setShowValidationDialog(true)
      return;
    }

    await onSubmitShipping({
      shipping_tracking_url: formData.shipping_tracking_url,
      shipping_carrier: formData.shipping_carrier,
      shipped_at: formData.shipped_at,
      shipping_notes: formData.shipping_notes,
      shipping_package_images: formData.shipping_package_images
    });
  }


  return (
    <div className="space-y-6">
      <StepHeader
        stepNumber={5}
        stepTitle="Shipping & Logistics Lock"
        owner="Manufacturer"
        requiredAction="Confirm shipment details and mark ready"
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
          <Label>Tracking Link *</Label>
          <Input
            value={formData.shipping_tracking_url}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                shipping_tracking_url: e.target.value
              }))
            }
            placeholder="https://dhl.com/track/..."
          />
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={formData.shipping_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, shipping_notes: e.target.value }))}
              placeholder="Any special handling instructions or notes..."
              rows={2}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Shipment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Carrier / Forwarder *</Label>
            <Input
              value={formData.shipping_carrier}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  shipping_carrier: e.target.value
                }))
              }
            />
          </div>

          <div>
            <Label>Dispatch Date *</Label>
            <Input
              type="date"
              value={formData.shipped_at}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  shipped_at: e.target.value
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

<Card>
  <CardHeader className="pb-3">
    <CardTitle className="text-lg">Package Photos (optional)</CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    {/* Hidden file input */}
    <input
      type="file"
      accept="image/*"
      multiple
      ref={fileInputRef}
      className="hidden"
      onChange={(e) => {
        Array.from(e.target.files || []).forEach(uploadImage);
        e.target.value = '';
      }}
    />

    <div className="grid grid-cols-3 gap-3">
      {/* Existing images */}
      {formData.shipping_package_images.map((url) => (
        <div key={url} className="relative group">
          <img
            src={url}
            className="h-24 w-full object-cover rounded-md border"
          />

          {
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="
                absolute top-1 right-1
                w-6 h-6 rounded-full
                bg-black/70 text-white
                flex items-center justify-center
                opacity-0 group-hover:opacity-100
                transition
              "
            >
              ×
            </button>
          }
        </div>
      ))}

      {/* Uploading placeholders */}
      {Array.from({ length: uploadingCount }).map((_, i) => (
        <div
          key={`uploading-${i}`}
          className="
            h-24 w-full rounded-md border
            flex items-center justify-center
            bg-muted/50
          "
        >
          <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      ))}


      {/* + Add photo tile */}
      {
        <div
          onClick={() => fileInputRef.current?.click()}
          className="
            h-24 w-full rounded-md
            border-2 border-dashed
            flex flex-col items-center justify-center
            cursor-pointer
            hover:bg-muted/50
            transition
          "
        >
          <span className="text-2xl font-medium">+</span>
          <span className="text-xs text-muted-foreground mt-1">
            Add photo
          </span>
        </div>
      }
    </div>
  </CardContent>
</Card>


      <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Missing shipping details</AlertDialogTitle>
        <AlertDialogDescription>
          Please fill in all required fields before submitting:
          <ul className="list-disc pl-5 mt-2 space-y-1">
            {!formData.shipping_tracking_url && <li>Tracking link</li>}
            {!formData.shipping_carrier && <li>Carrier / forwarder</li>}
            {!formData.shipped_at && <li>Dispatch date</li>}
          </ul>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogAction>
        Okay
      </AlertDialogAction>
    </AlertDialogContent>
  </AlertDialog>



      {/* Action */}
      {
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6">
            <Button 
              size="lg"
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <CheckCircle className="w-5 h-5" />
              Submit Shipping Details
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              This is the final irreversible step. Ensure all details are correct.
            </p>
          </CardContent>
        </Card>
      }
    </div>
  );
};
