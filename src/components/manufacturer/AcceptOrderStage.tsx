import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Package, 
  Ruler, 
  Palette, 
  Clock, 
  DollarSign, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AcceptOrderStageProps {
  order: any;
  onAccept: () => void;
  onDecline: () => void;
  matchStatus: 'pending' | 'accepted' | 'rejected' | null;
}

export const AcceptOrderStage = ({ order, onAccept, onDecline, matchStatus }: AcceptOrderStageProps) => {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const designSpecs = order?.design_specs;
  const techPackData = order?.tech_pack_data;

  const handleAccept = async () => {
    if (!order?.manufacturer_id) return;
    
    setAccepting(true);
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'accepted' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      toast.success('Order accepted! You can now review the tech pack and submit production parameters.');
      onAccept();
    } catch (error: any) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!order?.manufacturer_id) return;
    
    setDeclining(true);
    try {
      const { error } = await supabase
        .from('manufacturer_matches')
        .update({ status: 'rejected' })
        .eq('design_id', order.design_id)
        .eq('manufacturer_id', order.manufacturer_id);

      if (error) throw error;

      toast.info('Order declined.');
      onDecline();
    } catch (error: any) {
      console.error('Error declining order:', error);
      toast.error('Failed to decline order. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  // If already accepted, show confirmation
  if (matchStatus === 'accepted') {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
              Order Accepted
            </h3>
            <p className="text-green-700 dark:text-green-300 max-w-md">
              You've accepted this order. Please proceed to "Review & Feasibility" to review the tech pack and submit your production parameters.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If declined
  if (matchStatus === 'rejected') {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
        <CardContent className="py-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              Order Declined
            </h3>
            <p className="text-red-700 dark:text-red-300 max-w-md">
              You've declined this order request.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Decision Banner */}
      <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                New Order Request
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Review the order details below and decide if you want to take this project.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Order Overview
          </CardTitle>
          <CardDescription>
            Review the design and production requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Design Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Design Name</p>
              <p className="font-medium">{order?.designs?.name || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{order?.designs?.category || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-4 h-4" /> Designer
              </p>
              <p className="font-medium">{order?.profiles?.full_name || 'Unknown'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Order Quantity</p>
              <p className="font-medium">{order?.quantity || 'TBD'} units</p>
            </div>
          </div>

          <Separator />

          {/* Budget & Timeline */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Budget & Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="font-semibold text-lg">
                  {order?.budget_min && order?.budget_max 
                    ? `$${order.budget_min} - $${order.budget_max}`
                    : 'Not specified'}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Lead Time</p>
                <p className="font-semibold text-lg">
                  {order?.lead_time_days ? `${order.lead_time_days} days` : 'Flexible'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Design Specifications */}
          {designSpecs && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Design Specifications
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {designSpecs.fabric_type && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fabric Type</p>
                    <Badge variant="secondary">{designSpecs.fabric_type}</Badge>
                  </div>
                )}
                {designSpecs.gsm && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">GSM</p>
                    <Badge variant="secondary">{designSpecs.gsm}</Badge>
                  </div>
                )}
                {designSpecs.print_type && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Print Type</p>
                    <Badge variant="secondary">{designSpecs.print_type}</Badge>
                  </div>
                )}
              </div>
              {designSpecs.construction_notes && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Construction Notes</p>
                  <p className="text-sm">{designSpecs.construction_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Location Preference */}
          {order?.preferred_location && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Preference
                </h4>
                <Badge variant="outline">{order.preferred_location}</Badge>
              </div>
            </>
          )}

          {/* Sustainability */}
          {order?.sustainability_priority && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Sustainability Priority
                </h4>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {order.sustainability_priority}
                </Badge>
              </div>
            </>
          )}

          {/* Notes */}
          {order?.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Additional Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Decision Buttons - Tech Pack Review Request Style */}
      <Card>
        <CardContent className="py-6">
          <h3 className="text-xl font-bold mb-2">Tech Pack Review Request</h3>
          <p className="text-muted-foreground mb-4">
            The designer has requested you to review their tech pack. Agreeing to review does not commit you to production.
          </p>
          <div className="flex gap-3">
            <Button 
              onClick={handleAccept}
              disabled={accepting || declining}
              className="bg-[#2d3b2d] hover:bg-[#3d4b3d] text-white gap-2"
            >
              <Clock className="w-4 h-4" />
              {accepting ? 'Accepting...' : 'Agree to Review Tech Pack'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDecline}
              disabled={declining || accepting}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              {declining ? 'Declining...' : 'Decline'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};